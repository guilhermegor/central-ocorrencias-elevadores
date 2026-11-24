import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { IncidentForm } from '../components/IncidentForm';
import styles from '../styles.module.css';
export function NewIncidentPage() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = 'Nova ocorrência · Central de Ocorrências';
  }, []);
  return (
    <section className={styles.page} aria-labelledby="new-incident-title">
      <h1 id="new-incident-title" className={styles.pageTitle}>
        Registrar ocorrência
      </h1>
      <p className={styles.muted}>
        A prioridade é calculada pelo tipo; a ocorrência entra na fila como Aberta.
      </p>
      <IncidentForm onCreated={() => void navigate('/')} />
    </section>
  );
}
