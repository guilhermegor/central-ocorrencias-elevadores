import type { CSSProperties } from 'react';

import styles from '../styles.module.css';

export interface BreakdownEntry {
  label: string;
  count: number;
}

interface BreakdownChartProps {
  title: string;
  entries: BreakdownEntry[];
}

const PERCENT = 100;

export function BreakdownChart({ title, entries }: BreakdownChartProps) {
  const max = Math.max(1, ...entries.map((entry) => entry.count));
  return (
    <figure className={styles.chart}>
      <figcaption className={styles.chartTitle}>{title}</figcaption>
      {entries.map((entry) => (
        <div key={entry.label} className={styles.bar}>
          <span>{entry.label}</span>
          <div className={styles.barTrack} aria-hidden="true">
            <div
              className={styles.barFill}
              style={{ width: `${(entry.count / max) * PERCENT}%` } as CSSProperties}
            />
          </div>
          <strong>{entry.count}</strong>
        </div>
      ))}
    </figure>
  );
}
