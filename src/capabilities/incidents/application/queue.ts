import type { IncidentResponseDTO } from '../domain/dto';
import type { Incident, Technician } from '../domain/entities';
import { IncidentStatus, type IncidentPriority, type IncidentType } from '../domain/enums';
import { formatIncidentCode, parseIncidentCode } from '../domain/incident-code';
import { isActive } from '../domain/lifecycle';
import { PRIORITY_RANK } from '../domain/priority';

export const ALL = 'all';

export interface QueueFilters {
  status: IncidentStatus | typeof ALL;
  type: IncidentType | typeof ALL;
  priority: IncidentPriority | typeof ALL;
  elevatorId: string | typeof ALL;
  search: string;
}

export const DEFAULT_QUEUE_FILTERS: QueueFilters = {
  status: ALL,
  type: ALL,
  priority: ALL,
  elevatorId: ALL,
  search: '',
};

export function sortByUrgency<T extends Pick<Incident, 'priority' | 'openedAt' | 'elevatorId'>>(
  incidents: T[],
  history: Pick<Incident, 'elevatorId'>[] = incidents,
): T[] {
  const recurrence = countByElevator(history);
  return [...incidents].sort(
    (first, second) =>
      PRIORITY_RANK[second.priority] - PRIORITY_RANK[first.priority] ||
      recurrence[second.elevatorId] - recurrence[first.elevatorId] ||
      first.openedAt.localeCompare(second.openedAt),
  );
}

export function filterIncidents(
  incidents: IncidentResponseDTO[],
  filters: QueueFilters,
): IncidentResponseDTO[] {
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

export function buildQueue(
  incidents: IncidentResponseDTO[],
  history: IncidentResponseDTO[] = incidents,
): IncidentResponseDTO[] {
  const active = sortByUrgency(incidents.filter(isActive), history);
  const closed = incidents
    .filter((incident) => !isActive(incident))
    .sort((first, second) => second.openedAt.localeCompare(first.openedAt));
  return [...active, ...closed];
}

export function availableTechnicians(
  technicians: Technician[],
  incidents: IncidentResponseDTO[],
): Technician[] {
  const busy = new Set(
    incidents
      .filter((incident) => incident.status === IncidentStatus.InProgress)
      .map((incident) => incident.technicianId),
  );
  return technicians.filter((technician) => !busy.has(technician.id));
}

export function nextIncidentCode(incidents: Pick<Incident, 'code'>[]): string {
  const highest = incidents.reduce(
    (max, incident) => Math.max(max, parseIncidentCode(incident.code)),
    0,
  );
  return formatIncidentCode(highest + 1);
}

function countByElevator(history: Pick<Incident, 'elevatorId'>[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const { elevatorId } of history) counts[elevatorId] = (counts[elevatorId] ?? 0) + 1;
  return counts;
}

function matches<T extends string>(filter: T | typeof ALL, value: T): boolean {
  return filter === ALL || filter === value;
}

function matchesSearch(incident: IncidentResponseDTO, search: string): boolean {
  if (!search) return true;
  return [incident.code, incident.description, incident.reportedBy].some((field) =>
    field.toLowerCase().includes(search),
  );
}
