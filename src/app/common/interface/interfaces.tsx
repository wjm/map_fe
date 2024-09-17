import type { GeoJsonObject } from 'geojson';

export interface Drawing {
    id: string;
    shape: GeoJsonObject;
}

export interface MapResInfo {
    user_id: string;
    maps: {
        user: MapInfo[];
        shared: MapInfo[];
    }
}

export interface MapInfo {
    map_id: string;
    map_name: string;
}
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}