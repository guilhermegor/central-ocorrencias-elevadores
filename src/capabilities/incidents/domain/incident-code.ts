const CODE_PREFIX = 'OC-';
const CODE_DIGITS = 4;
const DECIMAL = 10;

export function formatIncidentCode(sequence: number): string {
  return `${CODE_PREFIX}${String(sequence).padStart(CODE_DIGITS, '0')}`;
}

export function parseIncidentCode(code: string): number {
  const parsed = Number.parseInt(code.replace(CODE_PREFIX, ''), DECIMAL);
  return Number.isNaN(parsed) ? 0 : parsed;
}
