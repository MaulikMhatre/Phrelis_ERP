"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Search, Activity, Calendar, ArrowLeft, Filter, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the interface here so it's available to the component
export interface HistoryRecord {
  id: string;
  timestamp: string;
  patient_name: string;
  patient_age: number;
  condition: string;
  esi_level: number;
  acuity: string;
  symptoms: string[];
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Set default state to today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        setError(null); // Reset error on new fetch
        // Fetch from the date-specific endpoint we added to main.py
        const res = await fetch(`http://localhost:8000/api/history/day/${selectedDate}`, { 
          cache: 'no-store' 
        });
        
        if (!res.ok) throw new Error("Server responded with an error");
        
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError("Could not connect to the medical server. Ensure the backend is running on port 8000.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]); // Re-fetch whenever the date is changed

  const filteredHistory = history.filter(item => 
    item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-slate-100 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER & DATE SELECTOR */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <Clock className="text-indigo-400 w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white">
                Clinical Logs
              </h1>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 font-medium tracking-wide pl-16"
            >
              Secure Archival Record System
            </motion.p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <Link href="/admin" className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300">
               <ArrowLeft size={16} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
               <span className="text-xs font-bold text-slate-300 group-hover:text-white tracking-widest uppercase">Back to Admin</span>
            </Link>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3 bg-[#0a0a0a] px-5 py-3 rounded-xl border border-white/10 group-hover:border-indigo-500/50 transition-colors shadow-xl">
                <Calendar size={18} className="text-indigo-500" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-slate-200 font-mono text-sm outline-none cursor-pointer uppercase tracking-widest [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </div>
            </div>
          </div>
        </header>

        {/* ERROR STATE */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-rose-950/30 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center gap-3 overflow-hidden"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-bold tracking-wide">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTROLS BAR */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-sm group-focus-within:bg-indigo-500/10 transition-colors" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search patient records..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0a0a0a] border border-white/10 focus:border-indigo-500/50 outline-none text-slate-200 placeholder:text-slate-600 transition-all shadow-lg"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-6 py-4 rounded-2xl bg-[#0a0a0a] border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/30 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="rounded-3xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-500">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Retrieving Archives...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Timestamp</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Patient Identity</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Triage Level</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Acuity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((row, i) => (
                      <motion.tr 
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-8 rounded-full bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
                            <span className="font-mono text-sm text-slate-400">
                              {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="font-bold text-slate-200 group-hover:text-white transition-colors text-lg">
                            {row.patient_name || "Unknown Patient"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-slate-500 uppercase">
                              ID: {row.id.slice(0, 8)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              Age: {row.patient_age}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <Activity size={16} className="text-indigo-500" />
                            <span className="text-sm font-medium text-slate-300">{row.condition || "Stable"}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            row.esi_level === 1 ? 'bg-rose-950/30 border-rose-500/30 text-rose-400' : 
                            row.esi_level === 2 ? 'bg-orange-950/30 border-orange-500/30 text-orange-400' : 
                            'bg-yellow-950/30 border-yellow-500/30 text-yellow-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              row.esi_level === 1 ? 'bg-rose-500 animate-pulse' : 
                              row.esi_level === 2 ? 'bg-orange-500' : 'bg-yellow-500'
                            }`} />
                            Level {row.esi_level}
                          </span>
                        </td>
                        <td className="p-6">
                          <span className="text-sm font-bold text-slate-400">{row.acuity}</span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-50">
                          <FileText size={48} className="text-slate-600" />
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                            No clinical records found for {new Date(selectedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}