"use client";

import React, { useEffect, useState } from 'react';
import LiveHeatmap from '@/components/LiveHeatmap';
import ResourceInventory from '@/components/ResourceInventory';
import { Activity, Users, AlertCircle, BedDouble, HeartPulse } from 'lucide-react';

interface DashboardData {
  occupancy: {
    ER: number;
    ICU: number;
    Surgery: number;
    Wards: number;
  };
  bed_stats: {
    total: number;
    occupied: number;
    available: number;
  };
  staff_ratio: string;
  resources: {
    Ventilators: { total: number; in_use: number };
    Ambulances: { total: number; available: number };
  };
  system_status?: {
    diversion_active: boolean;
    occupancy_rate: number;
  };
}

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/dashboard/stats');
      const json = await res.json();
      
      const adaptedData = {
        ...json,
        // Backend returns "Ventilators", "Ambulances" (capitalized)
        resources: {
            ventilators: json.resources.Ventilators,
            ambulances: json.resources.Ambulances
        },
        // Calculate system status if missing (backend structure might have changed slightly)
        system_status: {
            diversion_active: json.bed_stats.available === 0,
            occupancy_rate: Math.round((json.bed_stats.occupied / json.bed_stats.total) * 100)
        }
      };
      
      setData(adaptedData);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); 

    // WebSocket Connection
    const ws = new WebSocket("ws://localhost:8000/ws/vitals");
    
    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.type === "CRITICAL_VITALS") {
                setCriticalAlert(msg.message);
                // Auto-dismiss after 10s
                setTimeout(() => setCriticalAlert(null), 10000);
            }
        } catch (e) {
            console.error("WS Parse Error", e);
        }
    };

    return () => {
        clearInterval(interval);
        ws.close();
    };
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-gray-500">Loading Command Center...</div>;
  }

  return (
    <div className="space-y-8">
      {criticalAlert && (
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg animate-bounce flex items-center justify-between">
            <div className="flex items-center gap-3">
                <HeartPulse className="w-6 h-6 animate-pulse" />
                <span className="font-bold text-lg">CRITICAL ALERT: {criticalAlert}</span>
            </div>
            <button onClick={() => setCriticalAlert(null)} className="text-white underline text-sm">Dismiss</button>
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hospital Command Center</h1>
        <p className="text-gray-600">Real-time Operational Status & Bed Orchestration</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Occupancy</p>
            <p className="text-2xl font-bold text-gray-900">{data.system_status?.occupancy_rate}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Nurse Ratio</p>
            <p className="text-2xl font-bold text-gray-900">{data.staff_ratio}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-teal-100 rounded-full text-teal-600">
            <BedDouble className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Beds Available</p>
            <p className="text-2xl font-bold text-gray-900">{data.bed_stats.available} / {data.bed_stats.total}</p>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm border flex items-center gap-4 ${
          data.system_status?.diversion_active ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className={`p-3 rounded-full ${
             data.system_status?.diversion_active ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}>
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Status</p>
            <p className={`text-xl font-bold ${
                data.system_status?.diversion_active ? 'text-red-700' : 'text-green-700'
            }`}>
              {data.system_status?.diversion_active ? 'DIVERSION' : 'Normal'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LiveHeatmap occupancy={data.occupancy} />
        <ResourceInventory resources={data.resources} />
      </div>
    </div>
  );
};

export default DashboardPage;
