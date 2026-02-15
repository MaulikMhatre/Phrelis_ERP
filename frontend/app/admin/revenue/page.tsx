"use client";
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react';
import BillingSearch from '@/components/BillingSearch';
import { API_BASE_URL } from '@/utils/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RevenueDashboard() {
    const [timeframe, setTimeframe] = useState("24h");
    const { data, error, mutate } = useSWR(`${API_BASE_URL}/api/finance/revenue/analytics?timeframe=${timeframe}`, fetcher, { refreshInterval: 30000 });

    useEffect(() => {
        if (data) console.log("Revenue Analytics Loaded:", data);
        if (error) console.error("Revenue Analytics Error:", error);
    }, [data, error]);

    if (error) return <div className="p-8 text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">Error loading revenue analytics: {error.message || "Unknown Error"}</div>;
    if (!data) return <div className="p-8 text-gray-500 animate-pulse">Loading Financial Command Center...</div>;

    const kpis = [
        { title: "Total Revenue", value: data?.kpi ? `₹${data.kpi.total_revenue.toLocaleString()}` : "...", icon: DollarSign, color: "text-green-400", bg: "bg-green-500/20" },
        { title: "Avg Revenue / Patient", value: data?.kpi ? `₹${Math.round(data.kpi.arpp).toLocaleString()}` : "...", icon: Users, color: "text-blue-400", bg: "bg-blue-500/20" },
        { title: "Occupancy Rate", value: data?.kpi ? `${Math.round(data.kpi.occupancy_rate)}%` : "...", icon: Activity, color: "text-purple-400", bg: "bg-purple-500/20" },
        { title: "Surgery Growth", value: "+12%", icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/20" }, // Mock for now
    ];

    const categoryData = data?.breakdown ? [
        { name: 'Bed Charges', value: data.breakdown.bed_revenue || 0 },
        { name: 'Surgeries', value: data.breakdown.surgery_revenue || 0 },
        { name: 'Pharmacy', value: data.breakdown.pharmacy_revenue || 0 },
    ] : [];

    const COLORS = ['#60A5FA', '#34D399', '#F472B6'];

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                        Financial Command Center
                    </h1>
                    <p className="text-gray-400">Real-time revenue tracking & compliance analytics</p>
                </div>

                {/* Timeframe Selector */}
                <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10">
                    {["24h", "7D", "1M", "1Y"].map(t => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {kpis.map((k, i) => (
                    <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${k.bg} ${k.color} group-hover:scale-110 transition-transform`}>
                                <k.icon size={24} />
                            </div>
                            <span className="text-xs font-bold text-gray-500 bg-black/40 px-2 py-1 rounded-full border border-white/5">LIVE</span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">{k.title}</h3>
                        <p className="text-3xl font-black text-white tracking-tight">{k.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                {/* Main Chart */}
                <div className="lg:col-span-2 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="text-blue-400" size={20} />
                        Revenue Trajectory
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.trend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#666" tick={{ fill: '#666' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Breakdown Chart */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-6">Revenue Mix</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="mb-12">
                <BillingSearch />
            </div>
        </div>
    );
}
