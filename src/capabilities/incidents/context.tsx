import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  useCreateIncident,
  useDispatchIncident,
  useListIncidents,
  useReferenceData,
  useResolveIncident,
  useRestoreSampleData,
} from './application/use-cases';
import type { IncidentRepository, ReferenceDataRepository } from './domain/ports';
import { generateSampleDatabase } from './infrastructure/fake-data';
import { LocalStorageDatabase } from './infrastructure/local-storage-database';
import { ScreenNotifier, type Notice } from './infrastructure/screen-notifier';
import { IncidentContext, type IncidentContextValue } from './use-incident-context';

type Database = IncidentRepository & ReferenceDataRepository;

interface IncidentProviderProps {
  children: React.ReactNode;
  database?: Database;
}

export function IncidentProvider({ children, database }: IncidentProviderProps) {
  const repo = useMemo<Database>(
    () =>
      database ??
      new LocalStorageDatabase(window.localStorage, () => generateSampleDatabase(new Date())),
    [database],
  );
  const [notice, setNotice] = useState<Notice | null>(null);
  const notifier = useMemo(() => new ScreenNotifier(setNotice), []);

  const { incidents, execute: loadIncidents, loading, error } = useListIncidents(repo, notifier);
  const { elevators, technicians, execute: loadReferenceData } = useReferenceData(repo, notifier);
  const refresh = useCallback(async () => {
    await Promise.all([loadIncidents(), loadReferenceData()]);
  }, [loadIncidents, loadReferenceData]);

  const { execute: createIncident, loading: createLoading } = useCreateIncident(
    repo,
    notifier,
    loadIncidents,
  );
  const { execute: dispatchIncident } = useDispatchIncident(repo, notifier, loadIncidents);
  const { execute: resolveIncident } = useResolveIncident(repo, notifier, loadIncidents);
  const { execute: restoreSampleData } = useRestoreSampleData(repo, notifier, refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<IncidentContextValue>(
    () => ({
      incidents,
      elevators,
      technicians,
      loading,
      error,
      notice,
      notifier,
      createIncident,
      createLoading,
      dispatchIncident,
      resolveIncident,
      restoreSampleData,
    }),
    [
      incidents,
      elevators,
      technicians,
      loading,
      error,
      notice,
      notifier,
      createIncident,
      createLoading,
      dispatchIncident,
      resolveIncident,
      restoreSampleData,
    ],
  );

  return <IncidentContext value={value}>{children}</IncidentContext>;
}
