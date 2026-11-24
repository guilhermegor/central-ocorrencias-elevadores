import { repeatOffenders } from '../application/metrics';
import { IncidentStatus, IncidentType } from '../domain/enums';
import { generateSampleDatabase, SAMPLE_INCIDENT_COUNT } from '../infrastructure/fake-data';
import { LocalStorageDatabase, STORAGE_KEYS } from '../infrastructure/local-storage-database';

import { buildIncident } from './build-incident';

const ELEVATOR_COUNT = 10;
const NOW = new Date('2026-11-24T12:00:00.000Z');

describe('generateSampleDatabase', () => {
  const database = generateSampleDatabase(NOW);

  it('is deterministic for the same seed and clock', () => {
    expect(generateSampleDatabase(NOW)).toEqual(database);
  });

  it('changes with the seed', () => {
    expect(generateSampleDatabase(NOW, 1).incidents).not.toEqual(database.incidents);
  });

  it('generates the advertised number of incidents with unique codes', () => {
    const codes = new Set(database.incidents.map((incident) => incident.code));
    expect(codes.size).toBe(SAMPLE_INCIDENT_COUNT);
  });

  it('covers every incident type and status', () => {
    const types = new Set(database.incidents.map((incident) => incident.type));
    const statuses = new Set(database.incidents.map((incident) => incident.status));
    expect([...types].sort()).toEqual(Object.values(IncidentType).sort());
    expect([...statuses].sort()).toEqual(Object.values(IncidentStatus).sort());
  });

  it('only references known elevators and technicians', () => {
    const elevatorIds = new Set(database.elevators.map((elevator) => elevator.id));
    const technicianIds = new Set(database.technicians.map((technician) => technician.id));
    const referencedTechnicians = database.incidents
      .map((incident) => incident.technicianId)
      .filter((id): id is string => id !== null);
    const unknownElevators = database.incidents.filter(
      (incident) => !elevatorIds.has(incident.elevatorId),
    );
    const unknown = [
      ...unknownElevators,
      ...referencedTechnicians.filter((id) => !technicianIds.has(id)),
    ];
    expect(unknown).toEqual([]);
  });

  it('keeps every timeline consistent with its status and in the past', () => {
    const statusMismatch = database.incidents.filter(
      (incident) =>
        (incident.status === IncidentStatus.Resolved) !== (incident.resolvedAt !== null),
    );
    const inFuture = database.incidents.filter(
      (incident) => (incident.resolvedAt ?? '') > NOW.toISOString(),
    );
    const inconsistent = [...statusMismatch, ...inFuture];
    expect(inconsistent).toEqual([]);
  });

  it('produces at least one repeat-offender elevator for the dashboard', () => {
    expect(repeatOffenders(database.incidents).length).toBeGreaterThan(0);
  });
});

describe('LocalStorageDatabase', () => {
  const createDatabase = () =>
    new LocalStorageDatabase(window.localStorage, () => generateSampleDatabase(NOW));

  beforeEach(() => window.localStorage.clear());

  it('seeds the fake database on first read', async () => {
    const incidents = await createDatabase().list();
    expect(incidents).toHaveLength(SAMPLE_INCIDENT_COUNT);
    expect(await createDatabase().listElevators()).toHaveLength(ELEVATOR_COUNT);
  });

  it('persists an added incident across instances', async () => {
    await createDatabase().add(buildIncident({ id: 'new', code: 'OC-0061' }));
    const incidents = await createDatabase().list();
    expect(incidents[0]).toMatchObject({ id: 'new', code: 'OC-0061' });
  });

  it('replaces an incident on update', async () => {
    const database = createDatabase();
    const [first] = await database.list();
    await database.update({ ...first, status: IncidentStatus.Cancelled });
    const updated = (await database.list()).find((incident) => incident.id === first.id);
    expect(updated?.status).toBe(IncidentStatus.Cancelled);
  });

  it('refuses to update an incident that does not exist', async () => {
    await expect(createDatabase().update(buildIncident({ id: 'ghost' }))).rejects.toThrow(
      'not found',
    );
  });

  it('re-seeds when the stored value is corrupt', async () => {
    window.localStorage.setItem(STORAGE_KEYS.incidents, '{not json');
    expect(await createDatabase().list()).toHaveLength(SAMPLE_INCIDENT_COUNT);
  });

  it('restores the sample data, discarding local changes', async () => {
    const database = createDatabase();
    await database.add(buildIncident({ id: 'new' }));
    await database.restoreSampleData();
    expect(await database.list()).toHaveLength(SAMPLE_INCIDENT_COUNT);
  });
});
