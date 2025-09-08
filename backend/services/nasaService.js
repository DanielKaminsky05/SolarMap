// services/nasaService.js
const axios = require('axios');

/**
 * Fetches solar and wind data from NASA POWER API for a specific location
 * @param {number} latitude - Latitude coordinate (-90 to 90)
 * @param {number} longitude - Longitude coordinate (-180 to 180)
 * @returns {Promise<Object>} Object containing solar data, wind data, and metadata
 * @throws {Error} If API request fails or returns invalid data
 */
const fetchNASAData = async (latitude, longitude) => {
    try {
        // Configure API request parameters
        const params = {
            parameters: "ALLSKY_SFC_SW_DWN,WS50M", // Solar irradiance and wind speed at 50m
            community: "RE",                        // Renewable Energy community dataset
            longitude: longitude,
            latitude: latitude,
            start: "2012",                          // Start year for data range
            end: "2022",                            // End year for data range
            format: "JSON"                          // Response format
        };

        // NASA POWER API endpoint for monthly temporal data at a point
        const url = "https://power.larc.nasa.gov/api/temporal/monthly/point";
        
        // Make HTTP GET request to NASA API
        const response = await axios.get(url, { params });

        // Check if request was successful
        if (response.status !== 200) {
            throw new Error(`NASA API error: ${response.status}`);
        }

        const data = response.data;
        
        // Extract solar irradiance data (kWh/m²/day)
        const solarData = data.properties.parameter.ALLSKY_SFC_SW_DWN;
        
        // Extract wind speed data at 50m height (m/s)
        const windData = data.properties.parameter.WS50M;

        // Return structured data object
        return {
            solar: solarData,        // Monthly solar irradiance values
            wind: windData,          // Monthly wind speed values
            metadata: {
                latitude: data.geometry.coordinates[1],   // Actual latitude from API
                longitude: data.geometry.coordinates[0],  // Actual longitude from API
                elevation: data.properties.parameter.elevation // Site elevation in meters
            }
        };

    } catch (error) {
        // Log error for debugging purposes
        console.error('Error fetching NASA data:', error);
        
        // Throw a more user-friendly error message
        throw new Error('Failed to fetch data from NASA POWER API');
    }
};

// Export the service function
module.exports = {
    fetchNASAData
};