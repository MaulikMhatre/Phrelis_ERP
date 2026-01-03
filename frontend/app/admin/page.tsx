"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BedDouble, UserPlus, LogOut, ArrowLeft, Package, Plus, Minus, X, Activity, BrainCircuit } from 'lucide-react';

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
      fetchERPData(); // Refresh list
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
    // If the bed has triage data, we can pre-fill the condition
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

  if (loading) return <div className="p-10 text-center animate-pulse font-black text-indigo-600">LOADING PHRELIS OS ERP...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      
      {/* --- AMBULANCE CONTROL CENTER --- */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Panel */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="text-red-500" /> EMERGENCY DISPATCH
            </h3>
            <form onSubmit={handleDispatch} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Severity</label>
                    <select 
                        className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-700"
                        value={dispatchForm.severity}
                        onChange={e => setDispatchForm({...dispatchForm, severity: e.target.value})}
                    >
                        <option value="HIGH">CRITICAL (ICU Required)</option>
                        <option value="LOW">STABLE (ER Required)</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <input 
                        type="text" placeholder="Location" required
                        className="p-3 bg-gray-50 rounded-xl font-medium"
                        value={dispatchForm.location}
                        onChange={e => setDispatchForm({...dispatchForm, location: e.target.value})}
                    />
                    <input 
                        type="number" placeholder="ETA (min)" required
                        className="p-3 bg-gray-50 rounded-xl font-medium"
                        value={dispatchForm.eta}
                        onChange={e => setDispatchForm({...dispatchForm, eta: parseInt(e.target.value)})}
                    />
                </div>
                <button type="submit" className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
                    DISPATCH AMBULANCE
                </button>
            </form>
            {dispatchResult && (
                <div className={`mt-4 p-4 rounded-xl border-l-4 ${dispatchResult.status === 'DIVERTED' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'}`}>
                    <p className="font-bold text-sm">{dispatchResult.status}</p>
                    <p className="text-xs">{dispatchResult.message}</p>
                    {dispatchResult.target_unit && <p className="text-xs mt-1 font-mono">TARGET: {dispatchResult.target_unit}</p>}
                </div>
            )}
        </div>

        {/* Fleet Status */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-xl font-black text-gray-900 mb-4">FLEET STATUS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ambulances.map(amb => (
                    <div key={amb.id} className={`p-4 rounded-2xl border flex justify-between items-center ${amb.status === 'IDLE' ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-gray-800">{amb.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${amb.status === 'IDLE' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                    {amb.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                Loc: {amb.location} {amb.eta_minutes > 0 && `• ETA: ${amb.eta_minutes}m`}
                            </p>
                        </div>
                        {amb.status !== 'IDLE' && (
                            <button onClick={() => resetAmbulance(amb.id)} className="text-xs font-bold text-gray-400 hover:text-gray-900 underline">
                                Reset
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* ADMISSION MODAL OVERLAY */}
      {isModalOpen && selectedBed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-none">PATIENT ADMISSION</h2>
                <p className="text-indigo-500 font-bold text-xs mt-1 uppercase tracking-widest">Assigning to Unit: {selectedBed.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
            </div>

            {/* TRIAGE DATA PREVIEW (The "Necessary Information") */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex items-center gap-2 text-red-500 mb-1">
                    <Activity size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Triage Vitals</span>
                </div>
                <p className="text-lg font-black text-red-900">{selectedBed.vitals_snapshot || "N/A"}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-500 mb-1">
                    <BrainCircuit size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">AI Assessment</span>
                </div>
                <p className="text-xs font-bold text-indigo-900 italic leading-tight">
                    {selectedBed.condition || "Manual Intake Required"}
                </p>
              </div>
            </div>
            
            <form onSubmit={submitAdmission} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Legal Full Name</label>
                <input 
                  required
                  autoFocus
                  placeholder="e.g. John Doe"
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold"
                  value={patientData.name}
                  onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Patient Age</label>
                  <input 
                    type="number"
                    required
                    placeholder="25"
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold"
                    value={patientData.age}
                    onChange={(e) => setPatientData({...patientData, age: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Assign Status</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold appearance-none"
                    value={patientData.condition}
                    onChange={(e) => setPatientData({...patientData, condition: e.target.value})}
                  >
                    <option>Stable</option>
                    <option>Critical</option>
                    <option>Observation</option>
                    <option>Pre-Surgery</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 mt-4 active:scale-95">
                AUTHORIZE ADMISSION
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">ERP ADMINISTRATION</h1>
          <p className="text-gray-500 font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Orchestrating Hospital Resources in Real-time
          </p>
        </div>
        <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-white border shadow-sm rounded-xl text-indigo-600 font-black hover:shadow-md transition-all text-sm">
          <ArrowLeft size={18} /> BACK TO COMMAND CENTER
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* BED GRID */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ICU SECTION */}
          <div>
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} /> Intensive Care Unit (ICU)
                </h2>
                <div className="flex gap-4 text-[10px] font-black">
                    <span className="flex items-center gap-1 text-red-500"><div className="w-2 h-2 bg-red-500 rounded-full"></div> OCCUPIED</span>
                    <span className="flex items-center gap-1 text-gray-400"><div className="w-2 h-2 bg-gray-200 rounded-full"></div> VACANT</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {beds.filter(b => b.type === 'ICU').map((bed) => (
                  <div key={bed.id} className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${bed.is_occupied ? 'bg-white border-red-100 shadow-lg' : 'bg-white border-gray-100 opacity-60 hover:opacity-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-black text-gray-400">{bed.id}</p>
                        <div className={`w-2 h-2 rounded-full ${bed.is_occupied ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                    </div>
                    
                    {bed.is_occupied ? (
                      <div className="space-y-3">
                        <div>
                            <p className="text-xs font-black text-gray-900 truncate uppercase">{bed.patient_name || "Unidentified"}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{bed.condition || "General"}</p>
                        </div>
                        <button onClick={() => handleDischarge(bed.id)} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-100">
                            DISCHARGE
                        </button>
                      </div>
                    ) : (
                        <button onClick={() => openAdmitModal(bed)} className="w-full py-6 flex items-center justify-center text-gray-300 hover:text-indigo-500 transition-colors">
                            <Plus size={24} />
                        </button>
                    )}
                  </div>
                ))}
              </div>
          </div>

          {/* ER SECTION */}
          <div>
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-sm font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                    <BedDouble size={16} /> Emergency Room (ER)
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {beds.filter(b => b.type === 'ER').map((bed) => (
                  <div key={bed.id} className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${bed.is_occupied ? 'bg-white border-blue-100 shadow-lg' : 'bg-white border-gray-100 opacity-60 hover:opacity-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-black text-gray-400">{bed.id}</p>
                        <div className={`w-2 h-2 rounded-full ${bed.is_occupied ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    </div>
                    
                    {bed.is_occupied ? (
                      <div className="space-y-3">
                        <div>
                            <p className="text-xs font-black text-gray-900 truncate uppercase">{bed.patient_name || "Unidentified"}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{bed.condition || "General"}</p>
                        </div>
                        <button onClick={() => handleDischarge(bed.id)} className="w-full py-2 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg hover:bg-blue-100">
                            DISCHARGE
                        </button>
                      </div>
                    ) : (
                        <button onClick={() => openAdmitModal(bed)} className="w-full py-6 flex items-center justify-center text-gray-300 hover:text-indigo-500 transition-colors">
                            <Plus size={24} />
                        </button>
                    )}
                  </div>
                ))}
              </div>
          </div>

        </div>

        {/* INVENTORY PANEL (Kept from original) */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b pb-4">
            <Package size={16} /> Resource Inventory
          </h2>
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
            <InventoryControl label="Ventilators" current={8} total={20} />
            <InventoryControl label="Oxygen Cylinders" current={45} total={50} />
            <InventoryControl label="Ambulances" current={6} total={10} />
            <div className="pt-4 border-t">
                <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all">
                    + REQUEST SUPPLIES
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const InventoryControl = ({ label, current, total }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <p className="font-bold text-gray-700 text-sm">{label}</p>
      <p className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md border">
        {current} / {total}
      </p>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
        <Minus size={14} className="text-gray-500" />
      </button>
      <div className="flex-grow h-3 bg-gray-100 rounded-full overflow-hidden border border-inner">
        <div 
          className={`h-full transition-all duration-500 ${
            (current/total) < 0.2 ? 'bg-red-500' : 'bg-indigo-500'
          }`} 
          style={{ width: `${(current / total) * 100}%` }}
        ></div>
      </div>
      <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
        <Plus size={14} className="text-gray-500" />
      </button>
    </div>
  </div>
);
export default AdminPanel;

// ... InventoryControl stays the same ...