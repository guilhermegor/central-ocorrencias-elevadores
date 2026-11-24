import { createContext, useContext } from 'react';
export const IncidentContext = createContext(null);
export function useIncidentContext() {
  const ctx = useContext(IncidentContext);
  if (!ctx) throw new Error('useIncidentContext must be used within IncidentProvider');
  return ctx;
}
