import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { IncidentProvider } from '../context';
import { IncidentPriority, IncidentStatus, IncidentType } from '../domain/enums';
import { LocalStorageDatabase } from '../infrastructure/local-storage-database';
import { IncidentForm } from '../ui/components/IncidentForm';
import { NoticeBanner } from '../ui/components/NoticeBanner';
import { DashboardPage } from '../ui/pages/DashboardPage';
import { QueuePage } from '../ui/pages/QueuePage';

import { buildIncident } from './build-incident';

const SAMPLE = {
  elevators: [
    { id: 'EL-01', building: 'Edifício Aurora', address: 'Av. Paulista, 1500', region: 'Centro' },
  ],
  technicians: [{ id: 'TC-01', name: 'Ana Souza', region: 'Centro' }],
  incidents: [
    buildIncident({
      id: 'low',
      code: 'OC-0001',
      type: IncidentType.CustomerRequest,
      priority: IncidentPriority.Low,
    }),
    buildIncident({
      id: 'critical',
      code: 'OC-0002',
      type: IncidentType.TrappedPassenger,
      priority: IncidentPriority.Critical,
    }),
    buildIncident({ id: 'done', code: 'OC-0003', status: IncidentStatus.Resolved }),
  ],
};

function renderWithDatabase(ui: ReactNode) {
  window.localStorage.clear();
  const database = new LocalStorageDatabase(window.localStorage, () => SAMPLE);
  return render(
    <IncidentProvider database={database}>
      <NoticeBanner />
      {ui}
    </IncidentProvider>,
  );
}

async function cardCodes(): Promise<string[]> {
  const cards = await screen.findAllByRole('article');
  return cards.map((card) => card.getAttribute('aria-label') ?? '');
}

describe('QueuePage', () => {
  it('lists the critical incident first and the closed one last', async () => {
    renderWithDatabase(<QueuePage />);
    expect(await cardCodes()).toEqual([
      'Ocorrência OC-0002',
      'Ocorrência OC-0001',
      'Ocorrência OC-0003',
    ]);
  });

  it('dispatches an open incident to an available technician', async () => {
    renderWithDatabase(<QueuePage />);
    const card = await screen.findByRole('article', { name: 'Ocorrência OC-0002' });
    await userEvent.selectOptions(within(card).getByLabelText('Técnico disponível'), 'TC-01');
    await userEvent.click(within(card).getByRole('button', { name: 'Despachar' }));
    expect(await within(card).findByText('Em atendimento')).toBeInTheDocument();
    expect(await screen.findByRole('status')).toHaveTextContent('OC-0002 atualizada');
  });

  it('filters by free-text search', async () => {
    renderWithDatabase(<QueuePage />);
    await screen.findAllByRole('article');
    await userEvent.type(screen.getByLabelText('Buscar'), 'OC-0003');
    expect(await cardCodes()).toEqual(['Ocorrência OC-0003']);
  });
});

describe('IncidentForm', () => {
  it('shows every validation message when submitted empty', async () => {
    renderWithDatabase(<IncidentForm onCreated={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Registrar ocorrência' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Selecione o elevador.');
  });

  it('previews the priority and registers it with the next code', async () => {
    const onCreated = jest.fn();
    renderWithDatabase(<IncidentForm onCreated={onCreated} />);
    await screen.findByRole('option', { name: /Edifício Aurora/ });
    await userEvent.selectOptions(screen.getByLabelText('Elevador'), 'EL-01');
    await userEvent.selectOptions(screen.getByLabelText('Tipo de ocorrência'), 'trapped_passenger');
    expect(screen.getByText(/Prioridade calculada: Crítica/)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Descrição'), 'Pessoa presa no 5º andar.');
    await userEvent.type(screen.getByLabelText('Reportado por'), 'Portaria');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar ocorrência' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Ocorrência OC-0004 registrada');
    expect(onCreated).toHaveBeenCalledTimes(1);
  });
});

describe('DashboardPage', () => {
  it('summarises totals and active incidents', async () => {
    renderWithDatabase(<DashboardPage />);
    const total = await screen.findByText('Ocorrências no período');
    expect(total.nextSibling).toHaveTextContent(String(SAMPLE.incidents.length));
    expect(screen.getByText('Ativas agora').nextSibling).toHaveTextContent('2');
  });
});
