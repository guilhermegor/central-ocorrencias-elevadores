import type { IncidentCreateDTO, IncidentResponseDTO } from '../domain/dto';
import type { Incident } from '../domain/entities';
import { IncidentStatus, type IncidentPriority } from '../domain/enums';

export interface NewIncidentFields {
  id: string;
  code: string;
  priority: IncidentPriority;
  openedAt: Date;
}

export function incidentFromCreateDTO(dto: IncidentCreateDTO, fields: NewIncidentFields): Incident {
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

export function incidentToResponseDTO(incident: Incident): IncidentResponseDTO {
  return { ...incident };
}
