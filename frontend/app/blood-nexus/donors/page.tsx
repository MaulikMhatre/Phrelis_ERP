"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, 
  UserPlus, 
  Search, 
  Heart, 
  Phone, 
  Droplets, 
  ArrowLeft,
  Filter,
  MoreVertical,
  PlusCircle,
  Database,
  ShieldCheck,
  Calendar,
  ArrowRight,
  TrendingUp,
  X,
  Copy
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"

interface Donor {
  id: string
  name: string
  blood_group: string
  contact_info: string
  last_donation_date: string | null
  total_units_donated: number
}

export default function DonorRegistry() {
  const { token } = useAuth()
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDonor, setNewDonor] = useState({ name: "", blood_group: "O+", contact_info: "" })

  useEffect(() => {
    fetchDonors()
  }, [])

  const fetchDonors = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/blood/donors", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      setDonors(data)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("http://localhost:8000/api/blood/donors", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(newDonor)
      })
      if (res.ok) {
        toast.success("Donor Registered Successfully")
        setShowAddModal(false)
        setNewDonor({ name: "", blood_group: "O+", contact_info: "" })
        fetchDonors()
      }
    } catch (e) {
      toast.error("Registration Failed")
    }
  }

  const handleDonateTrigger = async (donorId: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/blood/donate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ donor_id: donorId })
      })
      if (res.ok) {
        toast.success("Blood Bag Generated")
        fetchDonors()
      } else {
        const err = await res.json()
        toast.error(err.detail || "Donation Failed")
      }
    } catch (e) {
      toast.error("Donation logic failed")
    }
  }

  const filteredDonors = donors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.blood_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      {/* Header Area */}
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-12">
        <div>
          <Link href="/blood-nexus/manager" className="flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Return to Terminal</span>
          </Link>
          <h1 className="text-5xl font-black tracking-tighter flex items-center gap-4">
            <Users className="text-indigo-500 w-12 h-12" />
            DONOR REGISTRY
          </h1>
          <p className="text-white/40 mt-2 font-medium tracking-wide">Centralized Biological Asset Management System</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs"
        >
          <UserPlus className="w-5 h-5" /> Enroll New Donor
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Statistics Bar */}
        <div className="col-span-12 grid grid-cols-4 gap-4 mb-4">
           {[
             { label: "Registered Donors", val: donors.length, icon: Users, color: "text-indigo-500" },
             { label: "Total Units", val: donors.reduce((a, b) => a + b.total_units_donated, 0), icon: Droplets, color: "text-red-500" },
             { label: "Active Cohort", val: donors.length, icon: TrendingUp, color: "text-emerald-500" },
             { label: "Safety Verified", val: "100%", icon: ShieldCheck, color: "text-blue-500" }
           ].map((stat, i) => (
             <div key={i} className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl flex items-center gap-6">
                <div className={`p-4 rounded-2xl bg-black border border-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
                   <p className="text-2xl font-black">{stat.val}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="col-span-12 bg-white/[0.02] border border-white/10 rounded-3xl p-4 flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="QUERY BY NAME, GROUP, OR ID CODE..." 
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-16 pr-6 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-all placeholder:text-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-6 bg-white/[0.05] border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4 text-white/40" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Sorting: A-Z</span>
          </button>
        </div>

        {/* Donor List */}
        <div className="col-span-12 grid grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDonors.map((donor, idx) => (
              <motion.div 
                key={donor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                   <Users className="w-32 h-32" />
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-black border border-white/10 rounded-2xl flex items-center justify-center text-2xl font-black text-indigo-400">
                    {donor.blood_group}
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[11px] font-black bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-l-full uppercase tracking-widest font-mono border border-indigo-500/20 select-all">
                      {donor.id}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(donor.id);
                        toast.success("ID Copied");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white p-[7px] rounded-r-xl transition-all active:scale-90 flex items-center justify-center border border-indigo-500/20 border-l-0"
                      title="Copy ID"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black uppercase tracking-tight mb-1 truncate">{donor.name}</h3>
                <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase mb-6">
                  <Phone className="w-3 h-3" /> {donor.contact_info}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase mb-1">Last Date</p>
                    <p className="text-[10px] font-bold text-white/60">
                      {donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'NEVER'}
                    </p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase mb-1">Donations</p>
                    <p className="text-[10px] font-bold text-white/60">{donor.total_units_donated} UNIT(S)</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleDonateTrigger(donor.id)}
                  className="w-full py-4 bg-white/5 hover:bg-red-500 group-hover:text-white text-white/40 font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5 hover:border-red-400 shadow-xl shadow-transparent hover:shadow-red-500/10 flex items-center justify-center gap-2"
                >
                  <Droplets className="w-3 h-3" /> Initiate Donation
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Donor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
               onClick={() => setShowAddModal(false)} 
             />
             <motion.form 
               onSubmit={handleRegister}
               initial={{ opacity: 0, scale: 0.9 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.9 }} 
               className="bg-card border border-white/10 rounded-[3rem] p-10 max-w-lg w-full relative z-10 shadow-2xl"
             >
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                      <UserPlus className="text-indigo-500" /> New Enrollment
                    </h2>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Biological Database Interface</p>
                  </div>
                  <button type="button" onClick={() => setShowAddModal(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10"><X size={20}/></button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block">Citizen Full Name</label>
                    <input 
                      required
                      className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 focus:outline-none transition-all"
                      value={newDonor.name}
                      onChange={(e) => setNewDonor({...newDonor, name: e.target.value.toUpperCase()})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block">Blood Group</label>
                      <select 
                        className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 focus:outline-none transition-all uppercase"
                        value={newDonor.blood_group}
                        onChange={(e) => setNewDonor({...newDonor, blood_group: e.target.value})}
                      >
                         {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block">Comms Contact</label>
                      <input 
                        required
                        className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 focus:outline-none transition-all"
                        value={newDonor.contact_info}
                        onChange={(e) => setNewDonor({...newDonor, contact_info: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-3xl text-xs uppercase tracking-[0.3em] transition-all shadow-2xl shadow-indigo-600/20"
                >
                  Commit to Registry
                </button>
             </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
