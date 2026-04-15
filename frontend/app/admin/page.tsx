

// "use client";
// import React, { useEffect, useState, useCallback } from 'react';
// import Link from 'next/link';
// import {
//     BedDouble, Activity, BrainCircuit, Package,
//     ArrowLeft, Plus, X, MapPin,
//     Siren, LogOut, Baby, Stethoscope,
//     ShieldAlert, HeartPulse, Timer, UserCheck, Trash2
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import ResourceInventory from '@/components/ResourceInventory';
// import SurgerySection from '@/components/SurgerySection';
// import { endpoints } from '@/utils/api';
// import { useToast } from '@/context/ToastContext';
// import { useAuth } from '@/context/AuthContext';

// // --- HELPERS ---
// const formatIST = (isoString?: string) => {
//     const date = isoString ? new Date(isoString) : new Date();
//     return date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
// };

// const getBedGender = (bedId: string): 'Male' | 'Female' | 'Any' => {
//     const num = parseInt(bedId.replace(/^\D+/g, '') || '0');
//     if (num >= 1 && num <= 20) return 'Male';
//     if (num >= 21 && num <= 40) return 'Female';
//     return 'Any';
// };

// // --- COMPONENTS ---

// const UnitHeroCard = ({ title, icon: Icon, total, occupied, isActive, onClick, colorClass }: any) => {
//     const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;
//     const isCritical = percentage >= 80;

//     const getColors = () => {
//         switch (colorClass) {
//             case 'red': return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', gradient: 'from-red-500/20' };
//             case 'blue': return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', gradient: 'from-blue-500/20' };
//             case 'indigo': return { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500', gradient: 'from-indigo-500/20' };
//             case 'emerald': return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', gradient: 'from-emerald-500/20' };
//             default: return { bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-500', gradient: 'from-slate-500/20' };
//         }
//     };
//     const c = getColors();

//     return (
//         <button
//             onClick={onClick}
//             className={`relative p-6 rounded-[2.5rem] border transition-all duration-500 w-full text-left overflow-hidden group hover:-translate-y-1
//         ${isActive ? `bg-card ${c.border}` : 'bg-card/40 border-border hover:border-primary/30'}`}
//         >
//             <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isActive ? 'opacity-20' : ''}`} />
//             <div className="relative z-10 flex justify-between items-start mb-6">
//                 <div className={`p-4 rounded-2xl ${isActive ? `${c.bg} text-white shadow-lg` : 'bg-muted text-muted-foreground'}`}>
//                     <Icon size={24} />
//                 </div>
//                 <div className="text-right">
//                     <p className="text-3xl font-black text-foreground">{percentage}%</p>
//                     <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isActive ? c.text : 'text-slate-600'}`}>Occupancy</p>
//                 </div>
//             </div>
//             <div className="relative z-10 space-y-3">
//                 <h3 className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-foreground' : 'text-slate-400'}`}>{title}</h3>
//                 <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
//                     <motion.div
//                         initial={{ width: 0 }}
//                         animate={{ width: `${percentage}%` }}
//                         transition={{ duration: 1 }}
//                         className={`h-full rounded-full ${isCritical ? 'bg-red-500' : `${c.bg}`}`}
//                     />
//                 </div>
//                 <div className="flex justify-between items-center pt-2">
//                     <p className="text-[10px] text-slate-500 font-bold uppercase">Active Units</p>
//                     <p className="text-xs font-mono text-foreground"><span className={`${c.text} font-bold`}>{occupied}</span> / {total}</p>
//                 </div>
//             </div>
//         </button>
//     );
// };

// const CleaningTimer = ({ bedId, onRequestUnlock }: { bedId: string, onRequestUnlock: () => void }) => {
//     const [timeLeft, setTimeLeft] = useState<number | null>(null);
//     const [isFinished, setIsFinished] = useState(false);

//     useEffect(() => {
//         const storageKey = `cleaning_end_time_${bedId}`;
//         let endTime = localStorage.getItem(storageKey);
//         if (!endTime) {
//             const newEndTime = Date.now() + 180 * 1000;
//             localStorage.setItem(storageKey, newEndTime.toString());
//             endTime = newEndTime.toString();
//         }
//         const checkTime = () => {
//             const remaining = Math.round((parseInt(endTime!) - Date.now()) / 1000);
//             if (remaining <= 0) { setTimeLeft(0); setIsFinished(true); return true; }
//             setTimeLeft(remaining); return false;
//         };
//         if (!checkTime()) {
//             const timer = setInterval(() => { if (checkTime()) clearInterval(timer); }, 1000);
//             return () => clearInterval(timer);
//         }
//     }, [bedId]);

//     const formatTime = (s: number) => {
//         const mins = Math.floor(s / 60);
//         const secs = s % 60;
//         return `${mins}:${secs.toString().padStart(2, '0')}`;
//     };

//     if (isFinished) {
//         return (
//             <button onClick={onRequestUnlock} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl animate-bounce transition-colors uppercase tracking-widest text-[10px]">
//                 Mark Ready
//             </button>
//         );
//     }
//     return (
//         <div className="text-center py-3 bg-sky-500/10 rounded-xl border border-sky-400/20">
//             <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest mb-1">Sterilization</p>
//             <p className="text-2xl font-black text-foreground font-mono tracking-tighter">{timeLeft !== null ? formatTime(timeLeft) : "--:--"}</p>
//         </div>
//     );
// };

// const BedCard = ({ bed, onDischarge, onAdmit, onStartCleaning, onRefresh, accentColor, genderLock, patientGender }: any) => {
//     const { token } = useAuth();
//     const isRed = accentColor === 'red';
//     const isGreen = accentColor === 'green';
//     const isLocked = !bed.is_occupied && genderLock && genderLock !== 'Any' && patientGender && patientGender !== genderLock;

//     const textClass = isRed ? 'text-red-400' : isGreen ? 'text-emerald-400' : 'text-blue-400';

//     const handleManualUnlock = async () => {
//         try {
//             await fetch(endpoints.cleaningComplete(bed.id), {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             localStorage.removeItem(`cleaning_end_time_${bed.id}`);
//             onRefresh();
//         } catch (e) { console.error(e); }
//     };

//     if (isLocked) {
//         return (
//             <div className="p-6 rounded-3xl border border-dashed border-border bg-muted/30 opacity-40 grayscale pointer-events-none relative overflow-hidden flex flex-col items-center justify-center gap-2">
//                 <ShieldAlert size={24} className="text-slate-600" />
//                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Restricted</p>
//             </div>
//         );
//     }

//     return (
//         <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className={`p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group 
//       ${bed.status === 'OCCUPIED'
//                     ? isRed ? 'bg-red-500/5 border-red-500/30' : isGreen ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-blue-500/5 border-blue-500/30'
//                     : bed.status === 'DIRTY' ? 'bg-orange-500/5 border-orange-500/20' : bed.status === 'CLEANING' ? 'bg-sky-500/5 border-sky-500/20' : 'bg-card border-border hover:border-primary/30'}`}>
//             <div className="flex justify-between items-center mb-6">
//                 <div className="flex items-center gap-3">
//                     <p className="text-xs font-black text-slate-400 px-3 py-1.5 rounded-lg bg-muted border border-border">{bed.id}</p>
//                     {genderLock && genderLock !== 'Any' && (
//                         <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${genderLock === 'Male' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>
//                             {genderLock}
//                         </span>
//                     )}
//                 </div>
//                 <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-opacity-20 ${bed.status === "AVAILABLE" ? "bg-emerald-500 ring-emerald-500" : bed.status === "OCCUPIED" ? (isRed ? "bg-red-500 ring-red-500" : "bg-blue-500 ring-blue-500") : bed.status === "DIRTY" ? "bg-orange-500 ring-orange-500" : "bg-sky-500 ring-sky-500"}`} />
//             </div>
//             {bed.status === "OCCUPIED" ? (
//                 <div className="space-y-6">
//                     <div>
//                         <p className="text-lg font-black text-foreground truncate leading-tight uppercase italic">{bed.patient_name || "Unidentified"}</p>
//                         <p className={`text-[10px] font-bold ${textClass} uppercase tracking-widest mt-1`}>{bed.condition || "General Care"}</p>
//                         {bed.ventilator_in_use && <span className="inline-flex mt-3 items-center gap-1.5 text-[9px] font-black text-cyan-300 bg-cyan-950/50 px-3 py-1.5 rounded-md border border-cyan-500/30"><Activity size={10} /> VENTILATOR ONLINE</span>}
//                     </div>
//                     <button onClick={onDischarge} className={`w-full py-3 ${isRed ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20'} border rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors`}>Initiate Discharge</button>
//                 </div>
//             ) : bed.status === "DIRTY" ? (
//                 <div className="space-y-4">
//                     <div className="flex flex-col items-center py-4 text-orange-400/50">
//                         <Baby size={32} className="mb-2 animate-pulse" />
//                         <p className="text-[10px] font-bold uppercase tracking-widest">Unit Secluded</p>
//                     </div>
//                     <button onClick={() => onStartCleaning(bed.id)} className="w-full py-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 text-[10px] font-black rounded-xl uppercase tracking-widest transition-colors">Start Protocol</button>
//                 </div>
//             ) : bed.status === "CLEANING" ? (
//                 <CleaningTimer bedId={bed.id} onRequestUnlock={handleManualUnlock} />
//             ) : (
//                 <button onClick={onAdmit} className="w-full py-10 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-all gap-3 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl bg-muted/20 group-hover:bg-card">
//                     <div className="p-3 rounded-full bg-muted group-hover:bg-primary/20 transition-colors">
//                         <Plus size={20} />
//                     </div>
//                     <span className="text-[10px] font-black uppercase tracking-widest">Assign Patient</span>
//                 </button>
//             )}
//         </motion.div>
//     );
// };

// // --- MAIN PANEL ---

// const AdminPanel = () => {
//     const { token } = useAuth();
//     const { toast } = useToast();
//     const [beds, setBeds] = useState<any[]>([]);
//     const [ambulances, setAmbulances] = useState<any[]>([]);
//     const [reservations, setReservations] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);

//     const [activeUnit, setActiveUnit] = useState<'ICU' | 'ER' | 'Surgery' | 'Wards'>('ICU');
//     const [wardCategory, setWardCategory] = useState<'Medical' | 'Specialty' | 'Recovery' | 'Security'>('Medical');

//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
//     const [selectedBed, setSelectedBed] = useState<any | null>(null);
//     const [resToDelete, setResToDelete] = useState<number | null>(null);

//     const [patientData, setPatientData] = useState({
//         name: '', age: '', gender: 'Male', condition: 'Stable',
//         surgeonName: '', duration: 60,
//         surgeryType: 'Minor', admissionUid: ''
//     });

//     const [bookingData, setBookingData] = useState({
//         patient_name: '', patient_age: '', resource_id: '',
//         surgeon_name: '', start_time: '', duration_minutes: 60, notes: ''
//     });

//     const [dispatchForm, setDispatchForm] = useState({
//         severity: 'HIGH', location: '', eta: 10, session_id: ''
//     });
//     const [rescueUrl, setRescueUrl] = useState<string | null>(null); 
//     const [dischargeBedId, setDischargeBedId] = useState<string | null>(null);

//     const fetchERPData = useCallback(async () => {
//         try {
//             const [bedsRes, ambRes] = await Promise.all([fetch(endpoints.beds), fetch(endpoints.ambulances)]);
//             const bedsData = await bedsRes.json();
//             const ambData = await ambRes.json();
//             setBeds(Array.isArray(bedsData) ? bedsData : []);
//             setAmbulances(Array.isArray(ambData) ? ambData : []);
//             setLoading(false);
//         } catch { toast("Sync Error", "error"); setLoading(false); }
//     }, [toast]);

//     const fetchReservations = useCallback(async () => {
//         if (!token) return;
//         try {
//             const res = await fetch(endpoints.reservationsAll, { headers: { 'Authorization': `Bearer ${token}` } });
//             const data = await res.json();
//             setReservations(Array.isArray(data) ? data : []);
//         } catch { console.error("Timeline Sync Failed"); }
//     }, [token]);

//     useEffect(() => { 
//         fetchERPData(); 
//         fetchReservations();
//     }, [fetchERPData, fetchReservations]);

//     useEffect(() => {
//         const ws = new WebSocket("ws://localhost:8000/ws");
//         ws.onmessage = (event) => {
//             try {
//                 const data = JSON.parse(event.data);
//                 if (["SURGERY_UPDATE", "SURGERY_EXTENDED", "ROOM_RELEASED", "BED_UPDATE", "REFRESH_RESOURCES", "NEW_ADMISSION", "AMBULANCE_UPDATE", "RESOURCE_CONFLICT"].includes(data.type)) {
//                     fetchERPData();
//                     fetchReservations();
//                 }
//             } catch { }
//         };
//         return () => ws.close();
//     }, [fetchERPData, fetchReservations]);

//     const handleStartCleaning = async (id: string) => {
//         await fetch(endpoints.startCleaning(id), {
//             method: 'POST',
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         fetchERPData();
//     };

//     const resetAmbulance = async (id: string) => {
//         await fetch(endpoints.ambulanceReset(id), {
//             method: 'POST',
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         fetchERPData();
//     };

//     const generateRescueLink = async () => {
//         try {
//             const res = await fetch(endpoints.createRescueSession, {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             const data = await res.json();
//             setRescueUrl(data.rescue_url);
//             setDispatchForm(prev => ({ ...prev, session_id: data.session_id }));
//             toast("Rescue Link Generated", "success");
//         } catch { toast("Link Generation Failed", "error"); }
//     };

//     const handleDispatch = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             const res = await fetch(endpoints.ambulanceDispatch, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//                 body: JSON.stringify(dispatchForm) 
//             });
//             const data = await res.json();
//             if (data.status === 'DISPATCHED') {
//                 toast("Unit Authorized", "success");
//                 setRescueUrl(null);
//                 setDispatchForm({ severity: 'HIGH', location: '', eta: 10, session_id: '' });
//             } else { toast(data.message || "Dispatch Failed", "error"); }
//             fetchERPData();
//         } catch { toast("Network Error", "error"); }
//     };

//     const handleBookReservation = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             const res = await fetch(endpoints.bookResource, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//                 body: JSON.stringify(bookingData)
//             });
//             const data = await res.json();
//             if (res.status === 409) {
//                 const suggestion = data.detail?.suggested;
//                 toast(`BUSY: Suggesting ${suggestion || "Alternative"}`, "error", 7000);
//                 if (suggestion) setBookingData(prev => ({ ...prev, resource_id: suggestion }));
//                 return;
//             }
//             if (res.ok) {
//                 toast("OT Pre-booking Confirmed", "success");
//                 setIsReservationModalOpen(false);
//                 fetchReservations();
//             }
//         } catch { toast("Booking Engine Failure", "error"); }
//     };

//     const handleCancelReservation = async () => {
//         if (!resToDelete) return;
//         try {
//             const res = await fetch(endpoints.cancelReservation(resToDelete), {
//                 method: 'DELETE',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             if (res.ok) {
//                 toast("Reservation Cancelled", "success");
//                 setResToDelete(null);
//                 fetchReservations();
//             }
//         } catch { toast("Deletion Failed", "error"); }
//     };

//     const confirmDischarge = async () => {
//         if (!dischargeBedId) return;
//         await fetch(endpoints.discharge(dischargeBedId), {
//             method: 'POST',
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         toast("Patient Discharged", "success");
//         setDischargeBedId(null);
//         fetchERPData();
//     };

//     const openAdmitModal = (bed: any) => {
//         setSelectedBed(bed);
//         let defCond = activeUnit === 'ICU' ? 'Critical' : activeUnit === 'Surgery' ? 'Pre-Surgery' : 'Stable';
//         setPatientData({
//             name: '', age: '', gender: 'Male', condition: defCond,
//             surgeonName: '', duration: 60,
//             surgeryType: 'Minor', admissionUid: ''
//         });
//         setIsModalOpen(true);
//     };

//     const submitAdmission = async (e: React.FormEvent) => {
//         e.preventDefault();
//         const staffId = localStorage.getItem('staff_id');
//         if (!staffId || !selectedBed) return;
//         try {
//             const payload: any = {
//                 bed_id: String(selectedBed.id),
//                 patient_name: patientData.name,
//                 patient_age: Number(patientData.age),
//                 condition: patientData.condition,
//                 staff_id: staffId,
//                 gender: patientData.gender
//             };
//             let res;
//             if (selectedBed.type === 'Surgery' || selectedBed.type === 'OT') {
//                 res = await fetch(endpoints.startSurgery, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//                     body: JSON.stringify({ ...payload, surgeon_name: patientData.surgeonName, duration_minutes: Number(patientData.duration), surgery_type: patientData.surgeryType, admission_uid: patientData.admissionUid || null })
//                 });
//             } else {
//                 res = await fetch(endpoints.admit, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//                     body: JSON.stringify(payload)
//                 });
//             }
//             if (res.ok) { setIsModalOpen(false); toast("Admission Confirmed", "success"); fetchERPData(); }
//             else { toast("Admission Rejected", "error"); }
//         } catch { toast("System Error", "error"); }
//     };

//     const getDisplayBeds = () => {
//         const unitBeds = beds.filter(b => b.type === activeUnit);
//         if (activeUnit === 'Wards') {
//             return unitBeds.filter(b => {
//                 const num = parseInt(b.id.replace(/^\D+/g, '') || '0');
//                 if (wardCategory === 'Medical') return num >= 1 && num <= 40;
//                 if (wardCategory === 'Specialty') return num >= 41 && num <= 70;
//                 if (wardCategory === 'Recovery') return num >= 71 && num <= 90;
//                 if (wardCategory === 'Security') return num >= 91;
//                 return false;
//             });
//         }
//         return unitBeds;
//     };

//     const getUnitStats = (type: string) => {
//         const unitBeds = beds.filter(b => b.type === type);
//         return { total: unitBeds.length, occupied: unitBeds.filter(b => b.status === "OCCUPIED").length };
//     };

//     if (loading) return (
//         <div className="min-h-screen bg-background flex items-center justify-center font-mono animate-pulse text-primary">
//             <Activity className="animate-spin mr-3" />
//             INITIALIZING ERP LINK...
//         </div>
//     );

//     return (
//         <div className="min-h-screen bg-background text-foreground transition-colors duration-500 selection:bg-primary/30">

//             <div className="max-w-[1900px] mx-auto grid grid-cols-12 min-h-screen">

//                 <div className="col-span-12 p-8 lg:p-12 flex flex-col gap-10 pb-60">

//                     {/* HEADER */}
//                     <div className="flex justify-between items-end border-b border-border pb-8 shrink-0">
//                         <div>
//                             <h1 className="text-5xl font-black text-foreground tracking-tighter flex items-center gap-4 uppercase italic">
//                                 <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
//                                     <Activity className="text-primary-foreground" size={32} />
//                                 </div>
//                                 PHRELIS ERP <span className="text-slate-500 font-light dark:text-slate-700">| ADMIN</span>
//                             </h1>
//                             <p className="text-slate-500 font-mono text-sm mt-3 pl-20 flex items-center gap-3 uppercase tracking-widest">
//                                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
//                                 IST: {formatIST()} • SYSTEM ONLINE
//                             </p>
//                         </div>
//                         <div className="flex gap-4">
//                             <Link href="/admin/audit-logs" className="px-8 py-4 bg-card border border-border rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:border-primary transition-all flex items-center gap-2">
//                                 <ShieldAlert size={16} className="text-primary" /> Sentinel
//                             </Link>
//                             <Link href="/" className="px-8 py-4 bg-card border border-border rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:border-primary transition-all">
//                                 Return HQ
//                             </Link>
//                         </div>
//                     </div>

//                     {/* LAYER 1: LOGISTICS & TIMELINE */}
//                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 shrink-0">
//                         <div className="bg-card rounded-[2rem] border border-rose-500/20 p-8 relative overflow-hidden group">
//                             <div className="relative z-10 flex justify-between items-start mb-8">
//                                 <div>
//                                     <h3 className="text-2xl font-black text-foreground flex items-center gap-3 uppercase italic tracking-tighter">
//                                         <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
//                                             <Siren className={`text-rose-500 ${dispatchForm.session_id ? 'animate-pulse' : ''}`} size={24} />
//                                         </div>
//                                         EMERGENCY DISPATCH
//                                     </h3>
//                                     <p className="text-xs text-rose-500/60 font-bold uppercase tracking-[0.2em] mt-2 pl-16">
//                                         {dispatchForm.session_id ? (
//                                             <span className="text-emerald-500 flex items-center gap-2">
//                                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
//                                                 GPS Rescue Link Active
//                                             </span>
//                                         ) : ( "High Priority Channel" )}
//                                     </p>
//                                 </div>
//                                 <div className={`w-3 h-3 rounded-full animate-ping ${dispatchForm.session_id ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-rose-500 shadow-[0_0_15px_#ef4444]'}`} />
//                             </div>

//                             <form onSubmit={handleDispatch} className="relative z-10 grid grid-cols-12 gap-4">
//                                 <div className="col-span-12 xl:col-span-3">
//                                     <label className="text-[10px] font-bold text-rose-500 uppercase ml-2 mb-1 block">Triage Level</label>
//                                     <select className="w-full h-14 px-4 bg-muted/50 border border-border focus:border-rose-500 rounded-xl outline-none font-bold text-sm text-foreground appearance-none cursor-pointer" value={dispatchForm.severity} onChange={e => setDispatchForm({ ...dispatchForm, severity: e.target.value })}>
//                                         <option value="HIGH">CRITICAL (RED)</option>
//                                         <option value="LOW">STABLE (YELLOW)</option>
//                                     </select>
//                                 </div>
//                                 <div className="col-span-12 xl:col-span-6">
//                                     <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1 block tracking-widest">Incident Location</label>
//                                     <div className="relative flex gap-2">
//                                         <div className="relative flex-1">
//                                             <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 ${dispatchForm.session_id ? 'text-emerald-500' : 'text-slate-500'}`} size={18} />
//                                             <input type="text" placeholder={rescueUrl ? "Waiting for GPS..." : "Enter Location..."} required={!dispatchForm.session_id} className={`w-full h-14 pl-12 pr-4 bg-muted/50 border rounded-xl text-sm font-medium text-foreground placeholder-slate-600 outline-none transition-all ${dispatchForm.session_id ? 'border-emerald-500/50' : 'border-border'}`} value={dispatchForm.location} onChange={e => setDispatchForm({ ...dispatchForm, location: e.target.value })} />
//                                         </div>
//                                         <button type="button" onClick={generateRescueLink} className={`px-5 rounded-xl border transition-all flex items-center justify-center ${dispatchForm.session_id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-muted border-border text-slate-500'}`}><ShieldAlert size={20}/></button>
//                                     </div>
//                                 </div>
//                                 <button type="submit" className={`col-span-12 xl:col-span-3 h-14 mt-auto rounded-xl font-black text-white text-xs uppercase tracking-[0.15em] shadow-lg ${dispatchForm.session_id ? 'bg-emerald-600' : 'bg-rose-600'}`}>Authorize</button>
//                             </form>
//                         </div>

//                         {/* FLEET COMMAND PANEL */}
//                         <div className="bg-card rounded-[2rem] border border-border p-8 relative overflow-hidden">
//                             <div className="absolute inset-0 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.015] pointer-events-none" />
//                             <div className="relative z-10 flex justify-between items-start mb-6">
//                                 <div>
//                                     <h3 className="text-2xl font-black text-foreground flex items-center gap-3 uppercase italic tracking-tighter">
//                                         <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
//                                             <Activity className="text-primary" size={24} />
//                                         </div>
//                                         FLEET COMMAND
//                                     </h3>
//                                     <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] mt-2 pl-16"><span className="text-primary font-black text-sm">{ambulances.filter(a => a.status === 'IDLE').length}</span> Units Active</p>
//                                 </div>
//                             </div>
                            
//                             <div className="relative z-10 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
//                                 {ambulances.map(amb => (
//                                     <div key={amb.id} className={`shrink-0 w-48 p-5 rounded-2xl border flex flex-col justify-between h-36 transition-all duration-500 ${amb.status === 'IDLE' ? 'bg-muted/50 border-border' : 'bg-rose-500/5 border-rose-500/20 animate-in fade-in'}`}>
//                                         <div className="flex justify-between items-start">
//                                             <div className="flex flex-col">
//                                                 <span className="font-black text-foreground text-lg tracking-tighter">{amb.id}</span>
//                                                 <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border inline-block w-fit mt-1 ${amb.status === 'IDLE' ? 'border-emerald-500/20 text-emerald-500' : 'border-rose-500/20 text-rose-500'}`}>{amb.status}</span>
//                                             </div>
//                                             <div className={`w-2.5 h-2.5 rounded-full ${amb.status === 'IDLE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_#ef4444]'}`} />
//                                         </div>
//                                         <div className="text-xs font-mono text-foreground truncate italic">{amb.location || "Standby"}</div>
//                                         {amb.status !== 'IDLE' && (
//                                             <button onClick={() => resetAmbulance(amb.id)} className="text-[9px] text-rose-500 font-black uppercase hover:underline text-left mt-2 flex items-center gap-1"><ArrowLeft size={10} /> Recall</button>
//                                         )}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* UPCOMING PROCEDURES (TIMELINE) */}
//                     <div className="bg-card rounded-[2.5rem] border border-indigo-500/20 p-8 relative overflow-hidden group shrink-0">
//                         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
//                         <div className="relative z-10 flex justify-between items-center mb-6">
//                             <h3 className="text-2xl font-black text-foreground flex items-center gap-3 uppercase italic tracking-tighter"><Timer className="text-indigo-500" /> UPCOMING PROCEDURES</h3>
//                             <button onClick={() => setIsReservationModalOpen(true)} className="px-6 py-3 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-indigo-400 transition-all flex items-center gap-2"><Plus size={14} /> New Pre-Booking</button>
//                         </div>
//                         <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
//                             {reservations.length === 0 ? <p className="text-xs text-muted-foreground italic col-span-full py-4 px-2">No procedures scheduled.</p> : (
//                                 reservations.map(res => (
//                                     <div key={res.id} className="p-4 bg-muted/30 rounded-2xl border border-border flex justify-between items-center group/item hover:border-indigo-500/30 transition-all">
//                                         <div>
//                                             <p className="text-sm font-black text-foreground uppercase">{res.patient_name}</p>
//                                             <div className="flex items-center gap-2 mt-1">
//                                                 <p className="text-[10px] text-indigo-400 font-bold uppercase">{res.resource_id} • Dr. {res.surgeon_name}</p>
//                                                 <span className="text-[8px] px-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono">{res.duration_minutes || 60}m</span>
//                                             </div>
//                                         </div>
//                                         <div className="flex items-center gap-4">
//                                             <div className="text-right">
//                                                 <p className="text-xs font-mono text-foreground font-bold">{new Date(res.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
//                                                 <p className="text-[9px] text-slate-500 font-black uppercase">Start</p>
//                                             </div>
//                                             <button onClick={() => setResToDelete(res.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all hover:bg-rose-500 hover:text-white"><Trash2 size={14} /></button>
//                                         </div>
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     </div>

//                     {/* LAYER 2: UNIT SWITCHER */}
//                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
//                         <UnitHeroCard title="ICU" icon={Activity} {...getUnitStats('ICU')} isActive={activeUnit === 'ICU'} onClick={() => setActiveUnit('ICU')} colorClass="red" />
//                         <UnitHeroCard title="Emergency" icon={BedDouble} {...getUnitStats('ER')} isActive={activeUnit === 'ER'} onClick={() => setActiveUnit('ER')} colorClass="blue" />
//                         <UnitHeroCard title="Surgery" icon={BrainCircuit} {...getUnitStats('Surgery')} isActive={activeUnit === 'Surgery'} onClick={() => setActiveUnit('Surgery')} colorClass="indigo" />
//                         <UnitHeroCard title="Wards" icon={Package} {...getUnitStats('Wards')} isActive={activeUnit === 'Wards'} onClick={() => setActiveUnit('Wards')} colorClass="emerald" />
//                     </div>

//                     {/* LAYER 3: DYNAMIC ASSET GRID */}
//                     <div className="bg-card rounded-[2.5rem] border border-border p-8 relative overflow-hidden">
//                         <div className="absolute inset-0 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.015] pointer-events-none" />
//                         <div className="relative z-10 flex justify-between items-center mb-8">
//                             <div>
//                                 <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">{activeUnit} Grid</h2>
//                             </div>
//                             {activeUnit === 'Wards' && (
//                                 <div className="hidden xl:flex bg-muted p-1.5 rounded-2xl border border-border shadow-inner">
//                                     {[{ id: 'Medical', icon: HeartPulse }, { id: 'Specialty', icon: Baby }, { id: 'Recovery', icon: Stethoscope }, { id: 'Security', icon: ShieldAlert }].map(cat => (
//                                         <button key={cat.id} onClick={() => setWardCategory(cat.id as any)} className={`px-6 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${wardCategory === cat.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-foreground hover:bg-card'}`}><cat.icon size={14} /> {cat.id}</button>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                         <div className="relative z-10">
//                             <AnimatePresence mode="wait">
//                                 <motion.div key={activeUnit + wardCategory} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
//                                     {activeUnit === 'Surgery' ? (
//                                         <div className="col-span-full"><SurgerySection beds={beds} onRefresh={fetchERPData} onAdmit={openAdmitModal} /></div>
//                                     ) : getDisplayBeds().map(bed => (
//                                         <BedCard key={bed.id} bed={bed} onDischarge={() => setDischargeBedId(bed.id)} onAdmit={() => openAdmitModal(bed)} onStartCleaning={handleStartCleaning} onRefresh={fetchERPData} accentColor={activeUnit === 'ICU' ? 'red' : activeUnit === 'Wards' ? 'green' : 'blue'} genderLock={activeUnit === 'Wards' && wardCategory === 'Medical' ? getBedGender(bed.id) : null} patientGender={patientData.gender} />
//                                     ))}
//                                 </motion.div>
//                             </AnimatePresence>
//                         </div>
//                     </div>
//                 </div>
//                 <ResourceInventory />
//             </div>

//             {/* MODALS */}
//             <AnimatePresence>
//                 {/* DELETE RESERVATION ALERT */}
//                 {resToDelete && (
//                     <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
//                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setResToDelete(null)} />
//                          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-card rounded-[3rem] p-8 max-w-sm w-full border border-rose-500/20 relative z-10 text-center shadow-2xl">
//                             <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={32} className="text-rose-500" /></div>
//                             <h2 className="text-2xl font-black text-foreground mb-2 uppercase italic tracking-tight">Abort Procedure?</h2>
//                             <p className="text-slate-500 text-xs mb-8 font-bold uppercase tracking-widest">This will permanently remove the reservation from the system.</p>
//                             <div className="flex gap-4">
//                                 <button onClick={() => setResToDelete(null)} className="flex-1 py-4 bg-muted text-slate-500 font-bold uppercase rounded-2xl hover:bg-card transition-all">Go Back</button>
//                                 <button onClick={handleCancelReservation} className="flex-1 py-4 bg-rose-600 text-white font-bold uppercase rounded-2xl shadow-lg shadow-rose-600/20 transition-all">Confirm Delete</button>
//                             </div>
//                         </motion.div>
//                     </div>
//                 )}

//                 {/* PRE-BOOKING MODAL (OT) */}
//                 {isReservationModalOpen && (
//                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsReservationModalOpen(false)} />
//                         <motion.div className="bg-card rounded-[2.5rem] p-10 max-w-xl w-full border border-border relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
//                             <h2 className="text-3xl font-black text-foreground uppercase italic mb-8 border-b pb-4">OT PRE-BOOKING</h2>
//                             <form onSubmit={handleBookReservation} className="space-y-6">
//                                 <div className="space-y-2">
//                                     <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Patient Identity</label>
//                                     <input required className="w-full p-5 bg-muted/40 border border-border rounded-2xl text-foreground outline-none font-bold" placeholder="Patient Name..." value={bookingData.patient_name} onChange={e => setBookingData({...bookingData, patient_name: e.target.value})} />
//                                 </div>
//                                 <div className="grid grid-cols-2 gap-4">
//                                     <input type="number" required className="p-5 bg-muted/40 border border-border rounded-2xl outline-none" placeholder="Age" value={bookingData.patient_age} onChange={e => setBookingData({...bookingData, patient_age: e.target.value})} />
//                                     <select required className="p-5 bg-muted/40 border border-border rounded-2xl text-foreground" value={bookingData.resource_id} onChange={e => setBookingData({...bookingData, resource_id: e.target.value})}>
//                                         <option value="">Select Theater</option>
//                                         {beds.filter(b => b.type === 'OT').map(ot => <option key={ot.id} value={ot.id}>{ot.id}</option>)}
//                                     </select>
//                                 </div>
//                                 <div className="space-y-2">
//                                     <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Duration (Minutes)</label>
//                                     <div className="flex gap-2">
//                                         {[30, 60, 120, 180].map((mins) => (
//                                             <button key={mins} type="button" onClick={() => setBookingData({...bookingData, duration_minutes: mins})} className={`flex-1 py-3 rounded-xl border text-[10px] font-black transition-all ${bookingData.duration_minutes === mins ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-muted/50 border-border text-slate-500'}`}>{mins}m</button>
//                                         ))}
//                                         <input type="number" className="w-20 p-3 bg-muted border border-border rounded-xl text-center text-xs font-bold" placeholder="Min" value={bookingData.duration_minutes} onChange={(e) => setBookingData({...bookingData, duration_minutes: parseInt(e.target.value) || 0})} />
//                                     </div>
//                                 </div>
//                                 <div className="space-y-2">
//                                     <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Scheduled Start</label>
//                                     <input type="datetime-local" required className="w-full p-5 bg-muted/40 border border-border rounded-2xl text-foreground font-mono" value={bookingData.start_time} onChange={e => setBookingData({...bookingData, start_time: e.target.value})} />
//                                 </div>
//                                 <div className="relative">
//                                     <Stethoscope className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
//                                     <input required className="w-full p-5 pl-14 bg-muted/40 border border-border rounded-2xl text-foreground font-bold" placeholder="Lead Surgeon Name..." value={bookingData.surgeon_name} onChange={e => setBookingData({...bookingData, surgeon_name: e.target.value})} />
//                                 </div>
//                                 <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-[0.98] transition-all">Submit Reservation</button>
//                             </form>
//                         </motion.div>
//                     </div>
//                 )}

//                 {/* ADMIT MODAL (ORIGINAL VERSION) */}
//                 {isModalOpen && selectedBed && (
//                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
//                         <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-card rounded-[2.5rem] p-10 max-w-xl w-full border border-border relative z-10 shadow-2xl">
//                             <div className="flex justify-between items-center mb-8 border-b border-border pb-6">
//                                 <h2 className="text-3xl font-black text-foreground italic uppercase">Admit to {selectedBed.id}</h2>
//                                 <button onClick={() => setIsModalOpen(false)} className="p-2 bg-muted rounded-full text-slate-500 hover:text-white hover:bg-red-500 transition-all"><X size={20}/></button>
//                             </div>
//                             <form onSubmit={submitAdmission} className="space-y-6">
//                                 <input className="w-full p-5 bg-muted/40 border border-border focus:border-primary rounded-2xl text-foreground outline-none font-mono text-xs transition-all" placeholder="UID Override (Optional)" value={patientData.admissionUid} onChange={e => setPatientData({ ...patientData, admissionUid: e.target.value })} />
//                                 <input required className="w-full p-5 bg-muted/40 border border-border rounded-2xl font-bold" placeholder="Enter Full Name..." value={patientData.name} onChange={e => setPatientData({ ...patientData, name: e.target.value })} />
//                                 <div className="grid grid-cols-2 gap-4">
//                                     <input type="number" required className="p-5 bg-muted/40 border border-border rounded-2xl" placeholder="Age" value={patientData.age} onChange={e => setPatientData({ ...patientData, age: e.target.value })} />
//                                     <select className="p-5 bg-muted/40 border border-border rounded-2xl" value={patientData.gender} onChange={e => setPatientData({ ...patientData, gender: e.target.value })}><option value="Male">Male</option><option value="Female">Female</option></select>
//                                 </div>
//                                 {(selectedBed.type === 'Surgery' || selectedBed.type === 'OT') && (
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl">
//                                         <select className="p-5 bg-card border border-border rounded-2xl" value={patientData.surgeryType} onChange={e => setPatientData({ ...patientData, surgeryType: e.target.value })}><option value="Minor">Minor</option><option value="Major">Major</option><option value="Intermediate">Intermediate</option><option value="Specialized">Specialized</option></select>
//                                         <input required className="p-5 bg-card border border-border rounded-2xl" placeholder="Surgeon" value={patientData.surgeonName} onChange={e => setPatientData({ ...patientData, surgeonName: e.target.value })} />
//                                     </div>
//                                 )}
//                                 <select className="w-full p-5 bg-muted/40 border border-border rounded-2xl font-bold appearance-none" value={patientData.condition} onChange={e => setPatientData({ ...patientData, condition: e.target.value })}><option>Stable</option><option>Critical</option><option>Observation</option><option>Pre-Surgery</option></select>
//                                 <button type="submit" className="w-full py-5 bg-primary text-primary-foreground font-black uppercase rounded-2xl active:scale-[0.98] transition-all shadow-xl">Authorize Admission</button>
//                             </form>
//                         </motion.div>
//                     </div>
//                 )}

//                 {/* DISCHARGE MODAL */}
//                 {dischargeBedId && (
//                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setDischargeBedId(null)} />
//                         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-card rounded-[3rem] p-8 max-w-sm w-full border border-rose-500/20 relative z-10 text-center shadow-2xl">
//                             <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={32} className="text-rose-500" /></div>
//                             <h2 className="text-2xl font-black mb-8 italic uppercase">Execute Finalize?</h2>
//                             <div className="flex gap-4">
//                                 <button onClick={() => setDischargeBedId(null)} className="flex-1 py-4 bg-muted text-slate-500 font-bold uppercase rounded-2xl hover:bg-card transition-all">Abort</button>
//                                 <button onClick={confirmDischarge} className="flex-1 py-4 bg-rose-600 text-white font-bold uppercase rounded-2xl shadow-lg transition-all">Confirm</button>
//                             </div>
//                         </motion.div>
//                     </div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// };

// export default AdminPanel;


















"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    BedDouble, Activity, BrainCircuit, Package,
    ArrowLeft, Plus, X, MapPin,
    Siren, LogOut, Baby, Stethoscope,
    ShieldAlert, HeartPulse, Timer, UserCheck, Trash2, Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ResourceInventory from '@/components/ResourceInventory';
import SurgerySection from '@/components/SurgerySection';
import { endpoints } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

// --- HELPERS ---
const formatIST = (isoString?: string) => {
    const date = isoString ? new Date(isoString) : new Date();
    return date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
};

const getBedGender = (bedId: string): 'Male' | 'Female' | 'Any' => {
    const num = parseInt(bedId.replace(/^\D+/g, '') || '0');
    if (num >= 1 && num <= 20) return 'Male';
    if (num >= 21 && num <= 40) return 'Female';
    return 'Any';
};

// --- COMPONENTS ---

const UnitHeroCard = ({ title, icon: Icon, total, occupied, isActive, onClick, colorClass }: any) => {
    const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;
    const isCritical = percentage >= 80;

    const getColors = () => {
        switch (colorClass) {
            case 'red': return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', gradient: 'from-red-500/20' };
            case 'blue': return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', gradient: 'from-blue-500/20' };
            case 'indigo': return { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500', gradient: 'from-indigo-500/20' };
            case 'emerald': return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', gradient: 'from-emerald-500/20' };
            default: return { bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-500', gradient: 'from-slate-500/20' };
        }
    };
    const c = getColors();

    return (
        <button
            onClick={onClick}
            className={`relative p-6 rounded-[2.5rem] border transition-all duration-500 w-full text-left overflow-hidden group hover:-translate-y-1
        ${isActive ? `bg-card ${c.border}` : 'bg-card/40 border-border hover:border-primary/30'}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isActive ? 'opacity-20' : ''}`} />
            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${isActive ? `${c.bg} text-white shadow-lg` : 'bg-muted text-muted-foreground'}`}>
                    <Icon size={24} />
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-foreground">{percentage}%</p>
                    <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isActive ? c.text : 'text-slate-600'}`}>Occupancy</p>
                </div>
            </div>
            <div className="relative z-10 space-y-3">
                <h3 className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-foreground' : 'text-slate-400'}`}>{title}</h3>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full rounded-full ${isCritical ? 'bg-red-500' : `${c.bg}`}`}
                    />
                </div>
                <div className="flex justify-between items-center pt-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Active Units</p>
                    <p className="text-xs font-mono text-foreground"><span className={`${c.text} font-bold`}>{occupied}</span> / {total}</p>
                </div>
            </div>
        </button>
    );
};

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
            if (remaining <= 0) { setTimeLeft(0); setIsFinished(true); return true; }
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
            <button onClick={onRequestUnlock} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl animate-bounce transition-colors uppercase tracking-widest text-[10px]">
                Mark Ready
            </button>
        );
    }
    return (
        <div className="text-center py-3 bg-sky-500/10 rounded-xl border border-sky-400/20">
            <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest mb-1">Sterilization</p>
            <p className="text-2xl font-black text-foreground font-mono tracking-tighter">{timeLeft !== null ? formatTime(timeLeft) : "--:--"}</p>
        </div>
    );
};



const AssignBloodModal = ({ isOpen, onClose, bed, onAssigned }: any) => {
    const { token } = useAuth();
    const { toast } = useToast();
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRepo = async () => {
            if (isOpen && bed?.patient_blood_group) {
                setLoading(true);
                try {
                    const [invRes, compRes] = await Promise.all([
                        fetch(`http://localhost:8000/api/blood/inventory`),
                        fetch(`http://localhost:8000/api/blood/compatible-donors/${encodeURIComponent(bed.patient_blood_group)}`)
                    ]);
                    
                    const data = await invRes.json();
                    const compatibleGroups = await compRes.json();

                    const available = data.filter((bag: any) => 
                        bag.status === 'Available' && 
                        compatibleGroups.includes(bag.blood_group)
                    );
                    setInventory(available);
                } catch (e) {
                    console.error("Link Failure:", e);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadRepo();
    }, [isOpen, bed]);

    const handleAssign = async (bagId: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/blood/assign-to-bed`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    bag_id: bagId, 
                    admission_uid: bed.admission_uid 
                })
            });
            if (res.ok) {
                toast("Blood Unit Allocated & Billed", "success");
                onAssigned();
                onClose();
            } else {
                const err = await res.json();
                toast(err.detail || "Allocation Rejected", "error");
            }
        } catch (e) { 
            toast("System Interface Fault", "error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-card rounded-[3rem] p-10 max-w-2xl w-full border border-red-500/20 relative z-10 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-foreground italic uppercase flex items-center gap-3">
                            <Droplets className="text-red-500" /> Blood Nexus
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 px-1">
                            Requesting for Bed {bed.id} • Patient {bed.patient_name} ({bed.patient_blood_group})
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-muted rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>
                </div>

                {loading ? (
                    <div className="py-20 text-center animate-pulse font-mono text-sm text-red-400">SCANNING BLOOD REPOSITORY...</div>
                ) : !bed?.patient_blood_group ? (
                    <div className="p-12 text-center bg-red-500/5 border border-dashed border-red-500/20 rounded-3xl">
                         <Activity className="text-red-500/30 mx-auto mb-4" size={40} />
                         <p className="text-sm font-black text-red-400 uppercase tracking-tighter">Biological Trace Missing</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">Patient blood group not recorded at admission. Update patient record to enable Blood-Nexus linkage.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {inventory.length === 0 ? (
                            <div className="p-12 text-center bg-muted/20 border border-dashed border-border rounded-3xl">
                                <p className="text-xs font-bold text-slate-500 uppercase">No compatible {bed.patient_blood_group} units found in live fridge.</p>
                            </div>
                        ) : (
                            inventory.map(bag => (
                                <div key={bag.bag_id} className="p-5 bg-muted/40 border border-border rounded-2xl flex justify-between items-center group hover:border-red-500/30 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                            <Droplets size={24} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-foreground uppercase tracking-tight">{bag.bag_id}</p>
                                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-1">{bag.component_type} • {bag.blood_group}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-foreground">₹{bag.price?.toLocaleString() || "1,500"}</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase">Unit Price</p>
                                        </div>
                                        <button onClick={() => handleAssign(bag.bag_id)} className="px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 active:scale-95">Assign</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const BedCard = ({ bed, onDischarge, onAdmit, onStartCleaning, onRefresh, accentColor, genderLock, patientGender }: any) => {
    const { token } = useAuth();
    const isRed = accentColor === 'red';
    const isGreen = accentColor === 'green';
    const isLocked = !bed.is_occupied && genderLock && genderLock !== 'Any' && patientGender && patientGender !== genderLock;

    const textClass = isRed ? 'text-red-400' : isGreen ? 'text-emerald-400' : 'text-blue-400';

    const handleManualUnlock = async () => {
        try {
            await fetch(endpoints.cleaningComplete(bed.id), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            localStorage.removeItem(`cleaning_end_time_${bed.id}`);
            onRefresh();
        } catch (e) { console.error(e); }
    };

    if (isLocked) {
        return (
            <div className="p-6 rounded-3xl border border-dashed border-border bg-muted/30 opacity-40 grayscale pointer-events-none relative overflow-hidden flex flex-col items-center justify-center gap-2">
                <ShieldAlert size={24} className="text-slate-600" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Restricted</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group 
      ${bed.status === 'OCCUPIED'
                    ? isRed ? 'bg-red-500/5 border-red-500/30' : isGreen ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-blue-500/5 border-blue-500/30'
                    : bed.status === 'DIRTY' ? 'bg-orange-500/5 border-orange-500/20' : bed.status === 'CLEANING' ? 'bg-sky-500/5 border-sky-500/20' : 'bg-card border-border hover:border-primary/30'}`}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <p className="text-xs font-black text-slate-400 px-3 py-1.5 rounded-lg bg-muted border border-border">{bed.id}</p>
                    {genderLock && genderLock !== 'Any' && (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${genderLock === 'Male' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>
                            {genderLock}
                        </span>
                    )}
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-opacity-20 ${bed.status === "AVAILABLE" ? "bg-emerald-500 ring-emerald-500" : bed.status === "OCCUPIED" ? (isRed ? "bg-red-500 ring-red-500" : "bg-blue-500 ring-blue-500") : bed.status === "DIRTY" ? "bg-orange-500 ring-orange-500" : "bg-sky-500 ring-sky-500"}`} />
            </div>
            {bed.status === "OCCUPIED" ? (
                <div className="space-y-6">
                    <div>
                        <p className="text-lg font-black text-foreground truncate leading-tight uppercase italic">{bed.patient_name || "Unidentified"}</p>
                        <p className={`text-[10px] font-bold ${textClass} uppercase tracking-widest mt-1`}>{bed.condition || "General Care"}</p>
                        {bed.ventilator_in_use && <span className="inline-flex mt-3 items-center gap-1.5 text-[9px] font-black text-cyan-300 bg-cyan-950/50 px-3 py-1.5 rounded-md border border-cyan-500/30"><Activity size={10} /> VENTILATOR ONLINE</span>}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onDischarge} className={`flex-1 py-3 ${isRed ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20'} border rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors`}>Discharge</button>
                        <button onClick={() => bed.onRequestBlood(bed)} className="w-14 h-12 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all shrink-0">
                            <Droplets size={18} />
                        </button>
                    </div>
                </div>
            ) : bed.status === "DIRTY" ? (
                <div className="space-y-4">
                    <div className="flex flex-col items-center py-4 text-orange-400/50">
                        <Baby size={32} className="mb-2 animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Unit Secluded</p>
                    </div>
                    <button onClick={() => onStartCleaning(bed.id)} className="w-full py-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 text-[10px] font-black rounded-xl uppercase tracking-widest transition-colors">Start Protocol</button>
                </div>
            ) : bed.status === "CLEANING" ? (
                <CleaningTimer bedId={bed.id} onRequestUnlock={handleManualUnlock} />
            ) : (
                <button onClick={onAdmit} className="w-full py-10 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-all gap-3 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl bg-muted/20 group-hover:bg-card">
                    <div className="p-3 rounded-full bg-muted group-hover:bg-primary/20 transition-colors">
                        <Plus size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Assign Patient</span>
                </button>
            )}
        </motion.div>
    );
};

// --- MAIN PANEL ---

const AdminPanel = () => {
    const { token } = useAuth();
    const { toast } = useToast();
    const [beds, setBeds] = useState<any[]>([]);
    const [ambulances, setAmbulances] = useState<any[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeUnit, setActiveUnit] = useState<'ICU' | 'ER' | 'Surgery' | 'Wards'>('ICU');
    const [wardCategory, setWardCategory] = useState<'Medical' | 'Specialty' | 'Recovery' | 'Security'>('Medical');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [selectedBed, setSelectedBed] = useState<any | null>(null);
    const [resToDelete, setResToDelete] = useState<number | null>(null);

    const [patientData, setPatientData] = useState({
        name: '', age: '', gender: 'Male', condition: 'Stable',
        surgeonName: '', duration: 60,
        surgeryType: 'Minor', admissionUid: '',
        bloodGroup: 'O+'
    });

    const [bookingData, setBookingData] = useState({
        patient_name: '', patient_age: '', resource_id: '',
        surgeon_name: '', start_time: '', duration_minutes: 60, notes: ''
    });

    const [dispatchForm, setDispatchForm] = useState({
        severity: 'HIGH', location: '', eta: 10, session_id: ''
    });
    const [rescueUrl, setRescueUrl] = useState<string | null>(null); 
    const [dischargeBedId, setDischargeBedId] = useState<string | null>(null);
    const [bloodRequestBed, setBloodRequestBed] = useState<any | null>(null);

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

    const fetchReservations = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(endpoints.reservationsAll, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setReservations(Array.isArray(data) ? data : []);
        } catch { console.error("Timeline Sync Failed"); }
    }, [token]);

    useEffect(() => { 
        fetchERPData(); 
        fetchReservations();
    }, [fetchERPData, fetchReservations]);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws");
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (["SURGERY_UPDATE", "SURGERY_EXTENDED", "ROOM_RELEASED", "BED_UPDATE", "REFRESH_RESOURCES", "NEW_ADMISSION", "AMBULANCE_UPDATE", "RESOURCE_CONFLICT"].includes(data.type)) {
                    fetchERPData();
                    fetchReservations();
                }
            } catch { }
        };
        return () => ws.close();
    }, [fetchERPData, fetchReservations]);

    const handleStartCleaning = async (id: string) => {
        await fetch(endpoints.startCleaning(id), {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchERPData();
    };

    const resetAmbulance = async (id: string) => {
        await fetch(endpoints.ambulanceReset(id), {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchERPData();
    };

    const generateRescueLink = async () => {
        try {
            const res = await fetch(endpoints.createRescueSession, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setRescueUrl(data.rescue_url);
            setDispatchForm(prev => ({ ...prev, session_id: data.session_id }));
            toast("Rescue Link Generated", "success");
        } catch { toast("Link Generation Failed", "error"); }
    };

    const handleDispatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(endpoints.ambulanceDispatch, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(dispatchForm) 
            });
            const data = await res.json();
            if (data.status === 'DISPATCHED') {
                toast("Unit Authorized", "success");
                setRescueUrl(null);
                setDispatchForm({ severity: 'HIGH', location: '', eta: 10, session_id: '' });
            } else { toast(data.message || "Dispatch Failed", "error"); }
            fetchERPData();
        } catch { toast("Network Error", "error"); }
    };

    const handleBookReservation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(endpoints.bookResource, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(bookingData)
            });
            const data = await res.json();
            if (res.status === 409) {
                const suggestion = data.detail?.suggested;
                toast(`BUSY: Suggesting ${suggestion || "Alternative"}`, "error", 7000);
                if (suggestion) setBookingData(prev => ({ ...prev, resource_id: suggestion }));
                return;
            }
            if (res.ok) {
                toast("OT Pre-booking Confirmed", "success");
                setIsReservationModalOpen(false);
                fetchReservations();
            }
        } catch { toast("Booking Engine Failure", "error"); }
    };

    const handleCancelReservation = async () => {
        if (!resToDelete) return;
        try {
            const res = await fetch(endpoints.cancelReservation(resToDelete), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast("Reservation Cancelled", "success");
                setResToDelete(null);
                fetchReservations();
            }
        } catch { toast("Deletion Failed", "error"); }
    };

    const confirmDischarge = async () => {
        if (!dischargeBedId) return;
        await fetch(endpoints.discharge(dischargeBedId), {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        toast("Patient Discharged", "success");
        setDischargeBedId(null);
        fetchERPData();
    };

    const openAdmitModal = (bed: any) => {
        setSelectedBed(bed);
        let defCond = activeUnit === 'ICU' ? 'Critical' : activeUnit === 'Surgery' ? 'Pre-Surgery' : 'Stable';
        setPatientData({
            name: '', age: '', gender: 'Male', condition: defCond,
            surgeonName: '', duration: 60,
            surgeryType: 'Minor', admissionUid: '', bloodGroup: 'O+'
        });
        setIsModalOpen(true);
    };

    const submitAdmission = async (e: React.FormEvent) => {
        e.preventDefault();
        const staffId = localStorage.getItem('staff_id');
        if (!staffId || !selectedBed) return;
        try {
            const payload: any = {
                bed_id: String(selectedBed.id),
                patient_name: patientData.name,
                patient_age: Number(patientData.age),
                condition: patientData.condition,
                staff_id: staffId,
                gender: patientData.gender,
                patient_blood_group: patientData.bloodGroup
            };
            let res;
            if (selectedBed.type === 'Surgery' || selectedBed.type === 'OT') {
                res = await fetch(endpoints.startSurgery, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ ...payload, surgeon_name: patientData.surgeonName, duration_minutes: Number(patientData.duration), surgery_type: patientData.surgeryType, admission_uid: patientData.admissionUid || null })
                });
            } else {
                res = await fetch(endpoints.admit, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            }
            if (res.ok) { setIsModalOpen(false); toast("Admission Confirmed", "success"); fetchERPData(); }
            else { toast("Admission Rejected", "error"); }
        } catch { toast("System Error", "error"); }
    };

    const getDisplayBeds = () => {
        const unitBeds = beds.filter(b => b.type === activeUnit);
        if (activeUnit === 'Wards') {
            return unitBeds.filter(b => {
                const num = parseInt(b.id.replace(/^\D+/g, '') || '0');
                if (wardCategory === 'Medical') return num >= 1 && num <= 40;
                if (wardCategory === 'Specialty') return num >= 41 && num <= 70;
                if (wardCategory === 'Recovery') return num >= 71 && num <= 90;
                if (wardCategory === 'Security') return num >= 91;
                return false;
            });
        }
        return unitBeds;
    };

    const getUnitStats = (type: string) => {
        const unitBeds = beds.filter(b => b.type === type);
        return { total: unitBeds.length, occupied: unitBeds.filter(b => b.status === "OCCUPIED").length };
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center font-mono animate-pulse text-primary">
            <Activity className="animate-spin mr-3" />
            INITIALIZING ERP LINK...
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 selection:bg-primary/30">

            <div className="max-w-[1900px] mx-auto grid grid-cols-12 min-h-screen">

                <div className="col-span-12 p-8 lg:p-12 flex flex-col gap-10 pb-60">

                    {/* HEADER */}
                    <div className="flex justify-between items-end border-b border-border pb-8 shrink-0">
                        <div>
                            <h1 className="text-5xl font-black text-foreground tracking-tighter flex items-center gap-4 uppercase italic">
                                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                                    <Activity className="text-primary-foreground" size={32} />
                                </div>
                                PHRELIS ERP <span className="text-slate-500 font-light dark:text-slate-700">| ADMIN</span>
                            </h1>
                            <p className="text-slate-500 font-mono text-sm mt-3 pl-20 flex items-center gap-3 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                IST: {formatIST()} • SYSTEM ONLINE
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/admin/audit-logs" className="px-8 py-4 bg-card border border-border rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:border-primary transition-all flex items-center gap-2">
                                <ShieldAlert size={16} className="text-primary" /> Sentinel
                            </Link>
                            <Link href="/" className="px-8 py-4 bg-card border border-border rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:border-primary transition-all">
                                Return HQ
                            </Link>
                        </div>
                    </div>

                    {/* LAYER 1: LOGISTICS & TIMELINE */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 shrink-0">
                        <div className="bg-card rounded-[2rem] border border-rose-500/20 p-8 relative overflow-hidden group">
                            <div className="relative z-10 flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-foreground flex items-center gap-3 uppercase italic tracking-tighter">
                                        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                                            <Siren className={`text-rose-500 ${dispatchForm.session_id ? 'animate-pulse' : ''}`} size={24} />
                                        </div>
                                        EMERGENCY DISPATCH
                                    </h3>
                                    <p className="text-xs text-rose-500/60 font-bold uppercase tracking-[0.2em] mt-2 pl-16">
                                        {dispatchForm.session_id ? (
                                            <span className="text-emerald-500 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                                GPS Rescue Link Active
                                            </span>
                                        ) : ( "High Priority Channel" )}
                                    </p>
                                </div>
                                <div className={`w-3 h-3 rounded-full animate-ping ${dispatchForm.session_id ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-rose-500 shadow-[0_0_15px_#ef4444]'}`} />
                            </div>

                            <form onSubmit={handleDispatch} className="relative z-10 grid grid-cols-12 gap-4">
                                <div className="col-span-12 xl:col-span-3">
                                    <label className="text-[10px] font-bold text-rose-500 uppercase ml-2 mb-1 block">Triage Level</label>
                                    <select className="w-full h-14 px-4 bg-muted/50 border border-border focus:border-rose-500 rounded-xl outline-none font-bold text-sm text-foreground appearance-none cursor-pointer" value={dispatchForm.severity} onChange={e => setDispatchForm({ ...dispatchForm, severity: e.target.value })}>
                                        <option value="HIGH">CRITICAL (RED)</option>
                                        <option value="LOW">STABLE (YELLOW)</option>
                                    </select>
                                </div>
                                <div className="col-span-12 xl:col-span-6">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1 block tracking-widest">Incident Location</label>
                                    <div className="relative flex gap-2">
                                        <div className="relative flex-1">
                                            <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 ${dispatchForm.session_id ? 'text-emerald-500' : 'text-slate-500'}`} size={18} />
                                            <input type="text" placeholder={rescueUrl ? "Waiting for GPS..." : "Enter Location..."} required={!dispatchForm.session_id} className={`w-full h-14 pl-12 pr-4 bg-muted/50 border rounded-xl text-sm font-medium text-foreground placeholder-slate-600 outline-none transition-all ${dispatchForm.session_id ? 'border-emerald-500/50' : 'border-border'}`} value={dispatchForm.location} onChange={e => setDispatchForm({ ...dispatchForm, location: e.target.value })} />
                                        </div>
                                        <button type="button" onClick={generateRescueLink} className={`px-5 rounded-xl border transition-all flex items-center justify-center ${dispatchForm.session_id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-muted border-border text-slate-500'}`}><ShieldAlert size={20}/></button>
                                    </div>
                                </div>
                                <button type="submit" className={`col-span-12 xl:col-span-3 h-14 mt-auto rounded-xl font-black text-white text-xs uppercase tracking-[0.15em] shadow-lg ${dispatchForm.session_id ? 'bg-emerald-600' : 'bg-rose-600'}`}>Authorize</button>
                            </form>

                            {rescueUrl && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between animate-in fade-in"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/30">
                                            <MapPin size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Active Rescue Link</p>
                                            <p className="text-xs font-mono text-foreground/80 truncate max-w-[200px] lg:max-w-md">{rescueUrl}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { 
                                            navigator.clipboard.writeText(rescueUrl); 
                                            toast("Copied to Clipboard", "success"); 
                                        }} 
                                        className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                                    >
                                        Copy Link
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {/* FLEET COMMAND PANEL */}
                        <div className="bg-card rounded-[2rem] border border-border p-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.015] pointer-events-none" />
                            <div className="relative z-10 flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-foreground flex items-center gap-3 uppercase italic tracking-tighter">
                                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                                            <Activity className="text-primary" size={24} />
                                        </div>
                                        FLEET COMMAND
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] mt-2 pl-16"><span className="text-primary font-black text-sm">{ambulances.filter(a => a.status === 'IDLE').length}</span> Units Active</p>
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {ambulances.map(amb => (
                                    <div key={amb.id} className={`shrink-0 w-48 p-5 rounded-2xl border flex flex-col justify-between h-36 transition-all duration-500 ${amb.status === 'IDLE' ? 'bg-muted/50 border-border' : 'bg-rose-500/5 border-rose-500/20 animate-in fade-in'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="font-black text-foreground text-lg tracking-tighter">{amb.id}</span>
                                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border inline-block w-fit mt-1 ${amb.status === 'IDLE' ? 'border-emerald-500/20 text-emerald-500' : 'border-rose-500/20 text-rose-500'}`}>{amb.status}</span>
                                            </div>
                                            <div className={`w-2.5 h-2.5 rounded-full ${amb.status === 'IDLE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_#ef4444]'}`} />
                                        </div>
                                        <div className="text-xs font-mono text-foreground truncate italic flex items-center gap-1.5">
                                            <MapPin size={10} className={amb.status === 'IDLE' ? 'text-slate-500' : 'text-rose-500'} />
                                            {amb.location ? (
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(amb.location)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-primary hover:underline transition-all"
                                                >
                                                    {amb.location}
                                                </a>
                                            ) : (
                                                "Standby"
                                            )}
                                        </div>
                                        {amb.status !== 'IDLE' && (
                                            <button onClick={() => resetAmbulance(amb.id)} className="text-[9px] text-rose-500 font-black uppercase hover:underline text-left mt-2 flex items-center gap-1"><ArrowLeft size={10} /> Recall</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* UPCOMING PROCEDURES (TIMELINE) */}
                    <div className="bg-card rounded-[2.5rem] border border-indigo-500/20 p-8 relative overflow-hidden group shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                        <div className="relative z-10 flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-foreground flex items-center gap-3 uppercase italic tracking-tighter"><Timer className="text-indigo-500" /> UPCOMING PROCEDURES</h3>
                            <button onClick={() => setIsReservationModalOpen(true)} className="px-6 py-3 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-indigo-400 transition-all flex items-center gap-2"><Plus size={14} /> New Pre-Booking</button>
                        </div>
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {reservations.length === 0 ? <p className="text-xs text-muted-foreground italic col-span-full py-4 px-2">No procedures scheduled.</p> : (
                                reservations.map(res => (
                                    <div key={res.id} className="p-4 bg-muted/30 rounded-2xl border border-border flex justify-between items-center group/item hover:border-indigo-500/30 transition-all">
                                        <div>
                                            <p className="text-sm font-black text-foreground uppercase">{res.patient_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] text-indigo-400 font-bold uppercase">{res.resource_id} • Dr. {res.surgeon_name}</p>
                                                <span className="text-[8px] px-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono">{res.duration_minutes || 60}m</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs font-mono text-foreground font-bold">{new Date(res.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className="text-[9px] text-slate-500 font-black uppercase">Start</p>
                                            </div>
                                            <button onClick={() => setResToDelete(res.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all hover:bg-rose-500 hover:text-white"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* LAYER 2: UNIT SWITCHER */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                        <UnitHeroCard title="ICU" icon={Activity} {...getUnitStats('ICU')} isActive={activeUnit === 'ICU'} onClick={() => setActiveUnit('ICU')} colorClass="red" />
                        <UnitHeroCard title="Emergency" icon={BedDouble} {...getUnitStats('ER')} isActive={activeUnit === 'ER'} onClick={() => setActiveUnit('ER')} colorClass="blue" />
                        <UnitHeroCard title="Surgery" icon={BrainCircuit} {...getUnitStats('Surgery')} isActive={activeUnit === 'Surgery'} onClick={() => setActiveUnit('Surgery')} colorClass="indigo" />
                        <UnitHeroCard title="Wards" icon={Package} {...getUnitStats('Wards')} isActive={activeUnit === 'Wards'} onClick={() => setActiveUnit('Wards')} colorClass="emerald" />
                    </div>

                    {/* LAYER 3: DYNAMIC ASSET GRID */}
                    <div className="bg-card rounded-[2.5rem] border border-border p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.015] pointer-events-none" />
                        <div className="relative z-10 flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">{activeUnit} Grid</h2>
                            </div>
                            {activeUnit === 'Wards' && (
                                <div className="hidden xl:flex bg-muted p-1.5 rounded-2xl border border-border shadow-inner">
                                    {[{ id: 'Medical', icon: HeartPulse }, { id: 'Specialty', icon: Baby }, { id: 'Recovery', icon: Stethoscope }, { id: 'Security', icon: ShieldAlert }].map(cat => (
                                        <button key={cat.id} onClick={() => setWardCategory(cat.id as any)} className={`px-6 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${wardCategory === cat.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-foreground hover:bg-card'}`}><cat.icon size={14} /> {cat.id}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative z-10">
                            <AnimatePresence mode="wait">
                                <motion.div key={activeUnit + wardCategory} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                    {activeUnit === 'Surgery' ? (
                                        <div className="col-span-full"><SurgerySection beds={beds} onRefresh={fetchERPData} onAdmit={openAdmitModal} /></div>
                                    ) : getDisplayBeds().map(bed => (
                                        <BedCard 
                                            key={bed.id} 
                                            bed={{...bed, onRequestBlood: (b: any) => setBloodRequestBed(b)}} 
                                            onDischarge={() => setDischargeBedId(bed.id)} 
                                            onAdmit={() => openAdmitModal(bed)} 
                                            onStartCleaning={handleStartCleaning} 
                                            onRefresh={fetchERPData} 
                                            accentColor={activeUnit === 'ICU' ? 'red' : activeUnit === 'Wards' ? 'green' : 'blue'} 
                                            genderLock={activeUnit === 'Wards' && wardCategory === 'Medical' ? getBedGender(bed.id) : null} 
                                            patientGender={patientData.gender} 
                                        />
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                <ResourceInventory />
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {/* DELETE RESERVATION ALERT */}
                {resToDelete && (
                    <div key="delete-modal" className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setResToDelete(null)} />
                         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-card rounded-[3rem] p-8 max-w-sm w-full border border-rose-500/20 relative z-10 text-center shadow-2xl">
                            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={32} className="text-rose-500" /></div>
                            <h2 className="text-2xl font-black text-foreground mb-2 uppercase italic tracking-tight">Abort Procedure?</h2>
                            <p className="text-slate-500 text-xs mb-8 font-bold uppercase tracking-widest">This will permanently remove the reservation from the system.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setResToDelete(null)} className="flex-1 py-4 bg-muted text-slate-500 font-bold uppercase rounded-2xl hover:bg-card transition-all">Go Back</button>
                                <button onClick={handleCancelReservation} className="flex-1 py-4 bg-rose-600 text-white font-bold uppercase rounded-2xl shadow-lg shadow-rose-600/20 transition-all">Confirm Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* PRE-BOOKING MODAL (OT) */}
                {isReservationModalOpen && (
                    <div key="reserve-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsReservationModalOpen(false)} />
                        <motion.div className="bg-card rounded-[2.5rem] p-10 max-w-xl w-full border border-border relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <h2 className="text-3xl font-black text-foreground uppercase italic mb-8 border-b pb-4">OT PRE-BOOKING</h2>
                            <form onSubmit={handleBookReservation} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Patient Identity</label>
                                    <input required className="w-full p-5 bg-muted/40 border border-border rounded-2xl text-foreground outline-none font-bold" placeholder="Patient Name..." value={bookingData.patient_name} onChange={e => setBookingData({...bookingData, patient_name: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" required className="p-5 bg-muted/40 border border-border rounded-2xl outline-none" placeholder="Age" value={bookingData.patient_age} onChange={e => setBookingData({...bookingData, patient_age: e.target.value})} />
                                    <select required className="p-5 bg-muted/40 border border-border rounded-2xl text-foreground" value={bookingData.resource_id} onChange={e => setBookingData({...bookingData, resource_id: e.target.value})}>
                                        <option value="">Select Theater</option>
                                        {beds.filter(b => b.type === 'OT').map(ot => <option key={ot.id} value={ot.id}>{ot.id}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Duration (Minutes)</label>
                                    <div className="flex gap-2">
                                        {[30, 60, 120, 180].map((mins) => (
                                            <button key={mins} type="button" onClick={() => setBookingData({...bookingData, duration_minutes: mins})} className={`flex-1 py-3 rounded-xl border text-[10px] font-black transition-all ${bookingData.duration_minutes === mins ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-muted/50 border-border text-slate-500'}`}>{mins}m</button>
                                        ))}
                                        <input type="number" className="w-20 p-3 bg-muted border border-border rounded-xl text-center text-xs font-bold" placeholder="Min" value={bookingData.duration_minutes} onChange={(e) => setBookingData({...bookingData, duration_minutes: parseInt(e.target.value) || 0})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Scheduled Start</label>
                                    <input type="datetime-local" required className="w-full p-5 bg-muted/40 border border-border rounded-2xl text-foreground font-mono" value={bookingData.start_time} onChange={e => setBookingData({...bookingData, start_time: e.target.value})} />
                                </div>
                                <div className="relative">
                                    <Stethoscope className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                                    <input required className="w-full p-5 pl-14 bg-muted/40 border border-border rounded-2xl text-foreground font-bold" placeholder="Lead Surgeon Name..." value={bookingData.surgeon_name} onChange={e => setBookingData({...bookingData, surgeon_name: e.target.value})} />
                                </div>
                                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-[0.98] transition-all">Submit Reservation</button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* ADMIT MODAL (ORIGINAL VERSION) */}
                {isModalOpen && selectedBed && (
                    <div key="admit-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-card rounded-[2.5rem] p-10 max-w-xl w-full border border-border relative z-10 shadow-2xl">
                            <div className="flex justify-between items-center mb-8 border-b border-border pb-6">
                                <h2 className="text-3xl font-black text-foreground italic uppercase">Admit to {selectedBed.id}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-muted rounded-full text-slate-500 hover:text-white hover:bg-red-500 transition-all"><X size={20}/></button>
                            </div>
                            <form onSubmit={submitAdmission} className="space-y-6">
                                <input className="w-full p-5 bg-muted/40 border border-border focus:border-primary rounded-2xl text-foreground outline-none font-mono text-xs transition-all" placeholder="UID Override (Optional)" value={patientData.admissionUid} onChange={e => setPatientData({ ...patientData, admissionUid: e.target.value })} />
                                <input required className="w-full p-5 bg-muted/40 border border-border rounded-2xl font-bold" placeholder="Enter Full Name..." value={patientData.name} onChange={e => setPatientData({ ...patientData, name: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" required className="p-5 bg-muted/40 border border-border rounded-2xl" placeholder="Age" value={patientData.age} onChange={e => setPatientData({ ...patientData, age: e.target.value })} />
                                    <select className="p-5 bg-muted/40 border border-border rounded-2xl" value={patientData.gender} onChange={e => setPatientData({ ...patientData, gender: e.target.value })}><option value="Male">Male</option><option value="Female">Female</option></select>
                                </div>
                                <select className="w-full p-5 bg-muted/40 border border-border rounded-2xl font-bold" value={patientData.bloodGroup} onChange={e => setPatientData({ ...patientData, bloodGroup: e.target.value })}>
                                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                                {(selectedBed.type === 'Surgery' || selectedBed.type === 'OT') && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl">
                                        <select className="p-5 bg-card border border-border rounded-2xl" value={patientData.surgeryType} onChange={e => setPatientData({ ...patientData, surgeryType: e.target.value })}><option value="Minor">Minor</option><option value="Major">Major</option><option value="Intermediate">Intermediate</option><option value="Specialized">Specialized</option></select>
                                        <input required className="p-5 bg-card border border-border rounded-2xl" placeholder="Surgeon" value={patientData.surgeonName} onChange={e => setPatientData({ ...patientData, surgeonName: e.target.value })} />
                                    </div>
                                )}
                                <select className="w-full p-5 bg-muted/40 border border-border rounded-2xl font-bold appearance-none" value={patientData.condition} onChange={e => setPatientData({ ...patientData, condition: e.target.value })}><option>Stable</option><option>Critical</option><option>Observation</option><option>Pre-Surgery</option></select>
                                <button type="submit" className="w-full py-5 bg-primary text-primary-foreground font-black uppercase rounded-2xl active:scale-[0.98] transition-all shadow-xl">Authorize Admission</button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* DISCHARGE MODAL */}
                {dischargeBedId && (
                    <div key="discharge-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setDischargeBedId(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-card rounded-[3rem] p-8 max-w-sm w-full border border-rose-500/20 relative z-10 text-center shadow-2xl">
                            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={32} className="text-rose-500" /></div>
                            <h2 className="text-2xl font-black mb-8 italic uppercase">Execute Finalize?</h2>
                            <div className="flex gap-4">
                                <button onClick={() => setDischargeBedId(null)} className="flex-1 py-4 bg-muted text-slate-500 font-bold uppercase rounded-2xl hover:bg-card transition-all">Abort</button>
                                <button onClick={confirmDischarge} className="flex-1 py-4 bg-rose-600 text-white font-bold uppercase rounded-2xl shadow-lg transition-all">Confirm</button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {/* BLOOD REQUEST MODAL */}
                <AssignBloodModal 
                    key="blood-nexus-modal"
                    isOpen={!!bloodRequestBed} 
                    onClose={() => setBloodRequestBed(null)} 
                    bed={bloodRequestBed} 
                    onAssigned={() => {
                        toast("Blood Unit Assigned & Billed", "success");
                        fetchERPData();
                    }} 
                />
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;