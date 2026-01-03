



// "use client";

// import React, { useState, useEffect } from 'react';
// import { Brain, Thermometer, TrendingUp, Activity, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
// const TOTAL_BEDS = 60;
// const MindPredictions = () => {
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchModel = async () => {
//       try {
//         const res = await fetch('http://localhost:8000/api/predict-inflow', { method: 'POST' });
//         const json = await res.json();
//         setData(json);
//       } catch (err) {
//         console.error("Sync Failure:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchModel();
//     const interval = setInterval(fetchModel, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   if (loading) return <div className="p-12 text-center animate-pulse text-indigo-400 font-mono">CALIBRATING HEURISTIC ENGINE...</div>;

//   return (
//   <div className="p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm">
//     <h3 className="text-xs font-black text-slate-400 uppercase mb-4">Inflow Forecast</h3>
    
//     {/* Use Optional Chaining (?.) to prevent the crash */}
//     <div className="flex items-center gap-2 mb-4">
//       <span className="text-lg font-bold">
//         Impact Multiplier: {data?.weather_impact?.multiplier || "1.0"}x
//       </span>
//       <span className="text-xs text-slate-400">
//         ({data?.weather_impact?.reason || "Normal Conditions"})
//       </span>
//     </div>

//     {/* Ensure forecast exists before mapping */}
//     <div className="h-40 flex items-end gap-2">
//       {data?.forecast?.map((item: any, i: number) => (
//         <div 
//           key={i} 
//           style={{ height: `${(item.inflow / 30) * 100}%` }}
//           className="flex-grow bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-all"
//           title={`${item.hour}: ${item.inflow} patients`}
//         />
//       ))}
//     </div>
//   </div>
// );
// };

// export default MindPredictions;
"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Thermometer, TrendingUp, Activity, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
const TOTAL_BEDS = 60;
const MindPredictions = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/predict-inflow', { method: 'POST' });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Sync Failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModel();
    const interval = setInterval(fetchModel, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-12 text-center animate-pulse text-indigo-400 font-mono">CALIBRATING HEURISTIC ENGINE...</div>;

  return (
    <div className="bg-slate-950 text-slate-200 p-8 rounded-3xl border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-3">
            <Brain className="text-indigo-500 w-8 h-8" /> 
            HEURISTIC INFLOW ENGINE
          </h2>
          <p className="text-slate-500 text-sm mt-1">Weighted Gaussian modeling with Systemic Saturation feedback</p>
        </div>
        
        {/* Confidence Badge */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-emerald-400 text-xs font-bold font-mono tracking-widest">
            {data?.confidence_score}% CONFIDENCE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">6H Forecast</p>
          <div className="flex items-baseline gap-3 text-white">
            <span className="text-7xl font-black">{data?.total_predicted_inflow}</span>
            <TrendingUp className="text-emerald-400 w-6 h-6" />
          </div>
          <p className="text-xs text-slate-400 mt-4 font-medium italic">High-accuracy arrival projection</p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Risk Factors</p>
          <div className="space-y-4">
             {/* Weather Factor */}
             <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Weather Multiplier</span>
                <span className="text-indigo-400 font-bold">{data?.weather_impact.multiplier}x</span>
             </div>
             {/* Saturation Factor */}
             <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Systemic Inertia</span>
                <span className="text-amber-400 font-bold">+{data?.saturation_impact}%</span>
             </div>
          </div>
          <div className="mt-6 p-2 bg-indigo-500/10 rounded border border-indigo-500/20 text-[10px] text-indigo-300">
             {data?.weather_impact.reason}
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Surge Readiness</p>
          <div className={`text-3xl font-black ${data?.total_predicted_inflow > 120 ? 'text-rose-500' : 'text-emerald-400'}`}>
              {data?.total_predicted_inflow > 120 ? 'CRITICAL' : 'STABLE'}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
             <ShieldAlert className="w-4 h-4 text-amber-500" />
             Based on {TOTAL_BEDS} bed capacity
          </div>
        </div>
      </div>

      {/* The Gaussian Distribution Graph */}
      <div className="mt-12">
        <p className="text-[10px] font-bold text-slate-500 uppercase mb-8 flex items-center gap-2 tracking-widest">
          <Clock className="w-4 h-4" /> Bimodal Stochastic Curve
        </p>
        <div className="flex items-end justify-between gap-4 h-40">
          {data?.forecast.map((item: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
              <div 
                className="w-full bg-indigo-500/20 border-t-2 border-indigo-500/50 rounded-t-lg transition-all duration-700 group-hover:bg-indigo-600 relative"
                style={{ height: `${(item.inflow / (data.total_predicted_inflow / 2)) * 100}%` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white opacity-0 group-hover:opacity-100">
                  {item.inflow}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{item.hour}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MindPredictions;