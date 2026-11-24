import type { Elevator, Incident, SampleDatabase, Technician } from '../domain/entities';
import type { IncidentRepository, ReferenceDataRepository } from '../domain/ports';

export const STORAGE_KEYS = {
  incidents: 'central-ocorrencias:v1:incidents',
  elevators: 'central-ocorrencias:v1:elevators',
  technicians: 'central-ocorrencias:v1:technicians',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export class LocalStorageDatabase implements IncidentRepository, ReferenceDataRepository {
  constructor(
    private readonly storage: Storage,
    private readonly createSampleDatabase: () => SampleDatabase,
  ) {}

  async list(): Promise<Incident[]> {
    return this.readCollection<Incident>(STORAGE_KEYS.incidents);
  }

  async add(incident: Incident): Promise<Incident> {
    const incidents = await this.list();
    this.writeCollection(STORAGE_KEYS.incidents, [incident, ...incidents]);
    return incident;
  }

  async update(incident: Incident): Promise<Incident> {
    const incidents = await this.list();
    if (!incidents.some((stored) => stored.id === incident.id)) {
      throw new Error(`Incident ${incident.code} not found`);
    }
    this.writeCollection(
      STORAGE_KEYS.incidents,
      incidents.map((stored) => (stored.id === incident.id ? incident : stored)),
    );
    return incident;
  }

  async restoreSampleData(): Promise<void> {
    this.seed();
  }

  async listElevators(): Promise<Elevator[]> {
    return this.readCollection<Elevator>(STORAGE_KEYS.elevators);
  }

  async listTechnicians(): Promise<Technician[]> {
    return this.readCollection<Technician>(STORAGE_KEYS.technicians);
  }

  private readCollection<T>(key: StorageKey): T[] {
    const parsed = parseArray(this.storage.getItem(key));
    if (parsed) return parsed as T[];
    this.seed();
    return parseArray(this.storage.getItem(key)) as T[];
  }

  private writeCollection<T>(key: StorageKey, items: T[]): void {
    this.storage.setItem(key, JSON.stringify(items));
  }

  private seed(): void {
    const database = this.createSampleDatabase();
    this.writeCollection(STORAGE_KEYS.incidents, database.incidents);
    this.writeCollection(STORAGE_KEYS.elevators, database.elevators);
    this.writeCollection(STORAGE_KEYS.technicians, database.technicians);
  }
}

function parseArray(raw: string | null): unknown[] | null {
  if (raw === null) return null;
  const value = parseJson(raw);
  return Array.isArray(value) ? value : null;
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}
