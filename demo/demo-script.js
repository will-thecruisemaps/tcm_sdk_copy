/**
 * TCG SDK Demo Application
 * Interactive demo for testing the TCG SDK functionality
 */
class TCGDemo {
    constructor() {
        // State variables
        this.ships = [];
        this.isConfigured = false;
        this.loading = false;
        this.mapLoaded = false;
        this.sdkLoaded = false;

        // Configuration
        this.config = {
            defaultMapDimensions: {
                width: 800,
                height: 400
            },
            defaultShipId: 350,
            defaultDuration: 7,
            styleNames: {
                'mapbox://styles/mapbox/streets-v11': 'Streets',
                'mapbox://styles/mapbox/light-v11': 'Light',
                'mapbox://styles/mapbox/dark-v11': 'Dark',
                'mapbox://styles/mapbox/satellite-v9': 'Satellite',
                'mapbox://styles/mapbox/satellite-streets-v11': 'Satellite Streets',
                'mapbox://styles/mapbox/navigation-day-v1': 'Navigation Day',
                'mapbox://styles/mapbox/navigation-night-v1': 'Navigation Night'
            }
        };

        this.init();
    }

    /**
     * Initialize the demo application
     */
    init() {
        this.initializeDateInput();
        this.checkSDK();
        this.setupEventListeners();
    }

    /**
     * Initialize the start date input with default value (7 days ago)
     */
    initializeDateInput() {
        const startDateInput = document.getElementById('start-date');
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        startDateInput.value = sevenDaysAgo.toISOString().split('T')[0];
    }

    /**
     * Set up event listeners for the demo
     */
    setupEventListeners() {
        // Listen for SDK auto-configuration events
        document.addEventListener('tcgSDKReady', (event) => {
            if (event.detail.configured) {
                this.isConfigured = true;
                document.getElementById('sdk-configured').textContent = 'Yes';
                this.updateButtonStates();
                this.clearError();
                this.populateMapStyles();
            }
        });

        document.addEventListener('tcgSDKError', (event) => {
            this.showError(`SDK auto-configuration failed: ${event.detail.error}`);
        });

        // Update button states when inputs change
        document.addEventListener('input', () => {
            this.updateButtonStates();
        });

        // Bind methods to window for onclick handlers
        window.fetchShips = () => this.fetchShips();
        window.loadMap = () => this.loadMap();
        window.destroyMap = () => this.destroyMap();
        window.addCustomMapStyle = () => this.addCustomMapStyle();
        window.setShipId = (id) => this.setShipId(id);
    }

    /**
     * Check if SDK is loaded and configured
     */
    checkSDK() {
        if (window.TCGSDK && (window.TCGSDK.default || window.TCGSDK.sdk)) {
            this.sdkLoaded = true;
            document.getElementById('loading-section').classList.add('hidden');
            document.getElementById('ships-section').classList.remove('hidden');
            document.getElementById('map-section').classList.remove('hidden');
            document.getElementById('info-section').classList.remove('hidden');

            // Use the correct SDK reference
            const sdk = window.TCGSDK.default || window.TCGSDK.sdk;

            // Check if SDK is already configured (auto-configured by the SDK itself)
            if (sdk.isConfigured()) {
                this.isConfigured = true;
                document.getElementById('sdk-configured').textContent = 'Yes';
                this.updateButtonStates();
                this.populateMapStyles();
            }

            this.clearError();
        } else {
            setTimeout(() => this.checkSDK(), 100); // Check again in 100ms
        }
    }

    /**
     * Fetch ships from the SDK
     */
    async fetchShips() {
        if (!this.isConfigured) {
            this.showError("Please configure the SDK first");
            return;
        }

        this.setLoading(true);
        this.clearError();

        try {
            // Get offset and limit values from input fields
            const offset = parseInt(document.getElementById('ships-offset').value) || 0;
            const limit = parseInt(document.getElementById('ships-limit').value) || 10;

            const sdk = window.TCGSDK.default || window.TCGSDK.sdk;
            const shipsData = await sdk.fetchShips({
                offset: offset,
                limit: limit,
            });

            // Handle the response format: {total_ship_count, ships}
            if (shipsData && shipsData.ships) {
                this.ships = shipsData.ships;
                this.displayShips(this.ships, shipsData.total_ship_count);
                document.getElementById('ships-loaded').textContent = this.ships.length;
            } else {
                // Fallback for direct array response
                this.ships = shipsData;
                this.displayShips(this.ships);
                document.getElementById('ships-loaded').textContent = this.ships.length;
            }
        } catch (err) {
            this.showError(`Failed to fetch ships: ${err.message}`);
            this.ships = [];
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Display ships in the UI
     */
    displayShips(ships, totalCount = null) {
        const shipsList = document.getElementById('ships-list');
        const shipsUl = document.getElementById('ships-ul');
        const shipsCount = document.getElementById('ships-count');
        const totalShipsCount = document.getElementById('total-ships-count');

        if (ships.length > 0) {
            shipsList.classList.remove('hidden');
            shipsCount.textContent = ships.length;

            // Always update total count if provided
            if (totalCount !== null && totalCount !== undefined) {
                totalShipsCount.textContent = totalCount;
            } else {
                totalShipsCount.textContent = ships.length;
            }

            shipsUl.innerHTML = '';
            ships.forEach(ship => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>ID:</strong> ${ship.id} | <strong>Name:</strong> ${ship.name} | <strong>Cruise Line:</strong> ${ship.cruise_line || 'N/A'}`;
                shipsUl.appendChild(li);
            });
        } else {
            // Show empty state but still update counts
            shipsList.classList.remove('hidden');
            shipsCount.textContent = 0;
            if (totalCount !== null && totalCount !== undefined) {
                totalShipsCount.textContent = totalCount;
            } else {
                totalShipsCount.textContent = 0;
            }
            shipsUl.innerHTML = '<li>No ships found</li>';
        }
    }

    /**
     * Set ship ID in the form (used by ship selection buttons)
     */
    setShipId(id) {
        document.getElementById('ship-id').value = id;
    }

    /**
     * Populate map styles dropdown from SDK
     */
    populateMapStyles() {
        try {
            const select = document.getElementById('map-style');
            if (!select) return;

            if (!window.TCGSDK) return;

            const sdk = window.TCGSDK.default || window.TCGSDK.sdk;
            if (!sdk || !sdk.isConfigured()) return;

            const availableStyles = sdk.getAvailableMapStyles();

            // Clear any existing options
            select.innerHTML = '';

            // Populate options from SDK config
            availableStyles.forEach((style, index) => {
                const option = document.createElement('option');
                option.value = style;
                option.textContent = this.config.styleNames[style] || style;
                if (index === 1) { // Default to Light style (index 1)
                    option.selected = true;
                }
                select.appendChild(option);
            });

        } catch (error) {
            console.error('Failed to populate map styles:', error);
        }
    }

    /**
     * Add custom map style to SDK
     */
    addCustomMapStyle() {
        const customStyle = document.getElementById('custom-style-input').value.trim();
        if (!customStyle) {
            alert('Please enter a map style URL');
            return;
        }

        try {
            const sdk = window.TCGSDK.default || window.TCGSDK.sdk;
            sdk.addMapStyle(customStyle);
            this.populateMapStyles();
            document.getElementById('custom-style-input').value = '';
        } catch (error) {
            console.error('Failed to add custom map style:', error);
            alert('Failed to add custom map style');
        }
    }

    /**
     * Load map with current configuration
     */
    async loadMap() {
        if (!this.isConfigured) {
            this.showError("Please configure the SDK first");
            return;
        }

        const mapWidth = parseInt(document.getElementById('map-width').value) || this.config.defaultMapDimensions.width;
        const mapHeight = parseInt(document.getElementById('map-height').value) || this.config.defaultMapDimensions.height;
        const mapStyle = document.getElementById('map-style').value || "mapbox://styles/mapbox/light-v11";
        const zoomLevel = parseFloat(document.getElementById('zoom-level').value) || 10;
        const staticMap = document.getElementById('static-map').checked;
        const map3d = document.getElementById('3d-map').checked;
        const hasArrows = document.getElementById('has-arrows').checked;
        const trackColor = document.getElementById('track-color').value;
        const trackWidth = parseFloat(document.getElementById('track-width').value) || 2.5;

        // Port styling
        const startPortColor = document.getElementById('start-port-color').value;
        const startPortRadius = parseInt(document.getElementById('start-port-radius').value) || 12;
        const endPortColor = document.getElementById('end-port-color').value;
        const endPortRadius = parseInt(document.getElementById('end-port-radius').value) || 12;
        const intermediatePortColor = document.getElementById('intermediate-port-color').value;
        const intermediatePortRadius = parseInt(document.getElementById('intermediate-port-radius').value) || 8;

        const shipId = document.getElementById('ship-id').value;
        const startDate = document.getElementById('start-date').value;
        const duration = document.getElementById('duration').value;

        this.setLoading(true);
        this.clearError();

        try {
            // Structure the map options according to LoadMapParams interface
            const mapOptions = {
                container: "cruise-map",
                data: {
                    shipId: parseInt(shipId) || this.config.defaultShipId,
                    startDate: startDate ? Math.floor(new Date(startDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
                    duration: (parseInt(duration) || this.config.defaultDuration) * 24 * 60 * 60 // Convert days to seconds
                },
                map: {
                    mapStyle: mapStyle,
                    height: mapHeight,
                    width: mapWidth,
                    zoomLevel: zoomLevel,
                    is3d: map3d,
                    isStatic: staticMap,
                    hasArrows: hasArrows,
                    center: [-74.5, 40],
                    trackStyle: {
                        color: trackColor,
                        width: trackWidth
                    },
                    portStyle: {
                        startPort: {
                            color: startPortColor,
                            radius: startPortRadius
                        },
                        endPort: {
                            color: endPortColor,
                            radius: endPortRadius
                        },
                        intermediatePorts: {
                            color: intermediatePortColor,
                            radius: intermediatePortRadius
                        }
                    }
                }
            };

            console.log('Map options being sent to SDK:', mapOptions);

            const sdk = window.TCGSDK.default || window.TCGSDK.sdk;
            const success = await sdk.loadMap(mapOptions);

            if (success) {
                this.mapLoaded = true;
                this.updateButtonStates();
                document.getElementById('map-loaded').textContent = 'Yes';

                // Remove placeholder class to fix CSS conflicts
                const mapContainer = document.getElementById("cruise-map");
                if (mapContainer) {
                    mapContainer.classList.remove("map-placeholder");
                }
            } else {
                this.showError("Failed to load map");
            }
        } catch (err) {
            this.showError(`Map loading failed: ${err.message}`);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Destroy the current map
     */
    async destroyMap() {
        try {
            const sdk = window.TCGSDK.default || window.TCGSDK.sdk;
            await sdk.destroy("cruise-map");
            this.mapLoaded = false;
            this.updateButtonStates();
            document.getElementById('map-loaded').textContent = 'No';
            this.clearError();

            // Add placeholder class back
            const mapContainer = document.getElementById("cruise-map");
            if (mapContainer) {
                mapContainer.classList.add("map-placeholder");
                mapContainer.innerHTML = "Map will appear here after loading...";
            }
        } catch (err) {
            this.showError(`Failed to destroy map: ${err.message}`);
        }
    }

    /**
     * Set loading state for the application
     */
    setLoading(isLoading) {
        this.loading = isLoading;
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            if (isLoading) {
                btn.disabled = true;
            } else {
                // Re-enable buttons based on state
                this.updateButtonStates();
            }
        });

        // Update button text for loading states
        const fetchBtn = document.getElementById('fetch-ships-btn');
        const loadBtn = document.getElementById('load-map-btn');

        if (isLoading) {
            if (fetchBtn.textContent === 'Fetch Ships') fetchBtn.textContent = 'Loading...';
            if (loadBtn.textContent === 'Load Map') loadBtn.textContent = 'Loading Map...';
        } else {
            fetchBtn.textContent = 'Fetch Ships';
            loadBtn.textContent = 'Load Map';
        }
    }

    /**
     * Update button states based on current application state
     */
    updateButtonStates() {
        document.getElementById('fetch-ships-btn').disabled = !this.isConfigured;
        document.getElementById('load-map-btn').disabled = !this.isConfigured || this.mapLoaded;
        document.getElementById('destroy-map-btn').disabled = !this.mapLoaded;
    }

    /**
     * Show error message to user
     */
    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-section').classList.remove('hidden');
    }

    /**
     * Clear error message
     */
    clearError() {
        document.getElementById('error-section').classList.add('hidden');
    }
}

// Initialize the demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TCGDemo();
});