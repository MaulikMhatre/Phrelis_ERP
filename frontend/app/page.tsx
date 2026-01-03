// "use client";

// import React, { useEffect, useState } from 'react';
// import LiveHeatmap from '@/components/LiveHeatmap';
// import ResourceInventory from '@/components/ResourceInventory';
// import { Activity, Users, AlertCircle, BedDouble, HeartPulse } from 'lucide-react';

// interface DashboardData {
//   occupancy: {
//     ER: number;
//     ICU: number;
//     Surgery: number;
//     Wards: number;
//   };
//   bed_stats: {
//     total: number;
//     occupied: number;
//     available: number;
//   };
//   staff_ratio: string;
//   resources: {
//     Ventilators: { total: number; in_use: number };
//     Ambulances: { total: number; available: number };
//   };
//   system_status?: {
//     diversion_active: boolean;
//     occupancy_rate: number;
//   };
// }

// const DashboardPage = () => {
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [criticalAlert, setCriticalAlert] = useState<string | null>(null);

//   const fetchData = async () => {
//     try {
//       const res = await fetch('http://localhost:8000/api/dashboard/stats');
//       const json = await res.json();
      
//       const adaptedData = {
//         ...json,
//         // Backend returns "Ventilators", "Ambulances" (capitalized)
//         resources: {
//             ventilators: json.resources.Ventilators,
//             ambulances: json.resources.Ambulances
//         },
//         // Calculate system status if missing (backend structure might have changed slightly)
//         system_status: {
//             diversion_active: json.bed_stats.available === 0,
//             occupancy_rate: Math.round((json.bed_stats.occupied / json.bed_stats.total) * 100)
//         }
//       };
      
//       setData(adaptedData);
//     } catch (err) {
//       console.error("Failed to fetch dashboard data", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 2000); 

//     // WebSocket Connection
//     const ws = new WebSocket("ws://localhost:8000/ws/vitals");
    
//     ws.onmessage = (event) => {
//         try {
//             const msg = JSON.parse(event.data);
//             if (msg.type === "CRITICAL_VITALS") {
//                 setCriticalAlert(msg.message);
//                 // Auto-dismiss after 10s
//                 setTimeout(() => setCriticalAlert(null), 10000);
//             }
//         } catch (e) {
//             console.error("WS Parse Error", e);
//         }
//     };

//     return () => {
//         clearInterval(interval);
//         ws.close();
//     };
//   }, []);

//   if (loading || !data) {
//     return <div className="p-8 text-center text-gray-500">Loading Command Center...</div>;
//   }

//   return (
//     <div className="space-y-8">
//       {criticalAlert && (
//         <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg animate-bounce flex items-center justify-between">
//             <div className="flex items-center gap-3">
//                 <HeartPulse className="w-6 h-6 animate-pulse" />
//                 <span className="font-bold text-lg">CRITICAL ALERT: {criticalAlert}</span>
//             </div>
//             <button onClick={() => setCriticalAlert(null)} className="text-white underline text-sm">Dismiss</button>
//         </div>
//       )}

//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Hospital Command Center</h1>
//         <p className="text-gray-600">Real-time Operational Status & Bed Orchestration</p>
//       </header>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
//           <div className="p-3 bg-blue-100 rounded-full text-blue-600">
//             <Activity className="w-8 h-8" />
//           </div>
//           <div>
//             <p className="text-sm text-gray-500 font-medium">Total Occupancy</p>
//             <p className="text-2xl font-bold text-gray-900">{data.system_status?.occupancy_rate}%</p>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
//           <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
//             <Users className="w-8 h-8" />
//           </div>
//           <div>
//             <p className="text-sm text-gray-500 font-medium">Nurse Ratio</p>
//             <p className="text-2xl font-bold text-gray-900">{data.staff_ratio}</p>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
//           <div className="p-3 bg-teal-100 rounded-full text-teal-600">
//             <BedDouble className="w-8 h-8" />
//           </div>
//           <div>
//             <p className="text-sm text-gray-500 font-medium">Beds Available</p>
//             <p className="text-2xl font-bold text-gray-900">{data.bed_stats.available} / {data.bed_stats.total}</p>
//           </div>
//         </div>

//         <div className={`p-6 rounded-lg shadow-sm border flex items-center gap-4 ${
//           data.system_status?.diversion_active ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
//         }`}>
//           <div className={`p-3 rounded-full ${
//              data.system_status?.diversion_active ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
//           }`}>
//             <AlertCircle className="w-8 h-8" />
//           </div>
//           <div>
//             <p className="text-sm font-medium text-gray-700">Status</p>
//             <p className={`text-xl font-bold ${
//                 data.system_status?.diversion_active ? 'text-red-700' : 'text-green-700'
//             }`}>
//               {data.system_status?.diversion_active ? 'DIVERSION' : 'Normal'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Main Views */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <LiveHeatmap occupancy={data.occupancy} />
//         <ResourceInventory resources={data.resources} />
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;







"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import LiveHeatmap from '@/components/LiveHeatmap';
import ResourceInventory from '@/components/ResourceInventory';
import MindPredictions from '@/components/MindPredictions';
import { Activity, Users, AlertCircle, BedDouble, HeartPulse, History, Zap } from 'lucide-react';

const DashboardPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/dashboard/stats');
      const json = await res.json();
      
      setData({
        ...json,
        resources: {
            ventilators: json.resources.Ventilators,
            ambulances: json.resources.Ambulances
        },
        system_status: {
            diversion_active: json.bed_stats.available === 0 || isSimulating,
            occupancy_rate: isSimulating ? 98 : Math.round((json.bed_stats.occupied / json.bed_stats.total) * 100)
        }
      });
    } catch (err) {
      console.error("Fetch Error", err);
    } finally {
      setLoading(false);
    }
  }, [isSimulating]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
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

  if (loading || !data) return <div className="p-8 text-center animate-pulse text-gray-500 font-mono">INITIALIZING COMMAND CENTER...</div>;

  return (
    <div className={`min-h-screen transition-colors duration-700 p-8 ${isSimulating ? 'bg-slate-950 text-slate-100' : 'bg-gray-50'}`}>
      
      {/* Simulation Banner */}
      {isSimulating && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white py-1 px-4 text-[10px] font-black tracking-[0.3em] text-center z-50 animate-pulse">
          STRESS TEST ACTIVE: SIMULATING MASS CASUALTY
        </div>
      )}

      {criticalAlert && (
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-2xl animate-bounce flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <HeartPulse className="w-6 h-6 animate-pulse" />
                <span className="font-bold">CRITICAL: {criticalAlert}</span>
            </div>
            <button onClick={() => setCriticalAlert(null)} className="underline text-xs">Dismiss</button>
        </div>
      )}

      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${isSimulating ? 'text-white' : 'text-gray-900'}`}>Hospital Command Center</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-500 font-medium">Real-time Bed Orchestration</p>
            <Link href="/history" className="text-indigo-500 font-bold hover:underline flex items-center gap-1 text-sm">
              <History className="w-4 h-4" /> View Prediction Logs
            </Link>
          </div>
        </div>

        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all shadow-lg ${
            isSimulating ? 'bg-red-500 text-white' : 'bg-white border-2 text-slate-600'
          }`}
        >
          <Zap className="w-4 h-4" />
          {isSimulating ? 'STOP STRESS TEST' : 'RUN STRESS TEST'}
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPIBox label="Occupancy" val={`${data.system_status.occupancy_rate}%`} icon={<Activity />} color="blue" dark={isSimulating} />
        <KPIBox label="Staff Ratio" val={data.staff_ratio} icon={<Users />} color="indigo" dark={isSimulating} />
        <KPIBox label="Available Beds" val={data.bed_stats.available} icon={<BedDouble />} color="teal" dark={isSimulating} />
        <div className={`p-6 rounded-2xl border flex items-center gap-4 ${isSimulating || data.system_status.diversion_active ? 'bg-red-500 text-white border-red-600' : 'bg-green-500 text-white'}`}>
            <AlertCircle className="w-8 h-8" />
            <div>
                <p className="text-xs font-bold opacity-80 uppercase">Status</p>
                <p className="text-xl font-black tracking-tighter uppercase">{isSimulating || data.system_status.diversion_active ? 'DIVERSION' : 'NORMAL'}</p>
            </div>
        </div>
      </div>

      <div className="space-y-8">
        <MindPredictions isSimulating={isSimulating} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LiveHeatmap occupancy={data.occupancy} isSimulating={isSimulating} />
          <ResourceInventory resources={data.resources} />
        </div>
      </div>
    </div>
  );
};

const KPIBox = ({ label, val, icon, color, dark }: any) => (
  <div className={`p-6 rounded-2xl border transition-all ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'}`}>
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black tracking-tighter">{val}</p>
      </div>
    </div>
  </div>
);

export default DashboardPage;