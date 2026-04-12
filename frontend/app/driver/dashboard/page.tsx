"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Navigation, Phone, CheckCircle, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { endpoints, WS_BASE_URL } from '@/utils/api';
import { toast } from 'react-hot-toast';

export default function DriverDashboard() {
    const { staffId, token, name } = useAuth(); 
    const [mission, setMission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<WebSocket | null>(null);

    const fetchMission = async () => {
        try {
            // CRITICAL: Ensure targetId matches your DB primary key exactly ("AMB-01")
            const targetId = staffId || "AMB-01"; 
            const res = await fetch(endpoints.activeMission(targetId), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error("Fetch Failed");
            const data = await res.json();
            console.log("📡 Phrelis Sync | Data Received:", data);
            
            // Allow flexibility in status checks (Case-insensitive)
            const currentStatus = data.status?.toUpperCase() || "IDLE";
            
            if (currentStatus === "DISPATCHED") {
                console.log("✅ Phrelis Sync | Mission ACTIVE for unit:", targetId);
                setMission({
                    ...data,
                    displayLocation: data.location_text?.includes("GPS:") 
                        ? "Active Emergency Site" 
                        : (data.location_text || "Incoming Dispatch"),
                    severity: data.severity || 'HIGH'
                });
            } else {
                if (mission) console.warn(`⚠️ Phrelis Sync | Mission status is '${currentStatus}', reverting to Standby.`);
                setMission(null);
            }


        } catch (err) {
            console.error("❌ Sync Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchMission();

        const connectWS = () => {
            if (socketRef.current?.readyState === WebSocket.OPEN) return;
            const ws = new WebSocket(`${WS_BASE_URL}/ws`);
            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.type === "AMBULANCE_UPDATE") {
                        console.log("🔄 Phrelis Sync | Live Update Received");
                        fetchMission();
                    }
                } catch (err) {
                    console.error("WS Parse Error", err);
                    if (e.data === "AMBULANCE_UPDATE") fetchMission();
                }
            };
            ws.onclose = () => setTimeout(connectWS, 3000);
            socketRef.current = ws;
        };

        connectWS();
        return () => socketRef.current?.close();
    }, [staffId, token]);

    const handleArrival = async () => {
        try {
            const res = await fetch(endpoints.ambulanceReset(staffId || "AMB-01"), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMission(null);
                toast.success("Unit IDLE");
            }
        } catch (err) {
            toast.error("Update Failed");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
            <div className="w-10 h-10 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin mb-4" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 italic">Syncing Phrelis OS Fleet...</p>
        </div>
    );

    if (!mission) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute top-8 left-0 right-0 px-8 flex justify-between items-center">
                <div className="text-left">
                    <h1 className="text-lg font-black text-white italic tracking-tighter">PHRELIS <span className="text-indigo-500">OS</span></h1>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Driver</p>
                    <p className="text-[10px] font-bold text-slate-300">{name || "Anonymous"}</p>
                </div>
            </div>
            <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                <Clock className="text-slate-600 animate-pulse" size={32} />
            </div>
            <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">Standby Mode</h1>
            <p className="text-slate-500 text-xs mt-2 max-w-[200px]">Waiting for high-priority dispatch signal...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col gap-4 max-w-md mx-auto">
            {/* Global Portal Header */}
            <div className="flex items-center justify-between px-2 py-2">
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight italic">
                        PHRELIS <span className="text-indigo-500">OS</span>
                    </h1>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Active Driver</span>
                    <span className="text-[10px] font-bold text-slate-200 tracking-tight">{name || "Ambulance Unit"}</span>
                </div>
            </div>

            {/* Live Dispatch Header */}
            <div className={`p-6 rounded-[2rem] border shadow-2xl ${
                mission.severity === 'HIGH' ? 'bg-rose-600 border-rose-400' : 'bg-amber-600 border-amber-400'
            }`}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1 flex items-center gap-2">
                           <ShieldAlert size={12} /> Priority Signal
                        </p>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase">{mission.status}</h2>
                    </div>
                    <AlertTriangle size={28} className="animate-pulse" />
                </div>
            </div>

            {/* Navigation & Telemetry */}
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">GPS Locked</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-zinc-500 text-[10px] font-bold uppercase">Destination</p>
                        <h3 className="text-2xl font-black italic text-zinc-100 uppercase">{mission.displayLocation}</h3>
                    </div>
                    {mission.precise_coords && mission.precise_coords.lat && (
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[10px] text-zinc-400">
                            LAT: {Number(mission.precise_coords.lat).toFixed(6)}<br/>
                            LNG: {Number(mission.precise_coords.lng).toFixed(6)}
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => {
                        const coords = mission.precise_coords 
                            ? `${mission.precise_coords.lat},${mission.precise_coords.lng}`
                            : mission.location_text.replace("GPS:", "").trim();
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}`, '_blank');
                    }}
                    className="w-full mt-6 py-6 bg-white text-black rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-xl active:scale-95 transition-transform"
                >
                    <Navigation size={24} fill="currentColor" /> LAUNCH MAPS
                </button>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-4 h-20">
                <button className="bg-zinc-900 rounded-[1.5rem] border border-zinc-800 text-zinc-500 font-bold text-[10px] uppercase flex flex-col items-center justify-center gap-1">
                    <Phone size={18} /> Comms
                </button>
                <button 
                    className="bg-emerald-600 rounded-[1.5rem] border border-emerald-400 text-emerald-50 font-black text-[10px] uppercase flex flex-col items-center justify-center gap-1"
                    onClick={handleArrival}
                >
                    <CheckCircle size={20} /> Mark Arrived
                </button>
            </div>
        </div>
    );
}