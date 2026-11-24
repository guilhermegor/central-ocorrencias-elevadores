import type { IncidentPriority, IncidentStatus, IncidentType } from './enums';

export interface Incident {
  id: string;
  code: string;
  elevatorId: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  description: string;
  reportedBy: string;
  openedAt: string;
  dispatchedAt: string | null;
  resolvedAt: string | null;
  technicianId: string | null;
}

export interface Elevator {
  id: string;
  building: string;
  address: string;
  region: string;
}

export interface Technician {
  id: string;
  name: string;
  region: string;
}

export interface SampleDatabase {
  elevators: Elevator[];
  technicians: Technician[];
  incidents: Incident[];
}
