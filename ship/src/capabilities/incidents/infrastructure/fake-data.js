import { IncidentStatus, IncidentType } from '../domain/enums';
import { formatIncidentCode } from '../domain/incident-code';
import { classifyPriority } from '../domain/priority';
export const DEFAULT_SEED = 20_261_127;
export const SAMPLE_INCIDENT_COUNT = 60;
const MINUTE_MS = 60_000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const HOUR_MS = MINUTES_PER_HOUR * MINUTE_MS;
const DAY_MS = HOURS_PER_DAY * HOUR_MS;
const HISTORY_DAYS = 30;
const HISTORY_MS = HISTORY_DAYS * DAY_MS;
const ACTIVE_WINDOW_HOURS = 6;
const ACTIVE_WINDOW_MS = ACTIVE_WINDOW_HOURS * HOUR_MS;
const ACTIVE_INCIDENT_COUNT = 10;
const FASTEST_DISPATCH_MINUTES = 5;
const SLOWEST_DISPATCH_MINUTES = 90;
const FASTEST_REPAIR_MINUTES = 20;
const SLOWEST_REPAIR_MINUTES = 240;
const REPEAT_OFFENDER_COUNT = 3;
var Weight = (function (Weight) {
  Weight[(Weight['Rare'] = 1)] = 'Rare';
  Weight[(Weight['Low'] = 2)] = 'Low';
  Weight[(Weight['Medium'] = 3)] = 'Medium';
  Weight[(Weight['RepeatOffender'] = 4)] = 'RepeatOffender';
  Weight[(Weight['High'] = 5)] = 'High';
  Weight[(Weight['Frequent'] = 8)] = 'Frequent';
  Weight[(Weight['Dominant'] = 9)] = 'Dominant';
  return Weight;
})(Weight || {});
const DISPATCH_RANGE = {
  min: FASTEST_DISPATCH_MINUTES,
  max: SLOWEST_DISPATCH_MINUTES,
};
const REPAIR_RANGE = {
  min: FASTEST_REPAIR_MINUTES,
  max: SLOWEST_REPAIR_MINUTES,
};
const ELEVATORS = [
  {
    id: 'EL-01',
    building: 'Edifício Aurora',
    address: 'Av. Paulista, 1500',
    region: 'Centro',
  },
  {
    id: 'EL-02',
    building: 'Torre Ipiranga',
    address: 'Av. Ipiranga, 344',
    region: 'Centro',
  },
  {
    id: 'EL-03',
    building: 'Residencial Jardins',
    address: 'Rua Augusta, 2100',
    region: 'Oeste',
  },
  {
    id: 'EL-04',
    building: 'Centro Médico Vila Mariana',
    address: 'Rua Domingos de Morais, 900',
    region: 'Sul',
  },
  {
    id: 'EL-05',
    building: 'Shopping Tatuapé',
    address: 'Rua Tuiuti, 2200',
    region: 'Leste',
  },
  {
    id: 'EL-06',
    building: 'Edifício Faria Lima',
    address: 'Av. Brig. Faria Lima, 3400',
    region: 'Oeste',
  },
  {
    id: 'EL-07',
    building: 'Hospital Santana',
    address: 'Rua Voluntários da Pátria, 1800',
    region: 'Norte',
  },
  {
    id: 'EL-08',
    building: 'Condomínio Mooca Park',
    address: 'Rua da Mooca, 1250',
    region: 'Leste',
  },
  {
    id: 'EL-09',
    building: 'Torre Berrini',
    address: 'Av. Eng. Luís Carlos Berrini, 1100',
    region: 'Sul',
  },
  {
    id: 'EL-10',
    building: 'Edifício Lapa Office',
    address: 'Rua Guaicurus, 500',
    region: 'Oeste',
  },
];
const TECHNICIANS = [
  {
    id: 'TC-01',
    name: 'Ana Souza',
    region: 'Centro',
  },
  {
    id: 'TC-02',
    name: 'Bruno Lima',
    region: 'Oeste',
  },
  {
    id: 'TC-03',
    name: 'Carla Mendes',
    region: 'Sul',
  },
  {
    id: 'TC-04',
    name: 'Diego Ferreira',
    region: 'Leste',
  },
  {
    id: 'TC-05',
    name: 'Elaine Rocha',
    region: 'Norte',
  },
  {
    id: 'TC-06',
    name: 'Fábio Nunes',
    region: 'Centro',
  },
];
const TYPE_WEIGHTS = [
  [IncidentType.TechnicalFailure, Weight.Frequent],
  [IncidentType.CustomerRequest, Weight.High],
  [IncidentType.PowerOutage, Weight.Medium],
  [IncidentType.TrappedPassenger, Weight.Low],
  [IncidentType.Other, Weight.Low],
];
const ACTIVE_STATUS_WEIGHTS = [
  [IncidentStatus.Open, Weight.Rare],
  [IncidentStatus.InProgress, Weight.Rare],
];
const CLOSED_STATUS_WEIGHTS = [
  [IncidentStatus.Resolved, Weight.Dominant],
  [IncidentStatus.Cancelled, Weight.Rare],
];
const ELEVATOR_WEIGHTS = ELEVATORS.map((elevator, index) => [
  elevator.id,
  index < REPEAT_OFFENDER_COUNT ? Weight.RepeatOffender : Weight.Rare,
]);
const DESCRIPTIONS = {
  [IncidentType.TrappedPassenger]: [
    'Passageiro preso entre o 7º e o 8º andar, interfone funcionando.',
    'Duas pessoas presas na cabine, porta não abre no térreo.',
    'Criança presa com a babá, cabine parada no 3º andar.',
  ],
  [IncidentType.PowerOutage]: [
    'Queda de energia no prédio; elevador parado com alarme acionado.',
    'Gerador não assumiu após queda da concessionária.',
    'Oscilação de energia desarmou o quadro do elevador.',
  ],
  [IncidentType.TechnicalFailure]: [
    'Porta da cabine abrindo e fechando sem parar.',
    'Ruído metálico forte durante a subida.',
    'Elevador não nivela no andar, degrau de 5 cm.',
    'Botoeira do 4º andar sem resposta.',
    'Freio acionando de forma brusca na descida.',
  ],
  [IncidentType.CustomerRequest]: [
    'Síndico solicita revisão preventiva antes de mudança no prédio.',
    'Pedido de vistoria após reclamação de moradores.',
    'Solicitação de segunda via do relatório de manutenção.',
  ],
  [IncidentType.Other]: [
    'Iluminação da cabine queimada.',
    'Vandalismo no painel interno da cabine.',
    'Cheiro de queimado relatado na casa de máquinas.',
  ],
};
const REPORTERS = ['Portaria', 'Síndico', 'Zelador', 'Central 24h', 'Morador', 'Segurança'];
export function generateSampleDatabase(now, seed = DEFAULT_SEED) {
  const random = createRandom(seed);
  const incidents = Array.from(
    {
      length: SAMPLE_INCIDENT_COUNT,
    },
    (_, index) => generateIncident(index + 1, now.getTime(), random),
  ).sort((first, second) => second.openedAt.localeCompare(first.openedAt));
  return {
    elevators: ELEVATORS,
    technicians: TECHNICIANS,
    incidents,
  };
}
function generateIncident(sequence, nowMs, random) {
  const type = pickWeighted(TYPE_WEIGHTS, random);
  const openedMs = nowMs - pickAgeMs(sequence, random);
  const status = pickStatus(nowMs - openedMs, random);
  return {
    id: `seed-${sequence}`,
    code: formatIncidentCode(sequence),
    elevatorId: pickWeighted(ELEVATOR_WEIGHTS, random),
    type,
    priority: classifyPriority(type),
    status,
    description: pick(DESCRIPTIONS[type], random),
    reportedBy: pick(REPORTERS, random),
    openedAt: new Date(openedMs).toISOString(),
    ...buildTimeline(status, openedMs, random),
  };
}
function pickAgeMs(sequence, random) {
  if (sequence <= ACTIVE_INCIDENT_COUNT) return Math.floor(random() * ACTIVE_WINDOW_MS);
  return ACTIVE_WINDOW_MS + Math.floor(random() * (HISTORY_MS - ACTIVE_WINDOW_MS));
}
function buildTimeline(status, openedMs, random) {
  const dispatchedMs = openedMs + randomMinutes(DISPATCH_RANGE, random);
  const resolvedMs = dispatchedMs + randomMinutes(REPAIR_RANGE, random);
  const technicianId = pick(TECHNICIANS, random).id;
  const notDispatched = {
    dispatchedAt: null,
    resolvedAt: null,
    technicianId: null,
  };
  const timelines = {
    [IncidentStatus.Open]: notDispatched,
    [IncidentStatus.Cancelled]: notDispatched,
    [IncidentStatus.InProgress]: {
      dispatchedAt: new Date(dispatchedMs).toISOString(),
      resolvedAt: null,
      technicianId,
    },
    [IncidentStatus.Resolved]: {
      dispatchedAt: new Date(dispatchedMs).toISOString(),
      resolvedAt: new Date(resolvedMs).toISOString(),
      technicianId,
    },
  };
  return timelines[status];
}
function pickStatus(ageMs, random) {
  const weights = ageMs < ACTIVE_WINDOW_MS ? ACTIVE_STATUS_WEIGHTS : CLOSED_STATUS_WEIGHTS;
  return pickWeighted(weights, random);
}
function pickWeighted(weights, random) {
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  let threshold = random() * total;
  const found = weights.find(([, weight]) => (threshold -= weight) < 0);
  return (found ?? weights[weights.length - 1])[0];
}
function pick(items, random) {
  return items[Math.floor(random() * items.length)];
}
function randomMinutes(range, random) {
  return (range.min + Math.floor(random() * (range.max - range.min))) * MINUTE_MS;
}
const MULBERRY_INCREMENT = 0x6d2b79f5;
const MULBERRY_SHIFT_A = 15;
const MULBERRY_SHIFT_B = 7;
const MULBERRY_ODD_MASK = 61;
const MULBERRY_SHIFT_C = 14;
const UINT32_RANGE = 4_294_967_296;
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + MULBERRY_INCREMENT) >>> 0;
    let mixed = Math.imul(state ^ (state >>> MULBERRY_SHIFT_A), 1 | state);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> MULBERRY_SHIFT_B), MULBERRY_ODD_MASK | mixed);
    return ((mixed ^ (mixed >>> MULBERRY_SHIFT_C)) >>> 0) / UINT32_RANGE;
  };
}
