import type { Incident } from './entities';
import { IncidentStatus } from './enums';

export function dispatchIncident(incident: Incident, technicianId: string, now: Date): Incident {
  if (incident.status !== IncidentStatus.Open) {
    throw new Error(`Only an open incident can be dispatched (got ${incident.status})`);
  }
  return {
    ...incident,
    status: IncidentStatus.InProgress,
    technicianId,
    dispatchedAt: now.toISOString(),
  };
}

export function resolveIncident(incident: Incident, now: Date): Incident {
  if (incident.status !== IncidentStatus.InProgress) {
    throw new Error(`Only an in-progress incident can be resolved (got ${incident.status})`);
  }
  return { ...incident, status: IncidentStatus.Resolved, resolvedAt: now.toISOString() };
}

export function isActive(incident: Pick<Incident, 'status'>): boolean {
  return incident.status === IncidentStatus.Open || incident.status === IncidentStatus.InProgress;
}
