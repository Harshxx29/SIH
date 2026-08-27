import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Search, Filter, ShieldCheck, Zap, CreditCard, Banknote, CheckCircle2 } from 'lucide-react';
import useNearbyWorkers from '../../hooks/useNearbyWorkers';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function LiveNearby() {
  const navigate = useNavigate();
  const [userLoc, setUserLoc] = useState({ lat: 28.6328, lng: 77.2167 }); // Connaught Place central Delhi
  const [radius, setRadius] = useState(25000);
  const [locName, setLocName] = useState('Connaught Place, New Delhi');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [services, setServices] = useState([]);
  const [paymentModal, setPaymentModal] = useState({ show: false, worker: null, price: 0, service: null });
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const { workers, loading, connectionStatus } = useNearbyWorkers(userLoc.lat, userLoc.lng, radius);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data) setServices(res.data);
      } catch (e) {
        console.log('Error loading services');
      }
    };

    const loadProfileLocation = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data?.location?.coordinates) {
          const [lng, lat] = res.data.location.coordinates;
          if (lat !== 0 && lng !== 0) {
            setUserLoc({ lat, lng });
            const addr = [res.data.address?.street, res.data.address?.city].filter(Boolean).join(', ');
            setLocName(addr || 'Saved Profile Location');
          }
        }
      } catch (e) {
        console.log('No profile location found');
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocName('Live GPS Location');
          },
          () => {}
        );
      }
    };

    fetchServices();
    loadProfileLocation();
  }, []);

  const handleLiveGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocName('Live GPS Location');
        },
        () => alert('Unable to detect live location. Using current map coordinates.')
      );
    }
  };

  const filteredWorkers = workers.filter(w => {
    if (selectedCategory === 'All') return true;
    return w.skills?.some(skill => 
      skill.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      skill.category?.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  });

  const triggerBooking = (worker) => {
    const chosenService = worker.skills?.[0] || services[0];
    setPaymentModal({
      show: true,
      worker,
      price: chosenService?.basePrice || 350,
      service: chosenService
    });
  };

  const handleConfirmDeploy = async () => {
    try {
      const payload = {
        workerId: paymentModal.worker?._id,
        serviceId: paymentModal.service?._id,
        priceEstimate: paymentModal.price,
        isEmergency: false,
        paymentMethod,
        location: { type: 'Point', coordinates: [userLoc.lng, userLoc.lat] },
        notes: 'Live Nearby Dispatch Request'
      };
      
      const response = await api.post('/bookings', payload);
      if (response.data?.success) {
        alert('Booking confirmed! Dispatch sent to worker.');
        setPaymentModal({ show: false, worker: null, price: 0, service: null });
        navigate('/customer/dashboard');
      }
    } catch (error) {
      alert('Failed to deploy worker. Please check your connection.');
    }
  };

  const categories = ['All', ...services.map(s => s.name)];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden font-sans bg-slate-50">
      
      {/* Header */}
      <div className="bg-white px-4 py-4 md:px-8 md:py-5 border-b border-slate-200 shadow-sm z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              {connectionStatus === 'connected' ? 'LIVE NETWORK' : connectionStatus}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live Nearby Professionals</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold flex-wrap">
             <span className="flex items-center gap-1"><MapPin size={14} className="text-red-500"/> {locName} • Within {radius/1000} km</span>
             <button onClick={handleLiveGPS} className="text-xs text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition">
               <Navigation size={12}/> Detect Live GPS
             </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <div className="text-2xl font-black text-blue-600 leading-none">{filteredWorkers.length}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Nearby</div>
           </div>
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 z-10 overflow-x-auto no-scrollbar flex items-center gap-2">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1"><Filter size={12}/> Filter:</div>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Split Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* List View */}
        <div className="w-full md:w-5/12 lg:w-4/12 h-1/2 md:h-full bg-slate-50 overflow-y-auto p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-200 z-10">
          
          {loading && <div className="p-8 text-center text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">Scanning Network...</div>}
          
          {!loading && filteredWorkers.length === 0 && (
            <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm mt-4">
               <Search size={36} className="mx-auto text-slate-300 mb-3"/>
               <h3 className="text-base font-black text-slate-900 mb-1">No {selectedCategory !== 'All' ? selectedCategory : 'workers'} found nearby</h3>
               <p className="text-xs text-slate-500 mb-4">Try expanding the search radius.</p>
               <button onClick={() => setRadius(r => r + 10000)} className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl">Expand Radius to {(radius/1000) + 10} km</button>
            </div>
          )}

          <div className="space-y-3">
            {filteredWorkers.map(worker => (
              <div key={worker._id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-slate-800 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-sm">
                      {worker.user?.name?.charAt(0) || 'W'}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">{worker.user?.name || 'Worker'}</h3>
                      <div className="flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase mt-0.5 border border-emerald-200 w-max">
                        <ShieldCheck size={10}/> Verified Pro
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-amber-500 text-xs justify-end">
                      ⭐ {worker.rating?.averageScore?.toFixed(1) || '4.9'}
                    </div>
                    <div className="text-[9px] font-black text-emerald-600 mt-1 uppercase tracking-widest">ONLINE NOW</div>
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
                   <div className="text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg">
                     <Navigation size={12} className="text-blue-500"/>
                     <span>{worker.distanceKm ? `${worker.distanceKm} km away` : 'Nearby'}</span>
                   </div>
                   <button 
                     onClick={() => triggerBooking(worker)}
                     className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-sm transition uppercase tracking-wider"
                   >
                     Book Service
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
           
           <div className="absolute w-80 h-80 rounded-full border border-slate-800 pointer-events-none"></div>
           <div className="absolute w-52 h-52 rounded-full border border-slate-800 pointer-events-none"></div>
           <div className="absolute w-24 h-24 rounded-full border border-blue-500/20 animate-ping pointer-events-none"></div>

           {/* User Location Marker */}
           <div className="relative z-10 flex flex-col items-center">
             <div className="w-10 h-10 bg-blue-600 rounded-2xl border-2 border-white shadow-2xl flex items-center justify-center text-white font-black text-xs">
               YOU
             </div>
             <div className="bg-white text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow mt-2">
               Your Location
             </div>
           </div>

           {/* Render Worker Markers */}
           {filteredWorkers.map((worker, i) => {
             const angle = (i * 137.5) * (Math.PI / 180);
             const radiusPos = 70 + (i * 20 % 140);
             const x = `calc(50% + ${Math.cos(angle) * radiusPos}px)`;
             const y = `calc(50% + ${Math.sin(angle) * radiusPos}px)`;

             return (
               <div 
                 key={worker._id} 
                 className="absolute z-20 flex flex-col items-center group cursor-pointer" 
                 style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
                 onClick={() => triggerBooking(worker)}
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

           <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur p-3 rounded-2xl border border-slate-800 text-[10px] font-bold text-slate-400 space-y-1">
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-500 rounded"></div> Customer Location</div>
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded"></div> Verified Active Worker</div>
           </div>
        </div>

      </div>

      {/* Booking Confirmation Modal */}
      {paymentModal.show && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
            <div className="p-6 text-white bg-slate-900">
               <h3 className="text-xl font-black mb-1">Confirm Service Booking</h3>
               <p className="text-white/80 text-xs">Worker: {paymentModal.worker?.user?.name}</p>
            </div>
            <div className="p-6 space-y-6">
               <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                 <div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Service & Tariff</div>
                   <div className="font-bold text-slate-900 text-sm">{paymentModal.service?.name}</div>
                 </div>
                 <div className="text-right">
                   <div className="text-3xl font-black text-slate-900 font-mono">₹{paymentModal.price}</div>
                 </div>
               </div>

               <div>
                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Payment Option</label>
                 <div className="space-y-2">
                   <div className={`border-2 rounded-2xl p-3 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'UPI' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200'}`} onClick={() => setPaymentMethod('UPI')}>
                     <CreditCard size={18} className="text-blue-600"/>
                     <span className="flex-1 font-bold text-xs text-slate-900">UPI / Online Pay</span>
                     {paymentMethod === 'UPI' && <CheckCircle2 size={16} className="text-blue-600"/>}
                   </div>

                   <div className={`border-2 rounded-2xl p-3 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-slate-200'}`} onClick={() => setPaymentMethod('Cash')}>
                     <Banknote size={18} className="text-emerald-600"/>
                     <span className="flex-1 font-bold text-xs text-slate-900">Cash on Service Completion</span>
                     {paymentMethod === 'Cash' && <CheckCircle2 size={16} className="text-emerald-600"/>}
                   </div>
                 </div>
               </div>

               <div className="flex gap-3 pt-2">
                 <button onClick={() => setPaymentModal({show: false, worker: null, price: 0, service: null})} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition">
                   Cancel
                 </button>
                 <button onClick={handleConfirmDeploy} className="flex-[1.5] py-3 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider rounded-xl text-xs transition shadow-md">
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
