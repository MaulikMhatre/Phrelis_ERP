// "use client";

// import React, { useEffect, useState, useCallback } from 'react';
// import Link from 'next/link';
// import LiveHeatmap from '@/components/LiveHeatmap';
// import ResourceInventory from '@/components/ResourceInventory';
// import MindPredictions from '@/components/MindPredictions';
// import { Activity, Users, AlertCircle, BedDouble, HeartPulse, Settings } from 'lucide-react';

// const DashboardPage = () => {
//   const [data, setData] = useState<any>(null);
//   const [criticalAlert, setCriticalAlert] = useState<any>(null);
//   const [error, setError] = useState(false);

//   const fetchData = useCallback(async () => {
//     try {
//       const res = await fetch('http://localhost:8000/api/dashboard/stats');
//       if (!res.ok) throw new Error("Backend Offline");
//       const json = await res.json();
      
//       // SAFETY CHECK: Ensure json and json.resources exist
//       if (!json || !json.resources || !json.bed_stats) {
//         console.warn("Malformed data received from API");
//         return;
//       }

//       setData({
//         ...json,
//         resources: {
//             ventilators: json.resources.Ventilators || { total: 0, in_use: 0 },
//             ambulances: json.resources.Ambulances || { total: 0, available: 0 }
//         },
//         system_status: {
//             diversion_active: (json.bed_stats?.available === 0),
//             occupancy_rate: Math.round(((json.bed_stats?.occupied || 0) / (json.bed_stats?.total || 1)) * 100)
//         }
//       });
//       setError(false);
//     } catch (err) { 
//       console.error("Fetch Error:", err);
//       setError(true);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 3000);

//     const ws = new WebSocket("ws://localhost:8000/ws/vitals");
//     ws.onmessage = (event) => {
//         try {
//             const msg = JSON.parse(event.data);
//             if (msg.type === "CRITICAL_VITALS") {
//                 setCriticalAlert(msg);
//                 setTimeout(() => setCriticalAlert(null), 12000);
//             }
//         } catch (e) { console.error("WS Error", e); }
//     };

//     ws.onerror = () => console.warn("WebSocket not connected. Alerts disabled.");

//     return () => { clearInterval(interval); ws.close(); };
//   }, [fetchData]);

//   if (error) return (
//     <div className="p-20 text-center space-y-4">
//       <AlertCircle className="mx-auto w-12 h-12 text-red-500" />
//       <h2 className="text-xl font-bold">Connection Lost</h2>
//       <p className="text-gray-500">FastAPI backend is not responding. Please check your terminal.</p>
//     </div>
//   );

//   if (!data) return <div className="p-10 text-center animate-pulse font-mono tracking-widest">BOOTING PHRELIS OS...</div>;

//   return (
//     <div className="min-h-screen transition-all duration-700 p-8 bg-gray-50">
      
//       {criticalAlert && (
//         <div className="bg-red-600 text-white p-6 rounded-2xl shadow-2xl animate-bounce mb-8 border-4 border-white">
//             <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-3">
//                     <HeartPulse className="w-8 h-8 animate-pulse" />
//                     <span className="font-black text-xl uppercase">Critical Level 1</span>
//                 </div>
//                 <button onClick={() => setCriticalAlert(null)} className="underline text-xs font-black">DISMISS</button>
//             </div>
//             <p className="text-sm font-medium bg-red-700 p-3 rounded-lg">{criticalAlert.ai_reasoning || "Critical vitals alert triggered."}</p>
//         </div>
//       )}

//       <header className="mb-10 flex justify-between items-end">
//         <div>
//           <h1 className="text-5xl font-black tracking-tighter">Hospital OS</h1>
//           <Link href="/admin" className="mt-3 px-3 py-1 bg-indigo-600 text-white rounded text-[10px] font-black inline-flex items-center gap-1 shadow-lg shadow-indigo-500/30">
//             <Settings size={12} /> OPEN ERP ADMIN
//           </Link>
//         </div>
//       </header>

//       {/* KPI Section */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
//         <KPIBox label="Occupancy" val={`${data.system_status?.occupancy_rate || 0}%`} color="blue" />
//         <KPIBox label="Nurse Ratio" val={data.staff_ratio || "1:0"} color="indigo" />
//         <KPIBox label="Available Beds" val={data.bed_stats?.available || 0} color="teal" />
//         <div className={`p-6 rounded-3xl border-4 transition-all ${data.system_status?.diversion_active ? 'bg-red-600 text-white border-red-400' : 'bg-emerald-500 text-white border-emerald-400'}`}>
//             <AlertCircle className="w-8 h-8 mb-2" />
//             <p className="text-2xl font-black uppercase tracking-tighter italic">{data.system_status?.diversion_active ? 'DIVERSION' : 'NORMAL'}</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//         <LiveHeatmap occupancy={data.occupancy} />
//         <div className="space-y-10">
//           <ResourceInventory resources={data.resources} />
//           <MindPredictions />
//         </div>
//       </div>
//     </div>
//   );
// };

// const KPIBox = ({ label, val, color }: { label: string, val: string | number, color: string }) => (
//   <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 text-slate-900 shadow-sm transition-transform hover:scale-105">
//     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
//     <p className="text-3xl font-black tracking-tighter">{val}</p>
//   </div>
// );

// export default DashboardPage;




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