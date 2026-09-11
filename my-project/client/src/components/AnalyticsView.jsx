import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Users } from 'lucide-react';

export default function AnalyticsView() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/analytics/stats').then(r => r.json()).then(j => j.success && setStats(j.data));
  }, []);

  if (!stats) return <div className="text-center py-20 text-slate-400">Loading civic analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-2xl font-black text-slate-900">City Civic Intelligence</h2>
      <div className="grid grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border">
          <span className="font-bold text-slate-400">Total Reports</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalReports}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <span className="font-bold text-slate-400">Resolution Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.resolutionRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <span className="font-bold text-slate-400">Active Backlog</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingReports + stats.inProgressReports}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <span className="font-bold text-slate-400">Community Endorsements</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.totalCommunityUpvotes}</p>
        </div>
      </div>
    </div>
  );
}