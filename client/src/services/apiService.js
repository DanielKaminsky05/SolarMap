import axios from 'axios';

// Base URL for the backend API server
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Create axios instance with default configuration
 * This provides consistent settings for all API requests
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout to prevent hanging requests
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API Service Object
 * 
 * This service handles all API communications for the application.
 * It provides methods for geocoding, fetching energy data, and calculating
 * custom energy values based on user parameters.
 */
const apiService = {
  /**
   * Geocoding service using Mapbox API
   * 
   * Converts location names (city, ZIP code, address) into geographic coordinates
   * using the Mapbox Geocoding API.
   * 
   * @param {string} location - The location to geocode (city, ZIP, address)
   * @param {string} mapboxToken - Mapbox access token for authentication
   * @returns {Promise<Object>} Object containing coordinates and place name
   * @throws {Error} If geocoding fails or location is not found
   */
  geocodeLocation: async (location, mapboxToken) => {
    try {
      // Make request to Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          location
        )}.json?access_token=${mapboxToken}`
      );
      
      // Check if request was successful
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if any results were found
      if (data.features.length === 0) {
        throw new Error('Location not found');
      }
      
      // Return the first result with coordinates and place name
      return {
        coordinates: data.features[0].geometry.coordinates, // [longitude, latitude]
        placeName: data.features[0].place_name,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  },

  /**
   * Fetch solar energy data for a specific location
   * 
   * Retrieves historical solar energy data from the backend API
   * for the given coordinates.
   * 
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object>} Solar energy data by year and month
   * @throws {Error} If API request fails
   */
  getSolarData: async (latitude, longitude) => {
    try {
      const response = await apiClient.get(`/api/solar/${latitude}/${longitude}`);
      return response.data;
    } catch (error) {
      console.error('Solar data error:', error);
      throw error;
    }
  },

  /**
   * Fetch wind energy data for a specific location
   * 
   * Retrieves historical wind energy data from the backend API
   * for the given coordinates.
   * 
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object>} Wind energy data by year and month
   * @throws {Error} If API request fails
   */
  getWindData: async (latitude, longitude) => {
    try {
      const response = await apiClient.get(`/api/wind/${latitude}/${longitude}`);
      return response.data;
    } catch (error) {
      console.error('Wind data error:', error);
      throw error;
    }
  },

  /**
   * Fetch combined energy data (both solar and wind) for a specific location
   * 
   * Retrieves both solar and wind energy data in a single request
   * for the given coordinates.
   * 
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object>} Combined energy data containing both solar and wind
   * @throws {Error} If API request fails
   */
  getEnergyData: async (latitude, longitude) => {
    try {
      const response = await apiClient.get(`/api/energy/${latitude}/${longitude}`);
      return response.data;
    } catch (error) {
      console.error('Energy data error:', error);
      throw error;
    }
  },

  /**
   * Calculate custom energy values based on user parameters
   * 
   * Sends location coordinates and custom parameters (area, efficiency)
   * to the backend for custom energy calculations.
   * 
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @param {Object} parameters - Custom calculation parameters
   * @param {number} parameters.area - Area in square meters
   * @param {number} parameters.solarEfficiency - Solar panel efficiency (0-1)
   * @param {number} parameters.windEfficiency - Wind turbine efficiency (0-1)
   * @returns {Promise<Object>} Calculated energy data
   * @throws {Error} If API request fails
   */
  calculateEnergy: async (latitude, longitude, parameters) => {
    try {
      const response = await apiClient.post('/api/calculate', {
        latitude: latitude,
        longitude: longitude,
        area: parameters.area,
        solarEfficiency: parameters.solarEfficiency,
        windEfficiency: parameters.windEfficiency,
      });
      return response.data;
    } catch (error) {
      console.error('Calculate energy error:', error);
      throw error;
    }
  },

  /**
   * Generic method to fetch data based on endpoint type
   * 
   * This is a convenience method that routes requests to the appropriate
   * specific method based on the endpoint parameter.
   * 
   * @param {string} endpoint - API endpoint type ('solar', 'wind', 'energy', 'calculate')
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @param {Object|null} parameters - Parameters for calculate endpoint (optional)
   * @returns {Promise<Object>} Energy data based on endpoint type
   * @throws {Error} If endpoint is invalid or API request fails
   */
  fetchData: async (endpoint, latitude, longitude, parameters = null) => {
    try {
      let response;
      
      // Route to appropriate method based on endpoint
      switch (endpoint) {
        case 'solar':
          response = await apiService.getSolarData(latitude, longitude);
          break;
        case 'wind':
          response = await apiService.getWindData(latitude, longitude);
          break;
        case 'energy':
          response = await apiService.getEnergyData(latitude, longitude);
          break;
        case 'calculate':
          // Calculate endpoint requires parameters
          if (!parameters) {
            throw new Error('Parameters required for calculate endpoint');
          }
          response = await apiService.calculateEnergy(latitude, longitude, parameters);
          break;
        default:
          throw new Error('Invalid endpoint selected');
      }
      
      return response;
    } catch (error) {
      // Enhanced error handling with user-friendly messages
      let errorMessage = 'Failed to fetch data. ';
      
      if (error.response) {
        // Server responded with an error status
        errorMessage += `Server responded with ${error.response.status}: ${error.response.data?.error || error.response.statusText}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += 'Unable to connect to the server. Please check if the backend is running.';
      } else {
        // Something else went wrong
        errorMessage += error.message;
      }
      
      throw new Error(errorMessage);
    }
  },
};

export default apiService;