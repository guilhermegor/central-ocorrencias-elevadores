import type { ReactNode } from 'react';

import type { IncidentResponseDTO } from '../../domain/dto';
import { formatDateTime, PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from '../labels';
import styles from '../styles.module.css';

interface IncidentCardProps {
  incident: IncidentResponseDTO;
  elevatorLabel: string;
  technicianName: string;
  children?: ReactNode;
}

export function IncidentCard({
  incident,
  elevatorLabel,
  technicianName,
  children,
}: IncidentCardProps) {
  return (
    <article
      className={styles.card}
      data-priority={incident.priority}
      aria-label={`Ocorrência ${incident.code}`}
    >
      <header className={styles.cardHeader}>
        <span className={styles.code}>{incident.code}</span>
        <span className={styles.badge} data-priority={incident.priority}>
          {PRIORITY_LABELS[incident.priority]}
        </span>
        <span>{STATUS_LABELS[incident.status]}</span>
      </header>
      <h2 className={styles.cardTitle}>
        {TYPE_LABELS[incident.type]} — {elevatorLabel}
      </h2>
      <p>{incident.description}</p>
      <div className={styles.details}>
        <span>Reportado por: {incident.reportedBy}</span>
        <span>Aberta: {formatDateTime(incident.openedAt)}</span>
        <span>Técnico: {technicianName}</span>
        <span>Resolvida: {formatDateTime(incident.resolvedAt)}</span>
      </div>
      {children}
    </article>
  );
}
