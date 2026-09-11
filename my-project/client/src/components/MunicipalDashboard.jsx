import React, { useState } from 'react';
import { Building2, Clock, CheckCircle2, Download, Camera } from 'lucide-react';

export default function MunicipalDashboard({ reports, onRefresh, onStatusUpdated }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [status, setStatus] = useState('IN_PROGRESS');
  const [notes, setNotes] = useState('');
  const [resPhoto, setResPhoto] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('status', status);
    data.append('officer_notes', notes);
    if (resPhoto) data.append('resolution_photo', resPhoto);

    await fetch(`/api/reports/${selectedReport.id}/status`, { method: 'PATCH', body: data });
    setSelectedReport(null);
    onStatusUpdated();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      <div className="bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Municipal Command Center</h2>
          <p className="text-xs text-slate-400">Department triage, field dispatch, and photo verification</p>
        </div>
        <button onClick={onRefresh} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Refresh Queue</button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b font-bold text-slate-500">
            <tr>
              <th className="p-3">Proof</th>
              <th className="p-3">Ticket ID</th>
              <th className="p-3">Title & Address</th>
              <th className="p-3">Dept</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reports.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="p-3"><img src={r.photo_url} alt="Proof" className="w-10 h-10 rounded object-cover border" /></td>
                <td className="p-3 font-mono font-bold text-slate-800">{r.id}</td>
                <td className="p-3 max-w-xs"><p className="font-bold truncate">{r.title}</p><p className="text-slate-400 text-[11px] truncate">{r.address}</p></td>
                <td className="p-3 font-semibold">{r.department_code}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-amber-100 text-amber-800">{r.status}</span></td>
                <td className="p-3 text-right">
                  <button onClick={() => { setSelectedReport(r); setStatus(r.status); setNotes(r.officer_notes || ''); }} className="bg-slate-900 text-white px-2.5 py-1 rounded font-bold text-xs">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white rounded-xl max-w-md w-full p-4 space-y-3 text-xs">
            <h3 className="font-bold text-sm">Update Ticket: {selectedReport.id}</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border rounded">
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Officer Notes *</label>
                <textarea rows={2} required value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded" placeholder="Actions taken..." />
              </div>
              <div>
                <label className="font-bold block mb-1">Resolution Photo Proof</label>
                <input type="file" accept="image/*" onChange={e => setResPhoto(e.target.files[0])} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setSelectedReport(null)} className="px-3 py-1 font-bold text-slate-500">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}