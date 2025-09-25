import { ConfigManager } from "./core/config-manager";
import { fetchShips } from "./api/ships";
import { MapRenderer } from "./map/renderer";
import {
  Config,
  LoadMapParams,
  FetchShipsOptions,
  FetchShipsResponse,
  Ship,
  AuthConfig,
  MapConfig,
  PortStyling,
  PortStyleConfig,
  TrackStyling,
  LoadMapData,
  NetworkConfig,
  ApiConfig,
  CoreConfig,
  UserConfig,
} from "./types";

// Export types for TypeScript users
export type {
  Config,
  LoadMapParams,
  FetchShipsOptions,
  FetchShipsResponse,
  Ship,
  AuthConfig,
  MapConfig,
  PortStyling,
  PortStyleConfig,
  TrackStyling,
  LoadMapData,
  NetworkConfig,
  ApiConfig,
  CoreConfig,
  UserConfig,
};

export {
  NetworkError,
  RateLimitError,
  AuthenticationError,
} from "./core/network";

class TCMSDK {
  private configManager: ConfigManager;
  private mapRenderer: MapRenderer;

  constructor() {
    this.configManager = new ConfigManager();
    this.mapRenderer = new MapRenderer(this.configManager);
  }

  /**
   * Configure the SDK with required API keys and optional settings
   */
  public configure(config: Config): void {
    this.configManager.configure(config);
  }

  /**
   * Fetch available ships (with pagination)
   */
  public async fetchShips(
    options: FetchShipsOptions
  ): Promise<FetchShipsResponse> {
    return fetchShips(options, this.configManager);
  }

  /**
   * Load and render a map for a specific itinerary
   */
  public async loadMap(params: LoadMapParams): Promise<boolean> {
    return this.mapRenderer.loadMap(params);
  }

  /**
   * Destroy a map instance
   */
  public async destroy(container: string): Promise<boolean> {
    return this.mapRenderer.destroy(container);
  }

  /**
   * Resize a map instance
   */
  public async resizeMap(container: string): Promise<boolean> {
    return this.mapRenderer.resizeMap(container);
  }

  /**
   * Check if SDK is properly configured
   */
  public isConfigured(): boolean {
    return this.configManager.isConfigured();
  }

  /**
   * Get current SDK configuration (for debugging)
   */
  public getConfig(): Config {
    return this.configManager.getConfig();
  }

  /**
   * Get available map styles
   */
  public getAvailableMapStyles(): string[] {
    return this.configManager.getAvailableMapStyles();
  }

  /**
   * Add a new map style to available styles
   */
  public addMapStyle(style: string): void {
    this.configManager.addMapStyle(style);
  }
}

// Auto-configuration from script tag data attributes (if running in a browser with data-* supplied)
function autoConfigureFromScriptTag(): void {
  // Ensure is browser env
  if (typeof document === "undefined") return;

  // Find the script tag that loaded this SDK - look for tcg-sdk or index.umd.js
  const scripts = document.querySelectorAll(
    'script[src*="tcg-sdk"], script[src*="index.umd.js"]'
  );
  let scriptTag: HTMLScriptElement | null = null;

  // Find the most recently added script tag
  for (let i = scripts.length - 1; i >= 0; i--) {
    scriptTag = scripts[i] as HTMLScriptElement;
    break;
  }

  if (!scriptTag) return;

  // Extract data attributes
  const mapboxKey = scriptTag.getAttribute("data-mapbox-key");
  const cruisemapsKey = scriptTag.getAttribute("data-cruisemaps-key");

  // Only auto-configure if we have all thse required keys
  if (!mapboxKey || !cruisemapsKey) {
    return;
  }

  const config: Config = {
    auth: {
      mapBoxKey: mapboxKey,
      cruiseMapsKey: cruisemapsKey,
    },
    mapDefaults: {
      mapStyle: "mapbox://styles/mapbox/streets-v11",
      zoomLevel: 10,
      is3d: false,
      isStatic: false,
      hasArrows: true,
      height: 400,
      width: 600,
      center: [-74.5, 40],
      portStyle: {
        startPort: { color: "#27ae60", radius: 10 },
        endPort: { color: "#e74c3c", radius: 10 },
        intermediatePorts: { color: "#ff6b6b", radius: 6 },
      },
      trackStyle: { color: "green", width: 1.5 },
    },
    availableMapStyles: [
      "mapbox://styles/mapbox/streets-v11",
      "mapbox://styles/mapbox/light-v11",
      "mapbox://styles/mapbox/dark-v11",
      "mapbox://styles/mapbox/satellite-v9",
      "mapbox://styles/mapbox/satellite-streets-v11",
      "mapbox://styles/mapbox/navigation-day-v1",
      "mapbox://styles/mapbox/navigation-night-v1",
    ],
    api: {
      apiBaseUrl: "http://localhost:8000/api/v1",
      shipsEndpoint: "http://localhost:8000/api/v1/ships",
      itinerariesEndpoint: "http://localhost:8000/api/v1/ships",
    },
    network: {
      maxRetries: 3,
      timeoutMs: 30000,
    },
  };

  try {
    sdk.configure(config);

    // Dispatch success event
    const event = new CustomEvent("tcgSDKReady", {
      detail: { configured: true, source: "auto-config" },
    });
    document.dispatchEvent(event);
  } catch (error) {
    console.error("TCG SDK auto-configuration failed:", error);

    // Dispatch error event
    const event = new CustomEvent("tcgSDKError", {
      detail: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    document.dispatchEvent(event);
  }
}

export const sdk = new TCMSDK();

// Auto-configure when the script loads (if in browser)
const isBrowser = typeof window !== "undefined";
if (isBrowser) {
  autoConfigureFromScriptTag();
}

export { TCMSDK };

export default sdk;
