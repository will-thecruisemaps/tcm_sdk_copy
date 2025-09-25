import { Map, LngLatBounds } from "mapbox-gl";
import {
  GeoJSONFeatureCollection,
  PortStyleConfig,
  TrackStyling,
} from "../types";

export const addPortsLayer = (map: Map, config?: PortStyleConfig) => {
  if (!map.getLayer("ports-layer")) {
    // Default styling if no config provided
    const startPort = config?.startPort || { color: "#27ae60", radius: 10 };
    const endPort = config?.endPort || { color: "#e74c3c", radius: 10 };
    const intermediatePorts = config?.intermediatePorts || {
      color: "#ff6b6b",
      radius: 6,
    };

    map.addLayer({
      id: "ports-layer",
      type: "circle",
      source: "track-source",
      filter: ["==", "$type", "Point"],
      paint: {
        "circle-radius": [
          "case",
          ["==", ["get", "Feature_type"], "start"],
          startPort.radius,
          ["==", ["get", "Feature_type"], "end"],
          endPort.radius,
          intermediatePorts.radius,
        ],
        "circle-color": [
          "case",
          ["==", ["get", "Feature_type"], "start"],
          startPort.color,
          ["==", ["get", "Feature_type"], "end"],
          endPort.color,
          intermediatePorts.color,
        ],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
        "circle-opacity": 0.9,
      },
    });
  }
};

export const addTrackLayer = (
  map: Map,
  geojsonData: any,
  config?: TrackStyling
) => {
  // Default styling if no config provided
  const trackStyle = config || { color: "green", width: 1.5 };

  map.addSource("track-source", {
    type: "geojson",
    data: geojsonData, // TODO: use correct type
  });

  if (!map.getLayer("track-layer")) {
    map.addLayer({
      id: "track-layer",
      type: "line",
      source: "track-source",
      paint: {
        "line-color": trackStyle.color,
        "line-width": trackStyle.width,
        "line-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8,
          1,
          9,
          0.5,
          10,
          0.3,
        ],
      },
    });
  }
};

export const addArrowsLayer = (map: Map) => {
  console.log("addArrowsLayer called");
  if (!map.getLayer("arrow-icons")) {
    console.log("Adding arrow-icons layer to map");
    map.addLayer({
      id: "arrow-icons",
      type: "symbol",
      source: "track-source",
      filter: ["==", "$type", "LineString"],
      layout: {
        "symbol-placement": "line",
        "symbol-spacing": 60,
        "text-field": "▶",
        "text-size": 16,
        "text-rotation-alignment": "map",
        "text-pitch-alignment": "viewport",
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "#3498db",
        "text-halo-width": 2,
        "text-opacity": 1,
      },
    });
  }
};

// ===== Helper functions =====

const calculateBounds = (
  geojson: GeoJSONFeatureCollection
): LngLatBounds | null => {
  if (!geojson?.features?.length) return null;

  const bounds = new LngLatBounds();
  let hasValidCoordinates = false;

  const addCoordinate = (coord: any) => {
    if (
      Array.isArray(coord) &&
      coord.length >= 2 &&
      typeof coord[0] === "number" &&
      typeof coord[1] === "number"
    ) {
      bounds.extend(coord as [number, number]);
      hasValidCoordinates = true;
    }
  };

  geojson.features.forEach((feature) => {
    if (!feature?.geometry?.coordinates) return;

    const { type, coordinates } = feature.geometry;

    if (type === "Point") {
      addCoordinate(coordinates);
    } else if (type === "LineString") {
      coordinates.forEach(addCoordinate);
    } else if (type === "MultiLineString") {
      coordinates.forEach((line: any) => line.forEach(addCoordinate));
    }
  });

  return hasValidCoordinates ? bounds : null;
};

export const fitMapToRoute = (map: Map, geojson: GeoJSONFeatureCollection) => {
  console.log("fitMapToRoute called with geojson:", geojson);

  const bounds = calculateBounds(geojson);
  if (bounds) {
    console.log("Bounds calculated successfully, fitting map to bounds");
    map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 12,
    });
  } else {
    console.warn("No bounds calculated, map will not be fitted to route");
  }
};
