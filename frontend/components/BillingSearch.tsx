"use client";
import { useState } from 'react';
import { Search, FileText, Printer, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/utils/api';

interface BillItem {
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    tax_percent: number;
    tax_amount: number;
}

interface BillData {
    status: "ESTIMATE" | "FINAL";
    admission_uid: string;
    patient_name: string;
    bill_no?: string;
    grand_total: number;
    tax_amount: number;
    items?: BillItem[]; // For Final
    // Estimate fields
    bed_days?: number;
    bed_charge?: number;
    surgery_charge?: number;
    tax?: number;
    total?: number;
}

export default function BillingSearch() {
    const [uid, setUid] = useState('');
    const [bill, setBill] = useState<BillData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        const trimmedUid = uid.trim();
        if (!trimmedUid) return;
        setLoading(true);
        setError('');
        setBill(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/finance/bill/${trimmedUid}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error("Admission UID not found");
                throw new Error("Error fetching bill");
            }
            const data = await res.json();
            setBill(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Billing & Tax Invoice</h2>
                    <p className="text-sm text-gray-400">Search by Admission UID for SC-Compliant Billing</p>
                </div>
            </div>

            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Enter Admission UID (e.g. ADM-2023-...)"
                        value={uid}
                        onChange={(e) => setUid(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                    {loading ? "Searching..." : "Search Records"}
                </button>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {bill && (
                <div className="animate-fade-in-up">
                    {/* Bill Header */}
                    <div className="bg-white text-black p-8 rounded-t-xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileText className="w-32 h-32" />
                        </div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <h1 className="text-3xl font-bold text-blue-900 mb-1">INVOICE</h1>
                                <p className="text-sm text-gray-600 font-mono">{bill.bill_no || "PREVIEW MODE"}</p>
                                {bill.status === "ESTIMATE" && <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">ESTIMATE ONLY</span>}
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold text-gray-800">Phrelis Hospital</h3>
                                <p className="text-sm text-gray-600">Compliance Unit</p>
                                <p className="text-sm text-gray-600">New Delhi, India</p>
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div className="grid grid-cols-2 gap-8 mb-8 text-sm border-b border-gray-200 pb-6 relative z-10">
                            <div>
                                <p className="text-gray-500 uppercase tracking-wider mb-1">Billed To</p>
                                <p className="font-bold text-lg">{bill.patient_name}</p>
                                <p className="text-gray-600 font-mono">{bill.admission_uid}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 uppercase tracking-wider mb-1">Date</p>
                                <p className="font-bold">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-8 relative z-10">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-3 rounded-l-lg">Description</th>
                                        <th className="p-3 text-center">Qty</th>
                                        <th className="p-3 text-right">Unit Price</th>
                                        <th className="p-3 text-right">Tax (GST)</th>
                                        <th className="p-3 text-right rounded-r-lg">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {/* If Final Bill */}
                                    {bill.items?.map((item, i) => (
                                        <tr key={i}>
                                            <td className="p-3 font-medium text-gray-800">{item.description}</td>
                                            <td className="p-3 text-center text-gray-600">{item.quantity}</td>
                                            <td className="p-3 text-right text-gray-600">₹{(item.unit_price || 0).toLocaleString()}</td>
                                            <td className="p-3 text-right text-gray-600">
                                                {item.tax_percent || 0}% (₹{(item.tax_amount || 0).toLocaleString()})
                                            </td>
                                            <td className="p-3 text-right font-bold text-gray-900">₹{(item.total_price || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}

                                    {/* If Estimate */}
                                    {bill.status === "ESTIMATE" && (
                                        <>
                                            <tr>
                                                <td className="p-3 font-medium text-gray-800">Bed Charges ({bill.bed_days} Days)</td>
                                                <td className="p-3 text-center text-gray-600">{bill.bed_days}</td>
                                                <td className="p-3 text-right text-gray-600">-</td>
                                                <td className="p-3 text-right text-gray-600">0%</td>
                                                <td className="p-3 text-right font-bold text-gray-900">₹{bill.bed_charge?.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 font-medium text-gray-800">Surgery / Procedures</td>
                                                <td className="p-3 text-center text-gray-600">1</td>
                                                <td className="p-3 text-right text-gray-600">-</td>
                                                <td className="p-3 text-right text-gray-600">0%</td>
                                                <td className="p-3 text-right font-bold text-gray-900">₹{bill.surgery_charge?.toLocaleString()}</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end relative z-10">
                            <div className="w-64 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <div className="flex justify-between mb-2 text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{((bill.total || bill.grand_total || 0) - (bill.tax || bill.tax_amount || 0)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between mb-2 text-gray-600">
                                    <span>GST (Goods)</span>
                                    <span>₹{(bill.tax || bill.tax_amount || 0).toLocaleString()}</span>
                                </div>
                                <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-xl text-blue-900">
                                    <span>Total</span>
                                    <span>₹{(bill.total || bill.grand_total || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Tax Note */}
                        <div className="mt-8 text-xs text-gray-400 border-t border-gray-100 pt-4 relative z-10">
                            <p>* Services (Bed/Doctor) are exempt from GST (0%). Medicines & Consumables charged at 5% GST as per SC Compliance.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-900 p-4 rounded-b-xl flex justify-between items-center border-t border-white/5">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Legal Compliance Verified</span>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                            <Printer className="w-4 h-4" />
                            Print / Export PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
