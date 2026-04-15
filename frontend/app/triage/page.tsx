"use client";

import React, { useState } from 'react';
import { User, Heart, Activity, CheckCircle, AlertTriangle, ArrowRight, Activity as Pulse, ShieldAlert, Binary, Fingerprint, Users, Droplets, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { endpoints } from '@/utils/api';

interface TriageResponse {
  patient_name: string;
  patient_age: number;
  esi_level: number;
  acuity: string;
  assigned_bed: string;
  color: string;
  action: string;
  ai_justification: string;
}

export default function TriagePage() {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_age: '',
    gender: '', 
    blood_group: 'O+',
    spo2: '',
    heart_rate: '',
    symptoms: ''
  });
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.gender) return alert("Please select Subject Gender");

    setLoading(true);
    try {
      const res = await fetch(endpoints.triageAssess, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: formData.patient_name,
          patient_age: parseInt(formData.patient_age),
          gender: formData.gender,
          blood_group: formData.blood_group,
          vitals: {
            spo2: parseInt(formData.spo2),
            heart_rate: parseInt(formData.heart_rate),
          },
          symptoms: formData.symptoms.split(',').map(s => s.trim())
        })
      });

      if (!res.ok) throw new Error("System Link Error");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ patient_name: '', patient_age: '', gender: '', blood_group: 'O+', spo2: '', heart_rate: '', symptoms: '' });
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans transition-colors duration-500">
      
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 flex justify-between items-end pb-8 opacity-80">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                <Fingerprint size={18} className="text-primary" />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Biometric Intake Phase</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none">
              Phrelis<span className="text-primary">OS</span>
            </h1>
          </div>
          <div className="text-right hidden md:block opacity-40">
            <p className="text-[10px] font-black uppercase tracking-widest">Protocol Sync</p>
            <p className="text-xs font-bold uppercase tracking-tighter">AI-Triage.v2.4</p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="form" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
              className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-[2.5rem] p-10 shadow-sm overflow-hidden group">
              
              <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                {errorMsg && (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="text-rose-500/60" size={18} />
                    <span className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest">{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-12 space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-50">Patient Identity</label>
                    <input
                      type="text" required value={formData.patient_name}
                      onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                      className="w-full bg-transparent border-b border-border/60 p-5 text-foreground focus:border-primary outline-none font-bold placeholder:text-muted-foreground/50 transition-all"
                      placeholder="ENTER FULL LEGAL NAME..."
                    />
                  </div>

                  <div className="md:col-span-4 space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-50">Age (Cycles)</label>
                    <input
                      type="number" required value={formData.patient_age}
                      onChange={(e) => setFormData({ ...formData, patient_age: e.target.value })}
                      className="w-full bg-transparent border-b border-border/60 p-5 text-foreground focus:border-primary outline-none font-bold transition-all"
                      placeholder="00"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-50">Biological Sex</label>
                    <div className="relative">
                      <select
                        required value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className={`w-full bg-transparent border-b border-border/60 p-5 font-bold cursor-pointer outline-none appearance-none transition-all ${
                          formData.gender === "" ? "text-muted-foreground/50" : "text-foreground"
                        }`}
                      >
                        <option value="" disabled className="bg-background">SELECT GENDER</option>
                        <option value="Male" className="bg-background text-foreground">MALE</option>
                        <option value="Female" className="bg-background text-foreground">FEMALE</option>
                        <option value="Other" className="bg-background text-foreground">OTHER</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none" />
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-2">
                    <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1 italic">Blood Type</label>
                    <div className="relative">
                      <select
                        required value={formData.blood_group}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                        className="w-full bg-transparent border-b border-primary/30 p-5 text-primary font-black appearance-none outline-none cursor-pointer pr-10"
                      >
                        {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => (
                          <option key={g} value={g} className="bg-background text-foreground">{g}</option>
                        ))}
                      </select>
                      <Droplets size={14} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2 opacity-50">
                      <Pulse size={12} className="text-blue-500" /> SpO2 Saturation
                    </label>
                    <input
                      type="number" required value={formData.spo2}
                      onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                      className="w-full bg-transparent border-b border-blue-500/30 p-5 text-blue-500 focus:border-blue-500 outline-none font-black text-6xl font-mono transition-all placeholder:text-blue-500/30"
                      placeholder="00"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2 opacity-50">
                      <Heart size={12} className="text-rose-500" /> BPM Frequency
                    </label>
                    <input
                      type="number" required value={formData.heart_rate}
                      onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                      className="w-full bg-transparent border-b border-rose-500/30 p-5 text-rose-500 focus:border-rose-500 outline-none font-black text-6xl font-mono transition-all placeholder:text-rose-500/30"
                      placeholder="00"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-10">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-50 text-center block">Neural Pathology Description</label>
                  <textarea
                    required rows={2} value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="w-full bg-transparent border-b border-border/60 p-5 text-foreground focus:border-primary outline-none font-bold resize-none placeholder:text-muted-foreground/50 transition-all text-center"
                    placeholder="DESCRIBE SYMPTOMS (COMMAS)..."
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full py-7 bg-primary text-primary-foreground font-black rounded-3xl hover:opacity-90 transition-all flex items-center justify-center gap-4 tracking-[0.5em] uppercase text-[10px] shadow-sm disabled:opacity-30"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Run AI Assessment Phase <ArrowRight size={20} /></>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card/40 backdrop-blur-md border border-border/40 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden text-center">
              
              <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-8 ${
                result.esi_level <= 2 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {result.esi_level <= 2 ? <ShieldAlert size={40} /> : <CheckCircle size={40} />}
              </div>

              <h2 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter italic">Analysis Complete</h2>
              
              <div className="flex justify-center gap-4 mb-12">
                <span className={`px-5 py-2 rounded-full font-black text-[10px] tracking-[0.3em] border ${
                  result.esi_level <= 2 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                }`}>
                  ESI LEVEL: {result.esi_level}
                </span>
                <span className="px-5 py-2 bg-muted/50 border rounded-full font-black text-[10px] tracking-[0.3em] uppercase">
                    BED ID: {result.assigned_bed}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
                <div className="p-8 rounded-[2rem] bg-muted/20 border border-border/30">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4 opacity-50">Patient Identification</p>
                  <span className="text-2xl font-black text-foreground uppercase tracking-tighter">{result.patient_name}</span>
                  <p className="text-xs font-bold text-muted-foreground mt-2 uppercase">{result.patient_age} CYCLES • {formData.gender} • {formData.blood_group} TYPE</p>
                </div>

                <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10">
                  <p className="text-[9px] font-black text-primary/50 uppercase tracking-widest mb-4">Target Unit</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-primary uppercase tracking-tighter italic">{result.acuity} UNIT</span>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 p-8 rounded-[2rem] border border-border/30 bg-muted/10">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 italic leading-none">Diagnostic Context</p>
                  <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed italic border-l-2 border-border/40 pl-6">
                    &quot;{result.ai_justification}&quot;
                  </p>
                </div>
              </div>

              <button onClick={resetForm}
                className="w-full md:w-auto px-20 py-5 bg-foreground text-background font-black rounded-2xl transition-all shadow-xl uppercase text-[10px] tracking-[0.4em] hover:opacity-90"
              >
                Sync Next Intake
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}