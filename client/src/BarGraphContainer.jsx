// client/src/BarGraphContainer.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * BarGraphContainer Component
 * 
 * This component renders an interactive bar chart for energy data visualization.
 * It supports both solar and wind energy data, with options to view yearly data
 * or averages across all years.
 * 
 * @param {Object} energyData - The energy data object containing solar/wind data by year and month
 * @param {boolean} loading - Loading state indicator
 * @param {string} error - Error message if data fetching failed
 */
const BarGraphContainer = ({ energyData, loading, error }) => {
  // State for tracking the currently selected year
  const [currentYear, setCurrentYear] = useState(null);
  
  // State for storing all available years in the dataset
  const [availableYears, setAvailableYears] = useState([]);
  
  // State for view mode: 'yearly' shows data for specific year, 'average' shows multi-year average
  const [viewMode, setViewMode] = useState('yearly');
  
  // State for data type: 'solar' or 'wind' - determines which dataset to display
  const [dataType, setDataType] = useState('solar');
  
  // State for the processed data that will be displayed in the chart
  const [processedData, setProcessedData] = useState([]);

  /**
   * Effect: Initialize component state when energy data changes
   * - Extracts available years from the dataset
   * - Sets the default year to display
   * - Determines the default data type based on available data
   */
  useEffect(() => {
    if (energyData) {
      // Extract years from the data structure, filtering out non-numeric keys
      const years = Object.keys(energyData.solar || energyData.wind || {})
        .filter(key => key !== 'timestamp' && !isNaN(key))
        .sort();
      
      setAvailableYears(years);
      
      // Set the first available year as default if no year is currently selected
      if (years.length > 0 && !currentYear) {
        setCurrentYear(years[0]);
      }
      
      // Set default data type based on what's available in the dataset
      if (energyData.solar && energyData.wind) {
        setDataType('solar'); // Default to solar if both are available
      } else if (energyData.solar) {
        setDataType('solar');
      } else if (energyData.wind) {
        setDataType('wind');
      }
    }
  }, [energyData]);

  /**
   * Effect: Process data for chart display whenever key state changes
   * - Triggers when energy data, current year, view mode, or data type changes
   * - Calls appropriate processing function based on view mode
   */
  useEffect(() => {
    if (!energyData || !currentYear) {
      setProcessedData([]);
      return;
    }

    if (viewMode === 'yearly') {
      processYearlyData();
    } else {
      processAverageData();
    }
  }, [energyData, currentYear, viewMode, dataType]);

  /**
   * Processes data for yearly view
   * - Extracts monthly data for the selected year and data type
   * - Converts raw data into format suitable for chart display
   */
  const processYearlyData = () => {
    // Select the appropriate dataset based on current data type
    const data = dataType === 'solar' ? energyData.solar : energyData.wind;
    
    // Exit early if no data available for selected year
    if (!data || !data[currentYear]) {
      setProcessedData([]);
      return;
    }

    const yearData = data[currentYear];
    
    // Month keys and display names for chart
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Transform data into chart-friendly format
    const processed = months.map((month, index) => ({
      name: monthNames[index], // Display name for x-axis
      value: yearData[month] || 0 // Energy value, default to 0 if missing
    }));

    setProcessedData(processed);
  };

  /**
   * Processes data for average view
   * - Calculates average values across all available years for each month
   * - Handles missing data gracefully by only averaging available values
   */
  const processAverageData = () => {
    // Select the appropriate dataset based on current data type
    const data = dataType === 'solar' ? energyData.solar : energyData.wind;
    
    if (!data) {
      setProcessedData([]);
      return;
    }

    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Calculate averages for each month across all years
    const processed = months.map((month, index) => {
      let sum = 0;
      let count = 0;

      // Sum up values for this month across all available years
      availableYears.forEach(year => {
        if (data[year] && data[year][month] !== undefined) {
          sum += data[year][month];
          count++;
        }
      });

      return {
        name: monthNames[index],
        value: count > 0 ? sum / count : 0 // Calculate average or default to 0
      };
    });

    setProcessedData(processed);
  };

  /**
   * Handler for navigating to the previous year
   * - Only allows navigation if not at the first year
   */
  const handlePreviousYear = () => {
    const currentIndex = availableYears.indexOf(currentYear);
    if (currentIndex > 0) {
      setCurrentYear(availableYears[currentIndex - 1]);
    }
  };

  /**
   * Handler for navigating to the next year
   * - Only allows navigation if not at the last year
   */
  const handleNextYear = () => {
    const currentIndex = availableYears.indexOf(currentYear);
    if (currentIndex < availableYears.length - 1) {
      setCurrentYear(availableYears[currentIndex + 1]);
    }
  };

  /**
   * Handler for toggling between yearly and average view modes
   */
  const toggleViewMode = () => {
    setViewMode(viewMode === 'yearly' ? 'average' : 'yearly');
  };

  /**
   * Handler for toggling between solar and wind data types
   * - Only allows toggle if both data types are available
   */
  const toggleDataType = () => {
    if (energyData?.solar && energyData?.wind) {
      setDataType(dataType === 'solar' ? 'wind' : 'solar');
    }
  };

  /**
   * Generates the chart title based on current state
   * - Includes data type, view mode, and units
   */
  const getTitle = () => {
    if (!energyData) return "Energy Data";
    
    const typeLabel = dataType === 'solar' ? 'Solar Energy' : 'Wind Energy';
    const modeLabel = viewMode === 'yearly' ? currentYear : 'Average (All Years)';
    const unit = dataType === 'solar' ? 'kWh' : 'MWh';
    
    return `${typeLabel} - ${modeLabel} (${unit})`;
  };

  /**
   * Returns the appropriate color for the chart bars based on data type
   * - Solar: Orange (#FFA726)
   * - Wind: Blue (#42A5F5)
   */
  const getBarColor = () => {
    return dataType === 'solar' ? '#FFA726' : '#42A5F5';
  };

  // Loading state display
  if (loading) {
    return (
      <div className="bar-graph-container">
        <div className="loading-spinner">
          <div>Loading energy data...</div>
        </div>
      </div>
    );
  }

  // Error state display
  if (error) {
    return (
      <div className="bar-graph-container">
        <div className="error-message">
          <div>
            <strong>Error loading data:</strong><br />
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Empty state display when no data is available
  if (!energyData) {
    return (
      <div className="bar-graph-container">
        <div className="graph-header">
          <h2 className="graph-title">Search for a location to view energy data</h2>
        </div>
        <div className="chart-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: '#6c757d',
            fontSize: '16px'
          }}>
            Enter a location in the map to get started
          </div>
        </div>
      </div>
    );
  }

  // Main component render with chart and controls
  return (
    <div className="bar-graph-container">
      {/* Chart header with title and controls */}
      <div className="graph-header">
        <h2 className="graph-title">{getTitle()}</h2>
        
        <div className="graph-controls">
          {/* Year navigation controls - only shown in yearly view mode */}
          {viewMode === 'yearly' && availableYears.length > 0 && (
            <div className="year-controls">
              <button 
                className="year-button"
                onClick={handlePreviousYear}
                disabled={availableYears.indexOf(currentYear) === 0}
              >
                ←
              </button>
              <span className="year-display">{currentYear}</span>
              <button 
                className="year-button"
                onClick={handleNextYear}
                disabled={availableYears.indexOf(currentYear) === availableYears.length - 1}
              >
                →
              </button>
            </div>
          )}
          
          {/* View mode toggle button */}
          <button className="mode-toggle" onClick={toggleViewMode}>
            {viewMode === 'yearly' ? 'Show Average' : 'Show Yearly'}
          </button>
          
          {/* Data type toggle button - only shown if both solar and wind data available */}
          {energyData?.solar && energyData?.wind && (
            <button className="data-type-toggle" onClick={toggleDataType}>
              Switch to {dataType === 'solar' ? 'Wind' : 'Solar'}
            </button>
          )}
        </div>
      </div>

      {/* Chart container with responsive bar chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            {/* X-axis showing month names */}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            {/* Y-axis showing energy values */}
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            {/* Tooltip showing detailed information on hover */}
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              formatter={(value) => [
                `${value.toFixed(2)} ${dataType === 'solar' ? 'kWh' : 'MWh'}`,
                dataType === 'solar' ? 'Solar Energy' : 'Wind Energy'
              ]}
            />
            <Legend />
            {/* Bar component with dynamic color and rounded corners */}
            <Bar 
              dataKey="value" 
              fill={getBarColor()}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarGraphContainer;