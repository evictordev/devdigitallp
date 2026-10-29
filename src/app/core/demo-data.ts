/** Dados fictícios e determinísticos usados nas demonstrações da página. */

export type Period = '7d' | '30d' | '12m';
export type Metric = 'receita' | 'pedidos';

export const PERIODS: { id: Period; label: string; ticks: string[] }[] = [
  { id: '7d', label: '7 dias', ticks: ['seg', 'qua', 'sex', 'dom'] },
  { id: '30d', label: '30 dias', ticks: ['sem 1', 'sem 2', 'sem 3', 'sem 4'] },
  { id: '12m', label: '12 meses', ticks: ['jan', 'abr', 'jul', 'out'] },
];

export const SERIES: Record<Metric, Record<Period, number[]>> = {
  receita: {
    '7d': [3.1, 3.6, 3.3, 4.2, 3.9, 4.8, 4.4, 5.1, 4.7, 5.6, 5.2, 6.0],
    '30d': [11.2, 12.4, 11.8, 13.1, 12.6, 12.9, 14.8, 14.2, 15.6, 14.9, 16.3, 17.1],
    '12m': [96, 104, 99, 118, 127, 122, 141, 153, 149, 168, 176, 190],
  },
  pedidos: {
    '7d': [34, 41, 38, 45, 42, 52, 47, 55, 50, 61, 57, 64],
    '30d': [118, 131, 124, 140, 136, 133, 152, 149, 161, 156, 168, 175],
    '12m': [1020, 1110, 1065, 1240, 1330, 1290, 1470, 1590, 1545, 1720, 1810, 1950],
  },
};

export const UNITS: Record<Metric, { prefix: string; suffix: string; decimals: number }> = {
  receita: { prefix: 'R$ ', suffix: ' mil', decimals: 1 },
  pedidos: { prefix: '', suffix: '', decimals: 0 },
};

export interface Kpi {
  id: string;
  label: string;
  value: number;
  decimals: number;
  prefix: string;
  suffix: string;
  delta: number;
}

export const KPIS: Record<Period, Kpi[]> = {
  '7d': [
    { id: 'rec', label: 'Receita', value: 38420, decimals: 0, prefix: 'R$ ', suffix: '', delta: 12.4 },
    { id: 'ped', label: 'Pedidos', value: 412, decimals: 0, prefix: '', suffix: '', delta: 8.1 },
    { id: 'tkt', label: 'Ticket médio', value: 93.25, decimals: 2, prefix: 'R$ ', suffix: '', delta: 3.9 },
    { id: 'cnv', label: 'Conversão', value: 3.8, decimals: 1, prefix: '', suffix: '%', delta: 0.4 },
  ],
  '30d': [
    { id: 'rec', label: 'Receita', value: 162870, decimals: 0, prefix: 'R$ ', suffix: '', delta: 9.7 },
    { id: 'ped', label: 'Pedidos', value: 1764, decimals: 0, prefix: '', suffix: '', delta: 6.2 },
    { id: 'tkt', label: 'Ticket médio', value: 92.33, decimals: 2, prefix: 'R$ ', suffix: '', delta: 3.3 },
    { id: 'cnv', label: 'Conversão', value: 3.6, decimals: 1, prefix: '', suffix: '%', delta: -0.2 },
  ],
  '12m': [
    { id: 'rec', label: 'Receita', value: 1948300, decimals: 0, prefix: 'R$ ', suffix: '', delta: 21.5 },
    { id: 'ped', label: 'Pedidos', value: 20940, decimals: 0, prefix: '', suffix: '', delta: 17.8 },
    { id: 'tkt', label: 'Ticket médio', value: 93.04, decimals: 2, prefix: 'R$ ', suffix: '', delta: 3.1 },
    { id: 'cnv', label: 'Conversão', value: 3.4, decimals: 1, prefix: '', suffix: '%', delta: 0.6 },
  ],
};

export type OrderStatus = 'pago' | 'pendente' | 'enviado';

export interface Order {
  id: number;
  customer: string;
  total: number;
  status: OrderStatus;
}

export const ORDERS: Order[] = [
  { id: 1042, customer: 'Marina Duarte', total: 184.9, status: 'pago' },
  { id: 1041, customer: 'Estúdio Alba', total: 642.0, status: 'enviado' },
  { id: 1040, customer: 'Rafael Nunes', total: 59.9, status: 'pendente' },
  { id: 1039, customer: 'Casa Verde', total: 318.5, status: 'pago' },
  { id: 1038, customer: 'Beatriz Lima', total: 97.0, status: 'enviado' },
  { id: 1037, customer: 'Oficina Norte', total: 1280.0, status: 'pago' },
  { id: 1036, customer: 'Paulo Reis', total: 74.2, status: 'pendente' },
  { id: 1035, customer: 'Lúmen Café', total: 225.6, status: 'enviado' },
];

export const ACTIVITY: { id: number; time: string; text: string; tone: 'ok' | 'run' | 'wait' }[] = [
  { id: 1, time: '09:42', text: 'Pedido #1042 pago — nota fiscal emitida', tone: 'ok' },
  { id: 2, time: '09:41', text: 'Cliente avisado no WhatsApp sobre o envio do #1041', tone: 'ok' },
  { id: 3, time: '09:38', text: 'Estoque de “Caneca grande” abaixo do mínimo', tone: 'wait' },
  { id: 4, time: '09:36', text: 'Sincronizando 38 produtos com o marketplace', tone: 'run' },
  { id: 5, time: '09:31', text: 'Relatório diário enviado para a diretoria', tone: 'ok' },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  enviado: 'Enviado',
};
