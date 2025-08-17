"use client"
import { createContext, useContext, useState } from 'react';

const AdminModeContext = createContext();

export function AdminModeProvider({ children }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  return (
    <AdminModeContext.Provider value={{ isAdminMode, setIsAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  return useContext(AdminModeContext);
}
