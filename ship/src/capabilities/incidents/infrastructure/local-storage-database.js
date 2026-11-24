export const STORAGE_KEYS = {
  incidents: 'central-ocorrencias:v1:incidents',
  elevators: 'central-ocorrencias:v1:elevators',
  technicians: 'central-ocorrencias:v1:technicians',
};
export class LocalStorageDatabase {
  constructor(storage, createSampleDatabase) {
    this.storage = storage;
    this.createSampleDatabase = createSampleDatabase;
  }
  async list() {
    return this.readCollection(STORAGE_KEYS.incidents);
  }
  async add(incident) {
    const incidents = await this.list();
    this.writeCollection(STORAGE_KEYS.incidents, [incident, ...incidents]);
    return incident;
  }
  async update(incident) {
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
  async restoreSampleData() {
    this.seed();
  }
  async listElevators() {
    return this.readCollection(STORAGE_KEYS.elevators);
  }
  async listTechnicians() {
    return this.readCollection(STORAGE_KEYS.technicians);
  }
  readCollection(key) {
    const parsed = parseArray(this.storage.getItem(key));
    if (parsed) return parsed;
    this.seed();
    return parseArray(this.storage.getItem(key));
  }
  writeCollection(key, items) {
    this.storage.setItem(key, JSON.stringify(items));
  }
  seed() {
    const database = this.createSampleDatabase();
    this.writeCollection(STORAGE_KEYS.incidents, database.incidents);
    this.writeCollection(STORAGE_KEYS.elevators, database.elevators);
    this.writeCollection(STORAGE_KEYS.technicians, database.technicians);
  }
}
function parseArray(raw) {
  if (raw === null) return null;
  const value = parseJson(raw);
  return Array.isArray(value) ? value : null;
}
function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
