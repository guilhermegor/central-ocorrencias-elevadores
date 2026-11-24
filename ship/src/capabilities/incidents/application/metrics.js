import { IncidentPriority } from '../domain/enums';
import { isActive } from '../domain/lifecycle';
export const REPEAT_OFFENDER_THRESHOLD = 8;
const MINUTE_MS = 60_000;
export function summarize(incidents) {
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
export function countBy(incidents, keyOf) {
  const counts = new Map();
  incidents.forEach((incident) => {
    const key = keyOf(incident);
    if (key !== null) counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return [...counts]
    .map(([key, count]) => ({
      key,
      count,
    }))
    .sort((first, second) => second.count - first.count || first.key.localeCompare(second.key));
}
export function repeatOffenders(incidents, threshold = REPEAT_OFFENDER_THRESHOLD) {
  return countBy(incidents, (incident) => incident.elevatorId).filter(
    (entry) => entry.count >= threshold,
  );
}
function meanMinutesBetween(incidents, from, to) {
  const durations = incidents
    .filter((incident) => incident[from] !== null && incident[to] !== null)
    .map((incident) => Date.parse(incident[to]) - Date.parse(incident[from]));
  if (durations.length === 0) return null;
  const totalMs = durations.reduce((sum, duration) => sum + duration, 0);
  return Math.round(totalMs / durations.length / MINUTE_MS);
}
