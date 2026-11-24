import type { Elevator, Incident, Technician } from './entities';

export interface IncidentRepository {
  list(): Promise<Incident[]>;
  add(incident: Incident): Promise<Incident>;
  update(incident: Incident): Promise<Incident>;
  restoreSampleData(): Promise<void>;
}

export interface ReferenceDataRepository {
  listElevators(): Promise<Elevator[]>;
  listTechnicians(): Promise<Technician[]>;
}

export interface INotifier {
  success(message: string): void;
  error(message: string): void;
  warning(message: string): void;
  info(message: string): void;
  dismiss(): void;
}
