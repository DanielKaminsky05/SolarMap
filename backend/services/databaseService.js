// services/databaseService.js
const fs = require('fs');
const path = require('path');

// Define the path to the JSON database file
const DB_FILE = path.join(__dirname, '../data/energy_database.json');

/**
 * Initialize database file if it doesn't exist
 * Creates the data directory and empty JSON array file
 */
const initializeDatabase = () => {
    // Get the directory path for the database file
    const dbDir = path.dirname(DB_FILE);
    
    // Create directory if it doesn't exist (recursive creates parent dirs too)
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Create empty JSON array file if database doesn't exist
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
    }
};

/**
 * Read and parse the JSON database file
 * @returns {Array} Array of energy data objects
 */
const readDatabase = () => {
    try {
        // Ensure database exists before reading
        initializeDatabase();
        
        // Read file content as UTF-8 string
        const data = fs.readFileSync(DB_FILE, 'utf8');
        
        // Parse JSON string to JavaScript array
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        // Return empty array if read fails
        return [];
    }
};

/**
 * Write data array to JSON database file
 * @param {Array} data - Array of energy data objects to save
 * @throws {Error} If file write operation fails
 */
const writeDatabase = (data) => {
    try {
        // Write data as formatted JSON (indent of 2 spaces)
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing database:', error);
        throw error; // Re-throw to let caller handle the error
    }
};

/**
 * Find energy data by coordinates within a tolerance range
 * @param {number} latitude - Target latitude coordinate
 * @param {number} longitude - Target longitude coordinate
 * @param {number} tolerance - Search tolerance in degrees (default: 0.01)
 * @returns {Object|undefined} Found energy data object or undefined if not found
 */
const findByCoordinates = (latitude, longitude, tolerance = 0.01) => {
    const database = readDatabase();
    
    // Find first entry where both lat/lng are within tolerance
    return database.find(entry => 
        Math.abs(entry.latitude - latitude) < tolerance &&
        Math.abs(entry.longitude - longitude) < tolerance
    );
};

/**
 * Save energy data to database, replacing any existing entry at same coordinates
 * @param {Object} energyData - Energy data object containing latitude, longitude, and energy values
 * @returns {Object} The saved energy data object
 */
const saveEnergyData = (energyData) => {
    const database = readDatabase();
    
    // Remove existing entry for same coordinates (within 0.01 degree tolerance)
    const filteredDatabase = database.filter(entry =>
        !(Math.abs(entry.latitude - energyData.latitude) < 0.01 &&
          Math.abs(entry.longitude - energyData.longitude) < 0.01)
    );
    
    // Add new entry to the filtered database
    filteredDatabase.push(energyData);
    
    // Write updated database back to file
    writeDatabase(filteredDatabase);
    
    // Return the saved data
    return energyData;
};

/**
 * Get all energy data from the database
 * @returns {Array} Array of all energy data objects
 */
const getAllData = () => {
    return readDatabase();
};

// Export all public functions
module.exports = {
    findByCoordinates,
    saveEnergyData,
    getAllData
};