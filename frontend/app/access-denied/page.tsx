"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldX, ArrowLeft, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AccessDeniedPage() {
    const router = useRouter();
    const { role } = useAuth();

    // Role-specific allowed modules
    const rolePermissions = {
        Admin: ['All Modules', 'Revenue Analytics', 'User Management', 'Surgery', 'Billing'],
        Doctor: ['OPD', 'Triage',, 'Smart Nursing', , 'Admin ', 'Staff '],
        Nurse: ['OPD', 'Triage', 'Staff (Attendance)', 'Smart Nursing']
    };

    const allowedModules = role ? rolePermissions[role] : [];

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-2xl mx-auto p-8"
            >
                <div className="bg-[#0a0f1d]/90 backdrop-blur-2xl p-12 rounded-3xl border border-white/5 shadow-2xl">

                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-rose-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center relative"
                    >
                        <ShieldX className="w-12 h-12 text-rose-400" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                            <Lock className="w-4 h-4 text-amber-400" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-4xl font-black text-white text-center mb-4 tracking-tight">
                        Access <span className="text-rose-500">Denied</span>
                    </h1>

                    {/* Message */}
                    <p className="text-slate-400 text-center mb-8 text-lg">
                        You don't have permission to access this module.
                    </p>

                    {/* Role Info */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <p className="text-xs font-black text-amber-400 uppercase tracking-widest">
                                Current Role: {role || 'Unknown'}
                            </p>
                        </div>

                        <p className="text-sm text-slate-500 mb-4">Your role has access to:</p>

                        <div className="flex flex-wrap gap-2">
                            {allowedModules.map((module, index) => (
                                <motion.div
                                    key={module}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + index * 0.05 }}
                                    className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs font-medium text-indigo-400"
                                >
                                    {module}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.back()}
                            className="flex-1 h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Go Back
                        </button>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/20"
                        >
                            Dashboard
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="text-[8px] text-slate-700 text-center uppercase tracking-wider mt-8">
                        If you believe this is an error, contact your system administrator
                    </p>
                </div>
            </motion.div>

            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
        </div>
    );
}
