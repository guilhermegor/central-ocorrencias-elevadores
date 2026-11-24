import { IncidentPriority, IncidentStatus, IncidentType } from '../domain/enums';
export const TYPE_LABELS = {
  [IncidentType.TrappedPassenger]: 'Passageiro preso',
  [IncidentType.PowerOutage]: 'Interrupção de energia',
  [IncidentType.TechnicalFailure]: 'Falha técnica',
  [IncidentType.CustomerRequest]: 'Solicitação de cliente',
  [IncidentType.Other]: 'Outro',
};
export const STATUS_LABELS = {
  [IncidentStatus.Open]: 'Aberta',
  [IncidentStatus.InProgress]: 'Em atendimento',
  [IncidentStatus.Resolved]: 'Resolvida',
  [IncidentStatus.Cancelled]: 'Cancelada',
};
export const PRIORITY_LABELS = {
  [IncidentPriority.Critical]: 'Crítica',
  [IncidentPriority.High]: 'Alta',
  [IncidentPriority.Medium]: 'Média',
  [IncidentPriority.Low]: 'Baixa',
};
const DATE_TIME = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});
export function formatDateTime(iso) {
  return iso ? DATE_TIME.format(new Date(iso)) : '—';
}
const MINUTES_PER_HOUR = 60;
export function formatMinutes(minutes) {
  if (minutes === null) return '—';
  if (minutes < MINUTES_PER_HOUR) return `${minutes} min`;
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  return `${hours} h ${minutes % MINUTES_PER_HOUR} min`;
}
