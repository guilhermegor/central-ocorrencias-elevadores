import { IncidentPriority, IncidentType } from './enums';
const PRIORITY_BY_TYPE = {
  [IncidentType.TrappedPassenger]: IncidentPriority.Critical,
  [IncidentType.PowerOutage]: IncidentPriority.High,
  [IncidentType.TechnicalFailure]: IncidentPriority.High,
  [IncidentType.Other]: IncidentPriority.Medium,
  [IncidentType.CustomerRequest]: IncidentPriority.Low,
};
const URGENCY_ORDER = [
  IncidentPriority.Low,
  IncidentPriority.Medium,
  IncidentPriority.High,
  IncidentPriority.Critical,
];
export const PRIORITY_RANK = Object.fromEntries(
  URGENCY_ORDER.map((priority, index) => [priority, index]),
);
export function classifyPriority(type) {
  return PRIORITY_BY_TYPE[type];
}
