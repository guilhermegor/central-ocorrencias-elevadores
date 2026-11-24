import { useId } from 'react';
import { ALL } from '../../application/queue';
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from '../labels';
import styles from '../styles.module.css';
export function QueueFiltersBar({ filters, elevators, onChange }) {
  const searchId = useId();
  const elevatorLabels = Object.fromEntries(
    elevators.map((elevator) => [elevator.id, `${elevator.id} · ${elevator.building}`]),
  );
  return (
    <div className={styles.filters} role="search">
      <label className={styles.field} htmlFor={searchId}>
        Buscar
        <input
          id={searchId}
          type="search"
          placeholder="Código, descrição ou quem reportou"
          value={filters.search}
          onChange={(event) =>
            onChange({
              search: event.target.value,
            })
          }
        />
      </label>
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUS_LABELS}
        onChange={(status) =>
          onChange({
            status,
          })
        }
      />
      <FilterSelect
        label="Tipo"
        value={filters.type}
        options={TYPE_LABELS}
        onChange={(type) =>
          onChange({
            type,
          })
        }
      />
      <FilterSelect
        label="Prioridade"
        value={filters.priority}
        options={PRIORITY_LABELS}
        onChange={(priority) =>
          onChange({
            priority,
          })
        }
      />
      <FilterSelect
        label="Elevador"
        value={filters.elevatorId}
        options={elevatorLabels}
        onChange={(elevatorId) =>
          onChange({
            elevatorId,
          })
        }
      />
    </div>
  );
}
function FilterSelect({ label, value, options, onChange }) {
  const id = useId();
  return (
    <label className={styles.field} htmlFor={id}>
      {label}
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value={ALL}>Todos</option>
        {Object.entries(options).map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
