"use client";

import React, { useState } from 'react';
import { Stethoscope, Heart, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

interface TriageResponse {
  priority: number;
  category: string;
  action: string;
  assigned_unit: string;
}

export default function TriagePage() {
  const [formData, setFormData] = useState({
    spo2: '',
    heart_rate: '',
    symptoms: ''
  });
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/triage/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spo2: parseInt(formData.spo2),
          heart_rate: parseInt(formData.heart_rate),
          symptoms: formData.symptoms.split(',').map(s => s.trim())
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Triage failed", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ spo2: '', heart_rate: '', symptoms: '' });
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-blue-600" />
          Smart Triage Portal
        </h1>
        <p className="text-gray-600">AI-Assisted Patient Intake & Severity Assessment</p>
      </header>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {!result ? (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> SpO2 (%)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={formData.spo2}
                  onChange={(e) => setFormData({...formData, spo2: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="98"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" /> Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  required
                  value={formData.heart_rate}
                  onChange={(e) => setFormData({...formData, heart_rate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="75"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presenting Symptoms (comma separated)
              </label>
              <textarea
                required
                rows={3}
                value={formData.symptoms}
                onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g. chest pain, dizziness, nausea"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-50 text-lg"
            >
              {loading ? 'Analyzing Vitals...' : 'Assess & Admit Patient'}
            </button>
          </form>
        ) : (
          <div className="p-8 text-center space-y-6">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
              result.color === 'red' ? 'bg-red-100 text-red-600' :
              result.color === 'orange' ? 'bg-orange-100 text-orange-600' :
              result.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
              result.color === 'green' ? 'bg-green-100 text-green-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {result.esi_level <= 2 ? <AlertTriangle className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ESI Assessment Complete</h2>
              <p className="text-gray-500">Patient admitted with ESI Level {result.esi_level}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Acuity Level</p>
                <p className={`text-xl font-bold ${
                   result.color === 'red' ? 'text-red-700' :
                   result.color === 'orange' ? 'text-orange-700' :
                   result.color === 'yellow' ? 'text-yellow-700' :
                   result.color === 'green' ? 'text-green-700' :
                   'text-blue-700'
                }`}>
                  ESI {result.esi_level} ({result.acuity})
                </p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Assigned Bed</p>
                <p className="text-xl font-bold text-blue-700">{result.assigned_bed}</p>
              </div>
              
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Clinical Action</p>
                <p className="text-lg font-medium text-gray-900">{result.action}</p>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow transition-colors"
            >
              Process Next Patient
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
