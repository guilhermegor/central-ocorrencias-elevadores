import { useCallback, useState } from 'react';
import { dispatchIncident, resolveIncident } from '../domain/lifecycle';
import { classifyPriority } from '../domain/priority';
import { incidentFromCreateDTO, incidentToResponseDTO } from './factories';
import { nextIncidentCode } from './queue';
import { validateIncidentCreate } from './validation';
export function useListIncidents(repo, notifier) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await repo.list();
      setIncidents(items.map(incidentToResponseDTO));
    } catch (err) {
      const e = toError(err);
      setError(e);
      notifier.error(`Falha ao carregar ocorrências: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [repo, notifier]);
  return {
    incidents,
    execute,
    loading,
    error,
  };
}
export function useReferenceData(repo, notifier) {
  const [elevators, setElevators] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const execute = useCallback(async () => {
    try {
      const [loadedElevators, loadedTechnicians] = await Promise.all([
        repo.listElevators(),
        repo.listTechnicians(),
      ]);
      setElevators(loadedElevators);
      setTechnicians(loadedTechnicians);
    } catch (err) {
      notifier.error(`Falha ao carregar elevadores e técnicos: ${toError(err).message}`);
    }
  }, [repo, notifier]);
  return {
    elevators,
    technicians,
    execute,
  };
}
export function useCreateIncident(repo, notifier, onChanged) {
  const [loading, setLoading] = useState(false);
  const execute = useCallback(
    async (dto) => {
      const validation = validateIncidentCreate(dto);
      if (!validation.ok) return validation;
      setLoading(true);
      try {
        const saved = await repo.add(await buildIncident(repo, validation.value));
        notifier.success(`Ocorrência ${saved.code} registrada`);
        await onChanged();
        return {
          ok: true,
          value: incidentToResponseDTO(saved),
        };
      } catch (err) {
        return failure(notifier, 'registrar a ocorrência', err);
      } finally {
        setLoading(false);
      }
    },
    [repo, notifier, onChanged],
  );
  return {
    execute,
    loading,
  };
}
export function useDispatchIncident(repo, notifier, onChanged) {
  const execute = useCallback(
    async (incidentId, technicianId) =>
      applyTransition(repo, notifier, onChanged, incidentId, (incident) =>
        dispatchIncident(incident, technicianId, new Date()),
      ),
    [repo, notifier, onChanged],
  );
  return {
    execute,
  };
}
export function useResolveIncident(repo, notifier, onChanged) {
  const execute = useCallback(
    async (incidentId) =>
      applyTransition(repo, notifier, onChanged, incidentId, (incident) =>
        resolveIncident(incident, new Date()),
      ),
    [repo, notifier, onChanged],
  );
  return {
    execute,
  };
}
export function useRestoreSampleData(repo, notifier, onChanged) {
  const execute = useCallback(async () => {
    try {
      await repo.restoreSampleData();
      notifier.success('Dados de exemplo restaurados');
      await onChanged();
    } catch (err) {
      notifier.error(`Falha ao restaurar dados de exemplo: ${toError(err).message}`);
    }
  }, [repo, notifier, onChanged]);
  return {
    execute,
  };
}
async function buildIncident(repo, dto) {
  return incidentFromCreateDTO(dto, {
    id: crypto.randomUUID(),
    code: nextIncidentCode(await repo.list()),
    priority: classifyPriority(dto.type),
    openedAt: new Date(),
  });
}
async function applyTransition(repo, notifier, onChanged, incidentId, transition) {
  try {
    const incident = (await repo.list()).find((stored) => stored.id === incidentId);
    if (!incident) throw new Error(`Ocorrência ${incidentId} não encontrada`);
    const updated = await repo.update(transition(incident));
    notifier.success(`Ocorrência ${updated.code} atualizada`);
    await onChanged();
    return true;
  } catch (err) {
    notifier.error(`Falha ao atualizar a ocorrência: ${toError(err).message}`);
    return false;
  }
}
function failure(notifier, action, err) {
  const message = `Falha ao ${action}: ${toError(err).message}`;
  notifier.error(message);
  return {
    ok: false,
    errors: [message],
  };
}
function toError(err) {
  return err instanceof Error ? err : new Error(String(err));
}
