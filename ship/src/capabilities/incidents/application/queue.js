import { IncidentStatus } from '../domain/enums';
import { formatIncidentCode, parseIncidentCode } from '../domain/incident-code';
import { isActive } from '../domain/lifecycle';
import { PRIORITY_RANK } from '../domain/priority';
export const ALL = 'all';
export const DEFAULT_QUEUE_FILTERS = {
  status: ALL,
  type: ALL,
  priority: ALL,
  elevatorId: ALL,
  search: '',
};
export function sortByUrgency(incidents) {
  return [...incidents].sort(
    (first, second) =>
      PRIORITY_RANK[second.priority] - PRIORITY_RANK[first.priority] ||
      first.openedAt.localeCompare(second.openedAt),
  );
}
export function filterIncidents(incidents, filters) {
  const search = filters.search.trim().toLowerCase();
  return incidents.filter((incident) =>
    [
      matches(filters.status, incident.status),
      matches(filters.type, incident.type),
      matches(filters.priority, incident.priority),
      matches(filters.elevatorId, incident.elevatorId),
      matchesSearch(incident, search),
    ].every(Boolean),
  );
}
export function buildQueue(incidents) {
  const active = sortByUrgency(incidents.filter(isActive));
  const closed = incidents
    .filter((incident) => !isActive(incident))
    .sort((first, second) => second.openedAt.localeCompare(first.openedAt));
  return [...active, ...closed];
}
export function availableTechnicians(technicians, incidents) {
  const busy = new Set(
    incidents
      .filter((incident) => incident.status === IncidentStatus.InProgress)
      .map((incident) => incident.technicianId),
  );
  return technicians.filter((technician) => !busy.has(technician.id));
}
export function nextIncidentCode(incidents) {
  const highest = incidents.reduce(
    (max, incident) => Math.max(max, parseIncidentCode(incident.code)),
    0,
  );
  return formatIncidentCode(highest + 1);
}
function matches(filter, value) {
  return filter === ALL || filter === value;
}
function matchesSearch(incident, search) {
  if (!search) return true;
  return [incident.code, incident.description, incident.reportedBy].some((field) =>
    field.toLowerCase().includes(search),
  );
}
