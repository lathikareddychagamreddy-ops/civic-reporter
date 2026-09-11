import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Lightbulb, Trash2, Droplets, ThumbsUp, Filter, ExternalLink, Navigation } from 'lucide-react';

export default function CivicMap({ reports, selectedCategory, setSelectedCategory, selectedStatus, setSelectedStatus, onUpvote, onSelectReport, onOpenReportModal }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [activeReport, setActiveReport] = useState(null);

  const getIcon = (cat, status) => {
    let color = cat === 'STREETLIGHT' ? '#f59e0b' : cat === 'GARBAGE' ? '#ea580c' : '#0284c7';
    if (status === 'RESOLVED') color = '#10b981';
    return L.divIcon({
      html: `<div style="background:${color};width:34px;height:34px;border-radius:50%;border:2px solid white;box-shadow:0 4px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">📍</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, { center: [12.9716, 77.5946], zoom: 13 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: 'OpenStreetMap' }).addTo(map);
      mapInstanceRef.current = map;
    }
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    reports.forEach(r => {
      if (!r.latitude || !r.longitude) return;
      const marker = L.marker([r.latitude, r.longitude], { icon: getIcon(r.category, r.status) }).addTo(map);
      marker.on('click', () => {
        setActiveReport(r);
        map.flyTo([r.latitude, r.longitude], 15);
      });
      markersRef.current.push(marker);
    });
  }, [reports]);

  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(p => {
        mapInstanceRef.current.flyTo([p.coords.latitude, p.coords.longitude], 15);
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] relative z-0">
      <div className="w-full lg:w-[380px] bg-white border-r border-slate-200 flex flex-col h-[40vh] lg:h-full z-10 relative">
        <div className="p-3 border-b space-y-2 bg-slate-50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><Filter className="w-4 h-4" /> Reports ({reports.length})</h2>
            <button onClick={handleLocateMe} className="text-xs bg-white border px-2 py-1 rounded flex items-center gap-1 font-semibold"><Navigation className="w-3 h-3 text-emerald-600" /> GPS</button>
          </div>
          <div className="flex gap-1 text-xs">
            {['ALL', 'STREETLIGHT', 'GARBAGE', 'WATER_LEAKAGE'].map(c => (
              <button key={c} onClick={() => setSelectedCategory(c)} className={`px-2 py-0.5 rounded text-[11px] font-semibold ${selectedCategory === c ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'}`}>
                {c === 'ALL' ? 'All' : c === 'STREETLIGHT' ? '💡 Light' : c === 'GARBAGE' ? '🗑️ Trash' : '💧 Water'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {reports.map(r => (
            <div key={r.id} onClick={() => { setActiveReport(r); mapInstanceRef.current?.flyTo([r.latitude, r.longitude], 15); }} className="p-2.5 rounded-xl border bg-white hover:bg-slate-50 cursor-pointer text-xs">
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>{r.id}</span>
                <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${r.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span>
              </div>
              <h4 className="font-bold text-slate-900 mt-1 truncate">{r.title}</h4>
              <p className="text-[11px] text-slate-500 truncate">{r.address}</p>
              <div className="flex items-center justify-between mt-2 pt-1 border-t text-[11px]">
                <button onClick={(e) => { e.stopPropagation(); onUpvote(r.id); }} className="text-slate-600 hover:text-emerald-700 font-bold">👍 {r.upvotes}</button>
                <button onClick={(e) => { e.stopPropagation(); onSelectReport(r.id); }} className="text-emerald-600 font-bold flex items-center gap-0.5">Track <ExternalLink className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        {activeReport && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-md bg-white rounded-xl shadow-xl p-3 border flex gap-3">
            <img src={activeReport.photo_url} alt="Proof" className="w-20 h-20 rounded-lg object-cover border" />
            <div className="flex-1 min-w-0 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-emerald-700">{activeReport.id}</span>
                <button onClick={() => setActiveReport(null)}>✕</button>
              </div>
              <h5 className="font-bold text-slate-900 truncate mt-0.5">{activeReport.title}</h5>
              <p className="text-slate-500 line-clamp-2 mt-0.5">{activeReport.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold">👍 {activeReport.upvotes}</span>
                <button onClick={() => onSelectReport(activeReport.id)} className="bg-slate-900 text-white px-2.5 py-1 rounded font-bold">Track</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}