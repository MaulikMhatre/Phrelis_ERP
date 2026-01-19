
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BedDouble, UserPlus, LogOut, ArrowLeft, Package, Plus, Minus, X, Activity, BrainCircuit, Ambulance, MapPin, Clock, AlertTriangle, Siren, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ResourceInventory from '@/components/ResourceInventory';
import SurgerySection from '@/components/SurgerySection';
import { endpoints } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

// 1. Automated Cleaning Timer
const CleaningTimer = ({ bedId, onRequestUnlock }: { bedId: string, onRequestUnlock: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const storageKey = `cleaning_end_time_${bedId}`;
    let endTime = localStorage.getItem(storageKey);

    if (!endTime) {
      const newEndTime = Date.now() + 180 * 1000;
      localStorage.setItem(storageKey, newEndTime.toString());
      endTime = newEndTime.toString();
    }

    const checkTime = () => {
      const now = Date.now();
      const remaining = Math.round((parseInt(endTime!) - now) / 1000);

      if (remaining <= 0) {
        setTimeLeft(0);
        setIsFinished(true);
        return true;
      }
      setTimeLeft(remaining);
      return false;
    };

    const done = checkTime();
    if (done) return;

    const timer = setInterval(() => {
      if (checkTime()) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [bedId]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <button
        onClick={onRequestUnlock}
        className="w-full py-3 bg-emerald-500 text-white font-black rounded-xl animate-bounce shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
      >
        RELEASE BED
      </button>
    );
  }

  return (
    <div className="text-center py-2 bg-sky-500/10 rounded-lg border border-sky-400/20">
      <p className="text-[9px] font-black text-sky-400 uppercase">Sanitizing</p>
      <p className="text-lg font-black text-white font-mono">{timeLeft !== null ? formatTime(timeLeft) : "--:--"}</p>
    </div>
  );
};
const BedCard = ({ bed, onDischarge, onAdmit, onStartCleaning, onRefresh, accentColor }: any) => {
  const isRed = accentColor === 'red';
  const isGreen = accentColor === 'green';

  // Restore original styling classes for occupied state
  const occupiedClass = isRed
    ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
    : isGreen
      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
      : 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]';

  const textClass = isRed ? 'text-red-400' : isGreen ? 'text-emerald-400' : 'text-blue-400';
  const bgClass = isRed ? 'bg-red-500' : isGreen ? 'bg-emerald-500' : 'bg-blue-500';

  const handleManualUnlock = async () => {
    try {
      await fetch(endpoints.cleaningComplete(bed.id), { method: 'POST' });
      localStorage.removeItem(`cleaning_end_time_${bed.id}`);
      onRefresh();
    } catch (e) {
      console.error("Manual unlock failed", e);
    }
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all relative overflow-hidden group 
      ${bed.status === 'OCCUPIED' ? occupiedClass :
        bed.status === 'DIRTY' ? 'bg-orange-500/10 border-orange-500/30 animate-pulse' :
          bed.status === 'CLEANING' ? 'bg-sky-500/10 border-sky-500/30' :
            'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}>

      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-slate-500">{bed.id}</p>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bed.status === "AVAILABLE" ? "#32CD32" : bed.status === "OCCUPIED" ? (isRed ? "#FF4500" : "#3b82f6") : bed.status === "DIRTY" ? "#FFA500" : "#87CEEB" }} />
      </div>

      {bed.status === "OCCUPIED" ? (
        <div className="space-y-4">
          {/* Restored Patient Name and Condition Display */}
          <div>
            <p className="text-xs font-black text-white truncate uppercase mb-1">
              {bed.patient_name || "Unidentified"}
            </p>
            <p className={`text-[9px] font-bold ${textClass} uppercase tracking-tighter`}>
              {bed.condition || "General"}
            </p>
            {bed.ventilator_in_use && (
              <span className="block mt-2 text-[9px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded w-fit border border-cyan-500/30">
                VENTILATOR
              </span>
            )}
          </div>

          <button
            onClick={onDischarge}
            className={`w-full py-2 ${isRed ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'} text-[10px] font-bold rounded-lg transition-colors`}
          >
            DISCHARGE
          </button>
        </div>
      ) : bed.status === "DIRTY" ? (
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-orange-400 text-center uppercase tracking-widest">Awaiting Cleaning</p>
          <button onClick={() => onStartCleaning(bed.id)} className="w-full py-2 bg-orange-500/20 text-orange-300 text-[10px] font-bold rounded-lg hover:bg-orange-500/40 transition-colors">
            START CLEANING
          </button>
        </div>
      ) : bed.status === "CLEANING" ? (
        <CleaningTimer bedId={bed.id} onRequestUnlock={handleManualUnlock} />
      ) : (
        <button onClick={onAdmit} className="w-full py-6 flex flex-col items-center justify-center text-slate-600 hover:text-white transition-colors gap-2">
          <Plus size={24} />
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Assign</span>
        </button>
      )}
    </div>
  );
};


// --- MAIN PANEL ---

const AdminPanel = () => {
  const { toast } = useToast();
  const [beds, setBeds] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [dispatchForm, setDispatchForm] = useState({ severity: 'HIGH', location: '', eta: 10 });
  const [dispatchResult, setDispatchResult] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any | null>(null);
  const [patientData, setPatientData] = useState({ name: '', age: '', condition: 'Stable', surgeonName: '', duration: 60 });

  const [dischargeBedId, setDischargeBedId] = useState<string | null>(null);

  const fetchERPData = useCallback(async () => {
    try {
      const [bedsRes, ambRes] = await Promise.all([
        fetch(endpoints.beds),
        fetch(endpoints.ambulances)
      ]);
      const bedsData = await bedsRes.json();
      const ambData = await ambRes.json();
      setBeds(Array.isArray(bedsData) ? bedsData : []);
      setAmbulances(Array.isArray(ambData) ? ambData : []);
    } catch (e) {
      toast("Failed to load ERP data", "error");
      setBeds([]);
      setAmbulances([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchERPData();
  }, [fetchERPData]);

  // Real-time WebSocket Logic
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => console.log("Connected to Hospital OS Realtime Network");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Listen for Surgery Updates or General Bed Updates
        if (["SURGERY_UPDATE", "SURGERY_EXTENDED", "ROOM_RELEASED", "BED_UPDATE", "REFRESH_RESOURCES"].includes(data.type)) {
          fetchERPData();
          if (data.type === "SURGERY_UPDATE" && data.state === "DIRTY") {
            toast(`Surgery Room ${data.bed_id} is now Dirty (Turnover)`, "info");
          }
        }
      } catch (e) { console.error("WS Error", e); }
    };

    return () => ws.close();
  }, [fetchERPData, toast]);

  const handleStartCleaning = async (bedId: string) => {
    try {
      await fetch(endpoints.startCleaning(bedId), { method: 'POST' });
      toast(`Cleaning cycle started for ${bedId}`, "info");
      fetchERPData();
    } catch (e) {
      toast("Failed to initiate cleaning", "error");
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(endpoints.ambulanceDispatch, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispatchForm)
      });
      const data = await res.json();
      setDispatchResult(data);
      if (data.status === 'DISPATCHED') {
        toast(`Ambulance dispatched to ${dispatchForm.location}`, "success");
      } else {
        toast(data.message || "Dispatch unavailable", "warning");
      }
      fetchERPData();
    } catch (e) {
      toast("Dispatch failed", "error");
    }
  };

  const resetAmbulance = async (id: string) => {
    await fetch(endpoints.ambulanceReset(id), { method: 'POST' });
    toast(`Ambulance ${id} returned to station`, "info");
    fetchERPData();
  };

  const confirmDischarge = async () => {
    if (!dischargeBedId) return;
    try {
      await fetch(endpoints.discharge(dischargeBedId), { method: 'POST' });
      toast(`Patient discharged from ${dischargeBedId}. Bed locked for cleaning.`, "success");
      fetchERPData();
    } catch (e) {
      toast("Discharge failed", "error");
    } finally {
      setDischargeBedId(null);
    }
  };

  const handleDischarge = (bedId: string) => {
    setDischargeBedId(bedId);
  };

  const openAdmitModal = (bed: any) => {
    setSelectedBed(bed);
    setPatientData({ name: '', age: '', condition: bed.condition || 'Stable', surgeonName: '', duration: 60 });
    setIsModalOpen(true);
  };

  const submitAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentStaffId = localStorage.getItem('staff_id');
    if (!currentStaffId || !patientData.age || !selectedBed?.id) {
      toast("Session error: Please re-login", "error");
      return;
    }
    try {
      let response;

      if (selectedBed.type === 'Surgery') {
        // Surgery Admission Flow
        response = await fetch(endpoints.startSurgery, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bed_id: String(selectedBed.id),
            patient_name: patientData.name,
            patient_age: Number(patientData.age),
            surgeon_name: patientData.surgeonName,
            duration_minutes: Number(patientData.duration)
          })
        });
      } else {
        // Standard ICU/ER Admission
        response = await fetch(endpoints.admit, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bed_id: String(selectedBed.id),
            patient_name: patientData.name,
            patient_age: Number(patientData.age),
            condition: patientData.condition,
            staff_id: currentStaffId
          }),
        });
      }

      if (response.ok) {
        setIsModalOpen(false);
        toast(`Patient admitted to ${selectedBed.id}`, "success");
        fetchERPData();
      } else {
        const err = await response.json();
        toast(err.detail || "Admission failed", "error");
      }
    } catch (error) {
      toast("Admission request failed", "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-indigo-400 font-mono tracking-widest text-sm animate-pulse">INITIALIZING ERP SYSTEM...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-slate-200 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <Activity className="text-indigo-400 w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white">ERP Administration</h1>
            </motion.div>
            <div className="flex items-center gap-2 pl-16">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-slate-500 font-medium tracking-wide text-sm">Orchestrating Hospital Resources in Real-time</p>
            </div>
          </div>

          <Link href="/" className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300">
            <ArrowLeft size={16} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-xs font-bold text-slate-300 group-hover:text-white tracking-widest uppercase">Back to Command Center</span>
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: DISPATCH & STATS */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-6 relative">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Siren size={18} /></div>
                  Emergency Dispatch
                </h3>
                <form onSubmit={handleDispatch} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Severity Level</label>
                    <select className="w-full p-4 bg-white/5 border border-white/10 rounded-xl font-bold text-slate-200 outline-none" value={dispatchForm.severity} onChange={e => setDispatchForm({ ...dispatchForm, severity: e.target.value })}>
                      <option value="HIGH" className="bg-black text-white">CRITICAL (ICU Required)</option>
                      <option value="LOW" className="bg-black text-white">STABLE (ER Required)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
                      <input type="text" placeholder="Sector 7" required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none" value={dispatchForm.location} onChange={e => setDispatchForm({ ...dispatchForm, location: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ETA (min)</label>
                      <input type="number" required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none" value={dispatchForm.eta} onChange={e => setDispatchForm({ ...dispatchForm, eta: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl mt-2 flex items-center justify-center gap-2">
                    <Siren size={18} className="animate-pulse" /> DISPATCH UNIT
                  </button>
                </form>
              </div>
            </div>
            <ResourceInventory resources={{ Ventilators: { total: 20, in_use: beds.filter(b => b.ventilator_in_use).length }, Ambulances: { total: ambulances.length, available: ambulances.filter(a => a?.status === 'IDLE').length } }} />
          </div>

          {/* RIGHT COLUMN: FLEET & BEDS */}
          <div className="lg:col-span-8 space-y-8">
            <SurgerySection beds={beds} onRefresh={fetchERPData} onAdmit={openAdmitModal} />

            <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 p-6 overflow-hidden">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Ambulance size={18} /></div>
                Active Fleet Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ambulances.map(amb => (
                  <div key={amb.id} className={`p-4 rounded-2xl border flex justify-between items-center transition-all ${amb.status === 'IDLE' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-white text-lg">{amb.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${amb.status === 'IDLE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>{amb.status}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin size={12} className="text-slate-500" />
                        <p className="text-xs text-slate-400">{amb.location}</p>
                      </div>
                    </div>
                    {amb.status !== 'IDLE' && <button onClick={() => resetAmbulance(amb.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"><X size={14} /></button>}
                  </div>
                ))}
              </div>
            </div>

            {/* BEDS SECTIONS */}
            <div className="space-y-8">
              {['ICU', 'ER', 'Wards'].map(sectionType => (
                <div key={sectionType}>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                    <h2 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${sectionType === 'ICU' ? 'text-red-400' : sectionType === 'Wards' ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {sectionType === 'ICU' ? <Activity size={16} /> : sectionType === 'ER' ? <BedDouble size={16} /> : <Package size={16} />}
                      {sectionType === 'ICU' ? 'Intensive Care Unit (ICU)' : sectionType === 'ER' ? 'Emergency Room (ER)' : 'General Wards'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    {beds.filter(b => b.type === sectionType).map(bed => (
                      <BedCard key={bed.id} bed={bed} onDischarge={() => handleDischarge(bed.id)} onAdmit={() => openAdmitModal(bed)} onStartCleaning={handleStartCleaning} onRefresh={fetchERPData} accentColor={sectionType === 'ICU' ? 'red' : sectionType === 'Wards' ? 'green' : 'blue'} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ADMISSION MODAL (RESTORED ORIGINAL UI) */}
      <AnimatePresence>
        {isModalOpen && selectedBed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#0a0a0a] rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/10 relative z-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white leading-none">PATIENT ADMISSION</h2>
                  <div className="text-indigo-400 font-bold text-xs mt-2 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    Assigning to Unit: <span className="text-white">{selectedBed.id}</span>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <Activity size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Triage Vitals</span>
                  </div>
                  <p className="text-lg font-black text-red-100">{selectedBed.vitals_snapshot || "N/A"}</p>
                </div>
                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                  <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <BrainCircuit size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">AI Assessment</span>
                  </div>
                  <p className="text-xs font-bold text-indigo-100 italic leading-tight">
                    {selectedBed.condition || "Manual Intake Required"}
                  </p>
                </div>
              </div>

              <form onSubmit={submitAdmission} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Legal Full Name</label>
                  <input required placeholder="e.g. John Doe" className="w-full p-4 bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-2xl outline-none transition-all font-bold text-white placeholder:text-slate-700" value={patientData.name} onChange={(e) => setPatientData({ ...patientData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Patient Age</label>
                    <input type="number" required placeholder="25" className="w-full p-4 bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-2xl outline-none transition-all font-bold text-white placeholder:text-slate-700" value={patientData.age} onChange={(e) => setPatientData({ ...patientData, age: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Assign Status</label>
                    <div className="relative">
                      <select className="w-full p-4 bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-2xl outline-none transition-all font-bold text-white appearance-none cursor-pointer" value={patientData.condition} onChange={(e) => setPatientData({ ...patientData, condition: e.target.value })}>
                        <option>Stable</option><option>Critical</option><option>Observation</option><option>Pre-Surgery</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                {/* Surgery Specific Fields */}
                {selectedBed.type === 'Surgery' && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-400 uppercase ml-1">Surgeon Name</label>
                      <input required placeholder="Dr. " className="w-full p-4 bg-indigo-500/10 border border-indigo-500/30 focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-white placeholder:text-indigo-500/50" value={patientData.surgeonName} onChange={(e) => setPatientData({ ...patientData, surgeonName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-400 uppercase ml-1">Duration (Min)</label>
                      <input type="number" required placeholder="60" className="w-full p-4 bg-indigo-500/10 border border-indigo-500/30 focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-white placeholder:text-indigo-500/50" value={patientData.duration} onChange={(e) => setPatientData({ ...patientData, duration: Number(e.target.value) })} />
                    </div>
                  </div>
                )}
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] mt-4 active:scale-[0.98] flex items-center justify-center gap-2 group">
                  AUTHORIZE ADMISSION <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISCHARGE MODAL */}
      <AnimatePresence>
        {dischargeBedId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDischargeBedId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-[#0a0a0a] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-red-500/20 relative z-10 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={32} className="text-red-500" /></div>
              <h2 className="text-xl font-black text-white mb-2">Confirm Discharge?</h2>
              <p className="text-slate-400 text-sm mb-8">Discharging patient from <span className="text-white font-bold">{dischargeBedId}</span> will lock the bed for cleaning.</p>
              <div className="flex gap-3">
                <button onClick={() => setDischargeBedId(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-colors">CANCEL</button>
                <button onClick={confirmDischarge} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-900/20">DISCHARGE</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;