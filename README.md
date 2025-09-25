# TCG SDK

Interactive Maps SDK for Cruise Route visualization using Mapbox GL JS.

## Installation

### NPM

```bash
npm install tcg-sdk
```

### CDN (UMD)

```html
<script src="https://unpkg.com/tcg-sdk@latest/dist/index.umd.js"></script>
```

## Quick Start

### 1. Configure the SDK

```javascript
import { sdk } from "tcg-sdk";

// Example configuration with custom settings
sdk.configure({
  auth: {
    mapBoxKey: "your-mapbox-key",
    cruiseMapsKey: "your-cruise-maps-key",
  },

  // Optional: Default map settings
  mapDefaults: {
    mapStyle: "mapbox://styles/mapbox/satellite-v9",
    zoomLevel: 12,
    height: 400,
    width: 600,
    center: [-74.5, 40],
    is3d: false,
    isStatic: false,
    hasArrows: true,

    // Optional: Custom track styling
    trackStyle: {
      color: "#0066cc",
      width: 2.5,
    },

    // Optional: Custom port styling
    portStyle: {
      startPort: { color: "#00ff00", radius: 12 },
      endPort: { color: "#ff0000", radius: 12 },
      intermediatePorts: { color: "#ffaa00", radius: 8 },
    },
  },

  // Available map styles (you can add more styles too)
  availableMapStyles: [
    "mapbox://styles/mapbox/streets-v11",
    "mapbox://styles/mapbox/satellite-v9",
  ],
});
```

### 2. Fetch Available Ships

```javascript
const ships = await sdk.fetchShips({
  offset: 0,
  limit: 10,
});

console.log("Available ships:", ships);
```

### 3. Load and Render a Map

```javascript
// Create a container element
const mapContainer = document.createElement("div");
mapContainer.id = "cruise-map";
document.body.appendChild(mapContainer);

// Basic map loading (uses default configuration)
const success = await sdk.loadMap({
  container: "cruise-map",
  data: {
    shipId: 1,
    startDate: 1640995200, // Unix timestamp
    duration: 604800, // Duration in seconds (7 days)
  },
});

// Advanced map loading with custom styling
const success = await sdk.loadMap({
  container: "cruise-map",
  data: {
    shipId: 1,
    startDate: 1640995200,
    duration: 604800,
  },
  map: {
    mapStyle: "mapbox://styles/mapbox/streets-v11",
    height: 400,
    width: 600,
    zoomLevel: 10,
    center: [-74.5, 40],
    isStatic: false,
    is3d: false,
    hasArrows: true,

    // Custom track styling
    trackStyle: {
      color: "#2ecc71", // Green track
      width: 3.0, // Thick line
    },

    // Custom port styling
    portStyle: {
      startPort: { color: "#27ae60", radius: 12 }, // Large green start port
      endPort: { color: "#e74c3c", radius: 12 }, // Large red end port
      intermediatePorts: { color: "#3498db", radius: 8 }, // Medium blue intermediate ports
    },
  },
});

if (success) {
  console.log("Map loaded successfully");
} else {
  console.error("Failed to load map");
}
```

### 4. Destroy a Map

```javascript
await sdk.destroy("cruise-map");
```

## Error Handling (this is currently an incomplete feature)

The SDK provides specific error types for different failure scenarios:

```javascript
import {
  sdk,
  NetworkError,
  RateLimitError,
  AuthenticationError,
} from "tcg-sdk";

try {
  const ships = await sdk.fetchShips({ offset: 0, limit: 10 });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error("Rate limit exceeded");
  } else if (error instanceof AuthenticationError) {
    console.error("Invalid API key");
  } else if (error instanceof NetworkError) {
    console.error("Network error:", error.message);
  }
}
```

## Getting started with the demo page

The SDK includes an interactive demo page that showcases features of the SDK in a testing environment. You can use this page to understand the SDK's capabilities before integration.

1. **Configure API Keys by first editing `/demo/tcg-demo.html` and replace the placeholder values:**

   ```html
   <script
     src="../dist/index.umd.js"
     data-mapbox-key="REPLACE_WITH_YOUR_MAPBOX_KEY"
     data-cruisemaps-key="REPLACE_WITH_YOUR_CRUISEMAPS_KEY"
   ></script>
   ```

2. **Build the SDK (this should create a ./dist file under the project directory)**

   ```bash
   npm run build
   ```

3. **Start a local server**

   ```bash
   # Option 1: Using Node.js http-server
   npx http-server . -p 8080

   # Option 2: Using Python
   python -m http.server 8080

   # Also, feel free to use any other server of your choice!
   ```

4. **Open the demo**

   Navigate to on your browser: `http://localhost:8080/demo/tcg-demo.html`
