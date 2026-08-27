import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Camera, ShieldCheck, User, Save, Key, FileText, AlertTriangle, MapPin, Navigation, Mail, Phone, Home, Building, CheckCircle2, Lock, Briefcase, DollarSign, Wrench, Clock } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'Customer');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    coordinates: null,
    skills: []
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
    if (role === 'Worker') {
      fetchServices();
    }
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      if (res.data) {
        setServicesList(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch services:', e);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userRes = await api.get('/users/profile');
      let fullProfile = { ...userRes.data };

      if (role === 'Worker') {
        try {
          const workerRes = await api.get('/workers/profile');
          if (workerRes.data?.worker) {
            fullProfile = { ...fullProfile, workerData: workerRes.data.worker };
          }
        } catch (e) {
          console.log("Worker profile not found yet.");
        }
      }
      
      setProfile(fullProfile);
      
      const workerSkills = fullProfile.workerData?.skills?.map(s => typeof s === 'object' ? s._id : s) || [];

      setFormData({
        name: fullProfile.name || '',
        phone: fullProfile.phone || '',
        street: fullProfile.address?.street || '',
        city: fullProfile.address?.city || '',
        state: fullProfile.address?.state || '',
        zipCode: fullProfile.address?.zipCode || '',
        coordinates: (fullProfile.location?.coordinates && (fullProfile.location.coordinates[0] !== 0 || fullProfile.location.coordinates[1] !== 0)) 
          ? fullProfile.location.coordinates 
          : null,
        skills: workerSkills
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
      setMessage({ type: 'error', text: 'Failed to load profile details. Please make sure you are logged in.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          setFormData(prev => ({
            ...prev,
            coordinates: coords,
            city: prev.city || 'Detected Location'
          }));
          setMessage({ type: 'success', text: `GPS coordinates acquired (Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)})` });
          setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        },
        (err) => {
          alert('Location access denied or unavailable. Please enable browser location permissions.');
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleToggleSkill = (skillId) => {
    if (!editMode) return;
    setFormData(prev => {
      const exists = prev.skills.includes(skillId);
      const updated = exists ? prev.skills.filter(id => id !== skillId) : [...prev.skills, skillId];
      return { ...prev, skills: updated };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const userPayload = {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        location: formData.coordinates ? {
          type: 'Point',
          coordinates: formData.coordinates
        } : undefined
      };

      const res = await api.put('/users/profile', userPayload);
      
      if (role === 'Worker') {
        const workerPayload = {
          skills: formData.skills
        };
        const workerRes = await api.put('/workers/profile', workerPayload);
        setProfile(prev => ({ ...prev, ...res.data, workerData: workerRes.data.worker }));
      } else {
        setProfile(prev => ({ ...prev, ...res.data }));
      }

      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error updating profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fd = new FormData();
    fd.append('image', file);
    
    try {
      setUploading(true);
      const res = await api.post('/upload', fd);
      const imageUrl = res.data.url;
      
      if (type === 'avatar') {
        await api.put('/users/profile', { avatar: imageUrl });
        setProfile(prev => ({ ...prev, avatar: imageUrl }));
        setMessage({ type: 'success', text: 'Profile picture updated!' });
      } else if (type === 'certificate' && role === 'Worker') {
        const updatedKyc = [...(profile.workerData?.kycDocuments || []), imageUrl];
        const workerRes = await api.put('/workers/profile', { kycDocuments: updatedKyc });
        setProfile(prev => ({
          ...prev,
          workerData: workerRes.data.worker
        }));
        setMessage({ type: 'success', text: "Certificate uploaded! Status is set to Pending for Cooperative verification." });
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">Loading Account Profile...</p>
      </div>
    );
  }

  const isWorkerVerified = (profile?.workerData?.verificationStatus === 'Approved' && profile?.workerData?.isVerified && (profile?.workerData?.kycDocuments?.length > 0));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 font-sans">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Account Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === 'Worker' 
              ? 'Manage your personal details, trade skills, and upload verification credentials' 
              : 'Manage your personal information, address, and default service location'}
          </p>
        </div>
        <div>
          {!editMode ? (
            <button 
              onClick={() => setEditMode(true)} 
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg"
            >
              Edit Profile
            </button>
          ) : (
            <button 
              onClick={() => { setEditMode(false); fetchProfile(); }} 
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Verification Status Banner for Workers */}
      {role === 'Worker' && (
        <div className={`border-2 rounded-2xl p-5 flex items-start gap-4 ${isWorkerVerified ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${isWorkerVerified ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'}`}>
            {isWorkerVerified ? <ShieldCheck size={20}/> : <AlertTriangle size={20}/>}
          </div>
          <div>
            <h3 className={`font-black text-sm mb-1 ${isWorkerVerified ? 'text-emerald-950' : 'text-amber-950'}`}>
              {isWorkerVerified ? 'Cooperative Verified Professional' : 'Documents Under Cooperative Verification'}
            </h3>
            <p className={`text-xs leading-relaxed font-medium ${isWorkerVerified ? 'text-emerald-800' : 'text-amber-900'}`}>
              {isWorkerVerified 
                ? 'Your trade credentials and documents have been reviewed and approved by Cooperative Administration. You are eligible to accept live customer dispatches.'
                : 'Your profile has not been verified by the cooperative administration yet. Upload your certificates/KYC documents below. You can only accept customer dispatches after an admin approves your profile.'}
            </p>
          </div>
        </div>
      )}

      {/* Status Notifications */}
      {message.text && (
        <div className={`p-4 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600"/> : <AlertTriangle size={18} className="text-red-600"/>}
          {message.text}
        </div>
      )}

      {/* Main Profile Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Avatar Sidebar */}
        <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center justify-center bg-slate-50/50 w-full md:w-1/3">
          <div className="relative group cursor-pointer mb-5">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-200 flex items-center justify-center relative">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover"/>
              ) : (
                <User size={56} className="text-slate-400"/>
              )}
            </div>
            {editMode && (
              <label className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-full shadow-xl cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all border-2 border-white">
                <Camera size={18}/>
                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} accept="image/*"/>
              </label>
            )}
            {uploading && <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center text-xs font-bold text-slate-800 animate-pulse">Uploading...</div>}
          </div>
          
          <h2 className="text-xl font-black text-slate-900 text-center leading-tight mb-1">{profile?.name || 'User'}</h2>
          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full mt-1">
            {profile?.role || role}
          </div>
          
          {role === 'Worker' && (
            <div className={`mt-4 text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-widest font-black flex items-center gap-1.5 border ${isWorkerVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
              {isWorkerVerified ? <><ShieldCheck size={14}/> Verified Worker</> : <><Clock size={14}/> Verification Pending</>}
            </div>
          )}

          {/* Location Status Badge */}
          <div className="mt-6 w-full p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              <MapPin size={14} className="text-blue-500"/> Base Location
            </div>
            {formData.coordinates ? (
              <div className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> GPS Configured
              </div>
            ) : (
              <div className="text-xs font-semibold text-amber-600 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Not Set Yet
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {profile?.address?.city || formData.city || 'Used for live dispatch matching'}
            </p>
          </div>
        </div>

        {/* Details Form Section */}
        <div className="p-6 md:p-8 w-full md:w-2/3">
          <form onSubmit={handleUpdate} className="space-y-5">
            
            {/* Identity Group */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <User size={14}/> Personal Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    disabled={!editMode} 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600 transition"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1"><Mail size={12}/> Email Address</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-bold uppercase"><Lock size={10}/> Read Only</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="email" 
                        disabled 
                        value={profile?.email || ''} 
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold bg-slate-100 text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                      <Phone size={12}/> Phone Number
                    </label>
                    <input 
                      type="text" 
                      disabled={!editMode} 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600 transition"
                      placeholder="e.g. +91 9876543210"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* WORKER SERVICES SECTION */}
            {role === 'Worker' && (
              <>
                <hr className="border-slate-100"/>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Wrench size={14}/> Services Provided (Cooperative Fixed Tariffs)
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Standard tariff rates are established by the cooperative per service category. When a customer books a specific service, the corresponding tariff rate is applied.
                  </p>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Select Your Service Expertise {editMode && <span className="text-blue-600 font-normal">(Click to toggle)</span>}
                    </label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {servicesList.length === 0 ? (
                        <div className="text-xs text-slate-400">Loading cooperative services...</div>
                      ) : (
                        servicesList.map(s => {
                          const isSelected = formData.skills.includes(s._id);
                          return (
                            <button
                              key={s._id}
                              type="button"
                              onClick={() => handleToggleSkill(s._id)}
                              disabled={!editMode}
                              className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border ${
                                isSelected 
                                  ? 'bg-blue-50 text-blue-900 border-blue-500 shadow-sm ring-1 ring-blue-500' 
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              } ${!editMode ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              <div className="flex items-center gap-2">
                                {isSelected && <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0"/>}
                                <span className="font-bold">{s.name}</span>
                              </div>
                              <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                ₹{s.basePrice || 350}/hr
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <hr className="border-slate-100"/>

            {/* Address & Geolocation Group */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Home size={14}/> Address & Location Setup
                </h3>
                {editMode && (
                  <button 
                    type="button" 
                    onClick={handleDetectGPS} 
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <Navigation size={12}/> Auto-Detect GPS Location
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Street Address</label>
                  <input 
                    type="text" 
                    disabled={!editMode} 
                    value={formData.street} 
                    onChange={e => setFormData({...formData, street: e.target.value})} 
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600 transition"
                    placeholder="e.g. Flat 402, Green Valley Apartments"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
                    <input 
                      type="text" 
                      disabled={!editMode} 
                      value={formData.city} 
                      onChange={e => setFormData({...formData, city: e.target.value})} 
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600 transition"
                      placeholder="e.g. New Delhi"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label>
                    <input 
                      type="text" 
                      disabled={!editMode} 
                      value={formData.state} 
                      onChange={e => setFormData({...formData, state: e.target.value})} 
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600 transition"
                      placeholder="e.g. Delhi"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">PIN / Zip Code</label>
                    <input 
                      type="text" 
                      disabled={!editMode} 
                      value={formData.zipCode} 
                      onChange={e => setFormData({...formData, zipCode: e.target.value})} 
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600 transition"
                      placeholder="e.g. 110001"
                    />
                  </div>
                </div>

                {/* GPS Coordinates Display */}
                {formData.coordinates && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Navigation size={14} className="text-blue-500"/>
                      <span className="font-bold text-slate-700">Geo Coordinates:</span>
                      <span>Lat: {formData.coordinates[1]?.toFixed(4)}, Lng: {formData.coordinates[0]?.toFixed(4)}</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {editMode && (
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setEditMode(false); fetchProfile(); }} 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-2.5 rounded-xl text-sm shadow-md hover:shadow-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Save size={16}/> {saving ? 'Saving Changes...' : 'Save Profile & Services'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Worker Credentials Section (for Worker Role) */}
      {role === 'Worker' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16}/> Professional Credentials & KYC Verification Documents
            </h3>
            <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-black ${isWorkerVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isWorkerVerified ? 'Approved' : 'Verification Required'}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            Upload your trade certificates or identity cards. Cooperative Administrators verify these documents before granting live job acceptance privileges.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile?.workerData?.kycDocuments?.map((doc, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 aspect-square group relative shadow-sm">
                <img src={doc} alt="Cert" className="w-full h-full object-cover"/>
              </div>
            ))}
            <label className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 aspect-square flex flex-col items-center justify-center text-slate-400 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500 transition cursor-pointer">
              <Camera size={26} className="mb-2"/>
              <span className="text-xs font-bold">Add Certificate</span>
              <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'certificate')} accept="image/*"/>
            </label>
          </div>
        </div>
      )}

    </div>
  );
}
