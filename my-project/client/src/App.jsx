import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CivicMap from './components/CivicMap';
import ReportModal from './components/ReportModal';
import MunicipalDashboard from './components/MunicipalDashboard';
import IssueTracker from './components/IssueTracker';
import AnalyticsView from './components/AnalyticsView';
import { apiCall } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [role, setRole] = useState('citizen');
  const [reports, setReports] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [trackedTicketId, setTrackedTicketId] = useState('');

  const fetchReports = async () => {
    try {
      let url = `/api/reports?sortBy=created_at`;
      if (selectedCategory !== 'ALL') url += `&category=${selectedCategory}`;
      if (selectedStatus !== 'ALL') url += `&status=${selectedStatus}`;
      const res = await apiCall(url);
      const json = await res.json();
      if (json.success) setReports(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCategory, selectedStatus]);

  const handleUpvote = async (id) => {
    try {
      const res = await apiCall(`/api/reports/${id}/upvote`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectReport = (id) => {
    setTrackedTicketId(id);
    setActiveTab('tracker');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        role={role}
        setRole={(r) => {
          setRole(r);
          setActiveTab(r === 'officer' ? 'municipal' : 'map');
        }}
        reportsCount={reports.filter(r => r.status !== 'RESOLVED').length}
      />

      <main className="flex-1">
        {activeTab === 'map' && (
          <CivicMap
            reports={reports}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            onUpvote={handleUpvote}
            onSelectReport={handleSelectReport}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}
        {activeTab === 'tracker' && (
          <IssueTracker
            initialTicketId={trackedTicketId}
            onUpvote={handleUpvote}
            reports={reports}
          />
        )}
        {activeTab === 'municipal' && (
          <MunicipalDashboard
            reports={reports}
            onRefresh={fetchReports}
            onStatusUpdated={fetchReports}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportCreated={fetchReports}
      />
    </div>
  );
}