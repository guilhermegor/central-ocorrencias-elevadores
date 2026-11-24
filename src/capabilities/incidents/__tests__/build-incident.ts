import type { Incident } from '../domain/entities';
import { IncidentPriority, IncidentStatus, IncidentType } from '../domain/enums';

export function buildIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: 'incident-1',
    code: 'OC-0001',
    elevatorId: 'EL-01',
    type: IncidentType.TechnicalFailure,
    priority: IncidentPriority.High,
    status: IncidentStatus.Open,
    description: 'Porta da cabine abrindo e fechando sem parar.',
    reportedBy: 'Portaria',
    openedAt: '2026-11-20T10:00:00.000Z',
    dispatchedAt: null,
    resolvedAt: null,
    technicianId: null,
    ...overrides,
  };
}
