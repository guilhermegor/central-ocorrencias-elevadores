import { useEffect, useMemo } from 'react';

import { countBy, repeatOffenders, summarize, type CountEntry } from '../../application/metrics';
import type { IncidentResponseDTO } from '../../domain/dto';
import { useIncidentContext } from '../../use-incident-context';
import { BreakdownChart, type BreakdownEntry } from '../components/BreakdownChart';
import { formatMinutes, PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from '../labels';
import styles from '../styles.module.css';

export function DashboardPage() {
  const { incidents, elevators, technicians, restoreSampleData } = useIncidentContext();
  const summary = useMemo(() => summarize(incidents), [incidents]);
  const elevatorNames = useMemo(
    () => Object.fromEntries(elevators.map((e) => [e.id, `${e.building} (${e.id})`])),
    [elevators],
  );
  const technicianNames = useMemo(
    () => Object.fromEntries(technicians.map((t) => [t.id, t.name])),
    [technicians],
  );

  useEffect(() => {
    document.title = 'Painel gerencial · Central de Ocorrências';
  }, []);

  return (
    <section className={styles.page} aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className={styles.pageTitle}>
        Painel gerencial
      </h1>
      <div className={styles.kpis}>
        <Kpi label="Ocorrências no período" value={summary.total} />
        <Kpi label="Ativas agora" value={summary.active} />
        <Kpi label="Críticas ativas" value={summary.criticalActive} />
        <Kpi
          label="Tempo médio até o despacho"
          value={formatMinutes(summary.meanMinutesToDispatch)}
        />
        <Kpi
          label="Tempo médio até a resolução"
          value={formatMinutes(summary.meanMinutesToResolve)}
        />
      </div>
      <div className={styles.charts}>
        <BreakdownChart title="Por tipo" entries={breakdown(incidents, 'type', TYPE_LABELS)} />
        <BreakdownChart
          title="Por prioridade"
          entries={breakdown(incidents, 'priority', PRIORITY_LABELS)}
        />
        <BreakdownChart
          title="Por status"
          entries={breakdown(incidents, 'status', STATUS_LABELS)}
        />
        <BreakdownChart
          title="Atendimentos por técnico"
          entries={breakdown(incidents, 'technicianId', technicianNames)}
        />
        <BreakdownChart
          title="Elevadores reincidentes (8+ ocorrências)"
          entries={labelled(repeatOffenders(incidents), elevatorNames)}
        />
      </div>
      <div className={styles.actions}>
        <button className={styles.button} type="button" onClick={() => void restoreSampleData()}>
          Restaurar dados de exemplo
        </button>
        <span className={styles.muted}>Descarta as alterações locais e recria a base fake.</span>
      </div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.kpi}>
      <span className={styles.muted}>{label}</span>
      <span className={styles.kpiValue}>{value}</span>
    </div>
  );
}

type GroupKey = 'type' | 'priority' | 'status' | 'technicianId';

function breakdown(
  incidents: IncidentResponseDTO[],
  key: GroupKey,
  labels: Record<string, string>,
): BreakdownEntry[] {
  return labelled(
    countBy(incidents, (incident) => incident[key]),
    labels,
  );
}

function labelled(entries: CountEntry[], labels: Record<string, string>): BreakdownEntry[] {
  return entries.map((entry) => ({ label: labels[entry.key] ?? entry.key, count: entry.count }));
}
