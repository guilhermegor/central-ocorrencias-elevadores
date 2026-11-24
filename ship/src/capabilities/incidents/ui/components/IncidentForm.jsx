import { useId, useState } from 'react';
import { classifyPriority } from '../../domain/priority';
import { useIncidentContext } from '../../use-incident-context';
import { PRIORITY_LABELS, TYPE_LABELS } from '../labels';
import styles from '../styles.module.css';
const EMPTY_FORM = {
  elevatorId: '',
  type: '',
  description: '',
  reportedBy: '',
};
export function IncidentForm({ onCreated }) {
  const { elevators, createIncident, createLoading } = useIncidentContext();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const elevatorId = useId();
  const typeId = useId();
  const descriptionId = useId();
  const reporterId = useId();
  const update = (patch) =>
    setForm({
      ...form,
      ...patch,
    });
  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await createIncident(form);
    setErrors(result.ok ? [] : result.errors);
    if (result.ok) onCreated();
  };
  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
      <label className={styles.field} htmlFor={elevatorId}>
        Elevador
        <select
          id={elevatorId}
          value={form.elevatorId}
          onChange={(event) =>
            update({
              elevatorId: event.target.value,
            })
          }
        >
          <option value="">Selecione…</option>
          {elevators.map((elevator) => (
            <option key={elevator.id} value={elevator.id}>
              {elevator.id} · {elevator.building} — {elevator.address}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field} htmlFor={typeId}>
        Tipo de ocorrência
        <select
          id={typeId}
          value={form.type}
          onChange={(event) =>
            update({
              type: event.target.value,
            })
          }
        >
          <option value="">Selecione…</option>
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <p className={styles.muted} aria-live="polite">
        Prioridade calculada: {form.type ? PRIORITY_LABELS[classifyPriority(form.type)] : '—'}
      </p>
      <label className={styles.field} htmlFor={descriptionId}>
        Descrição
        <textarea
          id={descriptionId}
          rows={4}
          value={form.description}
          onChange={(event) =>
            update({
              description: event.target.value,
            })
          }
        />
      </label>
      <label className={styles.field} htmlFor={reporterId}>
        Reportado por
        <input
          id={reporterId}
          value={form.reportedBy}
          onChange={(event) =>
            update({
              reportedBy: event.target.value,
            })
          }
        />
      </label>
      <ErrorList errors={errors} />
      <button className={styles.button} type="submit" disabled={createLoading}>
        Registrar ocorrência
      </button>
    </form>
  );
}
function ErrorList({ errors }) {
  if (errors.length === 0) return null;
  return (
    <ul className={styles.errors} role="alert">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}
