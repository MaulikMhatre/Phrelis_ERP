"use client";

import React from 'react';
import { Activity, Truck } from 'lucide-react';

interface ResourceProps {
  resources: {
    ventilators: { total: number; in_use: number };
    ambulances: { total: number; available: number };
  };
}

const ResourceInventory: React.FC<ResourceProps> = ({ resources }) => {
  const ventUsage = (resources.ventilators.in_use / resources.ventilators.total) * 100;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Critical Resources</h2>
      
      <div className="space-y-6">
        {/* Ventilators */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-700">Ventilators</span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {resources.ventilators.in_use} / {resources.ventilators.total} in use
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${ventUsage > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${ventUsage}%` }}
            ></div>
          </div>
        </div>

        {/* Ambulances */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-700">Ambulances</span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {resources.ambulances.available} Available
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1">
             {Array.from({ length: resources.ambulances.total }).map((_, i) => (
               <div 
                 key={i} 
                 className={`h-2 rounded-sm ${i < resources.ambulances.available ? 'bg-green-500' : 'bg-gray-300'}`}
               ></div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceInventory;
