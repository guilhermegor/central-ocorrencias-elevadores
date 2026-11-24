import type { IncidentResponseDTO } from '../domain/dto';
import { IncidentPriority } from '../domain/enums';
import { isActive } from '../domain/lifecycle';

export const REPEAT_OFFENDER_THRESHOLD = 8;

const MINUTE_MS = 60_000;

export interface DashboardSummary {
  total: number;
  active: number;
  criticalActive: number;
  meanMinutesToDispatch: number | null;
  meanMinutesToResolve: number | null;
}

export interface CountEntry {
  key: string;
  count: number;
}

export function summarize(incidents: IncidentResponseDTO[]): DashboardSummary {
  const active = incidents.filter(isActive);
  return {
    total: incidents.length,
    active: active.length,
    criticalActive: active.filter((incident) => incident.priority === IncidentPriority.Critical)
      .length,
    meanMinutesToDispatch: meanMinutesBetween(incidents, 'openedAt', 'dispatchedAt'),
    meanMinutesToResolve: meanMinutesBetween(incidents, 'openedAt', 'resolvedAt'),
  };
}

export function countBy(
  incidents: IncidentResponseDTO[],
  keyOf: (incident: IncidentResponseDTO) => string | null,
): CountEntry[] {
  const counts = new Map<string, number>();
  incidents.forEach((incident) => {
    const key = keyOf(incident);
    if (key !== null) counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return [...counts]
    .map(([key, count]) => ({ key, count }))
    .sort((first, second) => second.count - first.count || first.key.localeCompare(second.key));
}

export function repeatOffenders(
  incidents: IncidentResponseDTO[],
  threshold: number = REPEAT_OFFENDER_THRESHOLD,
): CountEntry[] {
  return countBy(incidents, (incident) => incident.elevatorId).filter(
    (entry) => entry.count >= threshold,
  );
}

type Timestamp = 'openedAt' | 'dispatchedAt' | 'resolvedAt';

function meanMinutesBetween(
  incidents: IncidentResponseDTO[],
  from: Timestamp,
  to: Timestamp,
): number | null {
  const durations = incidents
    .filter((incident) => incident[from] !== null && incident[to] !== null)
    .map((incident) => Date.parse(incident[to] as string) - Date.parse(incident[from] as string));
  if (durations.length === 0) return null;
  const totalMs = durations.reduce((sum, duration) => sum + duration, 0);
  return Math.round(totalMs / durations.length / MINUTE_MS);
}
