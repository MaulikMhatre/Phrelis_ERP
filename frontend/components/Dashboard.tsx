"use client";

import React, { useEffect, useState, useCallback } from 'react';
import LiveHeatmap from '@/components/LiveHeatmap';
import ResourceInventory from '@/components/ResourceInventory';
import MindPredictions from '@/components/MindPredictions';
import { Activity, Users, AlertCircle, BedDouble, HeartPulse, Timer, Zap } from 'lucide-react';
import { endpoints, WS_BASE_URL } from '@/utils/api';

interface DashboardData {
  occupancy: { ER: number; ICU: number; Surgery: number; Wards: number; };
  bed_stats: { total: number; occupied: number; available: number; };
  staff_ratio: string;
  resources: any;
  system_status?: { diversion_active: boolean; occupancy_rate: number; };
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [surge, setSurge] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);
  const [stressScore, setStressScore] = useState<number>(0);

  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch Core Stats
      const statsRes = await fetch(endpoints.dashboardStats);
      const json = await statsRes.json();
      
      // 2. Fetch Surge Intelligence (The Wow Factor)
      const surgeRes = await fetch(endpoints.timeToCapacity);
      const surgeData = await surgeRes.json();
      setSurge(surgeData);

      const adaptedData = {
        ...json,
        resources: {
            ventilators: json.resources.Ventilators,
            ambulances: json.resources.Ambulances
        },
        system_status: {
            diversion_active: json.bed_stats.available === 0,
            occupancy_rate: Math.round((json.bed_stats.occupied / json.bed_stats.total) * 100)
        }
      };
      
      setData(adaptedData);
      const occ = adaptedData.system_status.occupancy_rate / 100;
      const vel = Math.min((surgeData?.velocity || 0) / 120, 1);
      const ttc = 1 - Math.min((surgeData?.minutes_remaining || 0) / 120, 1);
      const score = Math.round(100 * (0.5 * occ + 0.3 * vel + 0.2 * ttc));
      setStressScore(score);
      setIsSimulating(score >= 70);
    } catch (err) {
      console.error("Dashboard Sync Error", err);
    } finally {
      setLoading(false);
    }
  }, [isSimulating]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 

    const ws = new WebSocket(`${WS_BASE_URL}/ws/vitals`);
    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "CRITICAL_VITALS") {
            setCriticalAlert(msg.message);
            setTimeout(() => setCriticalAlert(null), 10000);
        }
    };

    return () => { clearInterval(interval); ws.close(); };
  }, [fetchData]);

  if (loading || !data) return <div className="p-8 text-center font-mono">INITIALIZING CRITICAL SYSTEMS...</div>;

  return (
    <div className={`min-h-screen transition-colors duration-1000 p-8 ${isSimulating ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Simulation Overlay */}
      {isSimulating && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white py-1 px-4 text-[10px] font-black tracking-[0.3em] text-center z-50 animate-pulse">
          STRESS TEST ACTIVE: SIMULATING MASS CASUALTY EVENT
        </div>
      )}

      {criticalAlert && (
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-2xl animate-bounce flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <HeartPulse className="w-6 h-6 animate-pulse" />
                <span className="font-bold text-lg uppercase tracking-tighter">Code Red: {criticalAlert}</span>
            </div>
            <button onClick={() => setCriticalAlert(null)} className="bg-white/20 px-4 py-1 rounded text-sm font-bold">ACKNOWLEDGE</button>
        </div>
      )}

      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${isSimulating ? 'text-white' : 'text-gray-900'}`}>
            Hospital Command Center
          </h1>
          <p className="text-gray-500 font-medium">Predictive Bed Orchestration & Resource Intelligence</p>
        </div>
        <button 
          onClick={() => {
            if (!data || !surge) return;
            const occ = (data.system_status?.occupancy_rate || 0) / 100;
            const vel = Math.min((surge?.velocity || 0) / 120, 1);
            const ttc = 1 - Math.min((surge?.minutes_remaining || 0) / 120, 1);
            const score = Math.round(100 * (0.5 * occ + 0.3 * vel + 0.2 * ttc));
            setStressScore(score);
            setIsSimulating(score >= 70);
          }}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
            isSimulating 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' 
            : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-red-500 hover:text-red-500'
          }`}
        >
          <Zap className="w-4 h-4" />
          {isSimulating ? `STRESS: ${stressScore}` : 'EVALUATE STRESS'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* KPI Cards (Logic Enhanced) */}
        <Card label="Total Occupancy" val={`${data.system_status?.occupancy_rate}%`} icon={<Activity />} color="blue" isDark={isSimulating} />
        <Card label="Doctor Ratio" val={data.staff_ratio} icon={<Users />} color="indigo" isDark={isSimulating} />
        
        {/* Proactive Intelligence Card (The Wow Factor) */}
        <div className={`p-6 rounded-2xl shadow-sm border transition-all ${
          surge?.minutes_remaining < 60 ? 'bg-red-600 border-red-500 text-white' : 
          isSimulating ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Time-To-Capacity</p>
            <Timer className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black">
            {surge?.minutes_remaining > 0 ? `${surge.minutes_remaining}m` : 'STABLE'}
          </p>
          <p className="text-[10px] mt-1 font-bold opacity-80 uppercase">
            Velocity: {surge?.velocity} Patients/Hr
          </p>
        </div>

        <div className={`p-6 rounded-2xl shadow-sm border flex items-center gap-4 ${
          data.system_status?.diversion_active ? 'bg-red-500 border-red-600 text-white' : 
          isSimulating ? 'bg-slate-900 border-slate-700 text-white' : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          <AlertCircle className="w-8 h-8" />
          <div>
            <p className="text-xs font-bold uppercase opacity-70">System Status</p>
            <p className="text-xl font-black uppercase tracking-tighter">
              {data.system_status?.diversion_active ? 'DIVERSION' : 'Normal'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <MindPredictions data={surge?.forecast || []} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LiveHeatmap occupancy={data.occupancy} />
          <ResourceInventory resources={data.resources} />
        </div>
      </div>
    </div>
  );
};

const Card = ({ label, val, icon, color, isDark }: any) => (
  <div className={`p-6 rounded-2xl shadow-sm border transition-all ${
    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900'
  } flex items-center gap-4`}>
    <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black tracking-tighter">{val}</p>
    </div>
  </div>
);

export default Dashboard;
