// ===========================
// ======= Core config =======
// ===========================

export interface NetworkConfig {
  maxRetries: number;
  timeoutMs: number;
}

export interface ApiConfig {
  apiBaseUrl: string;
  shipsEndpoint: string;
  itinerariesEndpoint: string;
}

export interface CoreConfig {
  api: ApiConfig;
  network: NetworkConfig;
}

// ===========================
// ======= User config =======
// ===========================

export interface PortStyling {
  color: string;
  radius: number;
}

export interface PortStyleConfig {
  startPort?: PortStyling;
  endPort?: PortStyling;
  intermediatePorts?: PortStyling;
}

export interface TrackStyling {
  color: string;
  width: number;
}

export interface MapConfig {
  mapStyle: string;
  zoomLevel: number;
  height: number;
  width: number;
  is3d: boolean;
  isStatic: boolean;
  hasArrows: boolean;
  center: [number, number];
  portStyle: PortStyleConfig;
  trackStyle?: TrackStyling;
}

export interface AuthConfig {
  mapBoxKey: string;
  cruiseMapsKey: string;
}

export interface UserConfig {
  auth: AuthConfig;
  mapDefaults: MapConfig;
  availableMapStyles: string[];
}

// The Config interface is a representation of the full SDK configuration
export interface Config extends CoreConfig, UserConfig {}

// =================================
// ======= Other misc types ========
// =================================

export interface Ship {
  id: number;
  name: string;
  cruise_line: string;
  imo_number: number | null;
  display_name: string;
  mmsi: number;
}

export interface LoadMapData {
  shipId: number;
  startDate: number; // unix
  duration: number; // unix
}

export interface LoadMapParams {
  container: string; // DOM reference (the html div id)
  data: LoadMapData; // Data parameters for the map
  map?: MapConfig; // Optional since the map defaults will be used if this is not provided
}

export interface FetchShipsOptions {
  offset: number;
  limit: number;
}

export interface FetchShipsResponse {
  total_ship_count: number;
  ships: Ship[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  } | null;
  properties: Record<string, any>;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// 3D Map configuration types
export interface FogConfig {
  color: string;
  highColor: string;
  horizonBlend: number;
  spaceColor: string;
  starIntensity: number;
}

export interface SkyConfig {
  skyType: "atmosphere";
  sunPosition: [number, number];
  sunIntensity: number;
  atmosphereColor: string;
  haloColor: string;
  opacity: number;
}

export interface TerrainConfig {
  exaggeration: number;
}

export interface Map3DConfig {
  enabled: boolean;
  fog?: FogConfig;
  sky?: SkyConfig;
  terrain?: TerrainConfig;
}
