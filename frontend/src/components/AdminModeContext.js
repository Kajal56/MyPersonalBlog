"use client"
import { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';

const AdminModeContext = createContext();

export function AdminModeProvider({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setIsAdminMode(localStorage.getItem('isAdminMode') === 'true');
  }, []);

  const setAdminModePersist = (value) => {
    setIsAdminMode(value);
    localStorage.setItem('isAdminMode', value ? 'true' : 'false');
  };

  if (!isHydrated) return null;

  return (
    <AdminModeContext.Provider value={{ isAdminMode, setIsAdminMode: setAdminModePersist }}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  return useContext(AdminModeContext);
}
