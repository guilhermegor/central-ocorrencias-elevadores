import { createContext, useContext } from 'react';

import type { CreateIncidentResult } from './application/use-cases';
import type { IncidentCreateDTO, IncidentResponseDTO } from './domain/dto';
import type { Elevator, Technician } from './domain/entities';
import type { INotifier } from './domain/ports';
import type { Notice } from './infrastructure/screen-notifier';

export interface IncidentContextValue {
  incidents: IncidentResponseDTO[];
  elevators: Elevator[];
  technicians: Technician[];
  loading: boolean;
  error: Error | null;
  notice: Notice | null;
  notifier: INotifier;
  createIncident: (dto: IncidentCreateDTO) => Promise<CreateIncidentResult>;
  createLoading: boolean;
  dispatchIncident: (incidentId: string, technicianId: string) => Promise<boolean>;
  resolveIncident: (incidentId: string) => Promise<boolean>;
  restoreSampleData: () => Promise<void>;
}

export const IncidentContext = createContext<IncidentContextValue | null>(null);

export function useIncidentContext(): IncidentContextValue {
  const ctx = useContext(IncidentContext);
  if (!ctx) throw new Error('useIncidentContext must be used within IncidentProvider');
  return ctx;
}
