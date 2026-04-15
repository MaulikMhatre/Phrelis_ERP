"use client"

import { useState, useEffect } from "react"
import { endpoints } from "@/utils/api"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Droplets, 
  RotateCw, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Bell, 
  ChevronRight,
  Filter,
  Activity,
  Calendar,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  User,
  Heart,
  Plus,
  Stethoscope,
  Users
} from "lucide-react"
import Link from "next/link"


// --- Types ---
interface BloodBag {
  bag_id: string
  donor_id: string
  blood_group: string
  component_type: string
  expiry_date: string
  status: string
  is_tested: boolean
  test_results: any
}

interface BloodRequest {
  id: number
  patient_id: string
  required_component: string
  blood_group: string
  units_needed: number
  urgency_level: string
  status: string
  created_at: string
}

export default function BloodManagerDashboard() {
  const [inventory, setInventory] = useState<BloodBag[]>([])
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [splittingBag, setSplittingBag] = useState<string | null>(null)
  const [isCentrifuging, setIsCentrifuging] = useState(false)
  const [selectedBag, setSelectedBag] = useState<BloodBag | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null)
  const [fefoSuggestion, setFefoSuggestion] = useState<BloodBag | null>(null)
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [showDonateForm, setShowDonateForm] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [donorIdInput, setDonorIdInput] = useState("")
  const [verificationResults, setVerificationResults] = useState<Record<string, string>>({
    HIV: "pass",
    HepB: "pass",
    HepC: "pass",
    Syphilis: "pass",
    Malaria: "pass"
  })
  
  // Simulation Form State
  const [simReq, setSimReq] = useState({ patient_id: "P-SIM-99", component: "RBC", group: "O-", urgency: "STAT" })

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    
    // Real-time updates
    const ws = new WebSocket("ws://localhost:8000/ws")
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === "QUEUE_UPDATE" || msg.type === "EXPIRY_CLEANUP") {
          fetchData()
        }
      } catch (e) {}
    }
    
    return () => {
      clearInterval(interval)
      ws.close()
    }
  }, [])

  useEffect(() => {
    if (selectedBag) {
      setVerificationResults({
        HIV: "pass",
        HepB: "pass",
        HepC: "pass",
        Syphilis: "pass",
        Malaria: "pass"
      })
    }
  }, [selectedBag])

  const fetchData = async () => {
    try {
      const [invRes, reqRes] = await Promise.all([
        fetch("http://localhost:8000/api/blood/inventory"),
        fetch("http://localhost:8000/api/blood/requests")
      ])
      const invData = await invRes.json()
      const reqData = await reqRes.json()
      setInventory(invData)
      setRequests(reqData)
    } finally {
      setLoading(false)
    }
  }

  const handleSimulateRequest = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/blood/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: simReq.patient_id,
          required_component: simReq.component,
          blood_group: simReq.group,
          units_needed: 1,
          urgency_level: simReq.urgency
        })
      })
      if (res.ok) {
        setShowRequestForm(false)
        fetchData()
        setBroadcastMessage("Emergency Request Generated and Dispatched to Manager Terminal.")
        setTimeout(() => setBroadcastMessage(""), 4000)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDonate = async () => {
    if (!donorIdInput) return
    try {
      const res = await fetch("http://localhost:8000/api/blood/donate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ donor_id: donorIdInput })
      })
      if (res.ok) {
        setDonorIdInput("")
        setShowDonateForm(false)
        fetchData()
      } else {
        alert("Donor ID not found. Ensure donor is registered in the Donor Registry.")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSplit = async (bagId: string) => {
    setSplittingBag(bagId)
    setIsCentrifuging(true)
    
    setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/blood/split/${bagId}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
        if (res.ok) {
          fetchData()
        }
      } finally {
        setIsCentrifuging(false)
        setSplittingBag(null)
      }
    }, 4500)
  }

  const handleVerifyTest = async (bagId: string, results: any) => {
    try {
      const res = await fetch(`http://localhost:8000/api/blood/verify-test/${bagId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(results)
      })
      if (res.ok) {
        fetchData()
        setSelectedBag(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleFulfillRequest = async (requestId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/blood/suggest/${requestId}`)
      const data = await res.json()
      setSelectedRequest(data.request)
      setFefoSuggestion(data.suggested_bag)
    } catch (e) {
      console.error(e)
    }
  }

  const confirmFulfillment = async () => {
    if (!selectedRequest || !fefoSuggestion) return
    
    try {
      const res = await fetch(endpoints.bloodReserve, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          bag_id: fefoSuggestion.bag_id,
          patient_id: selectedRequest.patient_id
        })
      })
      if (res.ok) {
        setBroadcastMessage("SUCCESS: Unit allocated via FEFO protocol.")
        setTimeout(() => setBroadcastMessage(""), 4000)
        setSelectedRequest(null)
        setFefoSuggestion(null)
        fetchData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getExpiryColor = (expiryDate: string) => {
    const hours = (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    if (hours < 0) return "bg-gray-800 text-gray-400"
    if (hours < 48) return "bg-blood-critical/20 text-blood-critical border-blood-critical animate-pulse"
    if (hours < 168) return "bg-blood-quarantine/20 text-blood-quarantine border-blood-quarantine"
    return "bg-blood-safe/20 text-blood-safe border-blood-safe"
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <Droplets className="text-blood-critical w-10 h-10" />
            BLOOD-NEXUS <span className="text-white/30 text-xl font-mono ml-4 uppercase tracking-[0.2em]">Manager Terminal</span>
          </h1>
          <p className="text-white/40 mt-1 font-medium italic">High-Stakes Biological Inventory & Fulfillment Center</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setShowRequestForm(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all uppercase tracking-widest text-[10px]"
          >
            <Stethoscope className="w-4 h-4" /> Simulate Emergency
          </button>
          <button 
            onClick={() => setShowDonateForm(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all uppercase tracking-widest text-[10px]"
          >
            <Plus className="w-4 h-4" /> Quick Donation
          </button>
          <Link 
            href="/blood-nexus/donors"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 transition-all uppercase tracking-widest text-xs"
          >
            <Users className="w-5 h-5" /> Donor Registry
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="col-span-8 space-y-8">
          
          {/* Incoming Requests (Fulfillment Desk) */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Bell className="text-blood-critical w-6 h-6 animate-pulse" /> INCOMING FULFILLMENT REQUESTS
              </h2>
              <span className="bg-blood-critical/20 text-blood-critical text-[10px] font-black px-3 py-1 rounded-full uppercase">
                {requests.filter(r => r.urgency_level === 'STAT' && r.status === 'OPEN').length} STAT ALERTS
              </span>
            </div>

            <div className="space-y-4">
              {requests.filter(r => r.status === 'OPEN').map((req) => (
                <div key={req.id} className="group p-5 rounded-2xl bg-black border border-white/5 hover:border-blood-critical/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${req.urgency_level === 'STAT' ? 'bg-blood-critical text-white' : 'bg-white/10 text-white/40'}`}>
                      {req.blood_group}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-black text-lg uppercase">{req.required_component}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${req.urgency_level === 'STAT' ? 'bg-blood-critical/20 text-blood-critical' : 'bg-white/10 text-white/40'}`}>
                          {req.urgency_level}
                        </span>
                      </div>
                      <p className="text-xs text-white/30 font-mono tracking-widest uppercase">PATIENT: {req.patient_id} | UNITS: {req.units_needed}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleFulfillRequest(req.id)}
                    className="px-6 py-3 bg-blood-critical hover:bg-red-700 text-white font-black rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                  >
                    Fulfill Request <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {requests.filter(r => r.status === 'OPEN').length === 0 && (
                <div className="text-center py-10 opacity-20 border-2 border-dashed border-white/10 rounded-2xl">
                  <p className="font-mono text-sm uppercase tracking-widest italic">No active fulfillment orders.</p>
                </div>
              )}
            </div>
          </div>

          {/* Live Fridge (Bento Grid) */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Activity className="text-blood-safe" /> LIVE FRIDGE INVENTORY
              </h2>
              <div className="flex gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                 FRIDGE SERIAL #PH-NX-001
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 custom-scrollbar max-h-[50vh] overflow-y-auto pr-2">
              <AnimatePresence>
                {inventory.filter(bag => bag.status === 'Available' || bag.status === 'Quarantine').map((bag) => (
                  <motion.div
                    key={bag.bag_id}
                    layoutId={bag.bag_id}
                    onClick={() => setSelectedBag(bag)}
                    className={`relative p-5 rounded-2xl border cursor-pointer hover:border-white/40 transition-all group overflow-hidden ${
                      bag.status === 'Quarantine' ? 'bg-blood-quarantine/5 border-blood-quarantine/30' : 
                      bag.status === 'Available' ? 'bg-blood-safe/5 border-blood-safe/30' : 
                      bag.status === 'Reserved' ? 'bg-blue-500/5 border-blue-500/30' :
                      bag.status === 'Wasted' ? 'bg-white/5 border-white/10 grayscale opacity-40' :
                      'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded uppercase tracking-widest text-white/60">
                          {bag.component_type}
                        </span>
                        <h3 className="text-2xl font-mono font-black mt-1 text-white">{bag.blood_group}</h3>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${getExpiryColor(bag.expiry_date)}`}>
                        {bag.status}
                      </div>
                    </div>

                    <div className="font-mono text-[9px] text-white/30 mb-4 tracking-tighter">ID: {bag.bag_id}</div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        EXP: {new Date(bag.expiry_date).toLocaleDateString()}
                      </div>
                      
                      {bag.component_type === "Whole Blood" && bag.status === "Available" && !isCentrifuging && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSplit(bag.bag_id)
                          }}
                          className="p-2 bg-blood-safe/10 hover:bg-blood-safe text-black transition-colors rounded-lg border border-blood-safe/20 group/btn"
                        >
                          <RotateCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="col-span-4 space-y-6">
          
          {/* Simulation Form Overlay */}
          <AnimatePresence>
            {showRequestForm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/20 backdrop-blur-xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-white">
                    <Stethoscope className="w-5 h-5 text-indigo-400" /> Surgeon Request
                  </h3>
                  <button onClick={() => setShowRequestForm(false)} className="text-white/30 hover:text-white transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase mb-2 block">Patient Reference</label>
                    <input value={simReq.patient_id} onChange={(e) => setSimReq({...simReq, patient_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black text-white/40 uppercase mb-2 block">Component</label>
                       <select value={simReq.component} onChange={(e) => setSimReq({...simReq, component: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs uppercase">
                         <option>RBC</option><option>Plasma</option><option>Platelets</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-white/40 uppercase mb-2 block">Blood Group</label>
                       <select value={simReq.group} onChange={(e) => setSimReq({...simReq, group: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs">
                         {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => <option key={g}>{g}</option>)}
                       </select>
                     </div>
                  </div>
                </div>

                <button 
                  onClick={handleSimulateRequest}
                  className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all"
                >
                  Confirm Emergency Signal
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Donation Form Overlay */}
          <AnimatePresence>
            {showDonateForm && !showRequestForm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-3xl bg-blood-safe/10 border border-blood-safe/30 backdrop-blur-xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-blood-safe">
                    <Heart className="w-5 h-5" /> New Donation
                  </h3>
                  <button onClick={() => setShowDonateForm(false)} className="text-white/30 hover:text-white transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Donor ID REFERENCE</p>
                <input 
                  value={donorIdInput}
                  onChange={(e) => setDonorIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. D-101" 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-blood-safe transition-colors mb-4"
                />
                <button 
                  onClick={handleDonate}
                  className="w-full py-4 bg-blood-safe hover:bg-emerald-600 text-black font-black rounded-xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blood-safe/20"
                >
                  Generate Blood Bag
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fulfillment Modal (Dynamic) */}
          <AnimatePresence>
            {selectedRequest && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-3xl bg-white text-black shadow-2xl relative overflow-hidden ring-4 ring-blood-critical/20"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Heart className="w-32 h-32 text-red-600" />
                </div>
                
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Fulfillment Suggestion</h3>
                <p className="text-black/40 text-xs font-bold mb-8 italic">Phrelis FEFO Protocol Active</p>

                {fefoSuggestion ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-black/5 rounded-2xl border border-black/10">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center font-black text-white text-xl">
                        {fefoSuggestion.blood_group}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-black/40 uppercase mb-0.5">Recommended Bag</p>
                        <p className="font-black font-mono">{fefoSuggestion.bag_id}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                       <div className="flex items-center justify-between text-[10px] font-black text-emerald-600 uppercase">
                          <span>Expiry Compliance</span>
                          <span>Passed</span>
                       </div>
                       <div className="flex items-center justify-between text-[10px] font-black text-emerald-600 uppercase">
                          <span>Biological Compatibility</span>
                          <span>Verified</span>
                       </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSelectedRequest(null)}
                        className="flex-1 py-4 bg-black/5 hover:bg-black/10 text-black font-black rounded-2xl text-xs uppercase transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={confirmFulfillment}
                        className="flex-[2] py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-red-600/20"
                      >
                        Confirm Dispatch
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 opacity-50">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                    <p className="text-sm font-black uppercase">No compatible units found in current inventory.</p>
                    <button onClick={() => setSelectedRequest(null)} className="mt-6 text-xs font-black uppercase underline decoration-2 underline-offset-4">Close Terminal</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Biological Verification Modal */}
          <AnimatePresence>
            {selectedBag && selectedBag.status === "Quarantine" && !selectedRequest && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 rounded-3xl bg-blood-quarantine/10 border border-blood-quarantine/30"
              >
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="text-blood-quarantine w-6 h-6" />
                  <h3 className="text-xl font-black uppercase tracking-tighter">Verification Gate</h3>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    { id: "HIV", label: "HIV" },
                    { id: "HepB", label: "Hep-B" },
                    { id: "HepC", label: "Hep-C" },
                    { id: "Syphilis", label: "Syphilis" },
                    { id: "Malaria", label: "Malaria" }
                  ].map(test => (
                    <div key={test.id} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                      <span className="text-xs font-black text-white/60">{test.label} MARKER</span>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => setVerificationResults(prev => ({ ...prev, [test.id]: 'pass' }))}
                           className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                             verificationResults[test.id] === 'pass' 
                             ? 'bg-blood-safe text-black shadow-lg shadow-blood-safe/20' 
                             : 'bg-white/5 text-white/20 hover:bg-blood-safe/20 hover:text-blood-safe'
                           }`}
                         >
                           <CheckCircle2 className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => setVerificationResults(prev => ({ ...prev, [test.id]: 'fail' }))}
                           className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                             verificationResults[test.id] === 'fail' 
                             ? 'bg-blood-critical text-white shadow-lg shadow-blood-critical/20' 
                             : 'bg-white/5 text-white/20 hover:bg-blood-critical/20 hover:text-blood-critical'
                           }`}
                         >
                           <XCircle className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handleVerifyTest(selectedBag.bag_id, verificationResults)}
                  className="w-full py-4 bg-blood-quarantine hover:bg-amber-600 text-black font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-600/20"
                >
                  {Object.values(verificationResults).every(v => v === 'pass') ? 'Confirm Clearance' : 'Mark as Wasted'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Statistics Card */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
             <h3 className="text-lg font-black mb-6 uppercase tracking-wider flex items-center gap-2">
               <Activity className="w-5 h-5 text-blood-safe" /> System Load
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                   <p className="text-[9px] font-black text-white/30 uppercase mb-1">Stock</p>
                   <p className="text-2xl font-black">{inventory.filter(b => b.status === 'Available').length} U</p>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                   <p className="text-[9px] font-black text-white/30 uppercase mb-1">Requests</p>
                   <p className="text-2xl font-black text-blood-critical">{requests.filter(r => r.status === 'OPEN').length}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Cinematic Centrifuge Overlay */}
      <AnimatePresence>
        {isCentrifuging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl"
          >
            <div className="text-center">
               <motion.div
                  animate={{ rotate: 360 * 6, scale: [1, 1.2, 1] }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="w-80 h-80 rounded-full border-[10px] border-blood-critical/10 flex items-center justify-center relative mb-12"
               >
                  <div className="w-64 h-64 border-4 border-dashed border-blood-safe/20 rounded-full animate-spin-slow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Droplets className="w-20 h-20 text-blood-critical animate-pulse" />
                  </div>
                  
                  {/* Cinematic Icons Orbiting */}
                  <motion.div animate={{ opacity: [0, 1], scale: [0.5, 1.5], y: [-150] }} transition={{ delay: 1 }} className="absolute bg-black p-3 border border-blood-critical/30 rounded-xl"><Droplets className="text-blood-critical w-6 h-6" /></motion.div>
                  <motion.div animate={{ opacity: [0, 1], scale: [0.5, 1.5], x: [150], y: [100] }} transition={{ delay: 1.5 }} className="absolute bg-black p-3 border border-blue-500/30 rounded-xl"><Heart className="text-blue-500 w-6 h-6" /></motion.div>
                  <motion.div animate={{ opacity: [0, 1], scale: [0.5, 1.5], x: [-150], y: [100] }} transition={{ delay: 2 }} className="absolute bg-black p-3 border border-amber-500/30 rounded-xl"><Zap className="text-amber-500 w-6 h-6" /></motion.div>
               </motion.div>
               
               <h2 className="text-5xl font-black italic tracking-tighter mb-4">CENTRIFUGE ACTIVE</h2>
               <p className="text-white/30 font-mono text-sm uppercase tracking-[0.4em]">Biologic separation in progress...</p>
               
               <div className="w-80 h-1 bg-white/5 rounded-full mx-auto mt-12 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4 }}
                    className="h-full bg-blood-critical"
                  />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Toast Notification */}
      <AnimatePresence>
        {broadcastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-blood-safe/30 shadow-2xl shadow-blood-safe/20 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-blood-safe/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blood-safe" />
            </div>
            <p className="font-black text-sm uppercase tracking-widest text-white">{broadcastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}
