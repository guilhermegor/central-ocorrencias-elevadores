import { IncidentPriority, IncidentStatus, IncidentType } from '../domain/enums';
import { formatIncidentCode, parseIncidentCode } from '../domain/incident-code';
import { dispatchIncident, isActive, resolveIncident } from '../domain/lifecycle';
import { classifyPriority, PRIORITY_RANK } from '../domain/priority';

import { buildIncident } from './build-incident';

const SEVENTH = 7;
const FORTY_SECOND = 42;
const NOW = new Date('2026-11-20T10:30:00.000Z');

describe('classifyPriority', () => {
  it.each([
    [IncidentType.TrappedPassenger, IncidentPriority.Critical],
    [IncidentType.PowerOutage, IncidentPriority.High],
    [IncidentType.TechnicalFailure, IncidentPriority.High],
    [IncidentType.Other, IncidentPriority.Medium],
    [IncidentType.CustomerRequest, IncidentPriority.Low],
  ])('classifies %s as %s', (type, expected) => {
    expect(classifyPriority(type)).toBe(expected);
  });

  it('ranks critical above high above medium above low', () => {
    const ranks = [
      IncidentPriority.Critical,
      IncidentPriority.High,
      IncidentPriority.Medium,
      IncidentPriority.Low,
    ].map((priority) => PRIORITY_RANK[priority]);
    expect(ranks).toEqual([...ranks].sort((first, second) => second - first));
    expect(new Set(ranks).size).toBe(ranks.length);
  });
});

describe('dispatchIncident', () => {
  it('moves an open incident to in progress with the technician and timestamp', () => {
    const dispatched = dispatchIncident(buildIncident(), 'TC-01', NOW);
    expect(dispatched).toMatchObject({
      status: IncidentStatus.InProgress,
      technicianId: 'TC-01',
      dispatchedAt: NOW.toISOString(),
    });
  });

  it('rejects an incident that is not open', () => {
    const inProgress = buildIncident({ status: IncidentStatus.InProgress });
    expect(() => dispatchIncident(inProgress, 'TC-01', NOW)).toThrow('Only an open incident');
  });
});

describe('resolveIncident', () => {
  it('moves an in-progress incident to resolved with a timestamp', () => {
    const resolved = resolveIncident(buildIncident({ status: IncidentStatus.InProgress }), NOW);
    expect(resolved).toMatchObject({
      status: IncidentStatus.Resolved,
      resolvedAt: NOW.toISOString(),
    });
  });

  it('rejects an incident nobody was dispatched to', () => {
    expect(() => resolveIncident(buildIncident(), NOW)).toThrow('Only an in-progress incident');
  });
});

describe('isActive', () => {
  it.each([
    [IncidentStatus.Open, true],
    [IncidentStatus.InProgress, true],
    [IncidentStatus.Resolved, false],
    [IncidentStatus.Cancelled, false],
  ])('reports %s as active=%s', (status, expected) => {
    expect(isActive({ status })).toBe(expected);
  });
});

describe('incident codes', () => {
  it('formats a sequence as a zero-padded OC code', () => {
    expect(formatIncidentCode(SEVENTH)).toBe('OC-0007');
  });

  it('parses a code back to its sequence', () => {
    expect(parseIncidentCode('OC-0042')).toBe(FORTY_SECOND);
  });

  it('reads an unparseable code as zero', () => {
    expect(parseIncidentCode('legacy')).toBe(0);
  });
});
