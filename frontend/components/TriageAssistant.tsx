// "use client";

// import React, { useState } from 'react';
// import { Stethoscope } from 'lucide-react';

// interface TriageResult {
//   severity: string;
//   recommended_actions: string[];
// }

// const TriageAssistant: React.FC = () => {
//   const [symptoms, setSymptoms] = useState("");
//   const [result, setResult] = useState<TriageResult | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleAssess = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch('http://localhost:8000/api/triage/assess', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           symptoms: symptoms.split(',').map(s => s.trim()),
//           vitals: {} 
//         })
//       });
//       const data = await res.json();
//       setResult(data);
//     } catch (err) {
//       console.error("Triage assessment failed", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
//       <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
//         <Stethoscope className="w-5 h-5" /> Smart Triage
//       </h2>
      
//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Patient Symptoms (comma separated)</label>
//           <textarea 
//             rows={3}
//             placeholder="e.g. chest pain, shortness of breath, high fever"
//             value={symptoms}
//             onChange={(e) => setSymptoms(e.target.value)}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//           />
//         </div>
        
//         <button 
//           onClick={handleAssess}
//           disabled={loading || !symptoms}
//           className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
//         >
//           {loading ? 'Assessing...' : 'Assess Patient'}
//         </button>
//       </div>

//       {result && (
//         <div className={`mt-6 p-4 rounded-md border ${
//           result.severity === 'Critical' ? 'bg-red-50 border-red-200' :
//           result.severity === 'High' ? 'bg-orange-50 border-orange-200' :
//           'bg-green-50 border-green-200'
//         }`}>
//           <div className="flex justify-between items-center mb-2">
//             <span className="text-sm font-medium text-gray-500">Severity Level</span>
//             <span className={`text-xl font-bold ${
//               result.severity === 'Critical' ? 'text-red-700' :
//               result.severity === 'High' ? 'text-orange-700' :
//               'text-green-700'
//             }`}>
//               {result.severity}
//             </span>
//           </div>
          
//           <div className="mt-2">
//             <p className="text-xs font-semibold text-gray-500 uppercase">Recommended Actions:</p>
//             <ul className="list-disc pl-4 text-sm text-gray-700 mt-1">
//               {result.recommended_actions.map((action, i) => (
//                 <li key={i}>{action}</li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TriageAssistant;






"use client";
import React, { useState } from 'react';
import { Stethoscope, Activity, Wind } from 'lucide-react';

interface TriageResult {
  esi_level: number;
  acuity: string;
  color: string;
  assigned_bed: string;
  action: string;
}

const TriageAssistant: React.FC = () => {
  const [symptoms, setSymptoms] = useState("");
  const [spo2, setSpo2] = useState<number>(98);
  const [hr, setHr] = useState<number>(75);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAssess = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/triage/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spo2: spo2,
          heart_rate: hr,
          symptoms: symptoms.split(',').map(s => s.trim())
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Triage assessment failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <Stethoscope className="w-5 h-5" /> Smart Triage
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">SpO2 %</label>
            <div className="mt-1 relative">
              <input type="number" value={spo2} onChange={(e) => setSpo2(Number(e.target.value))} className="block w-full border rounded-md p-2" />
              <Wind className="absolute right-2 top-2 w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Heart Rate</label>
            <div className="mt-1 relative">
              <input type="number" value={hr} onChange={(e) => setHr(Number(e.target.value))} className="block w-full border rounded-md p-2" />
              <Activity className="absolute right-2 top-2 w-4 h-4 text-red-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Patient Symptoms</label>
          <textarea 
            rows={2}
            placeholder="e.g. chest pain, stroke"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
          />
        </div>
        
        <button 
          onClick={handleAssess}
          disabled={loading || !symptoms}
          className="w-full py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Assessing...' : 'Run Clinical Triage'}
        </button>
      </div>

      {result && (
        <div className={`mt-6 p-4 rounded-md border`} style={{ backgroundColor: `${result.color}10`, borderColor: result.color }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">ESI Level {result.esi_level}</span>
            <span className="text-xl font-bold uppercase" style={{ color: result.color }}>
              {result.acuity}
            </span>
          </div>
          
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Assigned Unit:</span>
              <span className="font-mono font-bold">{result.assigned_bed}</span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Protocol:</p>
            <p className="text-sm text-gray-700">{result.action}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriageAssistant;