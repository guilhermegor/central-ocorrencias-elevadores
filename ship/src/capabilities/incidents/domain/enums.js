export let IncidentType = (function (IncidentType) {
  IncidentType['TrappedPassenger'] = 'trapped_passenger';
  IncidentType['PowerOutage'] = 'power_outage';
  IncidentType['TechnicalFailure'] = 'technical_failure';
  IncidentType['CustomerRequest'] = 'customer_request';
  IncidentType['Other'] = 'other';
  return IncidentType;
})({});
export let IncidentStatus = (function (IncidentStatus) {
  IncidentStatus['Open'] = 'open';
  IncidentStatus['InProgress'] = 'in_progress';
  IncidentStatus['Resolved'] = 'resolved';
  IncidentStatus['Cancelled'] = 'cancelled';
  return IncidentStatus;
})({});
export let IncidentPriority = (function (IncidentPriority) {
  IncidentPriority['Critical'] = 'critical';
  IncidentPriority['High'] = 'high';
  IncidentPriority['Medium'] = 'medium';
  IncidentPriority['Low'] = 'low';
  return IncidentPriority;
})({});
