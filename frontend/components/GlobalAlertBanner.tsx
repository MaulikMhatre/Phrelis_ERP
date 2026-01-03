"use client";

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Ambulance } from 'lucide-react';

interface Alert {
  type: string;
  message: string;
  level: string;
}

const GlobalAlertBanner = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts || []);
        }
      } catch (e) {
        // console.error("Failed to fetch alerts");
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-2 shadow-md animate-pulse">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <AlertTriangle className="w-6 h-6" />
        <span className="font-bold text-lg uppercase tracking-wider">
          CRITICAL SYSTEM ALERT:
        </span>
        <div className="flex gap-4">
          {alerts.map((alert, i) => (
             <span key={i} className="font-semibold">{alert.type}: {alert.message}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalAlertBanner;
