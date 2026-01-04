"use client";

import React, { useState } from 'react';
import { Stethoscope, Heart, Activity, CheckCircle, AlertTriangle, ArrowRight, Activity as Pulse } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { endpoints } from '@/utils/api';

interface TriageResponse {
  priority: number;
  category: string;
  action: string;
  assigned_unit: string;
  esi_level: number;
  color: string;
  acuity: string;
  assigned_bed: string;
}

export default function TriagePage() {
  const [formData, setFormData] = useState({
    spo2: '',
    heart_rate: '',
    symptoms: ''
  });
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(endpoints.triageAssess, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spo2: parseInt(formData.spo2),
          heart_rate: parseInt(formData.heart_rate),
          symptoms: formData.symptoms.split(',').map(s => s.trim())
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Triage failed", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ spo2: '', heart_rate: '', symptoms: '' });
    setResult(null);
  };

  const getSeverityColor = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'orange': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'yellow': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'green': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6 md:p-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4"
          >
            <Activity className="w-3 h-3" />
            AI DIAGNOSTIC ENGINE
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight"
          >
            Smart Triage Portal
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg"
          >
            AI-Assisted Patient Intake & Severity Assessment
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Pulse className="w-4 h-4 text-blue-500" /> SpO2 (%)
                    </label>
                    <div className="relative group">
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        value={formData.spo2}
                        onChange={(e) => setFormData({...formData, spo2: e.target.value})}
                        className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none group-hover:border-gray-600"
                        placeholder="98"
                      />
                      <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" /> Heart Rate (BPM)
                    </label>
                    <div className="relative group">
                      <input
                        type="number"
                        required
                        value={formData.heart_rate}
                        onChange={(e) => setFormData({...formData, heart_rate: e.target.value})}
                        className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none group-hover:border-gray-600"
                        placeholder="75"
                      />
                      <div className="absolute inset-0 rounded-xl bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Presenting Symptoms (comma separated)
                  </label>
                  <div className="relative group">
                    <textarea
                      required
                      rows={3}
                      value={formData.symptoms}
                      onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                      className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none group-hover:border-gray-600 resize-none"
                      placeholder="e.g. chest pain, dizziness, nausea"
                    />
                    <div className="absolute inset-0 rounded-xl bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="relative z-10">Analyzing Vitals...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Assess & Admit Patient</span>
                      <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${
                 result.color === 'red' ? 'bg-red-500' :
                 result.color === 'orange' ? 'bg-orange-500' :
                 result.color === 'yellow' ? 'bg-yellow-500' :
                 result.color === 'green' ? 'bg-green-500' :
                 'bg-blue-500'
              }`} />
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8 border-4 ${
                  result.color === 'red' ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' :
                  result.color === 'orange' ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]' :
                  result.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]' :
                  result.color === 'green' ? 'bg-green-500/10 border-green-500 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' :
                  'bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                }`}
              >
                {result.esi_level <= 2 ? <AlertTriangle className="w-12 h-12" /> : <CheckCircle className="w-12 h-12" />}
              </motion.div>
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Assessment Complete</h2>
                <p className="text-gray-400">Patient categorized as <span className="text-white font-semibold">ESI Level {result.esi_level}</span></p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-black/40 p-6 rounded-xl border border-gray-800 mb-8">
                <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Acuity Level</p>
                  <p className={`text-xl font-bold ${
                     result.color === 'red' ? 'text-red-500' :
                     result.color === 'orange' ? 'text-orange-500' :
                     result.color === 'yellow' ? 'text-yellow-500' :
                     result.color === 'green' ? 'text-green-500' :
                     'text-blue-500'
                  }`}>
                    {result.acuity}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Assigned Bed</p>
                  <p className="text-xl font-bold text-blue-400 flex items-center gap-2">
                    {result.assigned_bed}
                  </p>
                </div>
                
                <div className="col-span-1 md:col-span-2 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Clinical Action</p>
                  <p className="text-lg font-medium text-gray-200">{result.action}</p>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl shadow-lg transition-all border border-gray-700 hover:border-gray-600 w-full md:w-auto"
              >
                Process Next Patient
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
