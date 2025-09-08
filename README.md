# SolarMap
Data visualization for Sunshine and Wind level for US & Canada

## Project Structure
```
sonnetEdit/
├── backend/           # Express.js API server
├── client/           # React frontend application
├── controllers/      # API route handlers
├── services/         # External API integrations
├── utils/           # Utility functions
└── data/            # Local database storage
```

## Running the Code

### Backend Setup
```bash
# Install dependencies
npm i

# Start the API server
node server.js
```
Server will run on `http://localhost:3000`

### Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

#Add mapbox token to MapComponent

# Start the development server
npm start
```
Frontend will run on `http://localhost:5173`

### Getting a Mapbox Token
1. Sign up at [mapbox.com](https://www.mapbox.com/)
2. Go to your account dashboard
3. Copy your default public token
4. Add it to MapComponent.jsx

## Frontend Features

### Interactive Map
- **Search**: Enter ZIP codes or city names to find locations
- **Geocoding**: Automatically converts addresses to coordinates
- **Markers**: Visual indicators for searched locations
- **Energy Data**: Fetches solar and wind data for selected locations

### Token Management
- **Graceful Fallback**: Map displays with OpenStreetMap tiles if no token
- **Warning System**: Helpful popup guides users to add Mapbox token
- **Feature Detection**: Search disabled without proper token

### Map Controls
- **Search Input**: ZIP code or city name search
- **Location Markers**: Click to view location details
- **Energy Popups**: Display solar and wind energy information

## API Testing Guide

### Prerequisites
- Install [Postman](https://www.postman.com/) or use curl commands
- Backend server running on `http://localhost:3000`

### Available Endpoints

#### 1. Health Check
```
GET http://localhost:3000/
```
Expected response:
```json
{
  "message": "Energy API Backend"
}
```

#### 2. Get Solar Energy Data
```
GET http://localhost:3000/api/solar/:lat/:lon
```
**Example:**
```
GET http://localhost:3000/api/solar/43.65/-79.38
```

#### 3. Get Wind Energy Data
```
GET http://localhost:3000/api/wind/:lat/:lon
```
**Example:**
```
GET http://localhost:3000/api/wind/43.65/-79.38
```

#### 4. Get Both Solar and Wind Data
```
GET http://localhost:3000/api/energy/:lat/:lon
```
**Example:**
```
GET http://localhost:3000/api/energy/43.65/-79.38
```

#### 5. Calculate Custom Energy Parameters
```
POST http://localhost:3000/api/calculate
Content-Type: application/json
```
**Request Body:**
```json
{
  "latitude": 43.65,
  "longitude": -79.38,
  "area": 25,
  "solarEfficiency": 0.22,
  "windEfficiency": 0.35
}
```

### Sample Coordinates for Testing

| Location | Latitude | Longitude |
|----------|----------|-----------|
| Toronto, ON | 43.65 | -79.38 |
| Vancouver, BC | 49.25 | -123.12 |
| New York, NY | 40.71 | -74.01 |
| Los Angeles, CA | 34.05 | -118.24 |
| Denver, CO | 39.74 | -104.99 |

### Expected Response Format

**Solar/Wind Individual:**
```json
{
  "latitude": 43.65,
  "longitude": -79.38,
  "solar": {
    "2012": {
      "01": 45.2,
      "02": 52.8,
      "annual": 1234.5
    }
  },
  "timestamp": "2025-07-08T10:30:00.000Z"
}
```

**Both Energy Types:**
```json
{
  "latitude": 43.65,
  "longitude": -79.38,
  "solar": { /* solar data */ },
  "wind": { /* wind data */ },
  "timestamp": "2025-07-08T10:30:00.000Z"
}
```

### Testing with Postman

1. **Create a new collection** called "SolarMap API"
2. **Add requests** for each endpoint above
3. **Set environment variables:**
   - `base_url`: `http://localhost:3000`
   - `test_lat`: `43.65`
   - `test_lon`: `-81.38`
4. **Use variables in requests:**
   ```
   {{base_url}}/api/solar/{{test_lat}}/{{test_lon}}
   ```

### Testing with curl

```bash
# Health check
curl http://localhost:3000/

# Solar data
curl http://localhost:3000/api/solar/43.65/-79.38

# Wind data
curl http://localhost:3000/api/wind/43.65/-79.38

# Both energy types
curl http://localhost:3000/api/energy/43.65/-79.38

# Custom calculation
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 43.65,
    "longitude": -79.38,
    "area": 25,
    "solarEfficiency": 0.22,
    "windEfficiency": 0.35
  }'
```

## Frontend Integration

### MapComponent Usage
```jsx
import MapComponent from './MapComponent';

// The component handles:
// - Mapbox token validation
// - Location search and geocoding
// - Energy data fetching
// - Map visualization
function App() {
  return <MapComponent />;
}
```

### API Integration
The frontend automatically calls the backend API when locations are searched:
```javascript
// Searches trigger energy data fetch
const response = await axios.get(
  `http://localhost:3000/api/energy/${latitude}/${longitude}`
);
```

## Error Handling

### API Errors
**Invalid Coordinates:**
```json
{
  "error": "Latitude must be between -90 and 90"
}
```

**Missing Parameters:**
```json
{
  "error": "Latitude and longitude are required"
}
```

**Server Error:**
```json
{
  "error": "Internal server error"
}
```

### Frontend Errors
- **No Mapbox Token**: Shows warning popup with setup instructions
- **Location Not Found**: Alert message for invalid searches
- **API Unavailable**: Console errors for backend connection issues

## Data Sources & Performance

### NASA POWER API
- **Solar Data**: Irradiance values (kWh/m²/day)
- **Wind Data**: Wind speeds (m/s) at 50m height
- **Coverage**: Years 2012-2022 with monthly granularity
- **Geographic**: Global coverage with 0.5° resolution

### Caching Strategy
- **First Request**: 3-5 seconds (NASA API fetch)
- **Subsequent Requests**: Instant (local database)
- **Storage**: JSON files in `/data` directory
- **Coordinate Tolerance**: 0.01° for cache matching

### Units
- **Solar Energy**: kWh (kilowatt-hours)
- **Wind Energy**: MWh (megawatt-hours)
- **Default Parameters**: 1m² area, 20% solar efficiency, 40% wind efficiency

## Development Notes

### Environment Variables
```bash
# Backend - no special setup needed
# Frontend - required for map functionality
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

### File Structure
```
client/
├── src/
│   ├── MapComponent.jsx    # Main map interface
│   ├── MapComponent.css    # Styling for popups
│   └── App.js             # Root component
├── public/
└── .env                   # Environment variables
```

### Known Issues
- React StrictMode may cause map re-renders in development
- Search requires valid Mapbox token for geocoding
- Large coordinate datasets may take time to load initially

## Support
For issues or questions, please create an issue in the project repository.