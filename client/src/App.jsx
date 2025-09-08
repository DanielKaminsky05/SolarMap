// client/src/App.jsx
import "./App.css";
import MapComponent from "./MapComponent";
import BarGraphContainer from "./BarGraphContainer.jsx";
import { useState } from "react";

function App() {
  const [energyData, setEnergyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDataUpdate = (data, isLoading, errorMsg) => {
    setEnergyData(data);
    setLoading(isLoading);
    setError(errorMsg);
  };

  return (
    <div className="app">
      <div className="map-section">
        <MapComponent onDataUpdate={handleDataUpdate} />
      </div>
      <div className="graph-section">
        <BarGraphContainer 
          energyData={energyData} 
          loading={loading} 
          error={error} 
        />
      </div>
    </div>
  );
}

export default App;