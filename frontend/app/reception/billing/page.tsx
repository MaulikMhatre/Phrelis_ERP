"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Receipt, IndianRupee, Send, CheckCircle2, Search, Filter, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, endpoints } from '@/utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface PendingBill {
  bill_no: string;
  admission_uid: string;
  patient_name: string;
  total_amount: number;
  grand_total: number;
  generated_at: string;
}

export default function ReceptionBillingPage() {
  const { role, hasAccess, token } = useAuth();
  const [bills, setBills] = useState<PendingBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, 'idle' | 'sending' | 'sent'>>({});
  const [settling, setSettling] = useState<string | null>(null);
  const [contactInputs, setContactInputs] = useState<Record<string, string>>({});

  // 1. Role-Locked Access Control
  const isAuthorized = useMemo(() => hasAccess(['Admin', 'Receptionist']), [hasAccess]);

  useEffect(() => {
    if (isAuthorized) {
      fetchBills();
    }
  }, [isAuthorized]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await fetch(endpoints.pendingBills, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch pending bills');
      const data = await res.json();
      setBills(data);
    } catch (error) {
      console.error(error);
      toast.error('Financial Engine Sync Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBill = async (bill: PendingBill) => {
    const destination = contactInputs[bill.bill_no] || '';
    if (!destination) {
      toast.error('Enter Phone or Email for Dispatch');
      return;
    }

    setDispatchStatus(prev => ({ ...prev, [bill.bill_no]: 'sending' }));
    try {
      const res = await fetch(endpoints.sendDigitalBill, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bill_no: bill.bill_no,
          destination,
          channel: destination.includes('@') ? 'email' : 'whatsapp'
        })
      });

      if (!res.ok) throw new Error('Dispatch failed');
      
      setDispatchStatus(prev => ({ ...prev, [bill.bill_no]: 'sent' }));
      toast.success(`Bill Dispatched to ${destination}`);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setDispatchStatus(prev => ({ ...prev, [bill.bill_no]: 'idle' }));
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error('WhatsApp Gateway Error');
      setDispatchStatus(prev => ({ ...prev, [bill.bill_no]: 'idle' }));
    }
  };

  const handleSettlePayment = async (bill: PendingBill) => {
    setSettling(bill.bill_no);
    try {
      const res = await fetch(endpoints.settlePayment(bill.bill_no), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          method: 'DIGITAL_PAY', // Standard for this desk
          contact_info: contactInputs[bill.bill_no] || null
        })
      });

      if (!res.ok) throw new Error('Settlement failed');
      
      const result = await res.json();
      
      // Animation handled by AnimatePresence on the filtered list
      setBills(prev => prev.filter(b => b.bill_no !== bill.bill_no));
      toast.success('Bill Archived to Ledger', {
        icon: '📚',
        style: {
          background: '#064e3b',
          color: '#10b981',
          border: '1px solid #065f46'
        }
      });
    } catch (error) {
      console.error(error);
      toast.error('Financial Settlement Failed');
    } finally {
      setSettling(null);
    }
  };

  const filteredBills = bills.filter(b => 
    b.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.admission_uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.bill_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnpaidRevenue = bills.reduce((sum, b) => sum + b.grand_total, 0);

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-md text-center"
        >
          <div className="bg-red-500/10 p-4 rounded-full mb-6">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Restricted Access</h1>
          <p className="text-slate-400 font-medium">
            This terminal belongs to the <span className="text-white">Financial Desk</span>. 
            Only <span className="text-emerald-500">Receptionists</span> and <span className="text-emerald-500">Admins</span> are authorized to execute billing transactions.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="mt-8 bg-white text-black font-black px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors uppercase text-sm tracking-widest"
          >
            Terminal Exit
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 custom-scrollbar">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Receipt size={18} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Financial Intelligence Unit</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-4">Financial Desk</h1>
          <p className="text-slate-500 max-w-lg font-medium leading-relaxed">
            Monitor and settle pending liabilities in real-time. Archived records are synchronized with the Phrelis Global Ledger.
          </p>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl backdrop-blur-md min-w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-500/70 uppercase tracking-widest">Unpaid Revenue</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-500 tracking-tighter">
              ₹{totalUnpaidRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-slate-600 font-black text-sm uppercase">STP</span>
          </div>
        </div>
      </header>

      {/* Control Bar */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
          <input 
            type="text" 
            placeholder="FILTER BY PATIENT, UID, OR BILL ID..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-sm font-black tracking-widest focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-slate-900 border border-slate-800 px-6 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Filter size={18} className="text-slate-500" />
          <span className="text-xs font-black uppercase tracking-widest">Sort: Newest</span>
        </button>
      </div>

      {/* Pending List */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-600 font-black tracking-[0.3em] uppercase ml-4">Syncing Ledger...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-24 text-center">
            <div className="text-slate-700 mb-4 flex justify-center">
              <CheckCircle2 size={64} />
            </div>
            <h3 className="text-xl font-black uppercase text-slate-500 tracking-widest">All Accounts Settled</h3>
            <p className="text-slate-700 mt-2 font-medium">No pending liabilities found in the current buffer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredBills.map((bill) => (
                <motion.div
                  key={bill.bill_no}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 200, transition: { duration: 0.5 } }}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors"
                >
                  {/* Card Background Glow */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full uppercase tracking-widest mb-3">
                        {bill.bill_no}
                      </span>
                      <h3 className="text-2xl font-black tracking-tight leading-tight uppercase truncate max-w-[200px]">
                        {bill.patient_name}
                      </h3>
                      <p className="text-slate-600 text-xs font-bold font-mono tracking-tighter uppercase mt-1">
                        UID: {bill.admission_uid}
                      </p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-2xl border border-slate-800">
                      <IndianRupee size={20} className="text-emerald-500" />
                    </div>
                  </div>

                  {/* Amount Section */}
                  <div className="bg-black/60 rounded-2xl p-4 mb-6 border border-slate-800/50">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Liability Amount</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white tracking-tighter">₹{bill.grand_total.toLocaleString('en-IN')}</span>
                      <span className="text-slate-700 font-bold text-[10px] uppercase">INC. GST</span>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="space-y-4">
                    <div className="relative overflow-hidden group/input">
                      <input 
                        type="text" 
                        placeholder="PHONE / EMAIL..." 
                        className="w-full bg-black border border-slate-800 rounded-xl py-3 px-4 text-xs font-black tracking-widest focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-slate-700"
                        value={contactInputs[bill.bill_no] || ''}
                        onChange={(e) => setContactInputs(prev => ({ ...prev, [bill.bill_no]: e.target.value.toUpperCase() }))}
                      />
                      <button 
                        onClick={() => handleSendBill(bill)}
                        disabled={dispatchStatus[bill.bill_no] === 'sending'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white p-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                      >
                        {dispatchStatus[bill.bill_no] === 'sending' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : dispatchStatus[bill.bill_no] === 'sent' ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <Send size={16} />
                        )}
                      </button>
                    </div>

                    <button 
                      onClick={() => handleSettlePayment(bill)}
                      disabled={settling === bill.bill_no}
                      className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 group/btn shadow-[0_4px_20px_-5px_rgba(16,185,129,0.3)]"
                    >
                      {settling === bill.bill_no ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <span className="uppercase text-xs tracking-[0.2em]">Confirm Payment</span>
                          <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Timestamp Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
                      Gen: {format(new Date(bill.generated_at), 'dd MMM HH:mm')}
                    </span>
                    <button 
                      onClick={() => window.open(endpoints.printBill(bill.bill_no), '_blank')}
                      className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-500 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
