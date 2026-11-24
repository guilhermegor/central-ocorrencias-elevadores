import type { IncidentPriority, IncidentStatus, IncidentType } from './enums';

export interface IncidentCreateDTO {
  elevatorId: string;
  type: IncidentType;
  description: string;
  reportedBy: string;
}

export interface IncidentResponseDTO {
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

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };
