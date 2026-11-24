import { useId, useState } from 'react';
import { IncidentStatus } from '../../domain/enums';
import { useIncidentContext } from '../../use-incident-context';
import styles from '../styles.module.css';
const ACTIONS = {
  [IncidentStatus.Open]: DispatchForm,
  [IncidentStatus.InProgress]: ResolveButton,
};
export function IncidentActions(props) {
  const Action = ACTIONS[props.incident.status];
  return Action ? <Action {...props} /> : null;
}
function DispatchForm({ incident, freeTechnicians }) {
  const { dispatchIncident } = useIncidentContext();
  const [technicianId, setTechnicianId] = useState('');
  const selectId = useId();
  const handleSubmit = (event) => {
    event.preventDefault();
    void dispatchIncident(incident.id, technicianId);
  };
  return (
    <form className={styles.actions} onSubmit={handleSubmit}>
      <label className={styles.field} htmlFor={selectId}>
        Técnico disponível
        <select
          id={selectId}
          value={technicianId}
          onChange={(event) => setTechnicianId(event.target.value)}
        >
          <option value="">Selecione…</option>
          {freeTechnicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.name} ({technician.region})
            </option>
          ))}
        </select>
      </label>
      <button className={styles.button} type="submit" disabled={!technicianId}>
        Despachar
      </button>
    </form>
  );
}
function ResolveButton({ incident }) {
  const { resolveIncident } = useIncidentContext();
  return (
    <div className={styles.actions}>
      <button
        className={styles.button}
        type="button"
        onClick={() => void resolveIncident(incident.id)}
      >
        Marcar como resolvida
      </button>
    </div>
  );
}
