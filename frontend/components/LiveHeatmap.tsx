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

// Capacity mapping from your Backend's HospitalState class
const CAPACITY = {
  ER: 60,
  ICU: 20,
  Wards: 100,
  Surgery: 10
};

const LiveHeatmap: React.FC<HeatmapProps> = ({ occupancy }) => {
  // Logic: Calculate percentage based on backend capacity limits
  const getPercentage = (dept: string, value: number) => {
    const cap = CAPACITY[dept as keyof typeof CAPACITY] || 100;
    return Math.round((value / cap) * 100);
  };

  const getColor = (percent: number) => {
    if (percent < 60) return 'bg-emerald-500'; // Stable
    if (percent < 85) return 'bg-amber-500';   // Warning
    return 'bg-rose-600';                      // Critical
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-emerald-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Unit Load Heatmap</h2>
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Live Feed</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(occupancy).map(([dept, value]) => {
          const percentage = getPercentage(dept, value);
          const colorClass = getColor(percentage);
          
          return (
            <div 
              key={dept} 
              className={`p-4 rounded-xl text-white ${colorClass} transition-all duration-700 shadow-sm relative overflow-hidden`}
            >
              {/* Subtle background pulse for high-load areas */}
              {percentage >= 85 && (
                <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
              )}
              
              <div className="relative z-10">
                <h3 className="text-sm font-medium opacity-80 uppercase tracking-wider">{dept}</h3>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black">{percentage}%</p>
                </div>
                <p className="text-xs opacity-90 font-medium">
                  {value} / {CAPACITY[dept as keyof typeof CAPACITY] || '??'} Beds
                </p>
              </div>

              {/* Progress bar footer */}
              <div className="mt-3 w-full bg-black bg-opacity-10 h-1.5 rounded-full">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveHeatmap;