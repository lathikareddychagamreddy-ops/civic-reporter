import React, { useState, useEffect } from 'react';
import { Search, Camera, ShieldCheck, ThumbsUp } from 'lucide-react';

export default function IssueTracker({ initialTicketId, onUpvote, reports }) {
  const [ticketInput, setTicketInput] = useState(initialTicketId || '');
  const [report, setReport] = useState(null);

  const fetchTicket = async (id) => {
    if (!id) return;
    const res = await fetch(`/api/reports/${id.trim()}`);
    const json = await res.json();
    if (json.success) setReport(json.data);
  };

  useEffect(() => {
    if (initialTicketId) fetchTicket(initialTicketId);
  }, [initialTicketId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-900">Track Civic Grievance Ticket</h2>
        <form onSubmit={(e) => { e.preventDefault(); fetchTicket(ticketInput); }} className="flex gap-2 max-w-md mx-auto">
          <input type="text" placeholder="e.g. CP-2026-1041" value={ticketInput} onChange={e => setTicketInput(e.target.value)} className="flex-1 p-2.5 border rounded-xl font-mono text-sm" />
          <button type="submit" className="bg-emerald-600 text-white font-bold px-4 rounded-xl text-xs">Track</button>
        </form>
      </div>

      {report && (
        <div className="bg-white rounded-2xl p-5 border shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-start border-b pb-3">
            <div>
              <span className="font-mono font-bold text-base text-emerald-700">{report.id}</span>
              <h3 className="font-bold text-sm text-slate-900">{report.title}</h3>
              <p className="text-slate-500">{report.address}</p>
            </div>
            <button onClick={() => onUpvote(report.id)} className="bg-slate-100 p-2 rounded-lg font-bold">👍 {report.upvotes}</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border">
              <span className="font-bold block mb-1">📸 Citizen Photo Proof</span>
              <img src={report.photo_url} alt="Proof" className="h-36 w-full object-cover rounded" />
              <p className="text-slate-600 mt-1 italic">"{report.description}"</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border">
              <span className="font-bold block mb-1">🛡️ Municipal Resolution</span>
              {report.resolution_photo_url ? (
                <img src={report.resolution_photo_url} alt="Resolution" className="h-36 w-full object-cover rounded" />
              ) : (
                <div className="h-36 flex items-center justify-center text-slate-400">Resolution photo will appear once fixed.</div>
              )}
              <p className="text-slate-600 mt-1">{report.officer_notes || 'Pending crew report.'}</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-2">Status Audit Trail</h4>
            <div className="space-y-2 border-l-2 pl-3">
              {report.history?.map((h, i) => (
                <div key={i}>
                  <p className="font-bold">{h.status}</p>
                  <p className="text-slate-500">{h.notes}</p>
                  <span className="text-[10px] text-slate-400">{new Date(h.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}