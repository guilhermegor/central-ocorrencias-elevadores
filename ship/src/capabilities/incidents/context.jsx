import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useCreateIncident,
  useDispatchIncident,
  useListIncidents,
  useReferenceData,
  useResolveIncident,
  useRestoreSampleData,
} from './application/use-cases';
import { generateSampleDatabase } from './infrastructure/fake-data';
import { LocalStorageDatabase } from './infrastructure/local-storage-database';
import { ScreenNotifier } from './infrastructure/screen-notifier';
import { IncidentContext } from './use-incident-context';
export function IncidentProvider({ children, database }) {
  const repo = useMemo(
    () =>
      database ??
      new LocalStorageDatabase(window.localStorage, () => generateSampleDatabase(new Date())),
    [database],
  );
  const [notice, setNotice] = useState(null);
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
  const value = useMemo(
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
