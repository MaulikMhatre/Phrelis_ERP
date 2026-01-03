// "use client";
// import React, { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { User, Users, Clipboard, Clock, ShieldAlert, ArrowLeft, Bed, Briefcase, CheckCircle } from 'lucide-react';

// const StaffPortal = () => {
//   const [staffList, setStaffList] = useState<any[]>([]);
//   const [stats, setStats] = useState({ nurses_on_shift: 0, doctors_on_shift: 0 });
//   const [assignments, setAssignments] = useState<any[]>([]);
//   const [beds, setBeds] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   // Login Simulation
//   const [currentUser, setCurrentUser] = useState<string | null>(null); // Staff ID
//   const [myDashboard, setMyDashboard] = useState<any>(null);

//   const fetchStaffData = async () => {
//     try {
//       const [staffRes, bedRes] = await Promise.all([
//         fetch('http://localhost:8000/api/staff'),
//         fetch('http://localhost:8000/api/erp/beds')
//       ]);
//       const staffData = await staffRes.json();
//       const bedData = await bedRes.json();
      
//       setStaffList(staffData.staff);
//       setStats(staffData.stats);
//       setAssignments(staffData.assignments);
//       setBeds(bedData);
//     } catch (e) {
//       console.error("Staff Data Load Failed", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchStaffData(); }, []);

//   const handleClockIn = async (id: string) => {
//     await fetch('http://localhost:8000/api/staff/clock', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ staff_id: id })
//     });
//     fetchStaffData();
//   };

//   const handleLogin = async (id: string) => {
//     setCurrentUser(id);
//     const res = await fetch(`http://localhost:8000/api/staff/dashboard/${id}`);
//     const data = await res.json();
//     setMyDashboard(data);
//   };

//   const assignBed = async (staffId: string, bedId: string, role: string) => {
//       try {
//         const res = await fetch('http://localhost:8000/api/staff/assign', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ staff_id: staffId, bed_id: bedId, role: role })
//         });
        
//         if (!res.ok) {
//             const err = await res.json();
//             alert(err.detail);
//         } else {
//             fetchStaffData();
//             if (currentUser === staffId) handleLogin(staffId); // Refresh my dashboard
//         }
//       } catch (e) {
//           alert("Assignment Failed");
//       }
//   };

//   if (loading) return <div className="p-10 text-center animate-pulse font-black text-indigo-600">LOADING STAFF PORTAL...</div>;

//   // --- INDIVIDUAL STAFF DASHBOARD (LOGGED IN VIEW) ---
//   if (currentUser && myDashboard) {
//       return (
//           <div className="min-h-screen bg-gray-50 p-6">
//               <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
//                   <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-xl">
//                           {myDashboard.role[0]}
//                       </div>
//                       <div>
//                           <h1 className="text-xl font-black text-gray-900">{staffList.find(s => s.id === currentUser)?.name}</h1>
//                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{myDashboard.role} Dashboard</p>
//                       </div>
//                   </div>
//                   <button onClick={() => setCurrentUser(null)} className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">LOGOUT</button>
//               </header>

//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                   {/* LEFT: ASSIGNED PATIENTS (DIGITAL FLOOR PLAN) */}
//                   <div className="lg:col-span-2 space-y-6">
//                       <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
//                           <Clipboard size={16} /> My Rounds / Assignments
//                       </h2>
                      
//                       {myDashboard.my_beds.length === 0 ? (
//                           <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400 font-bold">
//                               No active assignments. Check with Charge Nurse.
//                           </div>
//                       ) : (
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                               {myDashboard.my_beds.map((bed: any) => (
//                                   <div key={bed.id} className="bg-white p-5 rounded-2xl border-l-4 border-indigo-500 shadow-sm relative overflow-hidden group">
//                                       <div className="flex justify-between items-start mb-2">
//                                           <span className="text-xl font-black text-indigo-900">{bed.id}</span>
//                                           {bed.type === 'ICU' && <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-md">ICU</span>}
//                                       </div>
//                                       <div className="space-y-1">
//                                           <p className="font-bold text-gray-800">{bed.patient_name || "Empty Bed"}</p>
//                                           <p className="text-xs text-gray-500 italic">{bed.condition}</p>
//                                       </div>
                                      
//                                       {/* Mock Task List per Bed */}
//                                       <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
//                                           <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
//                                               <Clock size={12} className="text-orange-400"/> Vitals Due in 15m
//                                           </div>
//                                           <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
//                                               <CheckCircle size={12} className="text-green-400"/> Meds Administered
//                                           </div>
//                                       </div>
//                                   </div>
//                               ))}
//                           </div>
//                       )}
//                   </div>

//                   {/* RIGHT: AVAILABLE BEDS (Quick Assign) */}
//                   <div className="bg-white p-6 rounded-3xl border border-gray-100 h-fit">
//                       <h3 className="font-black text-gray-900 mb-4">Self-Assign Patient</h3>
//                       <div className="space-y-2 max-h-[500px] overflow-y-auto">
//                           {beds.filter(b => b.is_occupied).map(bed => (
//                               <div key={bed.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
//                                   <div>
//                                       <p className="text-xs font-black text-gray-800">{bed.id}</p>
//                                       <p className="text-[10px] text-gray-500 truncate w-24">{bed.patient_name}</p>
//                                   </div>
//                                   <button 
//                                       onClick={() => assignBed(currentUser, bed.id, myDashboard.role === 'Nurse' ? 'Primary Nurse' : 'Attending Physician')}
//                                       className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg hover:bg-indigo-100"
//                                   >
//                                       Take
//                                   </button>
//                               </div>
//                           ))}
//                       </div>
//                   </div>
//               </div>
//           </div>
//       )
//   }

//   // --- MAIN STAFF PORTAL (ADMIN/OVERVIEW VIEW) ---
//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <header className="flex justify-between items-end mb-12">
//         <div>
//           <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">STAFF & RESOURCE CENTER</h1>
//           <p className="text-gray-500 font-bold flex items-center gap-2">
//             Manage Shifts, Assignments, and Load Balancing
//           </p>
//         </div>
//         <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-white border shadow-sm rounded-xl text-indigo-600 font-black hover:shadow-md transition-all text-sm">
//           <ArrowLeft size={18} /> BACK
//         </Link>
//       </header>

//       {/* STATS ROW */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
//           <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
//               <div className="flex items-center gap-3 mb-2 text-indigo-500">
//                   <Users size={20} />
//                   <span className="text-xs font-black uppercase tracking-widest">Nurses on Shift</span>
//               </div>
//               <p className="text-4xl font-black text-gray-900">{stats.nurses_on_shift}</p>
//           </div>
//           <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
//               <div className="flex items-center gap-3 mb-2 text-blue-500">
//                   <Briefcase size={20} />
//                   <span className="text-xs font-black uppercase tracking-widest">Doctors on Shift</span>
//               </div>
//               <p className="text-4xl font-black text-gray-900">{stats.doctors_on_shift}</p>
//           </div>
//       </div>

//       {/* STAFF ROSTER */}
//       <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
//           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
//               <h3 className="font-black text-xl text-gray-900">STAFF ROSTER</h3>
//               <span className="text-xs font-bold text-gray-400 uppercase">Real-time Clock-in System</span>
//           </div>
//           <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                   <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
//                       <tr>
//                           <th className="p-4">ID</th>
//                           <th className="p-4">Name</th>
//                           <th className="p-4">Role</th>
//                           <th className="p-4">Status</th>
//                           <th className="p-4">Current Load</th>
//                           <th className="p-4">Actions</th>
//                       </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-50">
//                       {staffList.map(staff => {
//                           const load = assignments.filter(a => a.staff_id === staff.id).length;
//                           return (
//                               <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
//                                   <td className="p-4 font-mono text-xs font-bold text-gray-500">{staff.id}</td>
//                                   <td className="p-4 font-bold text-gray-900">{staff.name}</td>
//                                   <td className="p-4 text-xs font-medium text-gray-600">
//                                       <span className={`px-2 py-1 rounded-md ${staff.role === 'Doctor' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
//                                           {staff.role}
//                                       </span>
//                                   </td>
//                                   <td className="p-4">
//                                       <button 
//                                           onClick={() => handleClockIn(staff.id)}
//                                           className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border transition-all ${staff.is_clocked_in ? 'bg-green-100 border-green-200 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
//                                       >
//                                           <div className={`w-2 h-2 rounded-full ${staff.is_clocked_in ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
//                                           {staff.is_clocked_in ? 'CLOCKED IN' : 'OFF DUTY'}
//                                       </button>
//                                   </td>
//                                   <td className="p-4">
//                                       <div className="flex items-center gap-2">
//                                           <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
//                                               <div 
//                                                   className={`h-full rounded-full ${load >= 6 ? 'bg-red-500' : 'bg-indigo-500'}`} 
//                                                   style={{width: `${(load/6)*100}%`}}
//                                               ></div>
//                                           </div>
//                                           <span className="text-xs font-bold text-gray-600">{load}/6</span>
//                                       </div>
//                                   </td>
//                                   <td className="p-4">
//                                       <button 
//                                           onClick={() => handleLogin(staff.id)}
//                                           className="text-indigo-600 font-bold text-xs hover:underline"
//                                       >
//                                           OPEN DASHBOARD
//                                       </button>
//                                   </td>
//                               </tr>
//                           )
//                       })}
//                   </tbody>
//               </table>
//           </div>
//       </div>
//     </div>
//   );
// };

// export default StaffPortal;


"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Users, Clipboard, Clock, ShieldAlert, ArrowLeft, Bed, Briefcase, CheckCircle } from 'lucide-react';

const StaffPortal = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [stats, setStats] = useState({ nurses_on_shift: 0, doctors_on_shift: 0 });
  const [assignments, setAssignments] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Login Simulation
  const [currentUser, setCurrentUser] = useState<string | null>(null); // Staff ID
  const [myDashboard, setMyDashboard] = useState<any>(null);

  const fetchStaffData = async () => {
    try {
      const [staffRes, bedRes] = await Promise.all([
        fetch('http://localhost:8000/api/staff'),
        fetch('http://localhost:8000/api/erp/beds')
      ]);
      const staffData = await staffRes.json();
      const bedData = await bedRes.json();
      
      setStaffList(staffData.staff);
      setStats(staffData.stats);
      setAssignments(staffData.assignments);
      setBeds(bedData);
    } catch (e) {
      console.error("Staff Data Load Failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaffData(); }, []);

  const handleClockIn = async (id: string) => {
    await fetch('http://localhost:8000/api/staff/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: id })
    });
    fetchStaffData();
  };

  const handleLogin = async (id: string) => {
    setCurrentUser(id);
    const res = await fetch(`http://localhost:8000/api/staff/dashboard/${id}`);
    const data = await res.json();
    setMyDashboard(data);
  };

  const assignBed = async (staffId: string, bedId: string, role: string) => {
      try {
        const res = await fetch('http://localhost:8000/api/staff/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staff_id: staffId, bed_id: bedId, role: role })
        });
        
        if (!res.ok) {
            const err = await res.json();
            alert(err.detail);
        } else {
            fetchStaffData();
            if (currentUser === staffId) handleLogin(staffId); // Refresh my dashboard
        }
      } catch (e) {
          alert("Assignment Failed");
      }
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-black text-indigo-600">LOADING STAFF PORTAL...</div>;

  // --- INDIVIDUAL STAFF DASHBOARD (LOGGED IN VIEW) ---
  if (currentUser && myDashboard) {
      return (
          <div className="min-h-screen bg-gray-50 p-6">
              <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-xl">
                          {myDashboard.role[0]}
                      </div>
                      <div>
                          <h1 className="text-xl font-black text-gray-900">{staffList.find(s => s.id === currentUser)?.name}</h1>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{myDashboard.role} Dashboard</p>
                      </div>
                  </div>
                  <button onClick={() => setCurrentUser(null)} className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">LOGOUT</button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* LEFT: ASSIGNED PATIENTS (DIGITAL FLOOR PLAN) */}
                  <div className="lg:col-span-2 space-y-6">
                      <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Clipboard size={16} /> My Rounds / Assignments
                      </h2>
                      
                      {myDashboard.my_beds.length === 0 ? (
                          <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400 font-bold">
                              No active assignments. Check with Charge Nurse.
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {myDashboard.my_beds.map((bed: any) => (
                                  <div key={bed.id} className="bg-white p-5 rounded-2xl border-l-4 border-indigo-500 shadow-sm relative overflow-hidden group">
                                      <div className="flex justify-between items-start mb-2">
                                          <span className="text-xl font-black text-indigo-900">{bed.id}</span>
                                          {bed.type === 'ICU' && <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-md">ICU</span>}
                                      </div>
                                      <div className="space-y-1">
                                          <p className="font-bold text-gray-800">{bed.patient_name || "Empty Bed"}</p>
                                          <p className="text-xs text-gray-500 italic">{bed.condition}</p>
                                      </div>
                                      
                                      {/* Mock Task List per Bed */}
                                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                              <Clock size={12} className="text-orange-400"/> Vitals Due in 15m
                                          </div>
                                          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                              <CheckCircle size={12} className="text-green-400"/> Meds Administered
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* RIGHT: AVAILABLE BEDS (Quick Assign) */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 h-fit">
                      <h3 className="font-black text-gray-900 mb-4">Self-Assign Patient</h3>
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                          {beds.filter(b => b.is_occupied).map(bed => (
                              <div key={bed.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                  <div>
                                      <p className="text-xs font-black text-gray-800">{bed.id}</p>
                                      <p className="text-[10px] text-gray-500 truncate w-24">{bed.patient_name}</p>
                                  </div>
                                  <button 
                                      onClick={() => assignBed(currentUser, bed.id, myDashboard.role === 'Nurse' ? 'Primary Nurse' : 'Attending Physician')}
                                      className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg hover:bg-indigo-100"
                                  >
                                      Take
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  // --- MAIN STAFF PORTAL (ADMIN/OVERVIEW VIEW) ---
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">STAFF & RESOURCE CENTER</h1>
          <p className="text-gray-500 font-bold flex items-center gap-2">
            Manage Shifts, Assignments, and Load Balancing
          </p>
        </div>
        <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-white border shadow-sm rounded-xl text-indigo-600 font-black hover:shadow-md transition-all text-sm">
          <ArrowLeft size={18} /> BACK
        </Link>
      </header>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-indigo-500">
                  <Users size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Nurses on Shift</span>
              </div>
              <p className="text-4xl font-black text-gray-900">{stats.nurses_on_shift}</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-blue-500">
                  <Briefcase size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Doctors on Shift</span>
              </div>
              <p className="text-4xl font-black text-gray-900">{stats.doctors_on_shift}</p>
          </div>
      </div>

      {/* STAFF ROSTER */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-xl text-gray-900">STAFF ROSTER</h3>
              <span className="text-xs font-bold text-gray-400 uppercase">Real-time Clock-in System</span>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                      <tr>
                          <th className="p-4">ID</th>
                          <th className="p-4">Name</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Current Load</th>
                          <th className="p-4">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {staffList.map(staff => {
                          const load = assignments.filter(a => a.staff_id === staff.id).length;
                          return (
                              <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="p-4 font-mono text-xs font-bold text-gray-500">{staff.id}</td>
                                  <td className="p-4 font-bold text-gray-900">{staff.name}</td>
                                  <td className="p-4 text-xs font-medium text-gray-600">
                                      <span className={`px-2 py-1 rounded-md ${staff.role === 'Doctor' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                          {staff.role}
                                      </span>
                                  </td>
                                  <td className="p-4">
                                      <button 
                                          onClick={() => handleClockIn(staff.id)}
                                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border transition-all ${staff.is_clocked_in ? 'bg-green-100 border-green-200 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                                      >
                                          <div className={`w-2 h-2 rounded-full ${staff.is_clocked_in ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                          {staff.is_clocked_in ? 'CLOCKED IN' : 'OFF DUTY'}
                                      </button>
                                  </td>
                                  <td className="p-4">
                                      <div className="flex items-center gap-2">
                                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                              <div 
                                                  className={`h-full rounded-full ${load >= 6 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                                  style={{width: `${(load/6)*100}%`}}
                                              ></div>
                                          </div>
                                          <span className="text-xs font-bold text-gray-600">{load}/6</span>
                                      </div>
                                  </td>
                                  <td className="p-4">
                                      <button 
                                          onClick={() => handleLogin(staff.id)}
                                          className="text-indigo-600 font-bold text-xs hover:underline"
                                      >
                                          OPEN DASHBOARD
                                      </button>
                                  </td>
                              </tr>
                          )
                      })}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default StaffPortal;