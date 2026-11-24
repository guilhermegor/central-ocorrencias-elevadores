import { IncidentStatus } from '../domain/enums';
export function incidentFromCreateDTO(dto, fields) {
  return {
    id: fields.id,
    code: fields.code,
    elevatorId: dto.elevatorId,
    type: dto.type,
    priority: fields.priority,
    status: IncidentStatus.Open,
    description: dto.description,
    reportedBy: dto.reportedBy,
    openedAt: fields.openedAt.toISOString(),
    dispatchedAt: null,
    resolvedAt: null,
    technicianId: null,
  };
}
export function incidentToResponseDTO(incident) {
  return {
    ...incident,
  };
}
