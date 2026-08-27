import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle2, XCircle, UserCircle, Wallet, Navigation, AlertTriangle, RefreshCw, Briefcase, ShieldAlert, HeartHandshake, Phone, ArrowUpRight, DollarSign, Calendar, Sparkles, Wrench, Lock, Plus, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function WorkerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [servicesList, setServicesList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [serviceModal, setServiceModal] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [savingSkills, setSavingSkills] = useState(false);

  // Sync tab with URL route or state
  const getInitialTab = () => {
    if (location.pathname.includes('/worker/jobs')) return 'jobs';
    if (location.pathname.includes('/worker/earnings')) return 'earnings';
    if (location.pathname.includes('/worker/welfare')) return 'welfare';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      const [profileRes, bookingsRes, servicesRes] = await Promise.all([
        api.get('/workers/profile'),
        api.get('/bookings/my-bookings'),
        api.get('/services')
      ]);
      if (profileRes.data?.worker) {
        setProfile(profileRes.data.worker);
        const skillIds = profileRes.data.worker.skills?.map(s => typeof s === 'object' ? s._id : s) || [];
        setSelectedSkills(skillIds);
      }
      setBookings(bookingsRes.data?.bookings || []);
      if (servicesRes.data) {
        setServicesList(servicesRes.data);
      }
    } catch (error) {
      console.error('Failed to load worker data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const isWorkerVerified = (profile?.verificationStatus === 'Approved' && profile?.isVerified && (profile?.kycDocuments?.length > 0));

  const toggleOnlineStatus = async () => {
    try {
      if (!profile) return;
      if (!isWorkerVerified) {
        return alert("Your documents are still not verified by the cooperative. You cannot go online until approved.");
      }
      const newStatus = !profile.availability?.isOnline;
      let coords = null;
      
      if (newStatus && navigator.geolocation) {
        coords = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
            () => resolve(null)
          );
        });
      }

      await api.put('/workers/status', { isOnline: newStatus, coordinates: coords });
      await fetchData();
    } catch (error) {
      alert('Failed to update online status');
    }
  };

  const handleAccept = async (bookingId) => {
    if (!isWorkerVerified) {
      return alert("Your documents are still not verified by the cooperative. Please wait for admin approval before accepting requests.");
    }
    try {
      setActionLoading(true);
      const res = await api.put(`/bookings/${bookingId}/accept`);
      if (res.data?.success) {
        await fetchData();
        alert('Dispatch accepted! You can now navigate to the customer location.');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to accept booking';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (bookingId) => {
    try {
      setActionLoading(true);
      await api.put(`/bookings/${bookingId}/reject`);
      await fetchData();
    } catch (error) {
      alert('Failed to decline booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      setActionLoading(true);
      await api.put(`/bookings/${bookingId}/status`, { status });
      await fetchData();
    } catch (error) {
      alert(`Failed to mark status as ${status}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteService = async (bookingId, priceEstimate) => {
    try {
      const finalPrice = prompt("Enter final service amount (₹):", priceEstimate || 350);
      if (!finalPrice) return;
      setActionLoading(true);
      await api.put(`/bookings/${bookingId}/complete`, { finalPrice: parseFloat(finalPrice) });
      await fetchData();
      alert('Job Completed! Settlement has been added to your earnings.');
    } catch (error) {
      alert('Failed to complete booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNavigate = (coordinates) => {
    if (coordinates && coordinates.length === 2 && (coordinates[0] !== 0 || coordinates[1] !== 0)) {
      const [lng, lat] = coordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      alert('Customer GPS coordinates are unavailable. Please call the client for directions.');
    }
  };

  const handleSaveServices = async () => {
    try {
      setSavingSkills(true);
      const res = await api.put('/workers/profile', {
        skills: selectedSkills
      });
      if (res.data?.success) {
        setProfile(res.data.worker);
        setServiceModal(false);
        alert('Services updated successfully!');
      }
    } catch (err) {
      alert('Failed to update services');
    } finally {
      setSavingSkills(false);
    }
  };

  const toggleSkillSelection = (skillId) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  if (loading && !profile) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-600 uppercase tracking-widest text-sm">Connecting to Worker Network...</p>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => ['Pending', 'Assigned', 'OnTheWay', 'Arrived', 'InProgress'].includes(b.status));
  const historyBookings = bookings.filter(b => ['Completed', 'Cancelled'].includes(b.status));
  const completedJobs = bookings.filter(b => b.status === 'Completed');

  const totalEarnings = completedJobs.reduce((sum, b) => sum + (b.financialBreakdown?.workerEarnings || (b.finalPrice || b.priceEstimate || 0) * 0.85), 0);
  const totalWelfare = completedJobs.reduce((sum, b) => sum + (b.financialBreakdown?.welfareShare || (b.finalPrice || b.priceEstimate || 0) * 0.05), 0);
  const isOnline = isWorkerVerified && profile?.availability?.isOnline;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-12 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 border-b border-slate-800 pb-16 pt-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-slate-800 rounded-2xl flex items-center justify-center border-2 border-slate-700 relative overflow-hidden shadow-2xl">
              <span className="text-white font-black text-3xl">{(profile?.user?.name || 'W').charAt(0)}</span>
              {isWorkerVerified ? (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-slate-900 z-10 shadow-sm" title="Verified Professional">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
              ) : (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-slate-900 z-10 shadow-sm" title="Verification Pending">
                  <Clock size={14} className="text-slate-950" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile?.user?.name || 'Worker'}</h1>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {profile?.skills?.map((s, idx) => (
                    <span key={s._id || idx} className="bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-500/30">
                      {s.name} (₹{s.basePrice || 350}/hr)
                    </span>
                  ))}
                  <button 
                    onClick={() => setServiceModal(true)} 
                    className="text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1 transition"
                  >
                    <Wrench size={10}/> Change Services
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1"><Phone size={13} className="text-slate-500"/> {profile?.user?.phone || 'Private'}</span>
                
                {/* Online / Verification Status Indicator */}
                {isWorkerVerified ? (
                  <button 
                    onClick={toggleOnlineStatus}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full font-bold text-xs border transition-all ${isOnline ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    {isOnline ? 'ONLINE (ACCEPTING JOBS)' : 'OFFLINE'}
                  </button>
                ) : (
                  <button 
                    onClick={() => alert("Your documents are still not verified by the cooperative. You cannot go online until approved.")}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  >
                    <Clock size={12} className="text-amber-400 animate-pulse"/> VERIFICATION PENDING
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-3 sm:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 border border-slate-700 min-w-[140px] flex-1 md:flex-none">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Coop Tariff</div>
              <div className="text-xl font-mono text-emerald-400 font-black">
                {profile?.skills?.length > 0 ? `₹${profile.skills[0]?.basePrice || 350}/hr` : 'Per Service'}
              </div>
              <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Fixed by Cooperative</div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 border border-slate-700 min-w-[130px] flex-1 md:flex-none">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Earnings</div>
              <div className="text-2xl font-mono text-blue-400 font-black">₹{totalEarnings.toFixed(0)}</div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 border border-slate-700 min-w-[130px] flex-1 md:flex-none">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</div>
              <div className="text-2xl font-mono text-amber-400 font-black flex items-center gap-1">
                {profile?.rating?.averageScore?.toFixed(1) || '5.0'} <span className="text-xs text-amber-400">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('jobs')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Briefcase size={14}/> Jobs & Requests
            {isWorkerVerified && activeBookings.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">{activeBookings.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('earnings')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'earnings' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Wallet size={14}/> Earnings & Ledgers
          </button>
          <button 
            onClick={() => setActiveTab('welfare')} 
            className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'welfare' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ShieldAlert size={14}/> Welfare & Insurance
          </button>
          <button 
            onClick={() => navigate('/worker/profile')} 
            className="px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-1.5 ml-auto"
          >
            <UserCircle size={14}/> Profile & Verification
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-8 space-y-8">
        
        {/* Verification Alert Banner */}
        {!isWorkerVerified && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-md">
                <AlertTriangle size={24}/>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-amber-950 mb-1">
                  Documents Under Cooperative Verification
                </h3>
                <p className="text-xs font-medium text-amber-900 leading-relaxed max-w-2xl">
                  {profile?.kycDocuments?.length > 0 
                    ? "Your certificates have been uploaded and are currently under review by Cooperative Administration. Live customer requests will be unlocked once an admin approves your profile."
                    : "You have not uploaded your verification documents yet. Upload your certificates or ID cards in your profile to request cooperative approval and unlock customer dispatches."}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button onClick={() => navigate('/worker/profile')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5">
                    <FileText size={14}/> Go to Profile to Upload Documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION: DASHBOARD OVERVIEW ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                  <Briefcase size={24}/>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{isWorkerVerified ? activeBookings.length : 0}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Dispatches</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                  <CheckCircle2 size={24}/>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{completedJobs.length}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Jobs</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                  <ShieldAlert size={24}/>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900 font-mono">₹{totalWelfare.toFixed(0)}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Welfare Accumulated</div>
                </div>
              </div>
            </div>

            {/* Active Jobs Snippet */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Briefcase size={18} className="text-blue-600"/> Live Customer Requests
                </h2>
                {isWorkerVerified && (
                  <button onClick={fetchData} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition">
                    <RefreshCw size={12}/> Refresh Requests
                  </button>
                )}
              </div>

              {!isWorkerVerified ? (
                <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center font-bold text-slate-500 shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-amber-600 border border-amber-200">
                    <Lock size={28}/>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">Live Customer Requests Locked</h3>
                  <p className="text-xs text-slate-500 max-w-md mb-5 leading-relaxed">
                    Customer requests will become visible and available for you to accept once your KYC verification documents are approved by the Cooperative Administration.
                  </p>
                  <button 
                    onClick={() => navigate('/worker/profile')} 
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                  >
                    <FileText size={14}/> View / Upload Documents in Profile
                  </button>
                </div>
              ) : activeBookings.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center font-bold text-slate-500 shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Navigation size={28}/>
                  </div>
                  <h3 className="text-base font-black text-slate-800 mb-1">No Active Dispatches at this moment</h3>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">When a customer nearby or selecting your services submits a request, it will appear here immediately.</p>
                  {!isOnline && (
                    <button onClick={toggleOnlineStatus} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md">
                      Go Online to Receive Pings
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {activeBookings.map((booking) => (
                    <BookingCard 
                      key={booking._id} 
                      booking={booking} 
                      isVerified={isWorkerVerified}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                      onStatusUpdate={handleUpdateBookingStatus}
                      onComplete={handleCompleteService}
                      onNavigate={handleNavigate}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SECTION: JOBS & REQUESTS ================= */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Dispatches & Customer Pings</h2>
                <p className="text-xs text-slate-500">Real-time household and emergency requests according to cooperative service tariffs</p>
              </div>
              {isWorkerVerified && (
                <button onClick={fetchData} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl flex items-center gap-1.5 transition">
                  <RefreshCw size={14}/> Sync Data
                </button>
              )}
            </div>

            {!isWorkerVerified ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center font-bold text-slate-500 shadow-sm flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-amber-600 border border-amber-200">
                  <Lock size={32}/>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">Access Locked: Verification Pending</h3>
                <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
                  You cannot view or accept customer requests until your KYC documents are approved by the Cooperative Admin.
                </p>
                <button 
                  onClick={() => navigate('/worker/profile')} 
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md flex items-center gap-2"
                >
                  <FileText size={16}/> Go to Profile to Upload Documents
                </button>
              </div>
            ) : activeBookings.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center font-bold text-slate-500 shadow-sm flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <Briefcase size={28}/>
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">No Active Requests</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">Ensure your status is set to ONLINE to receive incoming service dispatches from nearby customers.</p>
                {!isOnline && (
                  <button onClick={toggleOnlineStatus} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md">
                    Switch to Online
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((booking) => (
                  <BookingCard 
                    key={booking._id} 
                    booking={booking} 
                    isVerified={isWorkerVerified}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onStatusUpdate={handleUpdateBookingStatus}
                    onComplete={handleCompleteService}
                    onNavigate={handleNavigate}
                    loading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION: EARNINGS & LEDGERS ================= */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-8 rounded-3xl text-white shadow-xl border border-slate-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">Total Net Earnings Settled</div>
                  <div className="text-4xl sm:text-5xl font-black font-mono">₹{totalEarnings.toFixed(0)}</div>
                  <p className="text-xs text-slate-400 mt-2">Transparent Cooperative breakdown: 85% Net Payout • 10% Platform & Support • 5% Welfare Fund</p>
                </div>
                <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10 text-right">
                  <div className="text-xs font-bold text-slate-300">Completed Deliveries</div>
                  <div className="text-3xl font-black font-mono text-emerald-400 mt-1">{completedJobs.length} Jobs</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <h3 className="text-lg font-black text-slate-900 mb-4">Job History & Settlements</h3>

              {historyBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">No completed jobs in the ledger yet.</div>
              ) : (
                <div className="space-y-4">
                  {historyBookings.map((b) => (
                    <div key={b._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">Request #{b._id.substring(b._id.length - 6).toUpperCase()}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{b.status}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{b.service?.name || 'General Service'} • {new Date(b.createdAt).toLocaleDateString()}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-600 font-mono">₹{b.finalPrice || b.priceEstimate || 0}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Net Payout: ₹{((b.finalPrice || b.priceEstimate || 0) * 0.85).toFixed(0)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SECTION: WELFARE & INSURANCE ================= */}
        {activeTab === 'welfare' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><ShieldAlert size={160} /></div>
               <div className="relative z-10">
                 <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><ShieldAlert /> Worker Welfare & Security Fund</h2>
                 <p className="text-emerald-100 mb-8 max-w-xl font-medium text-sm">Every completed gig contributes 5% directly to your Cooperative Welfare Fund to protect you and your family.</p>
                 
                 <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 inline-block">
                   <div className="text-emerald-200 font-bold uppercase tracking-widest text-xs mb-1">Total Accumulated Balance</div>
                   <div className="text-4xl font-black font-mono">₹{totalWelfare.toFixed(0)}</div>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold"><HeartHandshake size={24} /></div>
                   <div>
                     <h3 className="font-bold text-slate-900 text-base">Health Insurance Coverage</h3>
                     <span className="text-xs text-slate-400">Cooperative Health Shield</span>
                   </div>
                 </div>
                 <p className="text-xs text-slate-600 mb-4 leading-relaxed">Comprehensive health coverage for you and dependents up to ₹5,00,000 across partnered cooperative hospital networks.</p>
                 <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                   <span className="text-xs font-bold text-slate-500 uppercase">Policy Status</span>
                   <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">ACTIVE & COVERED</span>
                 </div>
               </div>
               
               <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold"><AlertTriangle size={24} /></div>
                   <div>
                     <h3 className="font-bold text-slate-900 text-base">On-Job Accident Shield</h3>
                     <span className="text-xs text-slate-400">Instant Claim Protection</span>
                   </div>
                 </div>
                 <p className="text-xs text-slate-600 mb-4 leading-relaxed">Emergency on-site injury support, disability assistance, and wage protection during medical recovery.</p>
                 <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                   <span className="text-xs font-bold text-slate-500 uppercase">Policy Code</span>
                   <span className="text-xs font-bold text-slate-800 font-mono">COOP-SEC-2026</span>
                 </div>
               </div>
            </div>
          </div>
        )}

      </div>

      {/* Services Modal (Fixed Cooperative Rates) */}
      {serviceModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2"><Wrench size={18} className="text-blue-400"/> Select Services Provided</h3>
                <p className="text-xs text-slate-400 mt-0.5">Rates are fixed by the cooperative tariff schedule per service</p>
              </div>
              <button onClick={() => setServiceModal(false)} className="text-slate-400 hover:text-white font-bold p-1 text-lg">✕</button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Available Cooperative Trades
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {servicesList.map(s => {
                    const isSelected = selectedSkills.includes(s._id);
                    return (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => toggleSkillSelection(s._id)}
                        className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border ${
                          isSelected 
                            ? 'bg-blue-50 text-blue-900 border-blue-500 shadow-sm ring-1 ring-blue-500' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-left">
                          <span className="block font-bold">{s.name}</span>
                          <span className="text-[10px] text-emerald-600 font-mono font-bold">₹{s.basePrice || 350}/hr</span>
                        </div>
                        {isSelected ? <CheckCircle2 size={16} className="text-blue-600"/> : <Plus size={16} className="text-slate-400"/>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setServiceModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveServices}
                  disabled={savingSkills}
                  className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md disabled:opacity-50"
                >
                  {savingSkills ? 'Saving...' : 'Save Services'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component for clean reusable booking cards with verification checks
function BookingCard({ booking, isVerified, onAccept, onDecline, onStatusUpdate, onComplete, onNavigate, loading }) {
  return (
    <div className={`bg-white rounded-3xl p-6 border-2 shadow-sm transition-all flex flex-col md:flex-row justify-between gap-6 ${booking.isEmergency ? 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'border-slate-200'}`}>
      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-xl text-slate-900">Request #{booking._id.substring(booking._id.length - 6).toUpperCase()}</h3>
              {booking.isEmergency && <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">EMERGENCY</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                booking.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                booking.status === 'Assigned' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                booking.status === 'OnTheWay' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                booking.status === 'Arrived' ? 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200' :
                'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                Status: {booking.status}
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Service: {booking.service?.name || 'General'}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coop Tariff (85% Net)</div>
            <div className="font-mono text-2xl font-black text-emerald-600 flex items-center justify-end gap-2">
              ₹{((booking.priceEstimate || 350) * 0.85).toFixed(0)}
              {booking.isEmergency && (
                <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black border border-red-200 animate-pulse">1.5x BONUS</span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-bold mt-1">Total: ₹{booking.priceEstimate || 350} {booking.isEmergency && '(Surge Pricing)'}</div>
          </div>
        </div>

        {/* Customer Details Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Customer Name</span>
            <span className="font-bold text-slate-800 text-sm">{booking.customer?.name || 'Customer'}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Contact Phone</span>
            <span className="font-bold text-blue-600 text-sm">{booking.customer?.phone || 'Available after accept'}</span>
          </div>
          <div className="sm:col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 font-medium text-slate-700">
              <MapPin size={14} className="text-red-500"/>
              <span>Coordinates: {booking.location?.coordinates?.map(c => c.toFixed(4)).join(', ') || 'GPS Location Set'}</span>
            </div>
            <button 
              onClick={() => onNavigate(booking.location?.coordinates)}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg transition"
            >
              <Navigation size={12}/> Open in Google Maps
            </button>
          </div>
        </div>
      </div>

      {/* Action Pipeline Buttons */}
      <div className="flex flex-col justify-center gap-3 md:border-l border-slate-100 md:pl-6 min-w-[200px]">
        {booking.status === 'Pending' && (
          <>
            {isVerified ? (
              <button 
                onClick={() => onAccept(booking._id)} 
                disabled={loading}
                className={`w-full text-white font-black py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-lg hover:scale-105 ${booking.isEmergency ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'}`}
              >
                Accept Dispatch
              </button>
            ) : (
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => alert("Your documents are still not verified by the cooperative. Please wait for admin verification before accepting jobs.")}
                  className="w-full bg-slate-200 text-slate-500 font-bold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <Lock size={14}/> Verification Required
                </button>
                <span className="text-[10px] text-amber-700 font-semibold text-center">Admin Approval Pending</span>
              </div>
            )}
            <button 
              onClick={() => onDecline(booking._id)} 
              disabled={loading}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl transition text-xs uppercase tracking-wider"
            >
              Decline Request
            </button>
          </>
        )}

        {booking.status === 'Assigned' && (
          <button 
            onClick={() => onStatusUpdate(booking._id, 'OnTheWay')} 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 hover:scale-105"
          >
            Mark: On The Way
          </button>
        )}

        {booking.status === 'OnTheWay' && (
          <button 
            onClick={() => onStatusUpdate(booking._id, 'Arrived')} 
            disabled={loading}
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-fuchsia-600/30 hover:scale-105"
          >
            Mark: Arrived at Client
          </button>
        )}

        {booking.status === 'Arrived' && (
          <button 
            onClick={() => onStatusUpdate(booking._id, 'InProgress')} 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 hover:scale-105"
          >
            Start Service Job
          </button>
        )}

        {booking.status === 'InProgress' && (
          <button 
            onClick={() => onComplete(booking._id, booking.priceEstimate)} 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 hover:scale-105"
          >
            Complete Job & Settle
          </button>
        )}
      </div>
    </div>
  );
}
