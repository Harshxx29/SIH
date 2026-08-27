import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Navigation, Zap, Wrench, ShieldAlert, CheckCircle2, PhoneCall } from 'lucide-react';
import api from '../../services/api';

export default function EmergencyBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('Detecting GPS...');
  const [dispatchStatus, setDispatchStatus] = useState('SEARCHING'); // SEARCHING, FOUND, DISPATCHED
  const [assignedWorker, setAssignedWorker] = useState(null);

  // Mock Map coordinates for visual
  const mapGrid = Array.from({ length: 100 });

  const startEmergency = async (selectedCategory) => {
    setCategory(selectedCategory);
    setStep(2);
    
    // Simulate GPS fetch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation([pos.coords.longitude, pos.coords.latitude]);
          setLocationName('Precise GPS Location Acquired');
        },
        () => {
          setLocation([77.2090, 28.6139]);
          setLocationName('Fallback Location (Delhi)');
        }
      );
    }

    // Simulate API match delay
    setTimeout(() => {
      setDispatchStatus('FOUND');
      setAssignedWorker({ name: 'Rajesh Kumar', distance: '1.2 km away', eta: '6 mins' });
    }, 3000);

    setTimeout(() => {
      setDispatchStatus('DISPATCHED');
    }, 6000);
  };

  return (
    <div className="bg-slate-900 min-h-[calc(100vh-64px)] pb-12 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Pulse */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[800px] h-[800px] bg-red-600 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {step === 1 && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-red-100 animate-in fade-in slide-in-from-bottom-8">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-3xl font-black text-center text-slate-900 mb-2">Emergency Dispatch</h1>
            <p className="text-center text-slate-500 font-medium mb-8">Priority deployment. A verified worker will be dispatched to your location immediately. 1.5x Surge Pricing applies.</p>
            
            <div className="space-y-4">
              <button onClick={() => startEmergency('Electrical Hazard')} className="w-full flex items-center p-4 border-2 border-slate-100 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all group">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform"><Zap size={24}/></div>
                <div className="text-left flex-1">
                  <div className="font-bold text-slate-900 text-lg">Electrical Hazard</div>
                  <div className="text-xs text-slate-500">Short circuits, power failure</div>
                </div>
              </button>
              
              <button onClick={() => startEmergency('Severe Plumbing')} className="w-full flex items-center p-4 border-2 border-slate-100 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all group">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform"><Wrench size={24}/></div>
                <div className="text-left flex-1">
                  <div className="font-bold text-slate-900 text-lg">Severe Plumbing Leak</div>
                  <div className="text-xs text-slate-500">Burst pipes, severe flooding</div>
                </div>
              </button>

              <button onClick={() => startEmergency('Security / Lockout')} className="w-full flex items-center p-4 border-2 border-slate-100 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all group">
                <div className="w-12 h-12 bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform"><ShieldAlert size={24}/></div>
                <div className="text-left flex-1">
                  <div className="font-bold text-slate-900 text-lg">Security & Lockout</div>
                  <div className="text-xs text-slate-500">Broken locks, lockouts</div>
                </div>
              </button>
            </div>
            
            <button onClick={() => navigate('/customer')} className="w-full mt-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors">Cancel</button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-red-500 animate-in fade-in slide-in-from-bottom-8">
            {/* Map Mockup Header */}
            <div className="h-64 bg-slate-800 relative overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 gap-0.5 opacity-20">
                 {mapGrid.map((_, i) => <div key={i} className="bg-slate-700"></div>)}
               </div>
               
               {/* Radar Pulse */}
               {dispatchStatus === 'SEARCHING' && (
                 <div className="absolute w-32 h-32 border-2 border-red-500 rounded-full animate-ping opacity-75"></div>
               )}
               
               {/* Location Marker */}
               <div className="relative z-10 flex flex-col items-center">
                 <div className="bg-red-600 text-white p-2 rounded-full shadow-lg shadow-red-600/50 mb-1">
                   <Navigation size={24} className={dispatchStatus === 'SEARCHING' ? 'animate-spin' : ''}/>
                 </div>
                 <div className="bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-md">
                   {dispatchStatus === 'SEARCHING' ? 'Scanning Radius...' : locationName}
                 </div>
               </div>
            </div>

            <div className="p-8 text-center">
              {dispatchStatus === 'SEARCHING' && (
                <>
                  <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Locating Nearest Worker</h2>
                  <p className="text-slate-500 font-medium text-sm">Querying Cooperative Network for {category} experts within 5km.</p>
                </>
              )}

              {dispatchStatus === 'FOUND' && assignedWorker && (
                <div className="animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Worker Found!</h2>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4 inline-block text-left mx-auto w-full max-w-sm">
                    <div className="font-bold text-lg text-slate-800">{assignedWorker.name}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={14}/> {assignedWorker.distance}</div>
                    <div className="mt-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded inline-block">ETA: {assignedWorker.eta}</div>
                  </div>
                  <p className="text-slate-500 font-medium text-xs">Awaiting worker acceptance...</p>
                </div>
              )}

              {dispatchStatus === 'DISPATCHED' && assignedWorker && (
                <div className="animate-in slide-in-from-right duration-500">
                  <h2 className="text-2xl font-black text-slate-900 mb-2 text-emerald-600">Dispatched!</h2>
                  <p className="text-slate-600 font-medium mb-6">Stay calm. {assignedWorker.name} is on the way to your location.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                      <PhoneCall size={24} className="mb-2"/> Call Worker
                    </button>
                    <button onClick={() => navigate('/customer')} className="flex flex-col items-center justify-center p-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                      <Navigation size={24} className="mb-2"/> Live Tracking
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
