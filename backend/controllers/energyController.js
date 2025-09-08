// controllers/energyController.js
const { fetchNASAData } = require('../services/nasaService');
const { findByCoordinates, saveEnergyData } = require('../services/databaseService');
const { calculateSolarEnergy, calculateWindEnergy } = require('../utils/energyCalculator');
const { validateCoordinates } = require('../utils/helpers');
/**
 * Higher-order function that creates route handlers for different energy types
 * @param {string} type - Energy type ('solar', 'wind', or 'both')
 * @returns {Function} Express route handler function
 */
const getEnergyData = (type) => {
    return async (req, res) => {
        try {
            // Extract and validate coordinates from URL parameters
            const { lat, lon } = req.params;
         

            // Validate coordinate values
            const { valid, latitude, longitude, error } = validateCoordinates(lat, lon);
            if (!valid) {
                return res.status(400).json({ error });
            }

            // Check if data exists in local database cache
            let existingData = findByCoordinates(latitude, longitude);

            if (!existingData) {
                // Fetch from NASA API if not in database
                console.log(`Fetching new data for ${latitude}, ${longitude}`);
                const nasaData = await fetchNASAData(latitude, longitude);
                
                // Calculate energy values using default parameters
                const solarEnergy = calculateSolarEnergy(nasaData.solar);
                const windEnergy = calculateWindEnergy(nasaData.wind);

                // Create data object to save to database
                existingData = {
                    latitude,
                    longitude,
                    solar: solarEnergy,
                    wind: windEnergy,
                    rawData: nasaData,  // Store raw NASA data for custom calculations
                    timestamp: new Date().toISOString()
                };
                
                // Save to local database for future requests
                saveEnergyData(existingData);
            }

            // Return requested data type based on route
            switch (type) {
                case 'solar':
                    res.json({
                        latitude,
                        longitude,
                        solar: existingData.solar,
                        timestamp: existingData.timestamp
                    });
                    break;
                case 'wind':
                    res.json({
                        latitude,
                        longitude,
                        wind: existingData.wind,
                        timestamp: existingData.timestamp
                    });
                    break;
                case 'both':
                    res.json({
                        latitude,
                        longitude,
                        solar: existingData.solar,
                        wind: existingData.wind,
                        timestamp: existingData.timestamp
                    });
                    break;
                default:
                    res.status(400).json({ error: 'Invalid energy type' });
            }

        } catch (error) {
            console.error('Error getting energy data:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

/**
 * Calculate energy production with custom parameters
 * Expects JSON body with latitude, longitude, and optional parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const calculateEnergy = async (req, res) => {
    try {
        // Extract parameters from request body with defaults
        const {
            latitude,
            longitude,
            area = 1,                    // Default area: 1 m²
            solarEfficiency = 0.2,       // Default solar efficiency: 20%
            windEfficiency = 0.4         // Default wind efficiency: 40%
        } = req.body;

        // Validate required parameters
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        // Try to find existing data in database
        let energyData = findByCoordinates(latitude, longitude);

        // If no cache or missing rawData, fetch fresh data from NASA
        if (!energyData || !energyData.rawData) {
            const nasaData = await fetchNASAData(latitude, longitude);

            // Calculate with default parameters
            const solarEnergy = calculateSolarEnergy(nasaData.solar);
            const windEnergy = calculateWindEnergy(nasaData.wind);

            // Create and save energy data object
            energyData = {
                latitude,
                longitude,
                solar: solarEnergy,
                wind: windEnergy,
                rawData: nasaData,  // Store raw data for custom calculations
                timestamp: new Date().toISOString()
            };

            saveEnergyData(energyData);
        }

        // Validate raw data exists
        if (!energyData.rawData?.solar || !energyData.rawData?.wind) {
            return res.status(500).json({ error: 'Missing raw solar or wind data' });
        }

        // Check if custom parameters are different from defaults
        if (area !== 1 || solarEfficiency !== 0.2 || windEfficiency !== 0.4) {
            // Calculate with custom parameters
            const customSolar = calculateSolarEnergy(
                energyData.rawData.solar,
                area,
                solarEfficiency
            );
            const customWind = calculateWindEnergy(
                energyData.rawData.wind,
                area,
                windEfficiency
            );

            // Return custom calculations with parameters used
            return res.json({
                latitude,
                longitude,
                solar: customSolar,
                wind: customWind,
                parameters: { area, solarEfficiency, windEfficiency }
            });
        }

        // Return cached default calculations
        res.json({
            latitude,
            longitude,
            solar: energyData.solar,
            wind: energyData.wind
        });

    } catch (error) {
        console.error('Error calculating energy:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getEnergyData,
    calculateEnergy
};