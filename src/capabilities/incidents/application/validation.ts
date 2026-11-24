import type { IncidentCreateDTO, ValidationResult } from '../domain/dto';
import { IncidentType } from '../domain/enums';

export const MIN_DESCRIPTION_LENGTH = 10;

const VALID_TYPES = new Set<string>(Object.values(IncidentType));

type Rule = (dto: IncidentCreateDTO) => string | null;

const RULES: Rule[] = [
  (dto) => (dto.elevatorId.trim() ? null : 'Selecione o elevador.'),
  (dto) => (VALID_TYPES.has(dto.type) ? null : 'Selecione o tipo de ocorrência.'),
  (dto) =>
    dto.description.trim().length >= MIN_DESCRIPTION_LENGTH
      ? null
      : `Descreva a ocorrência com pelo menos ${MIN_DESCRIPTION_LENGTH} caracteres.`,
  (dto) => (dto.reportedBy.trim() ? null : 'Informe quem reportou a ocorrência.'),
];

export function validateIncidentCreate(
  dto: IncidentCreateDTO,
): ValidationResult<IncidentCreateDTO> {
  const errors = RULES.map((rule) => rule(dto)).filter((error): error is string => error !== null);
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: { ...dto, description: dto.description.trim(), reportedBy: dto.reportedBy.trim() },
  };
}
