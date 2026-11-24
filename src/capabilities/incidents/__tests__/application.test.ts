import { countBy, repeatOffenders, summarize } from '../application/metrics';
import {
  availableTechnicians,
  buildQueue,
  DEFAULT_QUEUE_FILTERS,
  filterIncidents,
  nextIncidentCode,
  sortByUrgency,
} from '../application/queue';
import { validateIncidentCreate } from '../application/validation';
import { IncidentPriority, IncidentStatus, IncidentType } from '../domain/enums';

import { buildIncident } from './build-incident';

const FIELD_COUNT = 4;
const SAMPLE_SIZE = 3;
const MEAN_DISPATCH_MINUTES = 30;
const MEAN_RESOLVE_MINUTES = 100;

const VALID_DTO = {
  elevatorId: 'EL-01',
  type: IncidentType.PowerOutage,
  description: '  Queda de energia no prédio.  ',
  reportedBy: ' Síndico ',
};

describe('validateIncidentCreate', () => {
  it('accepts a complete form and trims the free-text fields', () => {
    expect(validateIncidentCreate(VALID_DTO)).toEqual({
      ok: true,
      value: { ...VALID_DTO, description: 'Queda de energia no prédio.', reportedBy: 'Síndico' },
    });
  });

  it('returns one message per missing field', () => {
    const result = validateIncidentCreate({
      elevatorId: '',
      type: 'unknown' as IncidentType,
      description: 'curta',
      reportedBy: '  ',
    });
    expect(result).toEqual({ ok: false, errors: expect.any(Array) as string[] });
    expect(result.ok ? [] : result.errors).toHaveLength(FIELD_COUNT);
  });
});

describe('sortByUrgency', () => {
  it('puts higher priority first and, within a priority, the oldest first', () => {
    const sorted = sortByUrgency([
      buildIncident({ id: 'low', priority: IncidentPriority.Low }),
      buildIncident({ id: 'high-new', openedAt: '2026-11-20T12:00:00.000Z' }),
      buildIncident({ id: 'critical', priority: IncidentPriority.Critical }),
      buildIncident({ id: 'high-old', openedAt: '2026-11-20T08:00:00.000Z' }),
    ]);
    expect(sorted.map((incident) => incident.id)).toEqual([
      'critical',
      'high-old',
      'high-new',
      'low',
    ]);
  });

  it('breaks a priority tie by elevator recurrence before waiting time', () => {
    const repeat = buildIncident({ id: 'repeat', elevatorId: 'EL-09' });
    const oneOff = buildIncident({
      id: 'one-off',
      elevatorId: 'EL-01',
      openedAt: '2026-11-01T00:00:00.000Z',
    });
    const history = [repeat, oneOff, buildIncident({ id: 'past', elevatorId: 'EL-09' })];
    const sorted = sortByUrgency([oneOff, repeat], history);
    expect(sorted.map((incident) => incident.id)).toEqual(['repeat', 'one-off']);
  });

  it('keeps a critical incident above a more recurrent elevator', () => {
    const critical = buildIncident({ id: 'critical', priority: IncidentPriority.Critical });
    const recurrent = buildIncident({ id: 'recurrent', elevatorId: 'EL-09' });
    const history = [critical, recurrent, recurrent, recurrent];
    const sorted = sortByUrgency([recurrent, critical], history);
    expect(sorted.map((incident) => incident.id)).toEqual(['critical', 'recurrent']);
  });
});

describe('buildQueue', () => {
  it('lists active incidents before the closed history', () => {
    const queue = buildQueue([
      buildIncident({ id: 'resolved', status: IncidentStatus.Resolved }),
      buildIncident({ id: 'open', status: IncidentStatus.Open }),
    ]);
    expect(queue.map((incident) => incident.id)).toEqual(['open', 'resolved']);
  });
});

describe('filterIncidents', () => {
  const incidents = [
    buildIncident({ id: 'a', type: IncidentType.PowerOutage, description: 'Gerador falhou' }),
    buildIncident({ id: 'b', status: IncidentStatus.Resolved, elevatorId: 'EL-02' }),
  ];

  it('returns everything with the default filters', () => {
    expect(filterIncidents(incidents, DEFAULT_QUEUE_FILTERS)).toHaveLength(2);
  });

  it('combines a field filter with a case-insensitive search', () => {
    const filtered = filterIncidents(incidents, {
      ...DEFAULT_QUEUE_FILTERS,
      type: IncidentType.PowerOutage,
      search: 'GERADOR',
    });
    expect(filtered.map((incident) => incident.id)).toEqual(['a']);
  });

  it('filters by elevator', () => {
    const filtered = filterIncidents(incidents, { ...DEFAULT_QUEUE_FILTERS, elevatorId: 'EL-02' });
    expect(filtered.map((incident) => incident.id)).toEqual(['b']);
  });
});

describe('availableTechnicians', () => {
  it('excludes technicians assigned to an in-progress incident', () => {
    const technicians = [
      { id: 'TC-01', name: 'Ana', region: 'Centro' },
      { id: 'TC-02', name: 'Bruno', region: 'Oeste' },
    ];
    const incidents = [
      buildIncident({ status: IncidentStatus.InProgress, technicianId: 'TC-01' }),
      buildIncident({ status: IncidentStatus.Resolved, technicianId: 'TC-02' }),
    ];
    expect(availableTechnicians(technicians, incidents).map((tech) => tech.id)).toEqual(['TC-02']);
  });
});

describe('nextIncidentCode', () => {
  it('continues after the highest existing code', () => {
    const incidents = [buildIncident({ code: 'OC-0009' }), buildIncident({ code: 'OC-0060' })];
    expect(nextIncidentCode(incidents)).toBe('OC-0061');
  });

  it('starts at OC-0001 on an empty base', () => {
    expect(nextIncidentCode([])).toBe('OC-0001');
  });
});

describe('summarize', () => {
  it('counts active and critical incidents and averages the response times', () => {
    const summary = summarize([
      buildIncident({ priority: IncidentPriority.Critical }),
      buildIncident({
        status: IncidentStatus.Resolved,
        openedAt: '2026-11-20T10:00:00.000Z',
        dispatchedAt: '2026-11-20T10:20:00.000Z',
        resolvedAt: '2026-11-20T11:40:00.000Z',
      }),
      buildIncident({
        status: IncidentStatus.InProgress,
        openedAt: '2026-11-20T10:00:00.000Z',
        dispatchedAt: '2026-11-20T10:40:00.000Z',
      }),
    ]);
    expect(summary).toEqual({
      total: SAMPLE_SIZE,
      active: 2,
      criticalActive: 1,
      meanMinutesToDispatch: MEAN_DISPATCH_MINUTES,
      meanMinutesToResolve: MEAN_RESOLVE_MINUTES,
    });
  });

  it('reports no mean when nothing was dispatched yet', () => {
    expect(summarize([buildIncident()]).meanMinutesToDispatch).toBeNull();
  });
});

describe('countBy and repeatOffenders', () => {
  const incidents = [
    buildIncident({ elevatorId: 'EL-01' }),
    buildIncident({ elevatorId: 'EL-01' }),
    buildIncident({ elevatorId: 'EL-02' }),
  ];

  it('counts per key, largest first', () => {
    expect(countBy(incidents, (incident) => incident.elevatorId)).toEqual([
      { key: 'EL-01', count: 2 },
      { key: 'EL-02', count: 1 },
    ]);
  });

  it('skips incidents whose key is null', () => {
    expect(countBy(incidents, (incident) => incident.technicianId)).toEqual([]);
  });

  it('keeps only elevators at or above the threshold', () => {
    expect(repeatOffenders(incidents, 2)).toEqual([{ key: 'EL-01', count: 2 }]);
  });
});
