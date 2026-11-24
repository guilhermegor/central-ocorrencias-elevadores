import { useEffect } from 'react';
import { useIncidentContext } from '../../use-incident-context';
import styles from '../styles.module.css';
const NOTICE_VISIBLE_MS = 5_000;
export function NoticeBanner() {
  const { notice, notifier } = useIncidentContext();
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => notifier.dismiss(), NOTICE_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [notice, notifier]);
  return (
    <div role="status" aria-live="polite">
      {notice && (
        <div className={styles.notice} data-kind={notice.kind}>
          <span>{notice.message}</span>
          <button
            className={styles.dismiss}
            type="button"
            aria-label="Fechar aviso"
            onClick={() => notifier.dismiss()}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
