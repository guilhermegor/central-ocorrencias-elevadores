import { IncidentStatus } from './enums';
export function dispatchIncident(incident, technicianId, now) {
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
export function resolveIncident(incident, now) {
  if (incident.status !== IncidentStatus.InProgress) {
    throw new Error(`Only an in-progress incident can be resolved (got ${incident.status})`);
  }
  return {
    ...incident,
    status: IncidentStatus.Resolved,
    resolvedAt: now.toISOString(),
  };
}
export function isActive(incident) {
  return incident.status === IncidentStatus.Open || incident.status === IncidentStatus.InProgress;
}
