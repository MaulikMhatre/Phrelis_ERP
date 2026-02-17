"use client";
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    DollarSign, TrendingUp, Users, Activity,
    CreditCard, ShieldCheck, ArrowUpRight, Clock,
    Search, LayoutDashboard
} from 'lucide-react';
import BillingSearch from '@/components/BillingSearch';
import { API_BASE_URL } from '@/utils/api';

import { useAuth } from '@/context/AuthContext';

export default function RevenueDashboard() {
    const { token } = useAuth();
    const [timeframe, setTimeframe] = useState("24h");
    const [ledgerSearch, setLedgerSearch] = useState("");
    const [ledgerPage, setLedgerPage] = useState(1);

    const authFetcher = async (url: string) => {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            const error = new Error('An error occurred while fetching the data.');
            (error as any).info = await res.json();
            (error as any).status = res.status;
            throw error;
        }
        return res.json();
    };

    const { data, error, isLoading } = useSWR(
        token ? `${API_BASE_URL}/api/finance/revenue/analytics?timeframe=${timeframe}` : null,
        authFetcher,
        { refreshInterval: 10000, revalidateOnFocus: true }
    );

    const { data: ledgerData, error: ledgerError } = useSWR(
        token ? `${API_BASE_URL}/api/finance/ledger?search=${ledgerSearch}&page=${ledgerPage}` : null,
        authFetcher,
        { refreshInterval: 5000 }
    );

    if (error) return (
        <div className="min-h-screen bg-[#020617] p-8 flex items-center justify-center">
            <div className="p-8 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20 backdrop-blur-xl max-w-md text-center">
                <LayoutDashboard className="mx-auto mb-4 text-red-500" size={48} />
                <h2 className="text-xl font-bold mb-2">Systems Offline</h2>
                <p className="text-sm opacity-70">Error loading financial data: {error.message || "Connection refused"}</p>
            </div>
        </div>
    );

    const kpis = [
        {
            title: "Total Revenue",
            value: data?.kpi ? `₹${data.kpi.total_revenue.toLocaleString()}` : "...",
            sub: data?.kpi?.growth !== undefined ? `${data.kpi.growth >= 0 ? '▲' : '▼'} ${Math.abs(data.kpi.growth).toFixed(1)}%` : "...",
            growthType: data?.kpi?.growth >= 0 ? "positive" : "negative",
            icon: DollarSign,
            color: "text-cyan-400",
            glow: "shadow-cyan-500/20"
        },
        {
            title: "Pipeline Value",
            value: data?.kpi ? `₹${Math.round(data.kpi.potential_revenue).toLocaleString()}` : "...",
            sub: "Active Estimates",
            icon: TrendingUp,
            color: "text-purple-400",
            glow: "shadow-purple-500/20"
        },
        {
            title: "Tax (GST)",
            value: data?.kpi ? `₹${Math.round(data.kpi.total_tax).toLocaleString()}` : "...",
            sub: "Compliance Secure",
            icon: ShieldCheck,
            color: "text-amber-400",
            glow: "shadow-amber-500/20"
        },
        {
            title: "Avg / Patient",
            value: data?.kpi ? `₹${Math.round(data.kpi.arpp).toLocaleString()}` : "...",
            sub: `${Math.round(data?.kpi?.occupancy_rate || 0)}% Cap.`,
            icon: Users,
            color: "text-blue-400",
            glow: "shadow-blue-500/20"
        },
    ];

    const categoryData = data?.breakdown ? [
        { name: 'Hospitalization', value: data.breakdown.bed_revenue || 0 },
        { name: 'Surgical Units', value: data.breakdown.surgery_revenue || 0 },
        { name: 'Medical Supply', value: data.breakdown.pharmacy_revenue || 0 },
        { name: 'Consultations', value: data.breakdown.consultation_revenue || 0 },
    ].filter(v => v.value > 0) : [];

    const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#3b82f6'];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
            {/* Header */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                            <CreditCard className="text-cyan-400" size={24} />
                        </div>
                        <span className="text-xs font-bold tracking-[0.2em] text-cyan-500 uppercase">Financial Intelligence</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-white mb-2 italic">
                        REVENUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 not-italic">COMMAND</span>
                    </h1>
                    <p className="text-slate-400 max-w-md">Secure, real-time fiscal monitoring with AI-driven growth trajectory analytics.</p>
                </motion.div>

                <div className="flex items-center gap-4 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl">
                    {["24h", "7D", "1M", "1Y"].map(t => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${timeframe === t
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 translate-y-[-1px]'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {kpis.map((k, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5 }}
                        className={`group p-6 bg-slate-900/40 border border-slate-800 rounded-3xl hover:border-slate-700 transition-all backdrop-blur-xl relative overflow-hidden shadow-2xl ${k.glow}`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <k.icon size={80} />
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 ${k.color}`}>
                                <k.icon size={24} />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded-full border border-cyan-500/20">
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                QUANTUM-SYNC
                            </div>
                        </div>

                        <h3 className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">{k.title}</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-white">{k.value}</p>
                            <span className={`text-[11px] font-black ${k.growthType === 'positive' ? 'text-emerald-400' :
                                k.growthType === 'negative' ? 'text-rose-400' : 'text-slate-400'
                                }`}>
                                {k.sub}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                {/* Main Trajectory Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="xl:col-span-2 p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl relative group shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                <Activity className="text-indigo-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white leading-none mb-1">Fiscal Trajectory</h3>
                                <p className="text-slate-500 text-xs font-bold tracking-wider">REAL-TIME INFLOW MONITORING</p>
                            </div>
                        </div>
                        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400 shadow-inner">
                            SECURE_LEDGER_FEED v2.0
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.trend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="10 10" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#475569"
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#475569"
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `₹${val >= 1000 ? val / 1000 + 'k' : val}`}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#0891b2', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #1e293b',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: '#22d3ee', fontWeight: 900 }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', fontWeight: 800 }}
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Ledger Entry"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0891b2"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    animationBegin={200}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Revenue Mix Pie */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl shadow-2xl"
                >
                    <h3 className="text-xl font-black text-white mb-8">Segment Distribution</h3>
                    <div className="h-[280px] w-full flex items-center justify-center">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%" cy="50%"
                                        innerRadius={75}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                        animationBegin={500}
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-slate-600 font-bold opacity-50">NO DATA YET</div>
                        )}
                    </div>
                    <div className="space-y-3 mt-4">
                        {categoryData.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="text-xs font-bold text-slate-400">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-white italic">₹{(item.value).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section: Search & Recents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                {/* Billing Search Component Integration */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <BillingSearch />
                </motion.div>

                {/* Global Financial Ledger */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl shadow-2xl h-full"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                                <Clock size={20} />
                            </div>
                            <h3 className="text-xl font-black text-white">Global Financial Ledger</h3>
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search Ledger..."
                                value={ledgerSearch}
                                onChange={(e) => setLedgerSearch(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {ledgerData?.transactions?.length > 0 ? ledgerData.transactions.map((bill: any, idx: number) => (
                                <motion.div
                                    key={bill.bill_no}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 bg-slate-950/40 border border-slate-800/50 rounded-2xl hover:border-slate-700 transition-colors flex justify-between items-center group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                                            <ArrowUpRight size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{bill.patient_name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-mono text-slate-500">{bill.bill_no}</p>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold ${bill.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                    {bill.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-cyan-400 italic">₹{bill.amount.toLocaleString()}</p>
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                                            {new Date(bill.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="p-12 text-center text-slate-700 font-black tracking-widest opacity-30 border-2 border-dashed border-slate-800 rounded-[2rem]">
                                    {ledgerError ? "LEDGER CONNECTION ERROR" : "NO TRANSACTIONS FOUND"}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Ledger Pagination */}
                    {ledgerData?.total_pages > 1 && (
                        <div className="mt-8 flex justify-center items-center gap-4">
                            <button
                                onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                                disabled={ledgerPage === 1}
                                className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 disabled:opacity-20 hover:border-slate-700 transition-all"
                            >
                                PREV
                            </button>
                            <span className="text-[10px] font-mono text-slate-500">
                                {ledgerPage} / {ledgerData.total_pages}
                            </span>
                            <button
                                onClick={() => setLedgerPage(p => Math.min(ledgerData.total_pages, p + 1))}
                                disabled={ledgerPage === ledgerData.total_pages}
                                className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 disabled:opacity-20 hover:border-slate-700 transition-all"
                            >
                                NEXT
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
