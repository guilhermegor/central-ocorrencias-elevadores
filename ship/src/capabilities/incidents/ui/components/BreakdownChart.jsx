import styles from '../styles.module.css';
const PERCENT = 100;
export function BreakdownChart({ title, entries }) {
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
              style={{
                width: `${(entry.count / max) * PERCENT}%`,
              }}
            />
          </div>
          <strong>{entry.count}</strong>
        </div>
      ))}
    </figure>
  );
}
