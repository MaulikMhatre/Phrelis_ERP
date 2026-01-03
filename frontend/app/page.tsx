
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import LiveHeatmap from "@/components/LiveHeatmap";
import ResourceInventory from "@/components/ResourceInventory";
import MindPredictions from "@/components/MindPredictions";

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

/* ---------------------------------------------
   DASHBOARD PAGE
---------------------------------------------- */

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [time, setTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/dashboard/stats");
      const json = await res.json();

      setData({
        ...json,
        system_status: {
          diversion_active: json.bed_stats.available === 0 || isSimulating,
          occupancy_rate: isSimulating
            ? 98
            : Math.round(
                (json.bed_stats.occupied / json.bed_stats.total) * 100
              ),
        },
      });
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

    const ws = new WebSocket("ws://localhost:8000/ws/vitals");
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

  /* ---------------------------------------------
     LOADING STATE
  ---------------------------------------------- */

  if (loading || !data) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  /* ---------------------------------------------
     MAIN LAYOUT
  ---------------------------------------------- */

  return (
    <div className="h-screen w-full bg-black text-slate-100 flex overflow-hidden">
      

      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Simulation Banner */}
        {isSimulating && (
          <div className="w-full bg-indigo-600 text-white py-1 text-[10px] font-black tracking-[0.4em] text-center uppercase">
            Surge Simulation Mode Active
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-12 py-10 space-y-14 custom-scrollbar">
          <Header
            time={time}
            isSimulating={isSimulating}
            toggleSim={() => setIsSimulating(!isSimulating)}
          />

          {criticalAlert && (
            <CriticalAlert
              message={criticalAlert}
              onClose={() => setCriticalAlert(null)}
            />
          )}

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
    </div>
  );
}

/* ---------------------------------------------
   HEADER
---------------------------------------------- */

const Header = ({ time, isSimulating, toggleSim }: any) => (
  <header className="flex justify-between items-end">
    <div>
      <div className="flex items-center gap-4 mb-3">
        <span className="text-indigo-500 text-[10px] font-black tracking-[0.35em] uppercase">
          Intelligence Division
        </span>
        <span className="text-slate-600 text-[10px] font-mono">
          {time.toLocaleTimeString()}
        </span>
      </div>
      <h1 className="text-6xl font-black tracking-tight leading-none">
        Hospital Command Center
      </h1>
    </div>

    <button
      onClick={toggleSim}
      className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black tracking-tight border-2 transition-all ${
        isSimulating
          ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_40px_rgba(99,102,241,0.35)] animate-pulse"
          : "border-white/10 text-white hover:border-indigo-500 hover:text-indigo-400"
      }`}
    >
      <Zap className="w-5 h-5" />
      {isSimulating ? "Terminate Stress" : "Stress Test"}
    </button>
  </header>
);

/* ---------------------------------------------
   CRITICAL ALERT
---------------------------------------------- */

const CriticalAlert = ({ message, onClose }: any) => (
  <div className="bg-rose-600/5 border border-rose-500/50 rounded-[2.5rem] p-8 flex justify-between items-center shadow-[0_0_60px_rgba(225,29,72,0.15)]">
    <div className="flex items-center gap-6">
      <div className="p-4 bg-rose-600 rounded-3xl shadow-xl shadow-rose-600/40">
        <HeartPulse className="w-10 h-10 text-white animate-pulse" />
      </div>
      <div>
        <p className="text-[11px] font-black tracking-[0.35em] uppercase text-rose-500 mb-1">
          Priority Broadcast
        </p>
        <p className="text-3xl font-black uppercase tracking-tight italic">
          Code Red: {message}
        </p>
      </div>
    </div>

    <button
      onClick={onClose}
      className="px-10 py-4 rounded-2xl bg-rose-600 font-black hover:brightness-110"
    >
      Acknowledge
    </button>
  </div>
);

/* ---------------------------------------------
   METRICS
---------------------------------------------- */

const MetricsGrid = ({ data, isSimulating }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
    <Metric label="Capacity" value={`${data.system_status.occupancy_rate}%`} icon={<Activity />} />
    <Metric label="Nurse Ratio" value={data.staff_ratio} icon={<Users />} />
    <Metric label="Free Beds" value={data.bed_stats.available} icon={<BedDouble />} />

    <div
      className={`p-8 rounded-[2.5rem] border-2 flex flex-col justify-between transition-all ${
        isSimulating || data.system_status.diversion_active
          ? "bg-rose-600/5 border-rose-600/50 text-rose-500"
          : "bg-indigo-600/5 border-indigo-600/50 text-indigo-500"
      }`}
    >
      <AlertCircle className="w-10 h-10 mb-4" />
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
);

const Metric = ({ label, value, icon }: any) => (
  <div className="bg-[#0b0b0b] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl hover:border-indigo-500/40 transition">
    <div className="inline-flex p-4 bg-white/5 rounded-2xl mb-8 text-indigo-500">
      {React.cloneElement(icon, { size: 34 })}
    </div>
    <p className="text-[11px] font-black tracking-[0.35em] uppercase text-slate-500 mb-2">
      {label}
    </p>
    <p className="text-5xl font-black tracking-tight">{value}</p>
  </div>
);

/* ---------------------------------------------
   SIDEBAR LINK
---------------------------------------------- */

const SidebarLink = ({ icon, label, active = false }: any) => (
  <div
    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition cursor-pointer ${
      active
        ? "bg-indigo-600 text-white shadow-xl"
        : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
    }`}
  >
    {React.cloneElement(icon, { size: 22 })}
    <span className="text-sm tracking-tight">{label}</span>
  </div>
);