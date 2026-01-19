"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  BedDouble, Activity, BrainCircuit, Package,
  ArrowLeft, Plus, X, MapPin,
  Siren, ChevronRight, LogOut, Clock,
  Baby, Stethoscope, ShieldAlert, HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ResourceInventory from '@/components/ResourceInventory';
import SurgerySection from '@/components/SurgerySection';
import { endpoints } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

// --- HELPERS ---
const formatIST = (isoString: string) => {
  if (!isoString) return "--:--";
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
};

// --- SIMULATED ASSET DISTRIBUTION FOR UI DEMO ---
const getWardZone = (bedId: string): 'Medical' | 'Specialty' | 'Recovery' | 'Security' => {
  const num = parseInt(bedId.split('-')[1] || '0');
  if (num <= 40) return 'Medical';
  if (num <= 70) return 'Specialty';
  if (num <= 90) return 'Recovery';
  return 'Security';
};

const getBedGender = (bedId: string): 'Male' | 'Female' | 'Any' => {
  const num = parseInt(bedId.split('-')[1] || '0');
  // Medical Block Split: 1-20 Male, 21-40 Female
  if (num <= 20) return 'Male';
  if (num <= 40) return 'Female';
  return 'Any';
};

// --- COMPONENTS ---

const UnitHeroCard = ({ title, icon: Icon, total, occupied, isActive, onClick, colorClass }: any) => {
  const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const isCritical = percentage >= 80;

  const getColors = () => {
    switch (colorClass) {
      case 'red': return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', ring: 'ring-red-500' };
      case 'blue': return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', ring: 'ring-blue-500' };
      case 'indigo': return { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500', ring: 'ring-indigo-500' };
      case 'emerald': return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', ring: 'ring-emerald-500' };
      default: return { bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-500', ring: 'ring-slate-500' };
    }
  };
  const c = getColors();

  return (
    <button
      onClick={onClick}
      className={`relative p-5 rounded-2xl border transition-all duration-300 w-full text-left overflow-hidden group
        ${isActive
          ? `${c.bg}/10 ${c.border} ring-1 ${c.ring}/50 shadow-lg`
          : 'bg-[#0a0a0a] border-white/5 hover:border-white/20 hover:bg-white/5 opacity-60 hover:opacity-100'
        }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${isActive ? `${c.bg}/20 ${c.text}` : 'bg-white/5 text-slate-400'}`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white">{percentage}%</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Occupancy</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className={`text-sm font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-400'}`}>
          {title}
        </h3>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full rounded-full ${isCritical ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : `${c.bg} shadow-sm`}`}
          />
        </div>
        <p className="text-[10px] text-slate-500 font-medium pt-1">
          <span className="text-white font-bold">{occupied}</span> / {total} Active
        </p>
      </div>
    </button>
  );
};

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
      const remaining = Math.round((parseInt(endTime!) - Date.now()) / 1000);
      if (remaining <= 0) {
        setTimeLeft(0); setIsFinished(true); return true;
      }
      setTimeLeft(remaining); return false;
    };
    if (!checkTime()) {
      const timer = setInterval(() => { if (checkTime()) clearInterval(timer); }, 1000);
      return () => clearInterval(timer);
    }
  }, [bedId]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <button onClick={onRequestUnlock} className="w-full py-3 bg-emerald-500 text-white font-black rounded-xl animate-bounce shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105">
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

const BedCard = ({ bed, onDischarge, onAdmit, onStartCleaning, onRefresh, accentColor, genderLock, patientGender }: any) => {
  const isRed = accentColor === 'red';
  const isGreen = accentColor === 'green';
  const isLocked = !bed.is_occupied && genderLock && genderLock !== 'Any' && patientGender && patientGender !== genderLock;

  const occupiedStyle = isRed
    ? 'bg-red-500/10 border-red-500/30'
    : isGreen ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-blue-500/10 border-blue-500/30';

  const textClass = isRed ? 'text-red-400' : isGreen ? 'text-emerald-400' : 'text-blue-400';

  const handleManualUnlock = async () => {
    try {
      await fetch(endpoints.cleaningComplete(bed.id), { method: 'POST' });
      localStorage.removeItem(`cleaning_end_time_${bed.id}`);
      onRefresh();
    } catch (e) { console.error(e); }
  };

  if (isLocked) {
    return (
      <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] opacity-40 grayscale pointer-events-none relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] font-black text-slate-500">{bed.id}</p>
          <div className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-bold uppercase">{genderLock} Only</div>
        </div>
        <div className="h-24 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
          <p className="text-[10px] uppercase font-bold text-slate-600">Gender Mismatch</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl border transition-all relative overflow-hidden group 
      ${bed.status === 'OCCUPIED' ? occupiedStyle :
        bed.status === 'DIRTY' ? 'bg-orange-500/10 border-orange-500/30 animate-pulse' :
          bed.status === 'CLEANING' ? 'bg-sky-500/10 border-sky-500/30' :
            'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}>

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black text-slate-500">{bed.id}</p>
          {genderLock && genderLock !== 'Any' && (
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${genderLock === 'Male' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'}`}>
              {genderLock.substring(0, 1)}
            </span>
          )}
        </div>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bed.status === "AVAILABLE" ? "#32CD32" : bed.status === "OCCUPIED" ? (isRed ? "#FF4500" : "#3b82f6") : bed.status === "DIRTY" ? "#FFA500" : "#87CEEB" }} />
      </div>

      {bed.status === "OCCUPIED" ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-black text-white truncate uppercase mb-1">{bed.patient_name || "Unidentified"}</p>
            <p className={`text-[9px] font-bold ${textClass} uppercase tracking-tighter`}>{bed.condition || "General"}</p>
            {bed.ventilator_in_use && <span className="block mt-2 text-[9px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded w-fit border border-cyan-500/30">VENTILATOR</span>}
          </div>
          <button onClick={onDischarge} className={`w-full py-2 ${isRed ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'} text-[10px] font-bold rounded-lg transition-colors`}>
            DISCHARGE
          </button>
        </div>
      ) : bed.status === "DIRTY" ? (
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-orange-400 text-center uppercase tracking-widest">Awaiting Cleaning</p>
          <button onClick={() => onStartCleaning(bed.id)} className="w-full py-2 bg-orange-500/20 text-orange-300 text-[10px] font-bold rounded-lg hover:bg-orange-500/40 transition-colors">START CLEANING</button>
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

  // States
  const [activeUnit, setActiveUnit] = useState<'ICU' | 'ER' | 'Surgery' | 'Wards'>('ICU');
  const [wardCategory, setWardCategory] = useState<'Medical' | 'Specialty' | 'Recovery' | 'Security'>('Medical');

  // Triage / Admission State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any | null>(null);
  const [patientData, setPatientData] = useState({ name: '', age: '', gender: 'Male', condition: 'Stable', surgeonName: '', duration: 60 });

  // Feature Logic
  const [dispatchForm, setDispatchForm] = useState({ severity: 'HIGH', location: '', eta: 10 });
  const [dischargeBedId, setDischargeBedId] = useState<string | null>(null);

  // FETCH
  const fetchERPData = useCallback(async () => {
    try {
      const [bedsRes, ambRes] = await Promise.all([fetch(endpoints.beds), fetch(endpoints.ambulances)]);
      const bedsData = await bedsRes.json();
      const ambData = await ambRes.json();
      setBeds(Array.isArray(bedsData) ? bedsData : []);
      setAmbulances(Array.isArray(ambData) ? ambData : []);
      setLoading(false);
    } catch { toast("Sync Error", "error"); setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchERPData(); }, [fetchERPData]);

  // SOCKETS
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (["SURGERY_UPDATE", "SURGERY_EXTENDED", "ROOM_RELEASED", "BED_UPDATE", "REFRESH_RESOURCES", "NEW_ADMISSION"].includes(data.type)) {
          fetchERPData();
        }
      } catch { }
    };
    return () => ws.close();
  }, [fetchERPData]);

  // HANDLERS
  const handleStartCleaning = async (id: string) => { await fetch(endpoints.startCleaning(id), { method: 'POST' }); fetchERPData(); };
  const resetAmbulance = async (id: string) => { await fetch(endpoints.ambulanceReset(id), { method: 'POST' }); fetchERPData(); };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(endpoints.ambulanceDispatch, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dispatchForm) });
      const data = await res.json();
      toast(data.status === 'DISPATCHED' ? "Unit Authorized" : "Dispatch Failed", data.status === 'DISPATCHED' ? "success" : "error");
      fetchERPData();
    } catch { toast("Network Error", "error"); }
  };

  const confirmDischarge = async () => {
    if (!dischargeBedId) return;
    await fetch(endpoints.discharge(dischargeBedId), { method: 'POST' });
    toast("Patient Discharged", "success");
    setDischargeBedId(null);
    fetchERPData();
  };

  const openAdmitModal = (bed: any) => {
    setSelectedBed(bed);
    let defCond = activeUnit === 'ICU' ? 'Critical' : activeUnit === 'Surgery' ? 'Pre-Surgery' : 'Stable';
    setPatientData(prev => ({ ...prev, name: '', age: '', condition: defCond, surgeonName: '', duration: 60 }));
    setIsModalOpen(true);
  };

  const submitAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    const staffId = localStorage.getItem('staff_id');
    if (!staffId) { toast("Auth Error", "error"); return; }

    try {
      const payload = {
        bed_id: String(selectedBed.id),
        patient_name: patientData.name,
        patient_age: Number(patientData.age),
        condition: patientData.condition,
        staff_id: staffId,
        gender: patientData.gender
      };

      let res;
      if (selectedBed.type === 'Surgery') {
        res = await fetch(endpoints.startSurgery, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, surgeon_name: patientData.surgeonName, duration_minutes: Number(patientData.duration) }) });
      } else {
        res = await fetch(endpoints.admit, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }

      if (res.ok) { setIsModalOpen(false); toast("Admission Confirmed", "success"); fetchERPData(); }
      else { toast("Admission Rejected", "error"); }
    } catch { toast("System Error", "error"); }
  };

  // --- FILTERS ---
  const getDisplayBeds = () => {
    let filtered = beds.filter(b => b.type === activeUnit);
    if (activeUnit === 'Wards') {
      filtered = filtered.filter(b => getWardZone(b.id) === wardCategory);
    }
    return filtered;
  };

  const getUnitStats = (type: string) => {
    const unitBeds = beds.filter(b => b.type === type);
    return {
      total: unitBeds.length,
      occupied: unitBeds.filter(b => b.status === "OCCUPIED").length
    };
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><p className="text-white font-mono animate-pulse">Initializing Phrelis OS...</p></div>;

  return (
    <div className="min-h-screen bg-black text-slate-200 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1800px] mx-auto space-y-8">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <Activity className="text-indigo-400 w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white">Command Center</h1>
            </motion.div>
            <div className="flex items-center gap-2 pl-16">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-slate-500 font-medium tracking-wide text-sm">{formatIST(new Date().toISOString())} • Orchestrating Hospital Resources</p>
            </div>
          </div>

          <Link href="/" className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300">
            <ArrowLeft size={16} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-xs font-bold text-slate-300 group-hover:text-white tracking-widest uppercase">Dashboard Main</span>
          </Link>
        </header>

        {/* RESTORED GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">

          {/* LEFT COLUMN: LOGISTICS (PREMIUM RESTORED) */}
          <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {/* Dispatch - Reverted to Red Gradient */}
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

            {/* Fleet - Reverted to Yellow Card */}
            <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 p-6 overflow-hidden">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><MapPin size={18} /></div>
                Active Fleet Status
              </h3>
              <div className="space-y-3">
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

            <ResourceInventory resources={{ Ventilators: { total: 20, in_use: beds.filter(b => b.ventilator_in_use).length }, Ambulances: { total: ambulances.length, available: ambulances.filter(a => a?.status === 'IDLE').length } }} />
          </div>

          {/* RIGHT COLUMN: ZONAL DRILL DOWN (NEW LOGIC) */}
          <div className="lg:col-span-9 flex flex-col gap-6 h-full">

            {/* HERO SWITCHER */}
            <div className="grid grid-cols-4 gap-4 shrink-0">
              <UnitHeroCard title="Intensive Care" icon={Activity} {...getUnitStats('ICU')} isActive={activeUnit === 'ICU'} onClick={() => setActiveUnit('ICU')} colorClass="red" />
              <UnitHeroCard title="Emergency" icon={BedDouble} {...getUnitStats('ER')} isActive={activeUnit === 'ER'} onClick={() => setActiveUnit('ER')} colorClass="blue" />
              <UnitHeroCard title="Surgery" icon={BrainCircuit} {...getUnitStats('Surgery')} isActive={activeUnit === 'Surgery'} onClick={() => setActiveUnit('Surgery')} colorClass="indigo" />
              <UnitHeroCard title="Wards" icon={Package} {...getUnitStats('Wards')} isActive={activeUnit === 'Wards'} onClick={() => setActiveUnit('Wards')} colorClass="emerald" />
            </div>

            {/* DYNAMIC GRID */}
            <div className="flex-1 bg-[#0a0a0a] rounded-3xl border border-white/10 p-6 overflow-hidden flex flex-col relative">
              <div className="flex justify-between items-center mb-6 shrink-0 z-10 transition-all">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  {activeUnit === 'ICU' && <span className="text-red-500"><Activity /></span>}
                  {activeUnit === 'ER' && <span className="text-blue-500"><BedDouble /></span>}
                  {activeUnit === 'Surgery' && <span className="text-indigo-500"><BrainCircuit /></span>}
                  {activeUnit === 'Wards' && <span className="text-emerald-500"><Package /></span>}
                  {activeUnit === 'Wards' ? `${wardCategory} Block` : activeUnit}
                </h2>

                {/* WARD PORTAL NAV */}
                {activeUnit === 'Wards' && (
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {[
                      { id: 'Medical', icon: HeartPulse }, { id: 'Specialty', icon: Baby },
                      { id: 'Recovery', icon: Stethoscope }, { id: 'Security', icon: ShieldAlert }
                    ].map(cat => (
                      <button key={cat.id} onClick={() => setWardCategory(cat.id as any)} className={`px-4 py-2 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center gap-2 ${wardCategory === cat.id ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                        <cat.icon size={12} /> {cat.id}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                <AnimatePresence mode="wait">
                  <motion.div key={activeUnit + wardCategory} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {activeUnit === 'Surgery' ? (
                      <div className="col-span-full"><SurgerySection beds={beds} onRefresh={fetchERPData} onAdmit={openAdmitModal} /></div>
                    ) : getDisplayBeds().length > 0 ? (
                      getDisplayBeds().map(bed => (
                        <BedCard
                          key={bed.id}
                          bed={bed}
                          onDischarge={() => setDischargeBedId(bed.id)}
                          onAdmit={() => openAdmitModal(bed)}
                          onStartCleaning={handleStartCleaning}
                          onRefresh={fetchERPData}
                          accentColor={activeUnit === 'ICU' ? 'red' : activeUnit === 'Wards' ? 'green' : 'blue'}
                          genderLock={activeUnit === 'Wards' && wardCategory === 'Medical' ? getBedGender(bed.id) : null}
                          patientGender={patientData.gender}
                        />
                      ))) : (
                      <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-600 border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <Package size={48} className="mb-4 opacity-50" />
                        <p className="font-bold uppercase tracking-widest">No Beds Found in {activeUnit}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ADMISSION MODAL */}
      <AnimatePresence>
        {isModalOpen && selectedBed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0a0a0a] rounded-3xl p-8 max-w-lg w-full border border-white/10 relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white">Admit Patient</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="text-slate-500 hover:text-white" /></button>
              </div>

              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-6 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Target Bed</p>
                  <p className="text-xl font-black text-white">{selectedBed.id}</p>
                </div>
                {activeUnit === 'Wards' && wardCategory === 'Medical' && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ward Policy</p>
                    <p className="text-sm font-bold text-white">{getBedGender(selectedBed.id)} Only</p>
                  </div>
                )}
              </div>

              <form onSubmit={submitAdmission} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Full Name</label>
                  <input required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl font-bold text-white outline-none" value={patientData.name} onChange={e => setPatientData({ ...patientData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Age</label>
                    <input type="number" required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl font-bold text-white outline-none" value={patientData.age} onChange={e => setPatientData({ ...patientData, age: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Gender</label>
                    <select className="w-full p-4 bg-white/5 border border-white/10 rounded-xl font-bold text-white outline-none" value={patientData.gender} onChange={e => setPatientData({ ...patientData, gender: e.target.value })}>
                      <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Condition</label>
                  <select className="w-full p-4 bg-white/5 border border-white/10 rounded-xl font-bold text-white outline-none" value={patientData.condition} onChange={e => setPatientData({ ...patientData, condition: e.target.value })}>
                    <option>Stable</option><option>Critical</option><option>Observation</option><option>Pre-Surgery</option>
                  </select>
                </div>

                {/* Logic Check: Ward Gender Policy */}
                {activeUnit === 'Wards' && wardCategory === 'Medical' && getBedGender(selectedBed.id) !== 'Any' && getBedGender(selectedBed.id) !== patientData.gender && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                    <ShieldAlert className="text-red-500" size={20} />
                    <p className="text-xs font-bold text-red-200">Policy Violation: Bed reserved for {getBedGender(selectedBed.id)} patients.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={activeUnit === 'Wards' && wardCategory === 'Medical' && getBedGender(selectedBed.id) !== 'Any' && getBedGender(selectedBed.id) !== patientData.gender}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 mt-4"
                >
                  CONFIRM ADMISSION
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISCHARGE CONFIRMATION */}
      <AnimatePresence>
        {dischargeBedId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDischargeBedId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0a0a0a] rounded-3xl p-8 max-w-sm w-full border border-red-500/20 relative z-10 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={32} className="text-red-500" /></div>
              <h2 className="text-xl font-black text-white mb-2">Discharge Patient?</h2>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDischargeBedId(null)} className="flex-1 py-3 bg-white/5 rounded-xl text-slate-300 font-bold">CANCEL</button>
                <button onClick={confirmDischarge} className="flex-1 py-3 bg-red-600 rounded-xl text-white font-bold shadow-lg shadow-red-900/20">CONFIRM</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminPanel;