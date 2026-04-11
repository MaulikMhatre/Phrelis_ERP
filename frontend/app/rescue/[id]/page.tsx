"use client";
import React, { useEffect, useState, use } from 'react'; // 1. Import 'use'
import { ShieldCheck, Activity } from 'lucide-react';
import { endpoints } from '@/utils/api';

// 2. Define the type for the async params
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RescuePage({ params }: PageProps) {
    // 3. Unwrap the params promise using React.use()
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;

    const [status, setStatus] = useState<'requesting' | 'sending' | 'success' | 'error'>('requesting');
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus('error');
            setErrorMsg("Geolocation not supported.");
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        const sendLocation = async (position: GeolocationPosition) => {
            console.log("📍 GPS captured:", position.coords.latitude, position.coords.longitude);
            setStatus('sending');
            try {
                const url = endpoints.rescueUpdate(id);
        console.log("🚀 Sending to URL:", url);
                // 4. Use the unwrapped ID here
                const response = await fetch(endpoints.rescueUpdate(id), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    })
                });

                if (response.ok) setStatus('success');
                else setStatus('error');
            } catch (err) {
                setStatus('error');
                console.error(err);
            }
        };

        navigator.geolocation.getCurrentPosition(sendLocation, (err) => {
            setStatus('error');
            setErrorMsg(err.message);
        }, options);
    }, [id]); // 5. Depend on the unwrapped 'id'

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-8 border border-rose-500/20">
                <Activity className="text-rose-500 animate-pulse" size={40} />
            </div>

            <h1 className="text-2xl font-black tracking-tight uppercase italic mb-2">
                Phrelis Rescue Link
            </h1>

            {status === 'requesting' && <p className="text-slate-400 animate-pulse">Requesting GPS Access...</p>}
            {status === 'sending' && <p className="text-indigo-400 animate-pulse">Transmitting Coordinates...</p>}
            
            {status === 'success' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <ShieldCheck className="text-emerald-500 mx-auto mb-2" size={32} />
                    <p className="text-emerald-400 font-bold">Location Shared Successfully</p>
                    <p className="text-slate-500 text-xs mt-2 italic">Dispatch is tracking your signal.</p>
                </div>
            )}

            {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                    <p className="font-bold">Access Denied</p>
                    <p className="text-xs">{errorMsg}</p>
                </div>
            )}
        </div>
    );
}