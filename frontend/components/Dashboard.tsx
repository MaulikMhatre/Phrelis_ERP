"use client";
import React, { useEffect, useState } from 'react';
import TriageAssistant from './TriageAssistant';
import LiveHeatmap from './LiveHeatmap';
import GoldenHourClock from './GoldenHourClock';
import ResourceInventory from './ResourceInventory';
import MindPredictions from './MindPredictions';
import Alerts from './Alerts';

interface DashboardData {
  occupancy: {
    ER: number;
    ICU: number;
    Surgery: number;
    Wards: number;
  };
  er_wait_time: {
    current: number;
    predicted_4h: number;
  };
  resources: {
    ventilators: { total: number; in_use: number };
    ambulances: { total: number; available: number };
  };
}

interface AlertData {
  alerts: {
    type: string;
    message: string;
    level: string;
  }[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch Dashboard Stats
      const statsRes = await fetch('http://localhost:8000/api/dashboard/stats');
      const statsData = await statsRes.json();
      setData(statsData);

      // Fetch Alerts
      const alertsRes = await fetch('http://localhost:8000/api/alerts/active');
      const alertsData = await alertsRes.json();
      setAlerts(alertsData);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Initializing Hospital OS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital AI Command Center</h1>
          <p className="text-gray-500">Real-time predictive analytics & resource management</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Live System Status</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-semibold text-green-700">Online</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Eyes (Status) */}
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">👁️</span> The Eyes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LiveHeatmap occupancy={data.occupancy} />
              <div className="space-y-6">
                <GoldenHourClock 
                  currentWait={data.er_wait_time.current} 
                  predictedWait={data.er_wait_time.predicted_4h} 
                />
                <ResourceInventory resources={data.resources} />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: The Mind & Voice */}
        <div className="space-y-8">
          <section>
             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🧠</span> The Mind
            </h2>
            <div className="space-y-6">
              <MindPredictions />
              <TriageAssistant />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🔊</span> The Voice
            </h2>
            {alerts && <Alerts alerts={alerts.alerts} />}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
