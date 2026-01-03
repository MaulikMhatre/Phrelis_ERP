"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Brain, CloudLightning } from 'lucide-react';

interface ForecastItem {
  hour: string;
  inflow: number;
}

interface PredictionData {
  forecast: ForecastItem[];
  total_predicted_inflow: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<PredictionData | null>(null);
  const [weatherMultiplier, setWeatherMultiplier] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/predict-inflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather_event_multiplier: weatherMultiplier
        })
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [weatherMultiplier]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            The Mind: Predictive Analytics
          </h1>
          <p className="text-gray-600">Future Inflow Forecasting (Next 6 Hours)</p>
        </div>
        
        <button
          onClick={() => setWeatherMultiplier(!weatherMultiplier)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
            weatherMultiplier 
              ? 'bg-purple-600 text-white ring-2 ring-purple-300' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <CloudLightning className={`w-5 h-5 ${weatherMultiplier ? 'text-yellow-300' : 'text-gray-500'}`} />
          {weatherMultiplier ? 'Event/Weather Mode ON (+30%)' : 'Enable Event/Weather Logic'}
        </button>
      </header>

      {loading && !data ? (
        <div className="p-12 text-center text-gray-500">Calculating Forecast Models...</div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Projected Patient Inflow</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="inflow" 
                    name="Predicted Arrivals" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-8 rounded-xl shadow-lg text-white flex flex-col justify-center">
            <h3 className="text-purple-100 font-medium text-lg mb-2">Total Predicted Inflow</h3>
            <div className="text-5xl font-bold mb-4">{data.total_predicted_inflow}</div>
            <p className="text-purple-100 opacity-90 mb-8">Patients expected over the next 6 hours.</p>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Risk Level</span>
                <span className={`font-bold px-2 py-1 rounded text-xs ${
                  data.total_predicted_inflow > 80 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  {data.total_predicted_inflow > 80 ? 'HIGH' : 'NORMAL'}
                </span>
              </div>
              <p className="text-xs opacity-75">
                Based on historical sinusoidal data {weatherMultiplier && "& active event multipliers"}.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
