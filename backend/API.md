# SolarMap Energy API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
No authentication required for this API.

## Overview
The SolarMap Energy API provides solar and wind energy data for specific geographic coordinates using NASA POWER data. The API includes caching for improved performance and supports custom energy calculations.

## Data Sources
- **NASA POWER API**: Solar irradiance and wind speed data (2012-2022)
- **Local Database**: Cached energy calculations for faster responses

## Endpoints

### 1. Health Check
Check if the API is running properly.

**Endpoint:** `GET /`

**Response:**
```json
{
  "message": "Energy API Backend"
}
```

**Status Codes:**
- `200 OK` - API is running

---

### 2. Get Solar Energy Data
Retrieve solar energy production data for specific coordinates.

**Endpoint:** `GET /api/solar/:lat/:lon`

**Parameters:**
- `lat` (path parameter): Latitude (-90 to 90)
- `lon` (path parameter): Longitude (-180 to 180)

**Example Request:**
```
GET /api/solar/43.65/-79.38
```

**Response:**
```json
{
  "latitude": 43.65,
  "longitude": -79.38,
  "solar": {
    "2012": {
      "01": 45.2,
      "02": 52.8,
      "03": 78.4,
      "04": 102.3,
      "05": 125.6,
      "06": 145.2,
      "07": 152.8,
      "08": 138.7,
      "09": 108.9,
      "10": 82.1,
      "11": 55.3,
      "12": 38.9,
      "annual": 1126.2
    },
    "2013": {
      // ... more years
    }
  },
  "timestamp": "2025-07-08T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid coordinates
- `500 Internal Server Error` - Server error

---

### 3. Get Wind Energy Data
Retrieve wind energy production data for specific coordinates.

**Endpoint:** `GET /api/wind/:lat/:lon`

**Parameters:**
- `lat` (path parameter): Latitude (-90 to 90)
- `lon` (path parameter): Longitude (-180 to 180)

**Example Request:**
```
GET /api/wind/43.65/-79.38
```

**Response:**
```json
{
  "latitude": 43.65,
  "longitude": -79.38,
  "wind": {
    "2012": {
      "01": 2.45,
      "02": 2.78,
      "03": 3.12,
      "04": 2.89,
      "05": 2.56,
      "06": 2.34,
      "07": 2.12,
      "08": 2.23,
      "09": 2.67,
      "10": 2.98,
      "11": 3.23,
      "12": 2.87,
      "annual": 31.24
    }
  },
  "timestamp": "2025-07-08T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid coordinates
- `500 Internal Server Error` - Server error

---

### 4. Get Both Solar and Wind Data
Retrieve both solar and wind energy data for specific coordinates.

**Endpoint:** `GET /api/energy/:lat/:lon`

**Parameters:**
- `lat` (path parameter): Latitude (-90 to 90)
- `lon` (path parameter): Longitude (-180 to 180)

**Example Request:**
```
GET /api/energy/43.65/-79.38
```

**Response:**
```json
{
  "latitude": 43.65,
  "longitude": -79.38,
  "solar": {
    "2012": {
      "01": 45.2,
      "annual": 1126.2
    }
  },
  "wind": {
    "2012": {
      "01": 2.45,
      "annual": 31.24
    }
  },
  "timestamp": "2025-07-08T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid coordinates
- `500 Internal Server Error` - Server error

---

### 5. Calculate Custom Energy Parameters
Calculate energy production with custom parameters for area and efficiency.

**Endpoint:** `POST /api/calculate`

**Content-Type:** `application/json`

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

**Parameters:**
- `latitude` (required): Latitude (-90 to 90)
- `longitude` (required): Longitude (-180 to 180)
- `area` (optional): Area in square meters (default: 1)
- `solarEfficiency` (optional): Solar panel efficiency 0-1 (default: 0.2)
- `windEfficiency` (optional): Wind turbine efficiency 0-1 (default: 0.4)

**Example Request:**
```bash
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

**Response:**
```json
{
  "latitude": 43.65,
  "longitude": -79.38,
  "solar": {
    "2012": {
      "01": 124.3,
      "annual": 3099.5
    }
  },
  "wind": {
    "2012": {
      "01": 2.14,
      "annual": 27.34
    }
  },
  "parameters": {
    "area": 25,
    "solarEfficiency": 0.22,
    "windEfficiency": 0.35
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Missing required parameters or invalid coordinates
- `500 Internal Server Error` - Server error

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid coordinates"
}
```

### 400 Bad Request (Missing Parameters)
```json
{
  "error": "Latitude and longitude are required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Data Format

### Energy Units
- **Solar Energy**: kWh (kilowatt-hours)
- **Wind Energy**: MWh (megawatt-hours)

### Time Format
- **Months**: Numbered 01-12
- **Years**: 2012-2022
- **Annual**: Sum of all months for that year

### Default Parameters
- **Solar Panel Area**: 1 m²
- **Solar Panel Efficiency**: 20% (0.2)
- **Wind Turbine Swept Area**: 1256.64 m² (20m radius)
- **Wind Turbine Efficiency**: 40% (0.4)

---

## Rate Limits
- No rate limits currently implemented
- First request for new coordinates may take 3-5 seconds (NASA API fetch)
- Subsequent requests are cached and return instantly

---

## Sample Locations for Testing

| Location | Latitude | Longitude | Description |
|----------|----------|-----------|-------------|
| Toronto, ON | 43.65 | -79.38 | Urban, moderate solar/wind |
| Vancouver, BC | 49.25 | -123.12 | Coastal, high wind potential |
| Phoenix, AZ | 33.45 | -112.07 | Desert, high solar potential |
| Denver, CO | 39.74 | -104.99 | High altitude, good wind |
| Miami, FL | 25.76 | -80.19 | Subtropical, consistent sun |

---

## Code Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

// Get solar data
const getSolarData = async (lat, lon) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/solar/${lat}/${lon}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Custom calculation
const calculateCustom = async (params) => {
  try {
    const response = await axios.post('http://localhost:3000/api/calculate', params);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Python
```python
import requests

# Get energy data
def get_energy_data(lat, lon):
    url = f"http://localhost:3000/api/energy/{lat}/{lon}"
    response = requests.get(url)
    return response.json()

# Custom calculation
def calculate_energy(lat, lon, area=1, solar_eff=0.2, wind_eff=0.4):
    url = "http://localhost:3000/api/calculate"
    data = {
        "latitude": lat,
        "longitude": lon,
        "area": area,
        "solarEfficiency": solar_eff,
        "windEfficiency": wind_eff
    }
    response = requests.post(url, json=data)
    return response.json()
```

---

## Changelog

### v1.0.0
- Initial API release
- Solar and wind energy endpoints
- Custom calculation endpoint
- Local database caching
- NASA POWER integration

---

## Support
For issues or questions, please create an issue in the project repository.