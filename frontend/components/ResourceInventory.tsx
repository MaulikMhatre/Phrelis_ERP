// "use client";

// import React from 'react';
// import { Activity, Truck } from 'lucide-react';

// interface ResourceProps {
//   resources: {
//     ventilators: { total: number; in_use: number };
//     ambulances: { total: number; available: number };
//   };
// }

// const ResourceInventory: React.FC<ResourceProps> = ({ resources }) => {
//   const ventUsage = (resources.ventilators.in_use / resources.ventilators.total) * 100;
  
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-xl font-bold mb-4 text-gray-800">Critical Resources</h2>
      
//       <div className="space-y-6">
//         {/* Ventilators */}
//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <div className="flex items-center gap-2">
//               <Activity className="w-5 h-5 text-blue-500" />
//               <span className="font-semibold text-gray-700">Ventilators</span>
//             </div>
//             <span className="text-sm font-medium text-gray-600">
//               {resources.ventilators.in_use} / {resources.ventilators.total} in use
//             </span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2.5">
//             <div 
//               className={`h-2.5 rounded-full ${ventUsage > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
//               style={{ width: `${ventUsage}%` }}
//             ></div>
//           </div>
//         </div>

//         {/* Ambulances */}
//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <div className="flex items-center gap-2">
//               <Truck className="w-5 h-5 text-green-500" />
//               <span className="font-semibold text-gray-700">Ambulances</span>
//             </div>
//             <span className="text-sm font-medium text-gray-600">
//               {resources.ambulances.available} Available
//             </span>
//           </div>
//           <div className="grid grid-cols-5 gap-1">
//              {Array.from({ length: resources.ambulances.total }).map((_, i) => (
//                <div 
//                  key={i} 
//                  className={`h-2 rounded-sm ${i < resources.ambulances.available ? 'bg-green-500' : 'bg-gray-300'}`}
//                ></div>
//              ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResourceInventory;


"use client";
import React from 'react';
import { Activity, Truck } from 'lucide-react';

interface ResourceProps {
  resources: {
    Ventilators: { total: number; in_use: number };
    Ambulances: { total: number; available: number };
  };
}

const ResourceInventory: React.FC<ResourceProps> = ({ resources }) => {
  // Use optional chaining and default objects to prevent 'undefined' errors
  const v = resources?.Ventilators || { total: 20, in_use: 8 }; // Fallback to backend defaults
  const a = resources?.Ambulances || { total: 10, available: 6 };

  const ventUsage = v.total > 0 ? (v.in_use / v.total) * 100 : 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-400 h-full">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Critical Resource Inventory</h2>
      
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-700">Ventilators</span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {v.in_use} / {v.total} in use
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${ventUsage > 80 ? 'bg-red-500' : 'bg-blue-600'}`} 
              style={{ width: `${ventUsage}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-gray-700">Ambulance Fleet</span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {a.available} Units Ready
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
             {Array.from({ length: a.total || 10 }).map((_, i) => (
               <div 
                 key={i} 
                 className={`h-2 rounded-sm transition-colors ${i < a.available ? 'bg-emerald-500' : 'bg-gray-200'}`}
               ></div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceInventory;