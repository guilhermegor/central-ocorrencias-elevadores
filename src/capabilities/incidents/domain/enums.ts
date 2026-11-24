export enum IncidentType {
  TrappedPassenger = 'trapped_passenger',
  PowerOutage = 'power_outage',
  TechnicalFailure = 'technical_failure',
  CustomerRequest = 'customer_request',
  Other = 'other',
}

export enum IncidentStatus {
  Open = 'open',
  InProgress = 'in_progress',
  Resolved = 'resolved',
  Cancelled = 'cancelled',
}

export enum IncidentPriority {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}
