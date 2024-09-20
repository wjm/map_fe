"use client"
//import Image from "next/image";
import { useState, useCallback, useRef, useEffect } from "react";
import { LngLat, Map as MapGL, MapMouseEvent } from 'react-map-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
//import WebSocket from 'ws';
import { useRouter } from 'next/navigation'

import DrawControl from './draw-control';
//import ControlPanel from './control-panel';
import { DrawFeature } from "@mapbox/mapbox-gl-draw";
import { Session } from 'next-auth';
import type { FeatureCollection, Feature, Geometry, GeoJsonProperties } from 'geojson';
import { Client } from '@stomp/stompjs';
// import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Drawing } from "@/app/common/interface/interfaces";
import type {MapRef} from 'react-map-gl';


export default function MapDraw({ session, TOKEN, mapId }: { session: Session | null, TOKEN: string, mapId: string }) {
  // console.log("MapDraw session: ", session);
  const [cliendId] = useState<string>(uuidv4());
  const [features, setFeatures] = useState<{ [key: string]: DrawFeature }>({});
  const [fetchFeatures, setFetchFeatures] = useState<FeatureCollection>();
  const lockFeaturesRef = useRef<Map<string, Array<string>>>(new Map());
  const [cursors, setCursors] = useState<Map<string, [string, LngLat]>>(new Map()); 
  const drawControlRef = useRef<MapboxDraw | null>(null);
  const clientRef = useRef<Client | null>(null);
  const router = useRouter()
  const mapRef = useRef<MapRef>();
  typeof (features); // avoid lint error
  useEffect(() => {
    const fetchMapInfo = async (mapId: string) => {
      if (!session) {
        console.error("Session is not available.");
        return;
      } else {
        try {
          const response = await fetch(`/api/mapapi/map/check`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ map_id: mapId, user_id: session.user?.id })
          });
          if (!response.ok) {
            router.push('/');
          }
        }
        catch (error) {
          console.error("Failed to check map:", error);
        }
      }
      try {
        const response = await fetch(`/api/mapapi/drawings/${mapId}`);
        if (!response.ok) {
          console.error("Failed to fetch drawings:", response.statusText);
          return;
        }
        const data: Array<Drawing> = await response.json();
        const features = data.map((drawing) => ({
          type: 'Feature',
          properties: {},
          id: drawing.id,
          geometry: drawing.shape
        } as Feature<Geometry, GeoJsonProperties>));
        setFetchFeatures({ type: 'FeatureCollection', features: features });
        //const ids = drawControlRef.current?.set({type: 'FeatureCollection', features: features});
        //console.log("Fetched features: ", features);

      } catch (error) {
        console.error("Failed to fetch drawings:", error);
      }
    }
    if (!mapId) {
      router.push('/');
    }
    if (session && mapId) {
      fetchMapInfo(mapId);
    }
    // Only initialize the client if it doesn't already exist
    if (!clientRef.current || !clientRef.current.connected) {
      const client = new Client({
        brokerURL: '/api/ws',
        onConnect: () => {
          // console.log('Connected to STOMP server');

          // Subscribe to the map channel dynamically using the map ID (mapId)
          client.subscribe(`/map/${mapId}`, (message) => {
            if (message.headers['client-id'] === cliendId) {
              return;
            }
            const messageClient = message.headers['client-id'];
            const receivedData = JSON.parse(message.body);

            if (drawControlRef.current && receivedData) {
              // Handle different message types (create, update, delete, selection change, leave)
              if (receivedData.type === 'create' || receivedData.type === 'update') {
                Object.values(receivedData.data).forEach((feature) => {
                  drawControlRef.current?.add(feature as FeatureCollection);
                });
                // console.log("Received and added features: ", receivedData);
              } else if (receivedData.type === 'delete') {
                Object.values(receivedData.data).forEach((feature) => {
                  drawControlRef.current?.delete((feature as Feature).id as string);
                });
                // console.log("Received and deleted features: ", receivedData);
              } else if (receivedData.type === 'selectionchange') {
                lockFeaturesRef.current?.set(messageClient, receivedData.data.map((feature: { id: string; }) => feature.id));
                // console.log("Received selection change, lock: ", receivedData);
              } else if (receivedData.type === 'leave') {
                const leaveUser = messageClient;
                lockFeaturesRef.current?.delete(leaveUser);
                setCursors((prevCursors) => {
                  return Object.keys(prevCursors).reduce((newCursors, key) => {
                    if (key !== leaveUser) {
                      const cursor = prevCursors.get(key);
                      if (cursor) {
                        newCursors.set(key, cursor);
                      }
                    }
                    return newCursors;
                  }, new Map<string, [string, LngLat]>());
                });
              } else if (receivedData.type === 'mousemove') {
                const mouseMoveData = receivedData.data[0];
                const username = mouseMoveData.username;
                const lnglat = mouseMoveData.lnglat;
                setCursors((prevCursors) => ({
                  ...prevCursors,
                  [messageClient]: [username,lnglat], // Store cursor position in map with userId as key
                }));
                // console.log("Received mouse move: ", receivedData.data);
              }
            }
          });
        },
        // debug: (str) => {
        //   console.log('STOMP debug: ', str);
        // },
      });

      client.activate();

      clientRef.current = client;
    }

    // Cleanup
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        // console.log('Disconnected from STOMP server');
      }
    };
  }, [mapId, drawControlRef, lockFeaturesRef, cliendId, session, router]);

  const sync = useCallback((action: string, mapId: string, data: unknown) => {
    if (!clientRef.current || !clientRef.current.connected) {
      return;
    }
    switch (action) {
      case 'create':
      case 'update':
      case 'delete':
      case 'selectionchange':
      case 'mousemove':
      case 'leave':
        clientRef.current.publish({ destination: `/map/${mapId}`, body: JSON.stringify({ type: action, data: data }), headers: { 'client-id': cliendId } });
        break;
      default:
        break;
    }
  }, [clientRef, cliendId]);

  const onCreate = useCallback((e: { features: object[] }) => {
    setFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      //wsSend('update', e.features);
      for (const f of e.features as DrawFeature[]) {
        newFeatures[f.id] = f;
      }
      return newFeatures;
    });
    sync('create', mapId, e.features);
  }, [mapId, sync]);

  const onUpdate = useCallback((e: { features: object[] }) => {
    // console.log("updated");
    setFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      //wsSend('update', e.features);
      for (const f of e.features as DrawFeature[]) {
        newFeatures[f.id] = f;
      }
      return newFeatures;
    });
    sync('update', mapId, e.features);
  }, [mapId, sync]);

  const onDelete = useCallback((e: { features: object[] }) => {
    setFeatures(currFeatures => {
      const newFeatures = { ...currFeatures };
      //wsSend('delete', e.features);
      for (const f of e.features as DrawFeature[]) {
        delete newFeatures[f.id];
      }
      return newFeatures;
    });
    sync('delete', mapId, e.features);
  }, [mapId, sync]);
  const onSelect = useCallback((e: { features: object[] }) => {
    // console.log("Selected features: ", e.features);
    const eventFeatures = e.features as DrawFeature[];
    const featuresArray: Array<Array<string>> = lockFeaturesRef.current ? Array.from(lockFeaturesRef.current.values()) : [];
    const selecableFeatureIds = eventFeatures.filter(
      (feature: DrawFeature) => !featuresArray.some((lockedList) => lockedList.includes(feature.id as string))
    ).map((feature: DrawFeature) => feature.id);
    const unselecableFeatureIds = eventFeatures.filter(
      (feature: DrawFeature) => featuresArray.some((lockedList) => lockedList.includes(feature.id as string))
    ).map((feature: DrawFeature) => feature.id);
    //drawControlRef.current?.changeMode('simple_select', { featureIds: [] });
    if (drawControlRef.current) {
      // console.log("Changing mode to simple_select with features: ", selecableFeatureIds);
      drawControlRef.current?.changeMode('simple_select', { featureIds: selecableFeatureIds as string[] });
    }
    if (unselecableFeatureIds.length > 0) {
      alert("Selected feature is currently locked by another user");
    }

    //wsSend('selectionchange', e.features);
    sync('selectionchange', mapId, e.features);
  }, [mapId, sync]);
  useEffect(() => {
    // Handle WebSocket message and add features to the map
    // ws.onopen = () => {
    //   ws.send(JSON.stringify({
    //     type: 'join',
    //     channel: mapId,  // Send the channel or room information on connection
    //     user: localStorage.getItem('user') || 'default'
    //   }));
    // }

    // ws.onmessage = function (event) {
    //   const receivedData = JSON.parse(event.data);

    //   //convert receivedData to a feature
    //   if (drawControlRef.current && receivedData) {
    //     // Loop over the features and add them to the map
    //     if (receivedData.type === 'create' || receivedData.type === 'update') {
    //       Object.values(receivedData.data).forEach(feature => {
    //         drawControlRef.current?.add(feature as FeatureCollection);
    //       });
    //       console.log("Received and added features: ", receivedData);
    //     }
    //     else if (receivedData.type === 'delete') {
    //       Object.values(receivedData.data).forEach((feature) => {
    //         drawControlRef.current?.delete((feature as Feature).id as string);
    //       });
    //       console.log("Received and deleted features: ", receivedData);
    //     }
    //     else if (receivedData.type === 'selectionchange') {
    //       lockFeaturesRef.current?.set(receivedData.user,receivedData.data.map((feature: { id: string; }) => feature.id));
    //       console.log("Received selection change, lock: ", receivedData);
    //     }
    //     else if (receivedData.type === 'leave') {
    //       const leaveUser = receivedData.user;
    //       lockFeaturesRef.current?.delete(leaveUser);
    //     }


    //   }
    // };
    const handleBeforeUnload = (event: { returnValue: string; }) => {
      // Send a WebSocket message to notify other clients
      // clean up locked features
      // if (ws && ws.readyState === WebSocket.OPEN) {
      //   wsSend('selectionchange', []);
      // }
      if (clientRef.current?.connected) {
        sync('selectionchange', mapId, []);
        sync('leave', mapId, []);
        clientRef.current.unsubscribe(`/map/${mapId}`);
      }
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [mapId, sync]);
  const handleMouseMove = (e: MapMouseEvent) => {
    sync('mousemove', mapId, [{username: session?.user.email, lnglat: e.lngLat}]);
    //console.log(e.lngLat);
  };

  return (
    <div id="map">
      <MapGL
        ref = {mapRef as React.RefObject<MapRef>}
        initialViewState={{
          longitude: -91.874,
          latitude: 42.76,
          zoom: 12
        }}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxAccessToken={TOKEN}
        onMouseMove={handleMouseMove}
      >
         {Object.entries(cursors).map(([userId, [username, lngLat]]) => {
          // console.log("Cursor: ", userId, lngLat);
          if (!mapRef.current) return null;
        const map = mapRef.current?.getMap();
        const screenPos = map?.project([lngLat.lng, lngLat.lat]);

        return (
          <div
            key={userId}
            style={{
              position: 'absolute',
              left: screenPos.x,
              top: screenPos.y,
              backgroundColor: 'transparent',
              width: '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)',  // Center the cursor
            }}
          >
            {/* Cursor */}
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundImage: 'url(/cursor.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                cursor: 'none',
              }}
            />
            {/*User ID */}
            <div
              style={{
                position: 'absolute',
                top: '25px',
                left: '-10px',
                fontSize: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                padding: '2px 5px',
                borderRadius: '5px',
              }}
            >
              {username}
            </div>
          </div>
        );
      })}
        <DrawControl
          ref={drawControlRef}
          position="top-left"
          displayControlsDefault={false}
          controls={{
            point: true,
            line_string: true,
            polygon: true,
            trash: true
          }}
          defaultMode="simple_select"
          onCreate={onCreate}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onSelect={onSelect}
          fetchFeatures={fetchFeatures}
        />
      </MapGL>
      {/* <ControlPanel polygons={Object.values(features)} /> */}
    </div>
  );
}
