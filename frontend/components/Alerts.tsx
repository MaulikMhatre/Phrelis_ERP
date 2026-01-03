"use client";

import React from 'react';
import { AlertTriangle, UserMinus } from 'lucide-react';

interface Alert {
  type: string;
  message: string;
  level: string;
}

interface AlertsProps {
  alerts: Alert[];
}

const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
        <h3 className="text-lg font-bold text-green-700">System Status: Normal</h3>
        <p className="text-gray-600">No active critical alerts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <div 
          key={index} 
          className={`p-4 rounded-lg shadow-md border-l-4 flex items-start gap-3 ${
            alert.level === 'Critical' ? 'bg-red-50 border-red-500' : 
            alert.level === 'High' ? 'bg-orange-50 border-orange-500' : 
            'bg-yellow-50 border-yellow-500'
          }`}
        >
          {alert.type === 'Staff Burnout' ? (
            <UserMinus className="w-6 h-6 text-orange-600 mt-1" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
          )}
          
          <div>
            <h3 className={`text-lg font-bold ${
              alert.level === 'Critical' ? 'text-red-800' : 
              alert.level === 'High' ? 'text-orange-800' : 
              'text-yellow-800'
            }`}>
              {alert.type}
            </h3>
            <p className="text-gray-800">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Alerts;
