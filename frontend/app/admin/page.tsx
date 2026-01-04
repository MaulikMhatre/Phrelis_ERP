"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BedDouble, UserPlus, LogOut, ArrowLeft, Package, Plus, Minus, X, Activity, BrainCircuit, Ambulance, MapPin, Clock, AlertTriangle, Siren, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ResourceInventory from '@/components/ResourceInventory';

const AdminPanel = () => {
  const [beds, setBeds] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Ambulance Dispatch State ---
  const [dispatchForm, setDispatchForm] = useState({ severity: 'HIGH', location: '', eta: 10 });
  const [dispatchResult, setDispatchResult] = useState<any>(null);

  // --- State for Admission Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any | null>(null);
  const [patientData, setPatientData] = useState({ name: '', age: '', condition: 'Stable' });

  const fetchERPData = async () => {
    try {
      const [bedsRes, ambRes] = await Promise.all([
        fetch('http://localhost:8000/api/erp/beds'),
        fetch('http://localhost:8000/api/ambulances')
      ]);
      const bedsData = await bedsRes.json();
      const ambData = await ambRes.json();
      setBeds(bedsData);
      setAmbulances(ambData);
    } catch (e) {
      console.error("ERP Load Failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchERPData(); }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/ambulance/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispatchForm)
      });
      const data = await res.json();
      setDispatchResult(data);
      fetchERPData();
    } catch (e) {
      console.error("Dispatch Failed", e);
    }
  };

  const resetAmbulance = async (id: string) => {
    await fetch(`http://localhost:8000/api/ambulance/reset/${id}`, { method: 'POST' });
    fetchERPData();
  };

  const handleDischarge = async (bedId: string) => {
    if (!confirm("Confirm discharge?")) return;
    await fetch(`http://localhost:8000/api/erp/discharge/${bedId}`, { method: 'POST' });
    fetchERPData();
  };

  const openAdmitModal = (bed: any) => {
    setSelectedBed(bed);
    setPatientData({
      name: '',
      age: '',
      condition: bed.condition || 'Stable'
    });
    setIsModalOpen(true);
  };

  const submitAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/erp/admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bed_id: selectedBed.id,
          patient_name: patientData.name,
          age: parseInt(patientData.age),
          condition: patientData.condition
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchERPData();
      }
    } catch (error) {
      console.error("Admission failed", error);
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <Activity className="text-indigo-400 w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white">
                ERP Administration
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 pl-16"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-slate-500 font-medium tracking-wide text-sm">
                Orchestrating Hospital Resources in Real-time
              </p>
            </motion.div>
          </div>

          <Link href="/" className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300">
            <ArrowLeft size={16} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-xs font-bold text-slate-300 group-hover:text-white tracking-widest uppercase">Back to Command Center</span>
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN - DISPATCH & INVENTORY */}
          <div className="lg:col-span-4 space-y-8">

            {/* DISPATCH PANEL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-6 relative">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Siren size={18} /></div>
                  Emergency Dispatch
                </h3>

                <form onSubmit={handleDispatch} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Severity Level</label>
                    <div className="relative">
                      <select
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl font-bold text-slate-200 focus:border-red-500/50 focus:bg-red-500/5 outline-none transition-all appearance-none cursor-pointer"
                        value={dispatchForm.severity}
                        onChange={e => setDispatchForm({ ...dispatchForm, severity: e.target.value })}
                      >
                        <option value="HIGH" className="bg-black text-white">CRITICAL (ICU Required)</option>
                        <option value="LOW" className="bg-black text-white">STABLE (ER Required)</option>
                      </select>
                      <AlertTriangle className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
                      <div className="relative">
                        <input
                          type="text" placeholder="Sector 7" required
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl font-medium text-slate-200 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-500"
                          value={dispatchForm.location}
                          onChange={e => setDispatchForm({ ...dispatchForm, location: e.target.value })}
                        />
                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ETA (min)</label>
                      <div className="relative">
                        <input
                          type="number" placeholder="10" required
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl font-medium text-slate-200 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-500"
                          value={dispatchForm.eta}
                          onChange={e => setDispatchForm({ ...dispatchForm, eta: parseInt(e.target.value) })}
                        />
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-900/20 active:scale-[0.98] mt-2 flex items-center justify-center gap-2">
                    <Siren size={18} className="animate-pulse" /> DISPATCH UNIT
                  </button>
                </form>

                <AnimatePresence>
                  {dispatchResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mt-4 p-4 rounded-xl border-l-4 ${dispatchResult.status === 'DIVERTED' ? 'bg-red-500/10 border-red-500 text-red-200' : 'bg-green-500/10 border-green-500 text-green-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${dispatchResult.status === 'DIVERTED' ? 'bg-red-500' : 'bg-green-500'}`} />
                        <p className="font-bold text-sm">{dispatchResult.status}</p>
                      </div>
                      <p className="text-xs opacity-80">{dispatchResult.message}</p>
                      {dispatchResult.target_unit && <p className="text-xs mt-2 font-mono bg-black/20 p-2 rounded inline-block">TARGET: {dispatchResult.target_unit}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* INVENTORY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ResourceInventory
                resources={{
                  Ventilators: {
                    total: 20,
                    in_use: beds.filter(b => b.ventilator_in_use).length
                  },
                  Ambulances: {
                    total: ambulances.length || 10,
                    available: ambulances.filter(a => a.status === 'IDLE').length
                  }
                }}
              />
            </motion.div>

          </div>

          {/* CENTER & RIGHT - FLEET & BEDS */}
          <div className="lg:col-span-8 space-y-8">

            {/* FLEET STATUS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0a0a0a] rounded-3xl border border-white/10 p-6 overflow-hidden"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Ambulance size={18} /></div>
                Active Fleet Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ambulances.map(amb => (
                  <div key={amb.id} className={`p-4 rounded-2xl border flex justify-between items-center transition-all ${amb.status === 'IDLE' ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10'}`}>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-white text-lg">{amb.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${amb.status === 'IDLE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                          {amb.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin size={12} className="text-slate-500" />
                        <p className="text-xs text-slate-400 font-medium">
                          {amb.location} {amb.eta_minutes > 0 && <span className="text-slate-500">• {amb.eta_minutes}m away</span>}
                        </p>
                      </div>
                    </div>
                    {amb.status !== 'IDLE' && (
                      <button onClick={() => resetAmbulance(amb.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* BEDS SECTIONS */}
            <div className="space-y-8">
              {/* ICU */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                  <h2 className="text-sm font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} /> Intensive Care Unit (ICU)
                  </h2>
                  <div className="flex gap-4 text-[10px] font-bold tracking-wider">
                    <span className="flex items-center gap-2 text-red-400"><div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div> OCCUPIED</span>
                    <span className="flex items-center gap-2 text-slate-500"><div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div> VACANT</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {beds.filter(b => b.type === 'ICU').map((bed) => (
                    <BedCard
                      key={bed.id}
                      bed={bed}
                      onDischarge={() => handleDischarge(bed.id)}
                      onAdmit={() => openAdmitModal(bed)}
                      accentColor="red"
                    />
                  ))}
                </div>
              </motion.div>

              {/* ER */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                  <h2 className="text-sm font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <BedDouble size={16} /> Emergency Room (ER)
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {beds.filter(b => b.type === 'ER').map((bed) => (
                    <BedCard
                      key={bed.id}
                      bed={bed}
                      onDischarge={() => handleDischarge(bed.id)}
                      onAdmit={() => openAdmitModal(bed)}
                      accentColor="blue"
                    />
                  ))}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>

      {/* ADMISSION MODAL */}
      <AnimatePresence>
        {isModalOpen && selectedBed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0a0a0a] rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/10 relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white leading-none">PATIENT ADMISSION</h2>
                  {/* <p className="text-indigo-400 font-bold text-xs mt-2 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    Assigning to Unit: <span className="text-white">{selectedBed.id}</span>
                  </p> */}
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
                  <input
                    required
                    autoFocus
                    placeholder="e.g. John Doe"
                    className="w-full p-4 bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-2xl outline-none transition-all font-bold text-white placeholder:text-slate-700"
                    value={patientData.name}
                    onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Patient Age</label>
                    <input
                      type="number"
                      required
                      placeholder="25"
                      className="w-full p-4 bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-2xl outline-none transition-all font-bold text-white placeholder:text-slate-700"
                      value={patientData.age}
                      onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Assign Status</label>
                    <div className="relative">
                      <select
                        className="w-full p-4 bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-2xl outline-none transition-all font-bold text-white appearance-none cursor-pointer"
                        value={patientData.condition}
                        onChange={(e) => setPatientData({ ...patientData, condition: e.target.value })}
                      >
                        <option>Stable</option>
                        <option>Critical</option>
                        <option>Observation</option>
                        <option>Pre-Surgery</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] mt-4 active:scale-[0.98] flex items-center justify-center gap-2 group">
                  AUTHORIZE ADMISSION <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BedCard = ({ bed, onDischarge, onAdmit, accentColor }: any) => {
  const isRed = accentColor === 'red';
  const occupiedClass = isRed
    ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
    : 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]';

  const textClass = isRed ? 'text-red-400' : 'text-blue-400';
  const bgClass = isRed ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`p-5 rounded-2xl border transition-all relative overflow-hidden group ${bed.is_occupied ? occupiedClass : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-slate-500">{bed.id}</p>
        <div className={`w-2 h-2 rounded-full ${bed.is_occupied ? bgClass : 'bg-slate-700'}`}></div>
      </div>

      {bed.is_occupied ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-black text-white truncate uppercase mb-1">{bed.patient_name || "Unidentified"}</p>
            <p className={`text-[9px] font-bold ${textClass} uppercase tracking-tighter`}>{bed.condition || "General"}</p>
            {bed.ventilator_in_use && (
              <span className="block mt-2 text-[9px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded w-fit border border-cyan-500/30">
                VENTILATOR
              </span>
            )}
          </div>
          <button onClick={onDischarge} className={`w-full py-2 ${isRed ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'} text-[10px] font-bold rounded-lg transition-colors`}>
            DISCHARGE
          </button>
        </div>
      ) : (
        <button onClick={onAdmit} className="w-full py-6 flex flex-col items-center justify-center text-slate-600 hover:text-white transition-colors gap-2">
          <Plus size={24} />
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Assign</span>
        </button>
      )}
    </div>
  );
};

export default AdminPanel;
