"use client";
import React, { useEffect, useState } from 'react';
import { History, TrendingUp, Clock, Calendar } from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/predict/history')
      .then(res => res.json())
      .then(data => setHistory(data));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <History className="text-indigo-600" /> Prediction Logs & Peak Analysis
          </h1>
          <p className="text-gray-500">Historical performance of the Bimodal Heuristic Engine</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Total Forecast (6h)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Peak Volume</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Peak Hour</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Weather Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((log: any) => (
                <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-gray-900">{log.total_predicted}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-rose-500" />
                      <span className="font-bold text-rose-600">{log.peak_value} pts</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      {log.peak_time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">
                      {log.actual_weather_multiplier}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;