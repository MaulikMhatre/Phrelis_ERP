
"use client";
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    DollarSign, TrendingUp, Users, Activity,
    CreditCard, ShieldCheck, ArrowUpRight, Clock,
    Search, LayoutDashboard, Printer
} from 'lucide-react';
import BillingSearch from '@/components/BillingSearch';
import { API_BASE_URL } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

// PDF Generation Utilities
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function RevenueDashboard() {
    const { token } = useAuth();
    const [timeframe, setTimeframe] = useState("24h");
    const [ledgerSearch, setLedgerSearch] = useState("");
    const [ledgerPage, setLedgerPage] = useState(1);
    
    // Printing State
    const [isPrinting, setIsPrinting] = useState(false);
    const [currentBill, setCurrentBill] = useState<any>(null);

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

    // FIXED: Official Bill Printer Logic
    const handlePrintOfficialBill = async (bill: any) => {
        setCurrentBill(bill);
        setIsPrinting(true);
        
        // Essential: Small delay to ensure the DOM updates with the 'currentBill' state
        await new Promise(resolve => setTimeout(resolve, 400));

        const element = document.getElementById('printable-official-bill');
        if (!element) {
            setIsPrinting(false);
            return;
        }

        try {
            const canvas = await html2canvas(element, {
                scale: 2.5, // High resolution
                useCORS: true,
                backgroundColor: "#ffffff", // Force white background for the PDF
                onclone: (clonedDoc) => {
                    // Force the hidden element to be visible in the clone for capture
                    const clonedElement = clonedDoc.getElementById('printable-official-bill');
                    if (clonedElement) {
                        clonedElement.style.position = 'static';
                        clonedElement.style.display = 'block';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`BILL_${bill.bill_no || 'PHRELIS'}.pdf`);
        } catch (err) {
            console.error("Print Failed:", err);
        } finally {
            setIsPrinting(false);
            setCurrentBill(null);
        }
    };

    if (error) return (
        <div className="min-h-screen bg-background p-8 flex items-center justify-center">
            <div className="p-8 text-rose-500 bg-rose-500/10 rounded-2xl border border-rose-500/20 backdrop-blur-xl max-w-md text-center">
                <LayoutDashboard className="mx-auto mb-4 text-rose-500" size={48} />
                <h2 className="text-xl font-bold mb-2">Systems Offline</h2>
                <p className="text-sm opacity-70">Error loading financial data: {error.message || "Connection refused"}</p>
            </div>
        </div>
    );

    const kpis = [
        { title: "Total Revenue", value: data?.kpi ? `₹${data.kpi.total_revenue.toLocaleString()}` : "...", sub: data?.kpi?.growth !== undefined ? `${data.kpi.growth >= 0 ? '▲' : '▼'} ${Math.abs(data.kpi.growth).toFixed(1)}%` : "...", growthType: data?.kpi?.growth >= 0 ? "positive" : "negative", icon: DollarSign, color: "text-cyan-500", glow: "shadow-cyan-500/20" },
        { title: "Pipeline Value", value: data?.kpi ? `₹${Math.round(data.kpi.potential_revenue).toLocaleString()}` : "...", sub: "Active Estimates", icon: TrendingUp, color: "text-purple-500", glow: "shadow-purple-500/20" },
        { title: "Tax (GST)", value: data?.kpi ? `₹${Math.round(data.kpi.total_tax).toLocaleString()}` : "...", sub: "Compliance Secure", icon: ShieldCheck, color: "text-amber-500", glow: "shadow-amber-500/20" },
        { title: "Avg / Patient", value: data?.kpi ? `₹${Math.round(data.kpi.arpp).toLocaleString()}` : "...", sub: `${Math.round(data?.kpi?.occupancy_rate || 0)}% Cap.`, icon: Users, color: "text-blue-500", glow: "shadow-blue-500/20" },
    ];

    const categoryData = data?.breakdown ? [
        { name: 'Hospitalization', value: data.breakdown.bed_revenue || 0 },
        { name: 'Surgical Units', value: data.breakdown.surgery_revenue || 0 },
        { name: 'Medical Supply', value: data.breakdown.pharmacy_revenue || 0 },
        { name: 'Consultations', value: data.breakdown.consultation_revenue || 0 },
    ].filter(v => v.value > 0) : [];

    const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#3b82f6'];

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans selection:bg-primary/30 transition-colors duration-500">
            {/* Header */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <CreditCard className="text-primary" size={24} />
                        </div>
                        <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Financial Intelligence</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-foreground mb-2 italic uppercase">
                        REVENUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 not-italic">COMMAND</span>
                    </h1>
                    <p className="text-muted-foreground max-w-md font-medium">Secure, real-time fiscal monitoring with AI-driven growth trajectory analytics.</p>
                </motion.div>

                <div className="flex items-center gap-4 bg-muted/50 p-1.5 rounded-2xl border border-border backdrop-blur-xl">
                    {["24h", "7D", "1M", "1Y"].map(t => (
                        <button key={t} onClick={() => setTimeframe(t)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${timeframe === t ? 'bg-background text-primary shadow-lg shadow-black/10 translate-y-[-1px]' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>
                    ))}
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {kpis.map((k, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }} className={`group p-6 bg-card border border-border rounded-3xl hover:border-primary/30 transition-all backdrop-blur-xl relative overflow-hidden shadow-2xl ${k.glow} dark:shadow-none`}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><k.icon size={80} /></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-muted border border-border ${k.color}`}><k.icon size={24} /></div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> LIVE-SYNC
                            </div>
                        </div>
                        <h3 className="text-muted-foreground text-xs font-bold tracking-widest uppercase mb-1">{k.title}</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-foreground">{k.value}</p>
                            <span className={`text-[11px] font-black ${k.growthType === 'positive' ? 'text-emerald-400' : k.growthType === 'negative' ? 'text-rose-500' : 'text-muted-foreground'}`}>{k.sub}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                {/* Main Trajectory Chart */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="xl:col-span-2 p-8 bg-card border border-border rounded-[2.5rem] backdrop-blur-xl relative group shadow-2xl dark:shadow-none">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20"><Activity className="text-primary" size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black text-foreground leading-none mb-1 uppercase tracking-tight italic">Fiscal Trajectory</h3>
                                <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">Real-time Inflow Monitoring</p>
                            </div>
                        </div>
                        <div className="bg-muted px-4 py-2 rounded-xl border border-border text-xs font-mono font-black text-primary shadow-inner uppercase tracking-widest">Secure_Ledger v2.4</div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.trend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="10 10" stroke="currentColor" className="opacity-10" vertical={false} />
                                <XAxis dataKey="time" stroke="currentColor" className="opacity-40" tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="currentColor" className="opacity-40" tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val >= 1000 ? val / 1000 + 'k' : val}`} />
                                <Tooltip cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '5 5' }} contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--foreground)' }} itemStyle={{ color: 'var(--primary)', fontWeight: 900 }} formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Ledger Entry"]} />
                                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Revenue Mix Pie */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 bg-card border border-border rounded-[2.5rem] backdrop-blur-xl shadow-2xl dark:shadow-none transition-all">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic mb-8">Segment Distribution</h3>
                    <div className="h-[280px] w-full flex items-center justify-center">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={75} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-muted-foreground font-black opacity-30 uppercase tracking-widest text-xs">Waiting for Segment Data...</div>
                        )}
                    </div>
                    <div className="space-y-3 mt-4">
                        {categoryData.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-muted/40 p-3 rounded-2xl border border-border transition-all">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-foreground italic">₹{(item.value).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <BillingSearch />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-8 bg-card border border-border rounded-[2.5rem] backdrop-blur-xl shadow-2xl dark:shadow-none h-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary"><Clock size={20} /></div>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">Global Financial Ledger</h3>
                        </div>
                        <div className="relative w-full md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                            <input type="text" placeholder="Search Ledger..." value={ledgerSearch} onChange={(e) => setLedgerSearch(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 transition-all shadow-inner" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {ledgerData?.transactions?.length > 0 ? ledgerData.transactions.map((bill: any, idx: number) => (
                                <motion.div key={bill.bill_no} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 bg-muted/30 border border-border rounded-2xl hover:border-primary/30 transition-all flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all"><ArrowUpRight size={18} /></div>
                                        <div>
                                            <p className="text-sm font-black text-foreground uppercase tracking-tight">{bill.patient_name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-mono text-muted-foreground font-bold">{bill.bill_no}</p>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black border ${bill.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{bill.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-primary italic tracking-tighter">₹{bill.amount.toLocaleString()}</p>
                                            <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">{new Date(bill.time).toLocaleDateString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => handlePrintOfficialBill(bill)}
                                            className="p-2.5 bg-background border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
                                            title="Print Official Document"
                                        >
                                            <Printer size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="p-12 text-center text-muted-foreground font-black tracking-widest opacity-20 border-2 border-dashed border-border rounded-[2rem] uppercase text-[10px]">{ledgerError ? "Ledger Link Severed" : "No Transactions Detected"}</div>
                            )}
                        </AnimatePresence>
                    </div>

                    {ledgerData?.total_pages > 1 && (
                        <div className="mt-8 flex justify-center items-center gap-4">
                            <button onClick={() => setLedgerPage(p => Math.max(1, p - 1))} disabled={ledgerPage === 1} className="px-4 py-2 bg-muted border border-border rounded-xl text-[10px] font-black text-muted-foreground disabled:opacity-20 hover:text-primary transition-all">PREV</button>
                            <span className="text-[10px] font-black text-muted-foreground">{ledgerPage} / {ledgerData.total_pages}</span>
                            <button onClick={() => setLedgerPage(p => Math.min(ledgerData.total_pages, p + 1))} disabled={ledgerPage === ledgerData.total_pages} className="px-4 py-2 bg-muted border border-border rounded-xl text-[10px] font-black text-muted-foreground disabled:opacity-20 hover:text-primary transition-all">NEXT</button>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* --- PRINTING PORTAL --- */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {currentBill && (
                    <div id="printable-official-bill" className="p-16 bg-white text-slate-900 w-[210mm] min-h-[297mm] font-sans">
                        <div className="border-8 border-slate-900 p-2 h-full">
                            <div className="border-2 border-slate-900 p-10 h-full">
                                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-12">
                                    <div>
                                        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Phrelis<span className="text-indigo-600">OS</span></h1>
                                        <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Official Medical Invoice • Central Ledger</p>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-2xl font-black uppercase text-slate-400">Tax Invoice</h2>
                                        <p className="font-mono text-lg font-black text-indigo-600">{currentBill.bill_no}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-16 mb-16">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Details</p>
                                        <div>
                                            <p className="text-2xl font-black uppercase tracking-tight">{currentBill.patient_name}</p>
                                            <p className="text-sm font-bold text-slate-500">Phrelis UID: {currentBill.bill_no?.split('-')[1] || 'PENDING'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Timeline</p>
                                        <p className="text-md font-bold text-slate-800">{new Date(currentBill.time).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
                                    </div>
                                </div>

                                <table className="w-full mb-16 border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <th className="p-5 border-b-2 border-slate-200 text-left">Service Description</th>
                                            <th className="p-5 border-b-2 border-slate-200 text-right">Amount (INR)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="p-5 text-md font-black uppercase text-slate-800 border-b border-slate-100">Consolidated Medical Healthcare Services</td>
                                            <td className="p-5 text-right font-mono text-xl font-black italic border-b border-slate-100">₹{currentBill.amount.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="flex justify-end pt-10 border-t-4 border-slate-900">
                                    <div className="w-80 space-y-3">
                                        <div className="flex justify-between text-xs font-black uppercase text-slate-400">
                                            <span>Integrated GST (18%)</span>
                                            <span>Included</span>
                                        </div>
                                        <div className="flex justify-between items-center py-6 bg-slate-50 px-6 rounded-[2rem] border-2 border-slate-200 shadow-inner">
                                            <span className="text-[12px] font-black uppercase text-slate-500 tracking-widest">Net Payable</span>
                                            <span className="text-3xl font-black italic text-slate-900 tracking-tighter">₹{currentBill.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-48 pt-10 border-t border-slate-200 opacity-60 flex justify-between items-end">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest">System Authenticated via Phrelis Sentinel</p>
                                        <p className="text-[8px] font-bold text-slate-400">Verification ID: {currentBill.bill_no}-AUTH-PHI</p>
                                    </div>
                                    <div className="w-24 h-24 border-8 border-slate-100 rounded-full flex items-center justify-center font-black text-[9px] uppercase italic text-slate-200 text-center p-4">Phrelis Official Document Seal</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Printing Overlay */}
            <AnimatePresence>
                {isPrinting && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] bg-background/80 backdrop-blur-xl flex items-center justify-center">
                        <div className="flex flex-col items-center gap-5">
                            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="font-black text-[10px] uppercase tracking-[0.5em] text-primary animate-pulse italic">Encoding Medical Document...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}






























