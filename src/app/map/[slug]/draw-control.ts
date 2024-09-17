import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useControl } from 'react-map-gl';

import type { ControlPosition } from 'react-map-gl';
import type { FeatureCollection } from 'geojson';
import { MapContextValue } from 'react-map-gl/dist/esm/components/map';

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  position?: ControlPosition;
  fetchFeatures?: FeatureCollection;

  onCreate: (evt: { features: object[] }) => void;
  onUpdate: (evt: { features: object[]; action: string }) => void;
  onDelete: (evt: { features: object[] }) => void;
  onSelect: (evt: { features: object[] }) => void;


};
const DrawControl = forwardRef<MapboxDraw, DrawControlProps>(({
  onCreate = () => { },
  onUpdate = () => { },
  onDelete = () => { },
  onSelect = () => { },
  fetchFeatures,
  position
}, ref) => {
  const draw = useControl<MapboxDraw>(
    () => new MapboxDraw(),
    ({ map }: MapContextValue) => {
      map.on('draw.create', onCreate);
      map.on('draw.update', onUpdate);
      map.on('draw.delete', onDelete);
      map.on('draw.selectionchange', onSelect);
    },
    ({ map }: MapContextValue) => {
      map.off('draw.create', onCreate);
      map.off('draw.update', onUpdate);
      map.off('draw.delete', onDelete);
      map.off('draw.selectionchange', onSelect);
    },
    {
      position: position
    }
  );
  useEffect(() => {
    if (draw && fetchFeatures) {
      // Set the features only after draw has been initialized
      draw.set(fetchFeatures);
    }
  }, [draw, fetchFeatures]);
  useImperativeHandle(ref, () => draw, [draw]);
  return null;
});
DrawControl.displayName = 'DrawControl';

export default DrawControl;