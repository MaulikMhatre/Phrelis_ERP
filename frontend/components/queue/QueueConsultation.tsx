// "use client";

// import { motion } from "framer-motion";
// import { Stethoscope, User, DoorOpen } from "lucide-react";

// interface Room {
//     id: string;
//     doctor_name: string;
//     status: string;
//     current_patient_id?: string;
// }

// export default function QueueConsultation({ rooms, onComplete }: { rooms: Room[], onComplete: (id: string) => void }) {
//     return (
//         <div className="space-y-6">
//             <div className="flex items-center gap-3 px-2">
//                 <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
//                     <Stethoscope className="w-5 h-5" />
//                 </div>
//                 <h2 className="text-xl font-black text-white tracking-tight">Active Rooms</h2>
//             </div>

//             <div className="grid grid-cols-1 gap-5">
//                 {rooms.map((room) => (
//                     <motion.div
//                         key={room.id}
//                         layout
//                         initial={false}
//                         animate={{
//                             borderColor: room.status === "ACTIVE" ? "rgba(99, 102, 241, 0.4)" : "rgba(30, 41, 59, 1)",
//                             backgroundColor: room.status === "ACTIVE" ? "rgba(79, 70, 229, 0.05)" : "rgba(15, 23, 42, 0.2)",
//                         }}
//                         className={`p-5 rounded-2xl border backdrop-blur-md transition-shadow hover:shadow-lg ${room.status === "ACTIVE" ? "shadow-indigo-500/5" : ""
//                             }`}
//                     >
//                         <div className="flex items-start justify-between mb-4">
//                             <div className="flex items-center gap-4">
//                                 <div className={`p-2.5 rounded-xl transition-colors ${room.status === "ACTIVE"
//                                         ? "bg-indigo-500 text-white shadow-xl shadow-indigo-500/40"
//                                         : "bg-slate-800 text-slate-500"
//                                     }`}>
//                                     <DoorOpen className="w-5 h-5" />
//                                 </div>
//                                 <div>
//                                     <h3 className="font-bold text-slate-100 tracking-tight">{room.doctor_name}</h3>
//                                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{room.id}</p>
//                                 </div>
//                             </div>
//                             <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${room.status === "ACTIVE" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20" : "bg-slate-800/50 text-slate-500 border border-slate-700/50"
//                                 }`}>
//                                 {room.status}
//                             </div>
//                         </div>

//                         {room.status === "ACTIVE" && (
//                             <motion.div
//                                 initial={{ opacity: 0, y: 10 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 className="pt-4 border-t border-indigo-500/10 flex items-center justify-between"
//                             >
//                                 <div className="flex items-center gap-2">
//                                     <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
//                                     <span className="text-xs font-semibold text-indigo-200/70">In Consultation</span>
//                                 </div>
//                                 <button
//                                     onClick={() => onComplete(room.id)}
//                                     className="px-3 py-1 text-[10px] font-black text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all uppercase tracking-widest"
//                                 >
//                                     Release
//                                 </button>
//                             </motion.div>
//                         )}
//                     </motion.div>
//                 ))}
//             </div>
//         </div>
//     );
// }








"use client";

import { motion } from "framer-motion";
import { Stethoscope, DoorOpen } from "lucide-react";

interface Room {
    id: string;
    doctor_name: string;
    status: string;
    current_patient_id?: string;
}

export default function QueueConsultation({ rooms, onComplete }: { rooms: Room[], onComplete: (id: string) => void }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                {/* Adaptive icon background */}
                <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
                    <Stethoscope className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-foreground tracking-tight uppercase italic">Active Rooms</h2>
            </div>

            <div className="grid grid-cols-1 gap-5">
                {rooms.map((room) => (
                    <motion.div
                        key={room.id}
                        layout
                        initial={false}
                        animate={{
                            // Border color adapts based on system variables
                            borderColor: room.status === "ACTIVE" ? "var(--primary)" : "var(--border)",
                            // Background adapts based on system variables
                            backgroundColor: "var(--card)",
                        }}
                        className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-500 hover:shadow-xl 
                            ${room.status === "ACTIVE" 
                                ? "shadow-primary/5 border-opacity-50" 
                                : "shadow-sm border-opacity-30 dark:shadow-none"
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl transition-all duration-500 ${
                                    room.status === "ACTIVE"
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "bg-muted text-muted-foreground"
                                }`}>
                                    <DoorOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground tracking-tight uppercase">{room.doctor_name}</h3>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{room.id}</p>
                                </div>
                            </div>
                            {/* Status Badge adapts automatically */}
                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-colors ${
                                room.status === "ACTIVE" 
                                    ? "bg-primary/10 text-primary border-primary/20" 
                                    : "bg-muted text-muted-foreground border-border"
                            }`}>
                                {room.status}
                            </div>
                        </div>

                        {room.status === "ACTIVE" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="pt-4 border-t border-border flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">In Consultation</span>
                                </div>
                                <button
                                    onClick={() => onComplete(room.id)}
                                    className="px-3 py-1 text-[10px] font-black bg-foreground text-background hover:bg-rose-500 hover:text-white rounded-lg transition-all uppercase tracking-widest shadow-sm active:scale-95"
                                >
                                    Release
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}