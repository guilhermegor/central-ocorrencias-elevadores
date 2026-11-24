import { useCallback, useState } from 'react';

import type { IncidentCreateDTO, IncidentResponseDTO, ValidationResult } from '../domain/dto';
import type { Elevator, Incident, Technician } from '../domain/entities';
import { dispatchIncident, resolveIncident } from '../domain/lifecycle';
import type { INotifier, IncidentRepository, ReferenceDataRepository } from '../domain/ports';
import { classifyPriority } from '../domain/priority';

import { incidentFromCreateDTO, incidentToResponseDTO } from './factories';
import { nextIncidentCode } from './queue';
import { validateIncidentCreate } from './validation';

type OnChanged = () => Promise<void>;

export type CreateIncidentResult = ValidationResult<IncidentResponseDTO>;

export function useListIncidents(repo: IncidentRepository, notifier: INotifier) {
  const [incidents, setIncidents] = useState<IncidentResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (): Promise<void> => {
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

  return { incidents, execute, loading, error };
}

export function useReferenceData(repo: ReferenceDataRepository, notifier: INotifier) {
  const [elevators, setElevators] = useState<Elevator[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const execute = useCallback(async (): Promise<void> => {
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

  return { elevators, technicians, execute };
}

export function useCreateIncident(
  repo: IncidentRepository,
  notifier: INotifier,
  onChanged: OnChanged,
) {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (dto: IncidentCreateDTO): Promise<CreateIncidentResult> => {
      const validation = validateIncidentCreate(dto);
      if (!validation.ok) return validation;
      setLoading(true);
      try {
        const saved = await repo.add(await buildIncident(repo, validation.value));
        notifier.success(`Ocorrência ${saved.code} registrada`);
        await onChanged();
        return { ok: true, value: incidentToResponseDTO(saved) };
      } catch (err) {
        return failure(notifier, 'registrar a ocorrência', err);
      } finally {
        setLoading(false);
      }
    },
    [repo, notifier, onChanged],
  );

  return { execute, loading };
}

export function useDispatchIncident(
  repo: IncidentRepository,
  notifier: INotifier,
  onChanged: OnChanged,
) {
  const execute = useCallback(
    async (incidentId: string, technicianId: string): Promise<boolean> =>
      applyTransition(repo, notifier, onChanged, incidentId, (incident) =>
        dispatchIncident(incident, technicianId, new Date()),
      ),
    [repo, notifier, onChanged],
  );
  return { execute };
}

export function useResolveIncident(
  repo: IncidentRepository,
  notifier: INotifier,
  onChanged: OnChanged,
) {
  const execute = useCallback(
    async (incidentId: string): Promise<boolean> =>
      applyTransition(repo, notifier, onChanged, incidentId, (incident) =>
        resolveIncident(incident, new Date()),
      ),
    [repo, notifier, onChanged],
  );
  return { execute };
}

export function useRestoreSampleData(
  repo: IncidentRepository,
  notifier: INotifier,
  onChanged: OnChanged,
) {
  const execute = useCallback(async (): Promise<void> => {
    try {
      await repo.restoreSampleData();
      notifier.success('Dados de exemplo restaurados');
      await onChanged();
    } catch (err) {
      notifier.error(`Falha ao restaurar dados de exemplo: ${toError(err).message}`);
    }
  }, [repo, notifier, onChanged]);
  return { execute };
}

async function buildIncident(repo: IncidentRepository, dto: IncidentCreateDTO): Promise<Incident> {
  return incidentFromCreateDTO(dto, {
    id: crypto.randomUUID(),
    code: nextIncidentCode(await repo.list()),
    priority: classifyPriority(dto.type),
    openedAt: new Date(),
  });
}

async function applyTransition(
  repo: IncidentRepository,
  notifier: INotifier,
  onChanged: OnChanged,
  incidentId: string,
  transition: (incident: Incident) => Incident,
): Promise<boolean> {
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

function failure(notifier: INotifier, action: string, err: unknown): CreateIncidentResult {
  const message = `Falha ao ${action}: ${toError(err).message}`;
  notifier.error(message);
  return { ok: false, errors: [message] };
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}
