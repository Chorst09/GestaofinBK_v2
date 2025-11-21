"use client";

import { useEffect, useState } from 'react';

export function DebugEnv() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: 'black', 
      color: 'white', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '400px',
      wordBreak: 'break-all'
    }}>
      <div><strong>Debug ENV:</strong></div>
      <div>API Key: {apiKey ? `${apiKey.substring(0, 20)}...` : '❌ NÃO DEFINIDA'}</div>
      <div>Client ID: {clientId ? `${clientId.substring(0, 30)}...` : '❌ NÃO DEFINIDA'}</div>
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
    </div>
  );
}
