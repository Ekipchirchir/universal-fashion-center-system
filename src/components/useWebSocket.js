import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const useWebSocket = (token) => {
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  useEffect(() => {
    const socket = io('https://ufc.up.railway.app', {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('lowStock', (data) => {
      setLowStockAlerts((prev) => [...prev, data]);
      toast.warn(`Low stock alert: ${data.product} has ${data.stock} units left`);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      toast.error('Failed to connect to real-time updates');
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return lowStockAlerts;
};

export default useWebSocket;
