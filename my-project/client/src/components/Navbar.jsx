import React from 'react';
import { MapPin, PlusCircle, Search, BarChart3, Building2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenReportModal, role, setRole, reportsCount }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('map')}>
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl text-slate-900">CivicPulse</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">DVPS30</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('map')} className={`px-3 py-1.5 text-sm font-medium rounded-lg ${activeTab === 'map' ? 'bg-white shadow-xs font-bold' : 'text-slate-600'}`}>Map</button>
          <button onClick={() => setActiveTab('tracker')} className={`px-3 py-1.5 text-sm font-medium rounded-lg ${activeTab === 'tracker' ? 'bg-white shadow-xs font-bold' : 'text-slate-600'}`}>Track Ticket</button>
          <button onClick={() => setActiveTab('municipal')} className={`px-3 py-1.5 text-sm font-medium rounded-lg ${activeTab === 'municipal' ? 'bg-white shadow-xs font-bold' : 'text-slate-600'}`}>
            Municipal Desk {reportsCount > 0 && <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-xs">{reportsCount}</span>}
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`px-3 py-1.5 text-sm font-medium rounded-lg ${activeTab === 'analytics' ? 'bg-white shadow-xs font-bold' : 'text-slate-600'}`}>Analytics</button>
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => setRole(role === 'citizen' ? 'officer' : 'citizen')} className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg border font-semibold">
            Role: <span className="text-emerald-700">{role === 'citizen' ? 'Citizen' : 'Officer'}</span>
          </button>
          <button onClick={onOpenReportModal} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition">
            <PlusCircle className="w-4 h-4" /> Report Issue
          </button>
        </div>
      </div>
    </header>
  );
}