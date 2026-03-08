"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Shield, Activity, User, Search, RefreshCcw, Lock } from "lucide-react";
import Link from 'next/link';

interface AuditLog {
    id: number;
    timestamp: string;
    staff_id: string;
    staff_role: string;
    action: string;
    resource_path: string;
    details: string;
    ip_address: string;
}

const RiskDot = ({ level }: { level: string }) => {
    const colors: Record<string, string> = {
        high: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
        medium: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]",
        low: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
    };
    return <div className={`w-2.5 h-2.5 rounded-full ${colors[level] || "bg-slate-600"}`} />;
};

const RoleBadge = ({ role }: { role: string }) => {
    const styles: Record<string, string> = {
        Admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        Doctor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        Nurse: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
    return (
        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${styles[role] || "bg-slate-800 text-slate-400 border-slate-700"}`}>
            {role}
        </span>
    );
};

export default function SystemSentinel() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adminName, setAdminName] = useState("System Administrator");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/api/admin/audit-logs", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 403) throw new Error("CRITICAL_SECURITY_BREACH: Access Denied.");
                throw new Error("Failed to fetch audit logs.");
            }

            const data = await res.json();
            setLogs(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const storedName = localStorage.getItem("staff_name");
        if (storedName) setAdminName(storedName);
    }, []);

    const getRiskLevel = (action: string) => {
        if (action === "CRITICAL_SECURITY_BREACH" || action.includes("DELETE")) return "high";
        if (action.includes("FINANCE") || action.includes("BILLING") || action === "SUCCESSFUL_LOGIN") return "medium";
        return "low";
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
            <style jsx global>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

            {/* Header Banner - Dark Surgical Blue Gradient */}
            <div className="bg-[#0f172a] border-b border-indigo-500/10 px-8 py-6 flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 to-transparent pointer-events-none" />

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                        <Shield className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
                            Phrelis System Sentinel
                            
                        </h1>
                        <p className="text-xs text-indigo-400/60 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                            Live Security Feed • HIPAA Compliant
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Access Verified</p>
                        <p className="font-bold text-sm text-white">{adminName}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchLogs}
                            className="p-3 bg-[#1e293b] border border-slate-700 hover:border-indigo-500/50 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
                            title="Refresh logs"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                        <Link href="/admin" className="px-6 py-3 bg-[#1e293b] border border-slate-700 hover:border-indigo-500/50 rounded-xl text-xs font-black uppercase tracking-[0.1em] hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2">
                            Return
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto p-8">
                {/* Statistics Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "Active Sessions", value: "12", icon: User, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                        { label: "Total Events (24h)", value: logs.length.toString(), icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                        { label: "Security Alerts", value: logs.filter(l => getRiskLevel(l.action) === "high").length.toString(), icon: Shield, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
                        { label: "Compliance Status", value: "SECURE", icon: Lock, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                    ].map((stat, i) => (
                        <div key={i} className={`bg-[#0b0b0b] p-6 rounded-2xl border ${stat.border} flex items-center justify-between group hover:bg-[#111111] transition-colors`}>
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black mt-2 text-white tracking-tight">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="bg-[#0b0b0b] rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                            Auditor Log Feed
                            <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20 uppercase tracking-widest">Real-time Encrypted</span>
                        </h2>
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by identity, action, or path..."
                                className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-slate-800 focus:border-indigo-500 rounded-xl text-xs font-bold text-white placeholder-slate-600 outline-none transition-all focus:ring-1 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0f172a]/50 text-indigo-300 text-xs font-black uppercase tracking-widest border-b border-slate-700">
                                    <th className="px-8 py-5">Risk</th>
                                    <th className="px-8 py-5">Precise Time</th>
                                    <th className="px-8 py-5">User Identity</th>
                                    <th className="px-8 py-5">Activity</th>
                                    <th className="px-8 py-5">Resource Path</th>
                                    <th className="px-8 py-5 text-right">Access IP</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-32">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                                <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest animate-pulse">Decrypting Secure Logs...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-20 text-slate-400 font-medium">
                                            No audit logs found. System is currently idle.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-[#0f172a] transition-colors group">
                                            <td className="px-8 py-5">
                                                <RiskDot level={getRiskLevel(log.action)} />
                                            </td>
                                            <td className="px-8 py-5 font-mono text-slate-400 text-xs font-medium">
                                                {format(new Date(log.timestamp), "dd MMM yyyy • HH:mm:ss")}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <RoleBadge role={log.staff_role} />
                                                    <span className="font-bold text-white text-xs tracking-wide">{log.staff_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-slate-100 font-bold text-sm">{log.details || log.action}</p>
                                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-tight mt-1">{log.action}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <code className="text-[10px] bg-[#020617] px-2 py-1 rounded text-cyan-300 border border-slate-700 font-mono tracking-wide">
                                                    {log.resource_path}
                                                </code>
                                            </td>
                                            <td className="px-8 py-5 text-right font-mono text-xs text-slate-400">
                                                {log.ip_address}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {error && (
                <div className="fixed bottom-8 right-8 bg-[#0b0b0b] border border-red-500/50 text-red-500 px-6 py-4 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.2)] flex items-center gap-4 animate-in slide-in-from-bottom-2">
                    <Shield className="w-6 h-6" />
                    <div>
                        <p className="font-black text-xs uppercase tracking-widest">Security Alert</p>
                        <p className="text-sm font-medium text-red-400">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
