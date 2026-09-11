import React, { useState } from 'react';
import { X, Camera, MapPin, Navigation, Lightbulb, Trash2, Droplets, CheckCircle2, Copy } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, onReportCreated }) {
  const [formData, setFormData] = useState({
    title: '', category: 'STREETLIGHT', description: '', address: '', landmark: '', severity: 'HIGH', latitude: 12.9716, longitude: 77.5946, citizen_name: '', citizen_phone: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [createdTicket, setCreatedTicket] = useState(null);

  if (!isOpen) return null;

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => {
        setFormData(prev => ({ ...prev, latitude: Number(p.coords.latitude.toFixed(6)), longitude: Number(p.coords.longitude.toFixed(6)) }));
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please upload a photo proof');
      return;
    }
    
    const data = new FormData();
    Object.keys(formData).forEach(k => data.append(k, formData[k]));
    if (selectedFile) data.append('photo', selectedFile);

    try {
      const res = await fetch('/api/reports', { method: 'POST', body: data });
      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      if (json.success) {
        setCreatedTicket(json.data);
        onReportCreated();
      } else {
        alert(`Error: ${json.error || 'Failed to create report'}`);
      }
    } catch (err) {
      alert(`Error submitting report: ${err.message}`);
      console.error('Report submission error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5"><Camera className="w-4 h-4 text-emerald-600" /> Report Civic Issue</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        {createdTicket ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-black text-lg text-slate-900">Ticket Dispatched!</h4>
            <div className="bg-slate-50 p-3 rounded-xl border max-w-xs mx-auto">
              <span className="text-xs text-slate-400">Tracking Ticket ID:</span>
              <p className="text-xl font-mono font-black text-emerald-700">{createdTicket.id}</p>
            </div>
            <button onClick={() => { setCreatedTicket(null); onClose(); }} className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl">View on Map</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold block text-slate-700 mb-1">Issue Category *</label>
              <div className="grid grid-cols-3 gap-2">
                {[['STREETLIGHT', '💡 Streetlight'], ['GARBAGE', '🗑️ Garbage'], ['WATER_LEAKAGE', '💧 Water Leak']].map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setFormData({ ...formData, category: val })} className={`p-2 rounded-lg border font-bold text-center ${formData.category === val ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white'}`}>{label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold block text-slate-700 mb-1">Upload Photo Proof *</label>
              <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-semibold" />
            </div>

            <div>
              <label className="font-bold block text-slate-700 mb-1">Title / Summary *</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="e.g. Streetlight pole bent and flickering" />
            </div>

            <div>
              <label className="font-bold block text-slate-700 mb-1">Description *</label>
              <textarea rows={2} required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="Describe the hazard..." />
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border">
              <div>
                <label className="font-bold text-slate-600 block">Address *</label>
                <input type="text" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-1.5 border rounded bg-white" placeholder="Street name" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <label className="font-bold text-slate-600">GPS</label>
                  <button type="button" onClick={handleGPS} className="text-emerald-700 font-bold text-[10px]">Detect</button>
                </div>
                <input type="text" readOnly value={`${formData.latitude}, ${formData.longitude}`} className="w-full p-1.5 border rounded bg-white text-slate-500" />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <button type="button" onClick={onClose} className="px-3 py-1.5 font-bold text-slate-500">Cancel</button>
              <button type="submit" className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl">Submit to Municipal Desk</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}