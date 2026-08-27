import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Activity, AlertCircle, CheckCircle2, Clock, RefreshCw, XCircle, BrainCircuit, ShieldAlert, LineChart, Banknote, Edit3, Trash2, Plus, Eye, MapPin, Phone, ShieldCheck, DollarSign, Filter, Search, FileText, Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [newService, setNewService] = useState({ name: '', description: '', category: 'Maintenance', basePrice: 350 });
  const [workerFilter, setWorkerFilter] = useState('all'); // all, pending, noDocs, approved, rejected
  const [selectedKycImage, setSelectedKycImage] = useState(null);
  const [savingAction, setSavingAction] = useState(false);

  // Sync tab with URL route
  const getInitialTab = () => {
    if (location.pathname.includes('/admin/verification')) return 'verification';
    if (location.pathname.includes('/admin/services')) return 'services';
    if (location.pathname.includes('/admin/financials')) return 'financials';
    if (location.pathname.includes('/admin/forecasting')) return 'forecasting';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      const [adminRes, servicesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/services')
      ]);
      if (adminRes.data.success) {
        setStats(adminRes.data.stats);
      }
      if (servicesRes.data) {
        setServices(servicesRes.data);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyWorker = async (workerId, status) => {
    try {
      let reason = null;
      if (status === 'Rejected') {
        reason = prompt("Provide rejection reason (e.g. Incomplete ID document):");
        if (!reason) return;
      }
      setSavingAction(true);
      const res = await api.put(`/admin/workers/${workerId}/verify`, { status, reason });
      if (res.data?.success) {
        await fetchData();
        if (status === 'Approved') {
          alert('Worker verified successfully! They are now online and available for customer service dispatches.');
        } else {
          alert('Worker verification rejected.');
        }
      }
    } catch (error) {
      alert(`Failed to update worker status`);
    } finally {
      setSavingAction(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      setSavingAction(true);
      await api.post('/services', {
        ...newService,
        basePrice: Number(newService.basePrice)
      });
      setNewService({ name: '', description: '', category: 'Maintenance', basePrice: 350 });
      await fetchData();
      alert('New service added with base hourly tariff');
    } catch (error) {
      alert('Failed to add service');
    } finally {
      setSavingAction(false);
    }
  };

  const handleUpdateServiceRate = async (serviceId) => {
    try {
      if (!editPrice || isNaN(editPrice)) return alert('Please enter a valid rate');
      setSavingAction(true);
      await api.put(`/services/${serviceId}`, { basePrice: Number(editPrice) });
      setEditingServiceId(null);
      await fetchData();
      alert('Service tariff rate updated!');
    } catch (error) {
      alert('Failed to update service rate');
    } finally {
      setSavingAction(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        setSavingAction(true);
        await api.delete(`/services/${id}`);
        await fetchData();
      } catch (error) {
        alert('Failed to delete service');
      } finally {
        setSavingAction(false);
      }
    }
  };

  if (loading && !stats) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-600 uppercase tracking-widest text-sm">Loading SuperAdmin Command Center...</p>
      </div>
    );
  }

  const allWorkers = stats?.allWorkers || [];
  const filteredWorkers = allWorkers.filter(w => {
    const hasDocs = w.kycDocuments && w.kycDocuments.length > 0;
    if (workerFilter === 'pending') return w.verificationStatus === 'Pending' && hasDocs;
    if (workerFilter === 'noDocs') return w.verificationStatus === 'Pending' && !hasDocs;
    if (workerFilter === 'approved') return w.verificationStatus === 'Approved';
    if (workerFilter === 'rejected') return w.verificationStatus === 'Rejected';
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-12 font-sans">
      
      {/* SuperAdmin Header */}
      <div className="bg-slate-950 pt-10 pb-20 px-4 sm:px-8 relative overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-black">
                  <ShieldAlert size={26}/>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">SuperAdmin Command Center</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Platform Governance • Worker KYC Verification • Cooperative Tariffs</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-right">
                <div className="text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  COOPSEVA ACTIVE
                </div>
                <div className="text-[10px] text-slate-500 font-mono">NODE: SUPERADMIN-PRIMARY</div>
              </div>
              <button 
                onClick={fetchData} 
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 shadow-sm"
                title="Sync Live Data"
              >
                <RefreshCw size={16}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Activity size={14}/> System Overview
          </button>
          <button 
            onClick={() => setActiveTab('verification')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'verification' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ShieldCheck size={14}/> Worker Verification
            {stats?.pendingWorkersCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.2 rounded-full">{stats.pendingWorkersCount}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('services')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'services' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Briefcase size={14}/> Services & Base Tariffs
          </button>
          <button 
            onClick={() => setActiveTab('financials')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'financials' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Banknote size={14}/> Financial Settlements
          </button>
          <button 
            onClick={() => setActiveTab('forecasting')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'forecasting' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BrainCircuit size={14}/> AI Demand Forecast
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 space-y-8">
        
        {/* ================= SECTION: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users size={22}/></div>
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Customers</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{stats?.totalCustomers || 0}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Customers</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Briefcase size={22}/></div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {stats?.verifiedWorkersCount || 0} Verified
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900">{stats?.totalWorkersCount || 0}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Registered Workers</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><AlertCircle size={22}/></div>
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Docs Ready</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{stats?.pendingWorkersCount || 0}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Verification Queue</div>
              </div>

              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-slate-800 text-emerald-400 rounded-2xl"><Activity size={22}/></div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">Live Dispatches</span>
                </div>
                <div className="text-3xl font-black text-white">{stats?.totalBookings || 0}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Platform Bookings</div>
              </div>
            </div>

            {/* Quick Verification Queue */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <AlertCircle size={18} className="text-amber-500"/> Verification Queue (Uploaded Documents Ready for Review)
                  </h3>
                  <p className="text-xs text-slate-500">Only workers who have uploaded verification documents appear in this queue</p>
                </div>
                <button 
                  onClick={() => setActiveTab('verification')}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-4 py-2 rounded-xl transition"
                >
                  View All Workers ({allWorkers.length}) →
                </button>
              </div>

              {stats?.unverifiedWorkers?.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-500 opacity-60"/>
                  <p className="font-bold text-sm text-slate-700">Verification Queue is Empty</p>
                  <p className="text-xs">No pending worker profiles with uploaded documents awaiting approval.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Worker</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Skills Registered</th>
                        <th className="px-4 py-3">KYC Documents</th>
                        <th className="px-4 py-3 text-right">Verification Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats?.unverifiedWorkers?.map(worker => (
                        <tr key={worker._id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">
                              {(worker.user?.name || 'W').charAt(0)}
                            </div>
                            {worker.user?.name || 'Worker'}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">{worker.user?.phone || 'N/A'}</td>
                          <td className="px-4 py-3.5 text-xs font-medium">
                            {worker.skills?.map(s => s.name).join(', ') || 'General Service'}
                          </td>
                          <td className="px-4 py-3.5">
                            <button 
                              onClick={() => setSelectedKycImage(worker.kycDocuments[0])}
                              className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg"
                            >
                              <Eye size={12}/> View ({worker.kycDocuments.length})
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-2">
                            <button 
                              onClick={() => handleVerifyWorker(worker._id, 'Approved')}
                              disabled={savingAction}
                              className="text-xs font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl shadow-sm transition"
                            >
                              Approve & Activate
                            </button>
                            <button 
                              onClick={() => handleVerifyWorker(worker._id, 'Rejected')}
                              disabled={savingAction}
                              className="text-xs font-bold uppercase bg-red-100 hover:bg-red-200 text-red-700 px-3.5 py-1.5 rounded-xl transition"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <h3 className="text-lg font-black text-slate-900 mb-4">Recent Platform Dispatches</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Worker Assigned</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Tariff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats?.recentBookings?.map(b => (
                      <tr key={b._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900">
                          #{b._id.substring(b._id.length - 6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-800 text-xs">{b.customer?.name || 'Customer'}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">{b.service?.name || 'General'}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">{b.worker?.user?.name || 'Unassigned / Open'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 text-xs">
                          ₹{b.finalPrice || b.priceEstimate || 350}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= SECTION: WORKER VERIFICATION ================= */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Worker Management & Verification</h2>
                <p className="text-xs text-slate-500">Review trade qualifications, KYC documents, and approve active workers</p>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl flex-wrap">
                <button 
                  onClick={() => setWorkerFilter('all')} 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${workerFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  All ({allWorkers.length})
                </button>
                <button 
                  onClick={() => setWorkerFilter('pending')} 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${workerFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Docs Ready ({allWorkers.filter(w => w.verificationStatus === 'Pending' && w.kycDocuments?.length > 0).length})
                </button>
                <button 
                  onClick={() => setWorkerFilter('noDocs')} 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${workerFilter === 'noDocs' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Awaiting Upload ({allWorkers.filter(w => w.verificationStatus === 'Pending' && (!w.kycDocuments || w.kycDocuments.length === 0)).length})
                </button>
                <button 
                  onClick={() => setWorkerFilter('approved')} 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${workerFilter === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Approved ({allWorkers.filter(w => w.verificationStatus === 'Approved').length})
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Worker Name</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Skills Offered</th>
                      <th className="px-4 py-3">KYC Certificates</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorkers.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-10 text-slate-400 font-bold">No workers found matching this filter.</td></tr>
                    ) : (
                      filteredWorkers.map(w => {
                        const hasDocs = w.kycDocuments && w.kycDocuments.length > 0;
                        return (
                          <tr key={w._id} className="hover:bg-slate-50/80 transition">
                            <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">
                                {(w.user?.name || 'W').charAt(0)}
                              </div>
                              <div>
                                <div>{w.user?.name || 'Worker'}</div>
                                <span className="text-[10px] text-slate-400 font-mono">ID: #{w._id.substring(w._id.length - 6).toUpperCase()}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-slate-600">{w.user?.phone || 'N/A'}</td>
                            <td className="px-4 py-3.5 text-xs">
                              <div className="flex flex-wrap gap-1">
                                {w.skills?.map((s, idx) => (
                                  <span key={idx} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              {hasDocs ? (
                                <button 
                                  onClick={() => setSelectedKycImage(w.kycDocuments[0])}
                                  className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg"
                                >
                                  <Eye size={12}/> View ({w.kycDocuments.length})
                                </button>
                              ) : (
                                <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 w-fit">
                                  <Clock size={10}/> Not Uploaded
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                w.verificationStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                w.verificationStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                                hasDocs ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {w.verificationStatus === 'Pending' && !hasDocs ? 'Awaiting Upload' : w.verificationStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right space-x-2">
                              {w.verificationStatus !== 'Approved' && (
                                hasDocs ? (
                                  <button 
                                    onClick={() => handleVerifyWorker(w._id, 'Approved')}
                                    disabled={savingAction}
                                    className="text-xs font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl shadow-sm transition"
                                  >
                                    Approve
                                  </button>
                                ) : (
                                  <button 
                                    disabled
                                    className="text-[10px] font-bold uppercase bg-slate-100 text-slate-400 px-3 py-1.5 rounded-xl cursor-not-allowed border border-slate-200"
                                    title="Worker must upload documents before approval"
                                  >
                                    Docs Required
                                  </button>
                                )
                              )}
                              {w.verificationStatus !== 'Rejected' && (
                                <button 
                                  onClick={() => handleVerifyWorker(w._id, 'Rejected')}
                                  disabled={savingAction}
                                  className="text-xs font-bold uppercase bg-red-100 hover:bg-red-200 text-red-700 px-3.5 py-1.5 rounded-xl transition"
                                >
                                  Reject
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION: SERVICES & BASE RATES CONFIG ================= */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Add Service Form */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Plus size={18} className="text-blue-600"/> Add New Cooperative Service
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure standard tariff schedule for new service categories</p>
              </div>

              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Title</label>
                  <input 
                    type="text" 
                    required 
                    value={newService.name} 
                    onChange={e => setNewService({...newService, name: e.target.value})} 
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Masonry & Plastering"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <input 
                    type="text" 
                    required 
                    value={newService.category} 
                    onChange={e => setNewService({...newService, category: e.target.value})} 
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Construction"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Base Hourly Rate (₹/hr)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                    <input 
                      type="number" 
                      required 
                      value={newService.basePrice} 
                      onChange={e => setNewService({...newService, basePrice: e.target.value})} 
                      className="w-full border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="350"
                      min="50"
                      step="25"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                  <textarea 
                    required 
                    value={newService.description} 
                    onChange={e => setNewService({...newService, description: e.target.value})} 
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows="3"
                    placeholder="Description of the service scope..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={savingAction}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
                >
                  Create & Publish Service
                </button>
              </form>
            </div>

            {/* Active Services Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Cooperative Service Tariff Schedule</h3>
                  <p className="text-xs text-slate-500">Edit base hourly rates applied across customer bookings</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Service Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Base Tariff</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map((service) => (
                      <tr key={service._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-900">{service.name}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{service.category}</td>
                        <td className="px-4 py-3.5">
                          {editingServiceId === service._id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-500">₹</span>
                              <input 
                                type="number" 
                                value={editPrice}
                                onChange={e => setEditPrice(e.target.value)}
                                className="w-20 border border-blue-500 rounded-lg px-2 py-1 text-xs font-black"
                              />
                              <button 
                                onClick={() => handleUpdateServiceRate(service._id)}
                                className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded"
                              >
                                Save
                              </button>
                              <button 
                                onClick={() => setEditingServiceId(null)}
                                className="bg-slate-200 text-slate-600 text-[10px] px-2 py-1 rounded"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono font-black text-emerald-600 text-sm">
                              ₹{service.basePrice}/hr
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button 
                            onClick={() => { setEditingServiceId(service._id); setEditPrice(service.basePrice); }}
                            className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase p-1.5 rounded-lg hover:bg-blue-50 transition"
                            title="Edit Base Rate"
                          >
                            <Edit3 size={15}/>
                          </button>
                          <button 
                            onClick={() => handleDeleteService(service._id)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold uppercase p-1.5 rounded-lg hover:bg-red-50 transition"
                            title="Delete Service"
                          >
                            <Trash2 size={15}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= SECTION: FINANCIALS ================= */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl text-white shadow-xl border border-slate-800">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Banknote className="text-emerald-400"/> Platform Settlement Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur p-6 rounded-2xl border border-white/10">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gross Settled Volume</div>
                  <div className="text-4xl font-black font-mono text-white">₹{stats?.financials?.totalRevenue || 0}</div>
                  <p className="text-[11px] text-slate-400 mt-2">100% of completed service payments</p>
                </div>

                <div className="bg-white/10 backdrop-blur p-6 rounded-2xl border border-white/10">
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">Cooperative Share (10%)</div>
                  <div className="text-4xl font-black font-mono text-emerald-400">₹{stats?.financials?.cooperativeFund || 0}</div>
                  <p className="text-[11px] text-slate-400 mt-2">Reinvested in tools, server infrastructure & training</p>
                </div>

                <div className="bg-white/10 backdrop-blur p-6 rounded-2xl border border-white/10">
                  <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Worker Welfare Fund (5%)</div>
                  <div className="text-4xl font-black font-mono text-blue-400">₹{stats?.financials?.welfareFund || 0}</div>
                  <p className="text-[11px] text-slate-400 mt-2">Guaranteed health & accident insurance pool</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION: AI FORECASTING ================= */}
        {activeTab === 'forecasting' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-purple-100 p-2.5 rounded-2xl text-purple-600"><BrainCircuit size={24}/></div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">AI Predictive Demand Forecasting</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dynamic Workforce Mobilization v2.4</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {stats?.aiForecast?.map((f, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 text-base">{f.service} in {f.location}</div>
                      <div className="text-xs text-slate-500 mt-1">{f.timeframe} • {f.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-600 font-black text-lg font-mono">{f.surgePercentage}</div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Demand Metric</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Recommended Deployments</h3>
              <div className="space-y-3">
                {stats?.aiForecast?.map((f, idx) => (
                  <div key={idx} className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <div className="font-bold text-purple-900 text-sm mb-1">{f.action}</div>
                    <p className="text-xs text-purple-700 mb-3">{f.status} active for {f.service}.</p>
                    <button 
                      onClick={() => alert(`Mobilization alert dispatched for ${f.service} in ${f.location}`)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow-sm"
                    >
                      Broadcast Alert
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* KYC Document Viewer Modal */}
      {selectedKycImage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-lg">Worker Trade Certificate / KYC</h3>
              <button onClick={() => setSelectedKycImage(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1 text-lg">✕</button>
            </div>
            <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
              <img src={selectedKycImage} alt="KYC Document" className="w-full h-full object-contain"/>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setSelectedKycImage(null)}
                className="bg-slate-900 text-white font-bold px-6 py-2 rounded-xl text-xs transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
