// client/src/MapComponent.jsx
import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import apiService from './services/apiService';


//Mapbox access token for map authentication
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * MapComponent - Interactive map interface for energy data visualization
 * 
 * This component provides a Mapbox-powered map interface that allows users to:
 * - Search for locations by city name or ZIP code
 * - Select different energy data types (solar, wind, combined, custom)
 * - Input custom parameters for energy calculations
 * - View markers and popups for selected locations
 * 
 * @param {Function} onDataUpdate - Callback function to update parent component with energy data
 */
const MapComponent = ({ onDataUpdate }) => {
  // State for the Mapbox map instance
  const [map, setMap] = useState(null);
  
  // State to track if the map container is ready for initialization
  const [containerReady, setContainerReady] = useState(false);
  
  // State to store all map markers for cleanup purposes
  const [markers, setMarkers] = useState([]);
  
  // State to control display of token warning popup
  const [showTokenWarning, setShowTokenWarning] = useState(false);
  
  // State for selected API endpoint type
  const [endpoint, setEndpoint] = useState('energy'); // 'solar', 'wind', 'energy', 'calculate'
  
  // State for custom calculation parameters
  const [parameters, setParameters] = useState({
    area: 1, // Area in square meters
    solarEfficiency: 0.2, // Solar panel efficiency (0-1)
    windEfficiency: 0.4 // Wind turbine efficiency (0-1)
  });

  /**
   * Effect: Initialize map container and check for valid token
   * 
   * This effect runs once when the component mounts to:
   * - Validate the Mapbox token
   * - Set up the Mapbox access token
   * - Mark the container as ready for map initialization
   */
  useEffect(() => {
    // Check if token is missing or using placeholder value
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === "your_mapbox_token_here") {
      setShowTokenWarning(true);
    } else {
      // Set the global Mapbox access token
      mapboxgl.accessToken = MAPBOX_TOKEN;
    }
    
    // Mark the container as ready after the component mounts
    setContainerReady(true);
  }, []);

  /**
   * Effect: Initialize the Mapbox map instance
   * 
   * This effect runs when the container is ready and creates the map instance
   * with default settings (centered on the US with appropriate zoom level).
   */
  useEffect(() => {
    if (containerReady && MAPBOX_TOKEN && MAPBOX_TOKEN !== "your_mapbox_token_here") {
      const mapContainer = document.getElementById("map");
      
      if (mapContainer) {
        // Create new Mapbox map instance
        const mapInstance = new mapboxgl.Map({
          container: "map", // HTML element ID
          style: "mapbox://styles/mapbox/streets-v11", // Map style
          center: [-98.5795, 39.8283], // Center on continental US
          zoom: 3, // Zoom level to show entire US
        });

        setMap(mapInstance);

        // Cleanup function to remove map when component unmounts
        return () => mapInstance.remove();
      } else {
        console.error("Map container not found!");
      }
    }
  }, [containerReady]);

  /**
   * Function to remove all existing markers from the map
   * 
   * This is called before adding new markers to prevent accumulation
   * of markers from previous searches.
   */
  const removeMarkers = () => {
    markers.forEach((marker) => marker.remove());
    setMarkers([]);
  };

  /**
   * Main function to search for a location and fetch energy data
   * 
   * This function:
   * 1. Validates user input
   * 2. Geocodes the location using Mapbox API
   * 3. Fetches energy data from the backend
   * 4. Updates the map with a marker
   * 5. Calls the parent callback with the data
   */
  const searchLocation = async () => {
    // Get the location input value
    const locationInput = document.getElementById("location").value;
    
    // Validate input
    if (!locationInput) {
      alert("Please enter a ZIP Code or City.");
      return;
    }

    // Set loading state in parent component
    onDataUpdate(null, true, null);

    try {
      // Step 1: Geocode the location using the API service
      const { coordinates, placeName } = await apiService.geocodeLocation(locationInput, MAPBOX_TOKEN);
      const [longitude, latitude] = coordinates;

      // Step 2: Remove any existing markers
      removeMarkers();

      // Step 3: Fetch energy data from the backend API
      try {
        const apiResponse = await apiService.fetchData(endpoint, latitude, longitude, parameters);
        
        if (apiResponse) {
          console.log('API Response:', apiResponse);
          // Update parent component with successful data
          onDataUpdate(apiResponse, false, null);
        } else {
          // Handle case where API returns empty response
          onDataUpdate(null, false, "No data received from server");
        }
      } catch (error) {
        console.error("Error fetching energy data:", error);
        // Update parent component with error state
        onDataUpdate(null, false, error.message);
        return;
      }

      // Step 4: Update the map view and add marker
      if (map) {
        // Smoothly fly to the new location
        map.flyTo({
          center: [longitude, latitude],
          zoom: 12, // Zoom in to show local area
        });

        // Create and add a new marker with popup
        const marker = new mapboxgl.Marker()
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setText(placeName))
          .addTo(map);

        // Update state with the new marker
        setMarkers([marker]);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      // Update parent component with geocoding error
      onDataUpdate(null, false, error.message || "An error occurred while searching for the location. Please try again.");
    }
  };

  /**
   * Handler for parameter input changes
   * 
   * Updates the parameters state when user modifies custom calculation values.
   * Allows empty values and converts valid numbers.
   * 
   * @param {string} param - Parameter name ('area', 'solarEfficiency', 'windEfficiency')
   * @param {string} value - New value from input field
   */
  const handleParameterChange = (param, value) => {
    setParameters(prev => ({
      ...prev,
      [param]: value === '' ? '' : parseFloat(value) || 0
    }));
  };

  // Main component render
  return (
    <div className="map-container"> 
      {/* Token warning popup - shown when Mapbox token is missing or invalid */}
      {showTokenWarning && (
        <div className="token-warning">
          <div className="token-warning-content">
            <span>⚠️Add REACT_APP_MAPBOX_TOKEN</span>
            <button 
              onClick={() => setShowTokenWarning(false)}
              className="token-warning-close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Map container with full dimensions */}
      <div
        id="map"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* Controls overlay positioned over the map */}
        <div id="controls">
          {/* Location search input */}
          <input
            id="location"
            type="text"
            placeholder="Enter ZIP Code or City"
          />
          
          {/* Endpoint selection dropdown */}
          <select 
            value={endpoint} 
            onChange={(e) => setEndpoint(e.target.value)}
            title="Select data type"
          >
            <option value="energy">Both Solar & Wind</option>
            <option value="solar">Solar Only</option>
            <option value="wind">Wind Only</option>
            <option value="calculate">Custom Parameters</option>
          </select>

          {/* Custom parameters section - only shown when 'calculate' endpoint is selected */}
          {endpoint === 'calculate' && (
            <div className="parameter-controls">
              {/* Area input */}
              <div className="parameter-group">
                <label className="parameter-label">Area (m²)</label>
                <input
                  type="number"
                  value={parameters.area}
                  onChange={(e) => handleParameterChange('area', e.target.value)}
                  min="0.1"
                  step="0.1"
                  placeholder="Enter area"
                />
              </div>
              
              {/* Solar efficiency input */}
              <div className="parameter-group">
                <label className="parameter-label">Solar Efficiency</label>
                <input
                  type="number"
                  value={parameters.solarEfficiency}
                  onChange={(e) => handleParameterChange('solarEfficiency', e.target.value)}
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="0.0 - 1.0"
                />
              </div>
              
              {/* Wind efficiency input */}
              <div className="parameter-group">
                <label className="parameter-label">Wind Efficiency</label>
                <input
                  type="number"
                  value={parameters.windEfficiency}
                  onChange={(e) => handleParameterChange('windEfficiency', e.target.value)}
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="0.0 - 1.0"
                />
              </div>
            </div>
          )}

          {/* Search button to trigger location search and data fetching */}
          <button onClick={searchLocation}>Search</button>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;