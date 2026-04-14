"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, 
  Map, 
  Trophy, 
  PlusCircle, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  ChevronRight,
  ClipboardCheck,
  Award,
  Download,
  Search,
  CheckCircle,
  Clock
} from "lucide-react"

// --- Types ---
interface Camp {
  id: number
  location: string
  date: string
  status: string
  units_collected: number
  description: string
}

interface Donor {
  id: string
  name: string
  blood_group: string
  total_units_donated: number
  associated_ngo_id: string
}

export default function NGODashboard() {
  const [camps, setCamps] = useState<Camp[]>([])
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [showRegForm, setShowRegForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'map' | 'donors' | 'camps'>('map')
  
  // Form State
  const [newDonor, setNewDonor] = useState({ name: "", blood_group: "O+", contact_info: "" })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [cRes, dRes] = await Promise.all([
        fetch("http://localhost:8000/api/blood/camps"),
        fetch("http://localhost:8000/api/blood/donors")
      ])
      const cData = await cRes.json()
      const dData = await dRes.json()
      setCamps(cData)
      setDonors(dData)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("http://localhost:8000/api/blood/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newDonor, associated_ngo_id: "NGO-01" }) // Hardcoded for demo
      })
      if (res.ok) {
        setShowRegForm(false)
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDownloadCert = async (donorId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/blood/certificate/${donorId}`)
      const data = await res.json()
      // In a real app, this would trigger a PDF/Image generation
      alert(`Certificate for ${data.donor_name} is being generated!\nCert No: ${data.cert_no}`)
    } catch (err) {
      console.error(err)
    }
  }

  const totalCollected = camps.reduce((acc, curr) => acc + (curr.units_collected || 0), 0)
  const safePercentage = 94.2 // Mocked for UI

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      {/* NGO Header */}
      <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blood-safe/10 border border-blood-safe/30 rounded-lg">
              <Users className="text-blood-safe w-6 h-6" />
            </div>
            <span className="text-xs font-black text-blood-safe tracking-[0.2em] uppercase">NGO Partner Portal</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">
            PHRELIS <span className="text-white/20">OUTREACH</span>
          </h1>
          <p className="text-white/40 mt-2 font-medium">Coordinating high-impact donation camps globally.</p>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
             <p className="text-[10px] text-white/40 uppercase font-black mb-1">Total Impact</p>
             <p className="text-3xl font-black text-white leading-none">{totalCollected} <span className="text-xs text-blood-critical uppercase">Units</span></p>
          </div>
          <div className="w-[1px] h-12 bg-white/10 self-center" />
          <div className="text-right">
             <p className="text-[10px] text-white/40 uppercase font-black mb-1">Safety Rating</p>
             <p className="text-3xl font-black text-blood-safe leading-none">{safePercentage}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="col-span-3 space-y-4">
          {[
            { id: 'map', label: 'Outreach Map', icon: Map },
            { id: 'camps', label: 'Camp Management', icon: Calendar },
            { id: 'donors', label: 'Donor Registry', icon: Users },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full text-left p-5 rounded-2xl flex items-center justify-between group transition-all duration-300 border ${
                activeTab === item.id 
                ? 'bg-white text-black border-white' 
                : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon className="w-6 h-6" />
                <span className="font-bold uppercase tracking-widest text-sm">{item.label}</span>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform ${activeTab === item.id ? 'translate-x-1' : ''}`} />
            </button>
          ))}

          <div className="mt-12 p-6 rounded-3xl bg-gradient-to-br from-blood-critical/20 to-transparent border border-blood-critical/30 relative overflow-hidden group">
             <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Trophy className="w-32 h-32" />
             </div>
             <h3 className="font-black text-lg mb-2 relative z-10 uppercase italic">Leaderboard</h3>
             <p className="text-xs text-white/50 mb-6 relative z-10 leading-relaxed">Top NGO partners by safe unit collection this month.</p>
             
             <div className="space-y-4 relative z-10">
                {[
                  { name: "Red Cross", units: 1420, active: true },
                  { name: "Blood Warriors", units: 1250 },
                  { name: "Phrelis Care", units: 980 },
                ].map((ngo, idx) => (
                  <div key={ngo.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-white/20">0{idx+1}</span>
                      <span className={`text-sm font-bold ${ngo.active ? 'text-white' : 'text-white/40'}`}>{ngo.name}</span>
                    </div>
                    <span className="text-xs font-mono text-blood-critical">{ngo.units}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="col-span-9 bg-white/[0.02] border border-white/5 rounded-[40px] p-10 overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div
                key="map-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-4xl font-black italic">GLOBAL REACH</h2>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs font-black text-blood-safe">
                      <div className="w-2 h-2 rounded-full bg-blood-safe animate-pulse" /> ACTIVE CAMPS
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-white/30">
                      <div className="w-2 h-2 rounded-full bg-white/20" /> SCHEDULED
                    </div>
                  </div>
                </div>

                {/* SVG Map Visualization */}
                <div className="w-full h-96 relative bg-white/5 rounded-3xl border border-white/10 p-8 flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                   
                   {/* Representative Points */}
                   {[
                     { x: '20%', y: '30%', label: 'Downtown Center', active: true },
                     { x: '45%', y: '60%', label: 'University Hub', active: true },
                     { x: '70%', y: '40%', label: 'East Side Clinic', active: false },
                     { x: '80%', y: '75%', label: 'Corporate Park', active: false }
                   ].map((pt, idx) => (
                     <motion.div
                       key={idx}
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       transition={{ delay: idx * 0.2 }}
                       style={{ left: pt.x, top: pt.y }}
                       className="absolute"
                     >
                        <div className={`relative group`}>
                           <div className={`w-4 h-4 rounded-full border-2 border-black ${pt.active ? 'bg-blood-safe animate-ping absolute' : 'bg-white/20'}`} />
                           <div className={`w-4 h-4 rounded-full border-2 border-black relative ${pt.active ? 'bg-blood-safe' : 'bg-white/20'}`} />
                           
                           <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white text-black text-[10px] font-black px-2 py-1 rounded">
                             {pt.label}
                           </div>
                        </div>
                     </motion.div>
                   ))}

                   <div className="text-64 font-black text-white/[0.03] select-none pointer-events-none absolute inset-0 flex items-center justify-center uppercase tracking-[0.4em] leading-none">
                     Operational<br/>Network
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-8">
                   {[
                     { label: "Scheduled This Week", value: "12 Camps", icon: MapPin },
                     { label: "Volunteer Reach", value: "4.2k+", icon: Users },
                     { label: "Blood Units Goal", value: "85%", icon: TrendingUp },
                   ].map((stat) => (
                     <div key={stat.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <stat.icon className="w-6 h-6 text-blood-safe mb-4" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black">{stat.value}</p>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'donors' && (
              <motion.div
                key="donor-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col"
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-4xl font-black italic uppercase">Donor Registry</h2>
                  <button 
                    onClick={() => setShowRegForm(true)}
                    className="px-6 py-3 bg-blood-safe hover:bg-emerald-600 text-black font-black rounded-xl transition-all flex items-center gap-2 group"
                  >
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" /> PRE-REGISTER DONOR
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                   {donors.map((donor) => (
                     <div key={donor.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all hover:translate-x-1">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 bg-blood-critical/10 border border-blood-critical/30 rounded-full flex items-center justify-center font-black text-blood-critical">
                             {donor.blood_group}
                           </div>
                           <div>
                              <p className="font-black text-lg">{donor.name}</p>
                              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{donor.id}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-10">
                           <div className="text-center">
                              <p className="text-[10px] font-black text-white/40 uppercase">Total Points</p>
                              <p className="font-mono text-blood-safe font-black">{donor.total_units_donated * 100}</p>
                           </div>
                           
                           <button 
                             onClick={() => handleDownloadCert(donor.id)}
                             className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
                            >
                             <Award className="w-5 h-5 text-white group-hover:text-blood-quarantine transition-colors" />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'camps' && (
              <motion.div
                key="camp-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full"
              >
                 <div className="flex justify-between items-center mb-10">
                  <h2 className="text-4xl font-black italic uppercase">Event Pipeline</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   {camps.map((camp) => (
                     <div key={camp.id} className="p-8 rounded-3xl bg-white/5 border border-white/10 relative group overflow-hidden">
                        <div className={`absolute top-0 right-0 p-6 text-[10px] font-black uppercase tracking-widest ${camp.status === 'Approved' ? 'text-blood-safe' : 'text-blood-quarantine'}`}>
                          {camp.status}
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                           <MapPin className="text-white/30 w-5 h-5" />
                           <h3 className="text-2xl font-black tracking-tight">{camp.location}</h3>
                        </div>

                        <div className="flex gap-8 mb-8">
                           <div>
                              <p className="text-[10px] font-black text-white/40 uppercase mb-1">Target Date</p>
                              <p className="font-bold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-white/40" />
                                {new Date(camp.date).toLocaleDateString()}
                              </p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-white/40 uppercase mb-1">Yield Predicted</p>
                              <p className="font-bold text-blood-critical leading-none">40 Units+</p>
                           </div>
                        </div>

                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                           VIEW COMPONENT LOGS <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Registration Modal Overlay */}
      <AnimatePresence>
        {showRegForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-zinc-900 rounded-[40px] border border-white/10 p-12 relative shadow-2xl"
            >
              <button onClick={() => setShowRegForm(false)} className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors">
                <PlusCircle className="w-8 h-8 rotate-45" />
              </button>

              <h2 className="text-4xl font-black mb-2 italic">ENLIST DONOR</h2>
              <p className="text-white/40 text-sm mb-10 font-medium tracking-tight">Expand the network. Save more lives.</p>

              <form onSubmit={handleRegisterDonor} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 block">Full Legal Name</label>
                  <input
                    required
                    value={newDonor.name}
                    onChange={(e) => setNewDonor({...newDonor, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blood-safe transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 block">Blood Group</label>
                    <select
                      value={newDonor.blood_group}
                      onChange={(e) => setNewDonor({...newDonor, blood_group: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blood-safe transition-colors appearance-none"
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 block">Contact Ph</label>
                    <input
                      required
                      value={newDonor.contact_info}
                      onChange={(e) => setNewDonor({...newDonor, contact_info: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blood-safe transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-12 py-5 bg-blood-safe hover:bg-emerald-600 text-black font-black rounded-3xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                >
                  CONFIRM MEMBERSHIP
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
