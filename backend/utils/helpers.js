// utils/helpers.js - Utility functions for coordinate validation and response formatting

/**
 * Validate and parse coordinate values
 * @param {string|number} lat - Latitude value to validate
 * @param {string|number} lon - Longitude value to validate
 * @returns {Object} Validation result with valid flag, parsed coordinates, or error message
 */
const validateCoordinates = (lat, lon) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
        return { valid: false, error: 'Invalid coordinate format' };
    }
    if (latitude < -90 || latitude > 90) {
        return { valid: false, error: 'Latitude must be between -90 and 90' };
    }
    if (longitude < -180 || longitude > 180) {
        return { valid: false, error: 'Longitude must be between -180 and 180' };
    }

    return { valid: true, latitude, longitude };
};

/**
 * Format energy data response based on requested type
 * @param {Object} data - Complete energy data object from database
 * @param {string} type - Type of energy data to include ('solar', 'wind', or 'both')
 * @returns {Object} Formatted response object with only requested energy data
 */
const formatEnergyResponse = (data, type) => {
    // Base response with location and timestamp
    const response = {
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp
    };
    
    // Include solar data if requested
    if (type === 'solar' || type === 'both') {
        response.solar = data.solar;
    }
    
    // Include wind data if requested
    if (type === 'wind' || type === 'both') {
        response.wind = data.wind;
    }
    
    return response;
};

// Export utility functions for use in other modules
module.exports = {
    validateCoordinates,
    formatEnergyResponse
};