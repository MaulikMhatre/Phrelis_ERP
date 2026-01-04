
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import LiveHeatmap from "@/components/LiveHeatmap";
import ResourceInventory from "@/components/ResourceInventory";
import MindPredictions from "@/components/MindPredictions";
import LandingPage from "@/components/LandingPage";

import {
  Activity,
  Users,
  AlertCircle,
  BedDouble,
  HeartPulse,
  History,
  Zap,
  LayoutDashboard,
  Binary,
} from "lucide-react";

import { endpoints, WS_BASE_URL } from '@/utils/api';


export default function DashboardPage() {
  const [showLanding, setShowLanding] = useState(true);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [time, setTime] = useState(new Date());
  const [surge, setSurge] = useState<any>(null);
  const [stressScore, setStressScore] = useState<number>(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(endpoints.dashboardStats);
      const json = await res.json();
      const surgeRes = await fetch(endpoints.timeToCapacity);
      const surgeData = await surgeRes.json();
      setSurge(surgeData);

      setData({
        ...json,
        system_status: {
          diversion_active: json.bed_stats.available === 0,
          occupancy_rate: Math.round(
            (json.bed_stats.occupied / json.bed_stats.total) * 100
          ),
        },
      });
      const occ = Math.round((json.bed_stats.occupied / json.bed_stats.total) * 100) / 100;
      const vel = Math.min((surgeData?.velocity || 0) / 120, 1);
      const ttc = 1 - Math.min((surgeData?.minutes_remaining || 0) / 120, 1);
      const score = Math.round(100 * (0.5 * occ + 0.3 * vel + 0.2 * ttc));
      setStressScore(score);
      setIsSimulating(score >= 70);
    } catch (err) {
      console.error("Telemetry Sync Error", err);
    } finally {
      setLoading(false);
    }
  }, [isSimulating]);

  useEffect(() => {
    fetchData();

    const poll = setInterval(fetchData, 3000);
    const clock = setInterval(() => setTime(new Date()), 1000);

    const ws = new WebSocket(`${WS_BASE_URL}/ws/vitals`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "CRITICAL_VITALS") {
        setCriticalAlert(msg.message);
        setTimeout(() => setCriticalAlert(null), 10000);
      }
    };

    return () => {
      clearInterval(poll);
      clearInterval(clock);
      ws.close();
    };
  }, [fetchData]);


  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  if (loading || !data) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }


  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1 }}
      className="h-screen w-full bg-black text-slate-100 flex overflow-hidden"
    >
      
      <main className="flex-1 flex flex-col relative min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black">
        {/* Simulation Banner */}
        <AnimatePresence>
          {isSimulating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full bg-indigo-600/90 backdrop-blur-md text-white py-1 text-[10px] font-black tracking-[0.4em] text-center uppercase border-b border-indigo-400/30 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
            >
              Surge Simulation Mode Active
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto px-12 py-10 space-y-14 custom-scrollbar">
          <Header
            time={time}
            isSimulating={isSimulating}
            toggleSim={() => {
              if (!data || !surge) return;
              const occ = (data.system_status?.occupancy_rate || 0) / 100;
              const vel = Math.min((surge?.velocity || 0) / 120, 1);
              const ttc = 1 - Math.min((surge?.minutes_remaining || 0) / 120, 1);
              const score = Math.round(100 * (0.5 * occ + 0.3 * vel + 0.2 * ttc));
              setStressScore(score);
              setIsSimulating(score >= 70);
            }}
            stressScore={stressScore}
          />

          <AnimatePresence>
            {criticalAlert && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CriticalAlert
                  message={criticalAlert}
                  onClose={() => setCriticalAlert(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <MetricsGrid data={data} isSimulating={isSimulating} />

          <section className="space-y-14 pb-10">
            <MindPredictions isSimulating={isSimulating} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-14">
              <LiveHeatmap
                occupancy={data.occupancy}
                isSimulating={isSimulating}
              />
              <ResourceInventory
                resources={data.resources}
                isSimulating={isSimulating}
              />
            </div>
          </section>
        </div>
      </main>
    </motion.div>
  );
}



const Header = ({ time, isSimulating, toggleSim, stressScore }: any) => (
  <header className="flex justify-between items-end">
    <div>
      <div className="flex items-center gap-4 mb-3">
        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-[0.35em] uppercase shadow-[0_0_10px_rgba(99,102,241,0.1)]">
          Intelligence Division
        </span>
        <span className="text-slate-500 text-[10px] font-mono tracking-widest">
          {time.toLocaleTimeString()}
        </span>
      </div>
      <h1 className="text-6xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500 drop-shadow-2xl">
        Hospital Command Center
      </h1>
    </div>

    <button
      onClick={toggleSim}
      className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-black tracking-tight border transition-all duration-300 overflow-hidden ${
        isSimulating
          ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_40px_rgba(99,102,241,0.5)]"
          : "bg-white/5 border-white/10 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/10"
      }`}
    >
      <div className={`absolute inset-0 bg-indigo-400/20 blur-xl transition-opacity duration-300 ${isSimulating ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
      <Zap className={`w-5 h-5 relative z-10 ${isSimulating ? 'animate-pulse' : ''}`} />
      <span className="relative z-10">{isSimulating ? `Stress: ${stressScore}` : "Evaluate Stress"}</span>
    </button>
  </header>
);


const CriticalAlert = ({ message, onClose }: any) => (
  <div className="relative overflow-hidden bg-rose-950/20 border border-rose-500/30 rounded-[2rem] p-8 flex justify-between items-center shadow-[0_0_60px_rgba(225,29,72,0.1)] backdrop-blur-md">
    <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-transparent opacity-50" />
    <div className="relative flex items-center gap-6 z-10">
      <div className="p-4 bg-rose-600 rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.4)] animate-pulse">
        <HeartPulse className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-black tracking-[0.35em] uppercase text-rose-400 mb-1">
          Priority Broadcast
        </p>
        <p className="text-2xl font-black uppercase tracking-tight italic text-rose-100">
          Code Red: {message}
        </p>
      </div>
    </div>

    <button
      onClick={onClose}
      className="relative z-10 px-8 py-3 rounded-xl bg-rose-600 font-bold text-white text-sm tracking-wide hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/20"
    >
      ACKNOWLEDGE
    </button>
  </div>
);


const MetricsGrid = ({ data, isSimulating }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
    <Metric label="Capacity" value={`${data.system_status.occupancy_rate}%`} icon={<Activity />} />
    <Metric label="Doctor Ratio" value={data.staff_ratio} icon={<Users />} />
    <Metric label="Free Beds" value={data.bed_stats.available} icon={<BedDouble />} />

    <div
      className={`relative overflow-hidden p-8 rounded-[2.5rem] border flex flex-col justify-between transition-all duration-500 ${
        isSimulating || data.system_status.diversion_active
          ? "bg-rose-950/30 border-rose-500/50 text-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.15)]"
          : "bg-indigo-950/30 border-indigo-500/30 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
      <div className="relative z-10">
        <AlertCircle className="w-10 h-10 mb-4 opacity-80" />
        <div>
          <p className="text-[10px] font-black tracking-[0.35em] uppercase opacity-60 mb-1">
            System Status
          </p>
          <p className="text-4xl font-black uppercase tracking-tight">
            {isSimulating || data.system_status.diversion_active
              ? "Diversion"
              : "Normal"}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Metric = ({ label, value, icon }: any) => (
  <div className="group relative bg-[#0b0b0b]/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl hover:border-indigo-500/30 hover:bg-white/[0.02] transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
    
    <div className="relative z-10">
      <div className="inline-flex p-4 bg-white/5 rounded-2xl mb-8 text-indigo-500 shadow-inner border border-white/5 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-300">
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <p className="text-[10px] font-black tracking-[0.35em] uppercase text-slate-500 mb-2 group-hover:text-slate-400 transition-colors">
        {label}
      </p>
      <p className="text-5xl font-black tracking-tight text-slate-200 group-hover:text-white transition-colors">{value}</p>
    </div>
  </div>
);

