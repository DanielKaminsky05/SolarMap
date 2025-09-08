// Constants for energy calculations
const DAYS_PER_MONTH = 30;                // Average days per month for calculations
const HOURS_PER_MONTH = 24 * 30;         // Total hours per month (720 hours)
const AIR_DENSITY = 1.225;               // Air density at sea level (kg/m³)
const MONTH_KEY = /^\d{6}$/;             // Regex to match YYYYMM format keys

/**
 * Calculate solar energy production from NASA irradiance data
 * @param {Object} data - NASA solar irradiance data (kWh/m²/day)
 * @param {number} area - Solar panel area in square meters (default: 1)
 * @param {number} efficiency - Solar panel efficiency (default: 0.2 = 20%)
 * @returns {Object} Structured energy data by year and month
 */
function calculateSolarEnergy(data, area = 1, efficiency = 0.2) {
  const result = {};

  // Iterate through each month's data
  for (const key of Object.keys(data)) {
    // Skip invalid keys or annual averages (ending with '13')
    if (!MONTH_KEY.test(key) || key.endsWith('13')) continue;

    // Extract year and month from key (YYYYMM format)
    const year = key.slice(0, 4);
    const month = key.slice(4, 6);

    // Calculate monthly energy production
    const irradiance = data[key];  // kWh/m²/day
    const energy = +(irradiance * area * efficiency * DAYS_PER_MONTH).toFixed(2);

    // Initialize year object if it doesn't exist
    if (!result[year]) {
      result[year] = { annual: 0 };
    }

    // Store monthly energy and update annual total
    result[year][month] = energy;
    result[year].annual += energy;
    result[year].annual = +result[year].annual.toFixed(2);
  }

  return result;
}

/**
 * Calculate wind energy production from NASA wind speed data
 * @param {Object} data - NASA wind speed data (m/s)
 * @param {number} area - Wind turbine swept area in square meters (default: 1256.64 = 20m radius)
 * @param {number} efficiency - Wind turbine efficiency (default: 0.4 = 40%)
 * @returns {Object} Structured energy data by year and month
 */
function calculateWindEnergy(data, area = 1256.64, efficiency = 0.4) {
  const result = {};

  // Iterate through each month's data
  for (const key of Object.keys(data)) {
    // Skip invalid keys or annual averages (ending with '13')
    if (!MONTH_KEY.test(key) || key.endsWith('13')) continue;

    // Extract year and month from key (YYYYMM format)
    const year = key.slice(0, 4);
    const month = key.slice(4, 6);

    // Calculate monthly wind energy using wind power formula
    const v = data[key];  // Wind speed in m/s
    // P = 0.5 * ρ * A * v³ * η (Wind power formula)
    const power = 0.5 * AIR_DENSITY * area * Math.pow(v, 3) * efficiency;
    // Convert to MWh for monthly energy production
    const energy = +(power * HOURS_PER_MONTH / 1e6).toFixed(2);

    // Initialize year object if it doesn't exist
    if (!result[year]) {
      result[year] = { annual: 0 };
    }

    // Store monthly energy and update annual total
    result[year][month] = energy;
    result[year].annual += energy;
    result[year].annual = +result[year].annual.toFixed(2);
  }

  return result;
}

module.exports = { calculateSolarEnergy, calculateWindEnergy };