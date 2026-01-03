// "use client";
// import React, { useEffect, useState } from 'react';
// import TriageAssistant from './TriageAssistant';
// import LiveHeatmap from './LiveHeatmap';
// import GoldenHourClock from './GoldenHourClock';
// import ResourceInventory from './ResourceInventory';
// import MindPredictions from './MindPredictions';
// import Alerts from './Alerts';

// interface DashboardData {
//   occupancy: {
//     ER: number;
//     ICU: number;
//     Surgery: number;
//     Wards: number;
//   };
//   er_wait_time: {
//     current: number;
//     predicted_4h: number;
//   };
//   resources: {
//     ventilators: { total: number; in_use: number };
//     ambulances: { total: number; available: number };
//   };
// }

// interface AlertData {
//   alerts: {
//     type: string;
//     message: string;
//     level: string;
//   }[];
// }

// const Dashboard: React.FC = () => {
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [alerts, setAlerts] = useState<AlertData | null>(null);
//   const [loading, setLoading] = useState(true);

//   const fetchData = async () => {
//     try {
//       // Fetch Dashboard Stats
//       const statsRes = await fetch('http://localhost:8000/api/dashboard/stats');
//       const statsData = await statsRes.json();
//       setData(statsData);

//       // Fetch Alerts
//       const alertsRes = await fetch('http://localhost:8000/api/alerts/active');
//       const alertsData = await alertsRes.json();
//       setAlerts(alertsData);
//     } catch (err) {
//       console.error("Failed to fetch dashboard data", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 5000); // Refresh every 5s
//     return () => clearInterval(interval);
//   }, []);

//   if (loading || !data) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-lg font-medium text-gray-700">Initializing Hospital OS...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
//       <header className="mb-8 flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Hospital AI Command Center</h1>
//           <p className="text-gray-500">Real-time predictive analytics & resource management</p>
//         </div>
//         <div className="text-right">
//           <p className="text-sm text-gray-400">Live System Status</p>
//           <div className="flex items-center gap-2 justify-end">
//             <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
//             <span className="font-semibold text-green-700">Online</span>
//           </div>
//         </div>
//       </header>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Left Column: The Eyes (Status) */}
//         <div className="space-y-8 lg:col-span-2">
//           <section>
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <span className="text-2xl">👁️</span> The Eyes
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <LiveHeatmap occupancy={data.occupancy} />
//               <div className="space-y-6">
//                 <GoldenHourClock 
//                   currentWait={data.er_wait_time.current} 
//                   predictedWait={data.er_wait_time.predicted_4h} 
//                 />
//                 <ResourceInventory resources={data.resources} />
//               </div>
//             </div>
//           </section>
//         </div>

//         {/* Right Column: The Mind & Voice */}
//         <div className="space-y-8">
//           <section>
//              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <span className="text-2xl">🧠</span> The Mind
//             </h2>
//             <div className="space-y-6">
//               <MindPredictions />
//               <TriageAssistant />
//             </div>
//           </section>

//           <section>
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <span className="text-2xl">🔊</span> The Voice
//             </h2>
//             {alerts && <Alerts alerts={alerts.alerts} />}
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;






"use client";

import React, { useEffect, useState, useCallback } from 'react';
import LiveHeatmap from '@/components/LiveHeatmap';
import ResourceInventory from '@/components/ResourceInventory';
import MindPredictions from '@/components/MindPredictions';
import { Activity, Users, AlertCircle, BedDouble, HeartPulse, Timer, Zap } from 'lucide-react';

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

  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch Core Stats
      const statsRes = await fetch('http://localhost:8000/api/dashboard/stats');
      const json = await statsRes.json();
      
      // 2. Fetch Surge Intelligence (The Wow Factor)
      const surgeRes = await fetch('http://localhost:8000/api/predict/time-to-capacity');
      const surgeData = await surgeRes.json();
      setSurge(surgeData);

      const adaptedData = {
        ...json,
        resources: {
            ventilators: json.resources.Ventilators,
            ambulances: json.resources.Ambulances
        },
        system_status: {
            diversion_active: json.bed_stats.available === 0 || isSimulating,
            occupancy_rate: isSimulating ? 98 : Math.round((json.bed_stats.occupied / json.bed_stats.total) * 100)
        }
      };
      
      setData(adaptedData);
    } catch (err) {
      console.error("Dashboard Sync Error", err);
    } finally {
      setLoading(false);
    }
  }, [isSimulating]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 

    const ws = new WebSocket("ws://localhost:8000/ws/vitals");
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
          onClick={() => setIsSimulating(!isSimulating)}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
            isSimulating 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' 
            : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-red-500 hover:text-red-500'
          }`}
        >
          <Zap className="w-4 h-4" />
          {isSimulating ? 'STOP SIMULATION' : 'RUN STRESS TEST'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* KPI Cards (Logic Enhanced) */}
        <Card label="Total Occupancy" val={`${data.system_status?.occupancy_rate}%`} icon={<Activity />} color="blue" isDark={isSimulating} />
        <Card label="Nurse Ratio" val={data.staff_ratio} icon={<Users />} color="indigo" isDark={isSimulating} />
        
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
        <MindPredictions />
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