import { useEffect, useMemo, useState } from 'react';
import {
  availableTechnicians,
  buildQueue,
  DEFAULT_QUEUE_FILTERS,
  filterIncidents,
} from '../../application/queue';
import { useIncidentContext } from '../../use-incident-context';
import { IncidentActions } from '../components/IncidentActions';
import { IncidentCard } from '../components/IncidentCard';
import { QueueFiltersBar } from '../components/QueueFiltersBar';
import styles from '../styles.module.css';
export function QueuePage() {
  const { incidents, elevators, technicians, error } = useIncidentContext();
  const [filters, setFilters] = useState(DEFAULT_QUEUE_FILTERS);
  const queue = useMemo(
    () => buildQueue(filterIncidents(incidents, filters)),
    [incidents, filters],
  );
  const freeTechnicians = useMemo(
    () => availableTechnicians(technicians, incidents),
    [technicians, incidents],
  );
  const elevatorById = useMemo(() => byId(elevators), [elevators]);
  const technicianById = useMemo(() => byId(technicians), [technicians]);
  useEffect(() => {
    document.title = 'Fila de ocorrências · Central de Ocorrências';
  }, []);
  if (error) return <p role="alert">Erro ao carregar: {error.message}</p>;
  return (
    <section className={styles.page} aria-labelledby="queue-title">
      <h1 id="queue-title" className={styles.pageTitle}>
        Fila de ocorrências
      </h1>
      <QueueFiltersBar
        filters={filters}
        elevators={elevators}
        onChange={(patch) =>
          setFilters({
            ...filters,
            ...patch,
          })
        }
      />
      <p className={styles.muted}>
        {queue.length} ocorrência(s) · ativas primeiro, por prioridade e tempo de espera
      </p>
      <ul className={styles.list}>
        {queue.map((incident) => (
          <li key={incident.id}>
            <IncidentCard
              incident={incident}
              elevatorLabel={elevatorLabel(
                elevatorById.get(incident.elevatorId),
                incident.elevatorId,
              )}
              technicianName={technicianName(technicianById, incident.technicianId)}
            >
              <IncidentActions incident={incident} freeTechnicians={freeTechnicians} />
            </IncidentCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
function byId(items) {
  return new Map(items.map((item) => [item.id, item]));
}
function elevatorLabel(elevator, fallback) {
  return elevator ? `${elevator.building} (${elevator.id})` : fallback;
}
function technicianName(technicians, id) {
  const technician = id === null ? undefined : technicians.get(id);
  return technician ? technician.name : '—';
}
