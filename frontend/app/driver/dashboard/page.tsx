"use client";
import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Phone, CheckCircle, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { endpoints } from '@/utils/api';
import { toast } from 'react-hot-toast';

export default function DriverDashboard() {
    const { staffId, token } = useAuth(); // Assuming staffId matches the Ambulance ID (e.g., AMB-01)
    const [mission, setMission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<WebSocket | null>(null);

    // 1. Fetch function (used on load and on WS message)
    const fetchMission = async () => {
        try {
            // Using the specific mission endpoint we created earlier
            const res = await fetch(endpoints.activeMission(staffId || "AMB-01"), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error("Mission Fetch Failed");
            
            const data = await res.json();
            
            // Check if status is DISPATCHED (Matching our Backend State)
            if (data.status === "DISPATCHED") {
                setMission(data);
            } else {
                setMission(null);
            }
        } catch (err) {
            console.error("Failed to fetch mission", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMission();

        // 2. Persistent WebSocket Connection
        const connectWS = () => {
            if (socketRef.current?.readyState === WebSocket.OPEN) return;

            const ws = new WebSocket("ws://localhost:8000/ws");

            ws.onopen = () => console.log("🛰️ Phrelis Fleet Link Active");

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Check for multiple event types that suggest a dispatch state change
                    if (data.type === "AMBULANCE_UPDATE" || data.type === "NEW_AMBULANCE_JOB") {
                        console.log("🔔 Dispatch Pulse Received", data);
                        fetchMission();
                    }
                } catch (err) {
                    // Fallback for non-JSON messages if any
                    if (event.data === "AMBULANCE_UPDATE") {
                        fetchMission();
                    }
                }
            };

            ws.onclose = () => {
                console.log("🔌 Link Lost. Retrying...");
                setTimeout(connectWS, 3000); // Auto-reconnect logic
            };

            socketRef.current = ws;
        };

        connectWS();

        return () => {
            socketRef.current?.close();
        };
    }, [staffId, token]);

    // 3. Complete Mission / Arrived Function
    const handleArrival = async () => {
        try {
            const res = await fetch(endpoints.ambulanceReset(staffId || "AMB-01"), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMission(null);
                toast.success("Arrival Logged. Status: IDLE");
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin" />
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Initializing Phrelis Link...</p>
        </div>
    );

    if (!mission) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-2xl">
                <Clock className="text-slate-600 animate-pulse" size={40} />
            </div>
            <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">Standby Mode</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium max-w-[200px]">Waiting for high-priority dispatch from Command...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col gap-4 font-sans">
            {/* EMERGENCY HEADER */}
            <div className={`p-6 rounded-[2.5rem] border shadow-2xl animate-in fade-in zoom-in duration-500 ${
                mission.severity === 'HIGH' ? 'bg-rose-600 border-rose-400' : 'bg-amber-600 border-amber-400'
            }`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 flex items-center gap-2">
                           <ShieldAlert size={12} /> Active Priority
                        </p>
                        <h2 className="text-4xl font-black italic tracking-tighter">
                            {mission.severity === 'HIGH' ? 'CRITICAL' : 'STABLE'}
                        </h2>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <AlertTriangle size={24} className="animate-pulse" />
                    </div>
                </div>
            </div>

            {/* LOCATION CARD */}
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] flex-1 flex flex-col justify-between shadow-inner">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live GPS Signal Locked</span>
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-zinc-500 text-[10px] font-bold uppercase">Destination</p>
                        <h3 className="text-3xl font-black leading-tight tracking-tighter uppercase italic">
                            {mission.location_text || "Incoming Coordinates..."}
                        </h3>
                    </div>

                    {mission.precise_coords && (
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                            <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-tighter">Telemetry</p>
                            <p className="text-zinc-400 text-xs font-mono">
                                LAT: {mission.precise_coords.lat.toFixed(6)} <br/>
                                LNG: {mission.precise_coords.lng.toFixed(6)}
                            </p>
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
                    className="w-full py-6 bg-white text-black rounded-[2rem] flex items-center justify-center gap-3 font-black text-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                >
                    <Navigation size={28} fill="currentColor" /> LAUNCH MAPS
                </button>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="grid grid-cols-2 gap-4 h-24 mb-2">
                <button className="bg-zinc-900 rounded-[2rem] flex flex-col items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-widest border border-zinc-800 text-zinc-400 hover:bg-zinc-800 transition-colors">
                    <Phone size={20} /> Dispatch
                </button>
                <button 
                    className="bg-emerald-600 rounded-[2rem] flex flex-col items-center justify-center gap-1 font-black text-[10px] uppercase tracking-widest border border-emerald-400 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
                    onClick={handleArrival}
                >
                    <CheckCircle size={24} /> Mark Arrived
                </button>
            </div>
        </div>
    );
}