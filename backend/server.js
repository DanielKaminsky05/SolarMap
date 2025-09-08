// server.js - Main Express server configuration
const express = require('express');
const cors = require('cors');
const { getEnergyData, calculateEnergy } = require('./controllers/energyController');

// Create Express application instance
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());            // Enable Cross-Origin Resource Sharing
app.use(express.json());    // Parse JSON request bodies

// Routes configuration

// Root endpoint - API health check
app.get('/', (req, res) => {
    res.json({ message: 'Energy API Backend' });
});

// Get solar energy data for specific coordinates
// URL format: /api/solar/:lat/:lon
app.get('/api/solar/:lat/:lon', getEnergyData('solar'));

// Get wind energy data for specific coordinates  
// URL format: /api/wind/:lat/:lon
app.get('/api/wind/:lat/:lon', getEnergyData('wind'));

// Get both solar and wind energy data for coordinates
// URL format: /api/energy/:lat/:lon
app.get('/api/energy/:lat/:lon', getEnergyData('both'));

// Calculate energy savings with custom parameters
// POST endpoint that accepts JSON body with parameters
// Expected body format:
// {
//   "latitude": 43.65,
//   "longitude": -81.38,
//   "area": 25,
//   "solarEfficiency": 0.22,
//   "windEfficiency": 0.35
// }
app.post('/api/calculate', calculateEnergy);

// Start server and listen on specified port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});