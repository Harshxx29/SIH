import { useState, useEffect, useCallback } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import api from '../services/api';

export default function useNearbyWorkers(lat, lng, radius = 5000) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Fetch initial workers via REST
  const fetchWorkers = useCallback(async () => {
    if (!lat || !lng) return;
    try {
      setLoading(true);
      const res = await api.get(`/workers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (res.data.success) {
        setWorkers(res.data.workers);
      }
    } catch (err) {
      setError('Failed to fetch nearby workers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, radius]);

  useEffect(() => {
    fetchWorkers();
    
    // Setup Socket
    const socket = connectSocket();

    socket.on('connect', () => setConnectionStatus('connected'));
    socket.on('disconnect', () => setConnectionStatus('offline'));
    socket.on('connect_error', () => setConnectionStatus('offline'));

    // Join room based on rough coordinates to receive localized updates (Simulated geohash/grid logic here)
    const locationRoom = `location:${Math.floor(lat)}:${Math.floor(lng)}`;
    socket.emit('joinLocationRoom', locationRoom);

    socket.on('worker:online', (worker) => {
      setWorkers((prev) => {
        const exists = prev.find(w => w._id === worker.workerId);
        if (exists) return prev;
        
        // Ensure structure matches backend worker model structure for UI
        return [...prev, {
          _id: worker.workerId,
          user: { name: worker.name },
          skills: worker.skills,
          rating: { averageScore: worker.rating },
          isVerified: worker.verified,
          currentLocation: worker.currentLocation,
          availability: worker.availability
        }];
      });
    });

    socket.on('worker:offline', ({ workerId }) => {
      setWorkers((prev) => prev.filter(w => w._id !== workerId));
    });

    socket.on('worker:locationUpdated', ({ workerId, coordinates }) => {
      setWorkers((prev) => prev.map(w => 
        w._id === workerId 
          ? { ...w, currentLocation: { type: 'Point', coordinates } }
          : w
      ));
    });

    return () => {
      socket.emit('leaveLocationRoom', locationRoom);
      socket.off('worker:online');
      socket.off('worker:offline');
      socket.off('worker:locationUpdated');
      // In a real app, only disconnect if no other component uses it, 
      // but for this scope it's okay.
      disconnectSocket();
    };
  }, [lat, lng, radius, fetchWorkers]);

  return { workers, loading, error, connectionStatus };
}
