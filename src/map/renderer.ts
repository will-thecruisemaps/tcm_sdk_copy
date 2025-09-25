import mapboxgl from "mapbox-gl";
import { LoadMapParams, Map3DConfig } from "../types";
import { ConfigManager } from "../core/config-manager";
import { fetchItinerary } from "../api/itineraries";
import { add3d } from "./add3d";
import {
  addTrackLayer,
  addPortsLayer,
  fitMapToRoute,
  addArrowsLayer,
} from "./sketcher";

export class MapRenderer {
  private maps: Map<string, mapboxgl.Map> = new Map();
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  public async loadMap(options: LoadMapParams): Promise<boolean> {
    try {
      // If map is not provided, fallback to the default map config
      const mapConfig = options.map ?? this.configManager.getMapDefaults();

      // Set Mapbox token
      mapboxgl.accessToken = this.configManager.getMapBoxKey();

      // Get container
      const container = document.getElementById(options.container);
      if (!container) {
        throw new Error(`Container '${options.container}' not found`);
      }

      // Clear and style container
      container.innerHTML = "";
      container.style.width = `${mapConfig.width}px`;
      container.style.height = `${mapConfig.height}px`;

      // Create the MapBox map object
      const map = new mapboxgl.Map({
        container: container,
        style: mapConfig.mapStyle,
        center: mapConfig.center,
        zoom: mapConfig.zoomLevel,
        interactive: !mapConfig.isStatic,
      });
      map.setStyle(mapConfig.mapStyle);

      // Fetch itinerary GeoJSON data using the API
      const geojsonData = await fetchItinerary(
        options.data.shipId,
        options.data.startDate,
        options.data.duration,
        this.configManager
      );

      if (!geojsonData) {
        throw new Error("Failed to fetch itinerary GeoJSON data");
      }

      // Load GeoJSON data when map is ready
      map.on("load", async () => {
        // Auto-center the map to show the route more clearly
        fitMapToRoute(map, geojsonData);

        // Add track layer first (this creates the data source)
        addTrackLayer(map, geojsonData, mapConfig.trackStyle);

        // Add arrows after the data source exists
        if (mapConfig.hasArrows) {
          addArrowsLayer(map);
        }

        // Add the ports
        addPortsLayer(map, mapConfig.portStyle);

        // Setup 3D effects (fog, sky, terrain) if enabled
        if (mapConfig.is3d) {
          add3d(map);
        }

        return true;
      });

      // Store map
      this.maps.set(options.container, map);
      return true;
    } catch (error) {
      console.error("Map creation failed:", error);
      return false;
    }
  }

  public async destroy(container: string): Promise<boolean> {
    try {
      const map = this.maps.get(container);
      if (map) {
        map.remove();
        this.maps.delete(container);
      }
      return true;
    } catch (error) {
      console.error("Failed to destroy map:", error);
      return false;
    }
  }

  public async resizeMap(container: string): Promise<boolean> {
    try {
      const map = this.maps.get(container);
      if (map) {
        map.resize();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to resize map:", error);
      return false;
    }
  }
}
