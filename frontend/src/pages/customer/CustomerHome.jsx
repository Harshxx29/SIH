import React, { useState, useEffect } from 'react';
import { Search, MapPin, ShieldCheck, AlertTriangle, Navigation, CreditCard, Banknote, Clock, CheckCircle2, Filter } from 'lucide-react';
import api from '../../services/api';
import useNearbyWorkers from '../../hooks/useNearbyWorkers';
import { useNavigate } from 'react-router-dom';

export default function CustomerHome() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [coordinates, setCoordinates] = useState(null); // [lng, lat]
  const [radius, setRadius] = useState(25000); // 25km radius
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myBookings, setMyBookings] = useState([]);
  const [paymentModal, setPaymentModal] = useState({ show: false, workerId: null, workerName: '', price: 0, serviceId: null, serviceName: '' });
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const lat = coordinates ? coordinates[1] : null;
  const lng = coordinates ? coordinates[0] : null;

  const { workers, loading: workersLoading, connectionStatus } = useNearbyWorkers(lat, lng, radius);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      if (response.data.success) {
        setMyBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data) {
        const user = res.data;
        const coords = user.location?.coordinates;
        if (coords && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0)) {
          setCoordinates([coords[0], coords[1]]);
          const addr = [user.address?.street, user.address?.city].filter(Boolean).join(', ');
          setLocationQuery(addr || 'Saved Profile Location');
          return;
        }
      }
    } catch (err) {
      console.log('No saved profile location found yet');
    }

    // Default to central live coordinates if not set
    if (!coordinates) {
      setCoordinates([77.2167, 28.6328]);
      setLocationQuery('Connaught Place, New Delhi (Default)');
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
    fetchBookings();
    fetchUserProfile();

    const interval = setInterval(fetchBookings, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
          setLocationQuery('Current Location (GPS Live)');
        },
        (error) => {
          setCoordinates([77.2167, 28.6328]);
          setLocationQuery('Connaught Place, New Delhi');
          alert('Using default central location coordinates.');
        }
      );
    } else {
      setCoordinates([77.2167, 28.6328]);
      setLocationQuery('Connaught Place, New Delhi');
    }
  };

  const filteredWorkers = workers.filter(w => {
    if (!searchQuery) return true;
    return w.skills?.some(skill =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const triggerPayment = (worker, serviceObj) => {
    const chosenService = serviceObj || (worker.skills && worker.skills[0]) || (services.length > 0 ? services[0] : null);
    const baseTariff = chosenService?.basePrice || 350;
    const finalTariff = isEmergency ? Math.round(baseTariff * 1.5) : baseTariff;

    setPaymentModal({
      show: true,
      workerId: worker?._id || null,
      workerName: worker?.user?.name || 'Nearest Available Verified Worker',
      price: finalTariff,
      serviceId: chosenService?._id || null,
      serviceName: chosenService?.name || 'General Maintenance'
    });
  };

  const handleConfirmDeploy = async () => {
    try {
      const payload = {
        workerId: paymentModal.workerId,
        serviceId: paymentModal.serviceId,
        priceEstimate: paymentModal.price,
        isEmergency,
        paymentMethod,
        location: coordinates ? { type: 'Point', coordinates } : { type: 'Point', coordinates: [77.2167, 28.6328] },
        notes: isEmergency ? '🚨 EMERGENCY DISPATCH REQUEST' : 'Standard Cooperative Service Request'
      };

      const response = await api.post('/bookings', payload);
      if (response.data.success) {
        alert('Booking confirmed! Dispatch request sent to worker.');
        setPaymentModal({ show: false, workerId: null, workerName: '', price: 0, serviceId: null, serviceName: '' });
        await fetchBookings();
      }
    } catch (error) {
      console.error('Deploy failed:', error);
      alert('Failed to deploy worker. Please ensure you are signed in.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      await fetchBookings();
    } catch (error) {
      alert('Failed to cancel booking');
    }
  };

  const handleConfirmCompletion = async (bookingId, finalPrice) => {
    try {
      const review = prompt("Please rate the service (1-5 stars):", "5");
      const ratingNum = parseInt(review);

      await api.put(`/bookings/${bookingId}/complete`, { finalPrice });
      if (!isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5) {
        await api.post(`/bookings/${bookingId}/review`, { rating: ratingNum, review: "Great service!" });
      }

      alert('Job Completed! A digital invoice has been settled.');
      await fetchBookings();
    } catch (error) {
      alert('Failed to complete booking');
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-12 flex flex-col font-sans">
      {/* Search Header */}
      <div className={`pt-12 pb-24 px-4 relative overflow-hidden transition-colors duration-500 ${isEmergency ? 'bg-red-950' : 'bg-slate-900'}`}>
        <div className="max-w-7xl mx-auto relative z-10 text-center">

          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-1 rounded-full inline-flex backdrop-blur-md border border-white/20">
              <button onClick={() => setIsEmergency(false)} className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${!isEmergency ? 'bg-white text-slate-900 shadow-md scale-105' : 'text-white hover:bg-white/20'}`}>Normal Service</button>
              <button onClick={() => setIsEmergency(true)} className={`px-6 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${isEmergency ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105' : 'text-white hover:bg-white/20'}`}><AlertTriangle size={14} /> Emergency</button>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
            {isEmergency ? '🚨 Emergency Cooperative Deployment' : 'Book a Verified Cooperative Professional'}
          </h1>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-sm md:text-base">
            {isEmergency ? 'Priority instant dispatch. Rates are 1.5x with immediate response.' : 'Fixed cooperative tariffs • 100% KYC verified trade professionals'}
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/40">
            <div className="flex-[1.5] flex items-center px-5 py-4 border-b md:border-b-0 md:border-r border-slate-200">
              <Search className="text-slate-400 mr-3" size={20} />
              <select
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full focus:outline-none text-slate-900 font-bold bg-transparent cursor-pointer text-sm"
              >
                <option value="">All Services & Trades</option>
                {services.map(s => <option key={s._id} value={s.name}>{s.name} (₹{s.basePrice}/hr)</option>)}
              </select>
            </div>
            <div className="flex-[2] flex items-center px-5 py-4">
              <button onClick={handleGetLocation} className="text-blue-600 hover:text-white mr-3 p-2 bg-blue-50 hover:bg-blue-600 rounded-xl transition-colors border border-blue-100 group" title="Detect Live GPS Location">
                <Navigation size={18} />
              </button>
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  if (!coordinates) setCoordinates([77.2167, 28.6328]);
                }}
                placeholder="Location (e.g. Connaught Place, New Delhi)"
                className="w-full focus:outline-none text-slate-900 font-medium bg-transparent placeholder:text-slate-400 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 flex-1 flex flex-col">

        {/* Live Dispatches Section */}
        {myBookings.length > 0 && (
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-6 mb-8 text-white">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Active Service Requests</span>
              <button onClick={fetchBookings} className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-full"><Clock size={12} /> Refresh</button>
            </h2>
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <div key={booking._id} className={`bg-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center border ${booking.isEmergency ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-700'} gap-4`}>
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-black text-lg">Request #{booking._id.substring(booking._id.length - 6).toUpperCase()}</h3>
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${booking.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          booking.status === 'Assigned' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            booking.status === 'OnTheWay' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              booking.status === 'Arrived' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' :
                                booking.status === 'InProgress' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                  booking.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                    'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                        {booking.status}
                      </span>
                      {booking.isEmergency && <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest animate-pulse">EMERGENCY</span>}
                    </div>

                    {/* Status Tracking Progress */}
                    <div className="w-full bg-slate-700/50 h-2 rounded-full mt-4 mb-2 overflow-hidden flex">
                      {['Pending', 'Assigned', 'OnTheWay', 'Arrived', 'InProgress', 'Completed'].map((step, idx, arr) => {
                        const currentIndex = arr.indexOf(booking.status);
                        const isPast = currentIndex >= idx;
                        return <div key={step} className={`h-full flex-1 transition-all duration-500 ${isPast ? (booking.isEmergency ? 'bg-red-500' : 'bg-emerald-500') : 'bg-transparent'} ${idx > 0 ? 'border-l-2 border-slate-800' : ''}`}></div>
                      })}
                    </div>
                    <div className="text-[10px] text-slate-400 flex justify-between px-1 font-bold uppercase">
                      <span>Requested</span>
                      <span>Assigned</span>
                      <span>On Way</span>
                      <span>Arrived</span>
                      <span>Working</span>
                      <span>Done</span>
                    </div>

                    <div className="text-xs text-slate-300 mt-3 bg-slate-900/60 p-3 rounded-xl inline-flex gap-4 border border-slate-700/50 flex-wrap">
                      <div><span className="text-slate-500 block text-[10px] uppercase">Service</span> <span className="font-bold">{booking.service?.name || 'General'}</span></div>
                      <div className="w-px bg-slate-700"></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase">Worker</span> <span className="font-bold text-blue-400">{booking.worker?.user?.name || 'Finding nearest worker...'}</span></div>
                      <div className="w-px bg-slate-700"></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase">Tariff</span> <span className="font-bold font-mono text-emerald-400">₹{booking.priceEstimate || 350}</span></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto min-w-[160px]">
                    {booking.status === 'Pending' && (
                      <button onClick={() => handleCancelBooking(booking._id)} className="w-full bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-bold py-2.5 px-4 rounded-xl transition text-xs uppercase tracking-wider">
                        Cancel Request
                      </button>
                    )}
                    {booking.status === 'Completed' && !booking.rating && (
                      <button onClick={() => handleConfirmCompletion(booking._id, booking.priceEstimate)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition text-xs uppercase tracking-wider shadow-md">
                        Review & Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workspace: Categories + Map + Nearby List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">

          {/* Categories Bar */}
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 text-blue-600">
                <Filter size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Available Trades Nearby</h2>
                <p className="text-xs text-slate-500">Filter by category to view nearby verified workers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <MapPin size={12} className="text-red-500" />
                <span className="max-w-[220px] truncate">{locationQuery || 'Location Active'}</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {filteredWorkers.length} Verified Online
              </div>
            </div>
          </div>

          {/* Categories Carousel */}
          <div className="px-4 md:px-6 py-3 overflow-x-auto no-scrollbar flex items-center gap-2 border-b border-slate-100 bg-white">
            <button
              onClick={() => setSearchQuery('')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${!searchQuery ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All Categories
            </button>
            {services.map(service => (
              <button
                key={service._id}
                onClick={() => setSearchQuery(service.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${searchQuery === service.name ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {service.name} (₹{service.basePrice})
              </button>
            ))}
          </div>

          {/* List and Interactive Map View */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[500px]">

            {/* List View */}
            <div className="w-full lg:w-5/12 h-[450px] lg:h-full bg-slate-50/50 overflow-y-auto p-4 md:p-6 border-r border-slate-200 custom-scrollbar">

              {workersLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                  <p className="font-bold uppercase tracking-widest text-xs">Scanning Location...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex justify-between items-center">
                    <div>
                      <span className="text-xl font-black text-slate-900">{filteredWorkers.length}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase ml-2">Workers in Radius</span>
                    </div>
                    <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer">
                      <option value={5000}>Within 5 km</option>
                      <option value={15000}>Within 15 km</option>
                      <option value={25000}>Within 25 km</option>
                      <option value={50000}>Within 50 km</option>
                    </select>
                  </div>

                  {filteredWorkers.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm mt-4">
                      <Search size={36} className="mx-auto text-slate-300 mb-3" />
                      <h3 className="text-base font-black text-slate-900 mb-1">No verified {searchQuery || 'workers'} nearby</h3>
                      <p className="text-xs text-slate-500 mb-4">Try expanding the search radius or choosing another service category.</p>
                      <button onClick={() => setRadius(r => r + 10000)} className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl w-full">
                        Expand Radius to {(radius / 1000) + 10} km
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredWorkers.map(worker => {
                        const firstSkill = worker.skills?.[0];
                        const tariff = firstSkill?.basePrice || 350;
                        return (
                          <div key={worker._id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${isEmergency ? 'bg-red-500' : 'bg-emerald-500'}`}></div>

                            <div className="flex justify-between items-start mb-3">
                              <div className="flex gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-slate-800 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                                  {worker.user?.name?.charAt(0) || 'W'}
                                </div>
                                <div>
                                  <h3 className="font-black text-slate-900 text-base">{worker.user?.name || 'Worker'}</h3>
                                  <div className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase mt-0.5 border border-emerald-200 w-max">
                                    <ShieldCheck size={11} /> Verified Cooperative Pro
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 font-bold text-amber-500 text-xs justify-end">
                                  ⭐ {worker.rating?.averageScore?.toFixed(1) || '4.9'}
                                </div>
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1 block">ONLINE NOW</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {worker.skills?.map(s => (
                                <span key={s._id || s.name} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-bold border border-slate-200">
                                  {s.name} (₹{s.basePrice}/hr)
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                              <div className="text-xs font-bold text-slate-600 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                                <Navigation size={12} className="text-blue-500" />
                                <span>{worker.distanceKm ? `${worker.distanceKm} km away` : 'Nearby'}</span>
                              </div>
                              <div className="font-mono font-black text-slate-900 text-base">
                                ₹{isEmergency ? Math.round(tariff * 1.5) : tariff}<span className="text-[10px] font-bold text-slate-400">/hr</span>
                              </div>
                              <button
                                onClick={() => triggerPayment(worker, firstSkill)}
                                className={`text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition uppercase tracking-wider ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-blue-600'}`}
                              >
                                {isEmergency ? 'Deploy Now' : 'Book Pro'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Visual Radar Map */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center min-h-[400px]">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

              {/* Radar circles */}
              <div className="absolute w-72 h-72 rounded-full border border-slate-800"></div>
              <div className="absolute w-48 h-48 rounded-full border border-slate-800"></div>
              <div className="absolute w-24 h-24 rounded-full border border-blue-500/20 animate-ping"></div>

              {/* Center Customer Marker */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl border-2 border-white shadow-2xl flex items-center justify-center text-white font-black text-xs">
                  YOU
                </div>
                <div className="bg-white/90 backdrop-blur text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow mt-2">
                  Your Location
                </div>
              </div>

              {/* Render Workers on Radar */}
              {!workersLoading && filteredWorkers.map((worker, i) => {
                const angle = (i * 137.5) * (Math.PI / 180);
                const radiusPos = 60 + (i * 20 % 120);
                const x = `calc(50% + ${Math.cos(angle) * radiusPos}px)`;
                const y = `calc(50% + ${Math.sin(angle) * radiusPos}px)`;

                return (
                  <div
                    key={worker._id}
                    className="absolute z-20 flex flex-col items-center group cursor-pointer"
                    style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
                    onClick={() => triggerPayment(worker, worker.skills?.[0])}
                  >
                    <div className="w-7 h-7 rounded-2xl bg-emerald-500 border-2 border-slate-900 shadow-xl flex items-center justify-center text-slate-950 font-black text-[10px] group-hover:scale-125 transition-transform">
                      {(worker.user?.name || 'W').charAt(0)}
                    </div>
                    <div className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xl mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full pointer-events-none whitespace-nowrap border border-slate-700 z-30">
                      {worker.user?.name} ({worker.distanceKm || 1} km)
                    </div>
                  </div>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur p-3 rounded-2xl border border-slate-800 text-[10px] font-bold text-slate-400 space-y-1">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-500 rounded"></div> Customer Location</div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded"></div> Verified Active Worker</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {paymentModal.show && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
            <div className={`p-6 text-white ${isEmergency ? 'bg-red-600' : 'bg-slate-900'}`}>
              <h3 className="text-xl font-black mb-1">Confirm Service Booking</h3>
              <p className="text-white/80 text-xs">Worker: {paymentModal.workerName}</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Service & Tariff</div>
                  <div className="font-bold text-slate-900 text-sm">{paymentModal.serviceName}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-900 font-mono">₹{paymentModal.price}</div>
                  {isEmergency && <span className="text-[9px] font-black text-red-600 uppercase">1.5x Surge</span>}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Select Payment Method</label>
                <div className="space-y-2">
                  <div className={`border-2 rounded-2xl p-3 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'UPI' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200'}`} onClick={() => setPaymentMethod('UPI')}>
                    <CreditCard size={18} className="text-blue-600" />
                    <span className="flex-1 font-bold text-xs text-slate-900">UPI / Online Gateway</span>
                    {paymentMethod === 'UPI' && <CheckCircle2 size={16} className="text-blue-600" />}
                  </div>

                  <div className={`border-2 rounded-2xl p-3 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-slate-200'}`} onClick={() => setPaymentMethod('Cash')}>
                    <Banknote size={18} className="text-emerald-600" />
                    <span className="flex-1 font-bold text-xs text-slate-900">Cash on Service Completion</span>
                    {paymentMethod === 'Cash' && <CheckCircle2 size={16} className="text-emerald-600" />}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setPaymentModal({ show: false, workerId: null, workerName: '', price: 0, serviceId: null, serviceName: '' })} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition">
                  Cancel
                </button>
                <button onClick={handleConfirmDeploy} className={`flex-[1.5] py-3 text-white font-black uppercase tracking-wider rounded-xl text-xs transition shadow-md ${isEmergency ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'}`}>
                  Confirm & Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
