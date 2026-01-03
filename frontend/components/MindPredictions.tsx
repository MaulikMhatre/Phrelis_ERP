"use client";

import React, { useState } from 'react';
import { CloudRain, Calendar, ArrowRight } from 'lucide-react';

interface PredictionResult {
  predicted_inflow: number;
  risk_level: string;
  contributing_factors: string[];
}

const MindPredictions: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weather, setWeather] = useState("Clear");
  const [event, setEvent] = useState("");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/predict-inflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          weather_condition: weather,
          local_event: event || null
        })
      });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
      <h2 className="text-xl font-bold mb-4 text-gray-800">The "Mind": Inflow Forecaster</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Weather Forecast</label>
          <select 
            value={weather} 
            onChange={(e) => setWeather(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            <option>Clear</option>
            <option>Rain</option>
            <option>Snow</option>
            <option>Heatwave</option>
            <option>Cold Snap</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Local Event (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Marathon, Festival"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
        
        <button 
          onClick={handlePredict}
          disabled={loading}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Predict Inflow'}
        </button>
      </div>

      {prediction && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">Predicted Inflow</span>
            <span className="text-2xl font-bold text-gray-900">{prediction.predicted_inflow} Patients</span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              prediction.risk_level === 'Critical' ? 'bg-red-100 text-red-800' :
              prediction.risk_level === 'High' ? 'bg-orange-100 text-orange-800' :
              'bg-green-100 text-green-800'
            }`}>
              {prediction.risk_level} Risk
            </span>
          </div>
          
          {prediction.contributing_factors.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Factors:</p>
              <ul className="list-disc pl-4 text-sm text-gray-600">
                {prediction.contributing_factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MindPredictions;
