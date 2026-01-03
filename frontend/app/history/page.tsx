"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Search, Activity, Calendar, ArrowLeft } from 'lucide-react';

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
  
  // Set default state to today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
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
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER & DATE SELECTOR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Clock className="text-blue-600" /> Clinical Logs
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Reviewing patient records for a specific day</p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
               <ArrowLeft size={16} /> BACK TO ADMIN
            </Link>
            
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Calendar size={18} className="text-blue-500" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="outline-none font-bold text-slate-700 bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold uppercase text-xs animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Patient Name, Condition, or ID..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* HISTORY TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Patient Details</th>
                <th className="p-4">Condition</th>
                <th className="p-4">ESI Level</th>
                <th className="p-4">Acuity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 text-xs font-medium">
                    {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{row.patient_name || "Unknown Patient"}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                      Age: {row.patient_age} • ID: {row.id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <Activity size={14} className="text-blue-500" />
                      {row.condition || "Stable"}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      row.esi_level === 1 ? 'bg-red-100 text-red-600' : 
                      row.esi_level === 2 ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      Level {row.esi_level}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-700 text-sm">{row.acuity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredHistory.length === 0 && !error && (
            <div className="p-20 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                No clinical records found for {new Date(selectedDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}