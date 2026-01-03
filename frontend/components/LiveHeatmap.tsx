"use client";

import React from 'react';

interface HeatmapProps {
  occupancy: {
    ER: number;
    ICU: number;
    Surgery: number;
    Wards: number;
  };
}

const LiveHeatmap: React.FC<HeatmapProps> = ({ occupancy }) => {
  const getColor = (value: number) => {
    if (value < 60) return 'bg-green-500';
    if (value < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Hospital Heatmap</h2>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(occupancy).map(([dept, value]) => (
          <div key={dept} className={`p-4 rounded-lg text-white ${getColor(value)} transition-colors duration-500`}>
            <h3 className="text-lg font-semibold">{dept}</h3>
            <p className="text-3xl font-bold">{value}%</p>
            <p className="text-sm opacity-90">Occupancy</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveHeatmap;
