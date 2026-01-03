"use client";

import React from 'react';
import { Clock } from 'lucide-react';

interface GoldenHourProps {
  currentWait: number;
  predictedWait: number;
}

const GoldenHourClock: React.FC<GoldenHourProps> = ({ currentWait, predictedWait }) => {
  const isWorsening = predictedWait > currentWait;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">The "Golden Hour"</h2>
      </div>
      
      <div className="flex w-full justify-around mt-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Current Wait</p>
          <p className="text-3xl font-bold text-blue-600">{currentWait} <span className="text-lg">min</span></p>
        </div>
        
        <div className="h-12 w-px bg-gray-200"></div>
        
        <div className="text-center">
          <p className="text-gray-500 text-sm">Predicted (4h)</p>
          <p className={`text-3xl font-bold ${isWorsening ? 'text-red-500' : 'text-green-500'}`}>
            {predictedWait} <span className="text-lg">min</span>
          </p>
        </div>
      </div>
      
      {isWorsening && (
        <div className="mt-4 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
          Expected to Increase
        </div>
      )}
    </div>
  );
};

export default GoldenHourClock;
