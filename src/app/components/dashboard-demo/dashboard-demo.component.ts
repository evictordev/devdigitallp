import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  OnDestroy,
  signal,
  untracked,
} from '@angular/core';
import { AnimatedNumberComponent } from '../../core/animated-number.component';
import {
  ACTIVITY,
  KPIS,
  Metric,
  ORDERS,
  OrderStatus,
  PERIODS,
  Period,
  SERIES,
  STATUS_LABEL,
  UNITS,
} from '../../core/demo-data';
import { FlipDirective } from '../../core/flip.directive';
import { tween } from '../../core/motion';

type View = 'painel' | 'pedidos' | 'atividade';
type SortKey = 'id' | 'total';

const W = 400;
const H = 150;

/** Curva suave (Catmull-Rom → Bézier) por uma lista de pontos. */
function smoothPath(pts: [number, number][]): string {
  if (!pts.length) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * Painel de pedidos fictício. Todos os controles alteram o estado de verdade:
 * período, métrica, visões, filtro e ordenação.
 * Os fatores `--e1..--e5` (progresso de montagem de cada módulo) vêm do palco pai.
 */
@Component({
  selector: 'dd-dashboard-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimatedNumberComponent, FlipDirective],
  templateUrl: './dashboard-demo.component.html',
  styleUrl: './dashboard-demo.component.css',
})
export class DashboardDemoComponent implements OnDestroy {
  readonly periods = PERIODS;
  readonly units = UNITS;
  readonly statusLabel = STATUS_LABEL;
  readonly activity = ACTIVITY;
  readonly views: { id: View; label: string }[] = [
    { id: 'painel', label: 'Painel' },
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'atividade', label: 'Atividade' },
  ];
  readonly statuses: { id: OrderStatus | 'todos'; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'pago', label: 'Pagos' },
    { id: 'enviado', label: 'Enviados' },
    { id: 'pendente', label: 'Pendentes' },
  ];

  readonly view = signal<View>('painel');
  readonly period = signal<Period>('7d');
  readonly metric = signal<Metric>('receita');
  readonly status = signal<OrderStatus | 'todos'>('todos');
  readonly sort = signal<{ key: SortKey; dir: 1 | -1 }>({ key: 'id', dir: -1 });
  readonly hover = signal<number | null>(null);

  readonly periodIndex = computed(() => PERIODS.findIndex((p) => p.id === this.period()));
  readonly viewIndex = computed(() => this.views.findIndex((v) => v.id === this.view()));
  readonly kpis = computed(() => KPIS[this.period()]);
  readonly ticks = computed(() => PERIODS[this.periodIndex()].ticks);
  readonly raw = computed(() => SERIES[this.metric()][this.period()]);

  /** valores normalizados (0–1) em transição; é isso que o SVG desenha */
  readonly shown = signal<number[]>(this.normalize(SERIES.receita['7d']));
  private cancelTween = () => {};

  readonly points = computed<[number, number][]>(() => {
    const v = this.shown();
    return v.map((n, i) => [(i / (v.length - 1)) * W, H - n * H]);
  });
  readonly line = computed(() => smoothPath(this.points()));
  readonly area = computed(() => `${this.line()}L${W},${H}L0,${H}Z`);
  readonly max = computed(() => Math.max(...this.raw()));

  readonly hoverInfo = computed(() => {
    const i = this.hover();
    if (i === null) return null;
    const [x, y] = this.points()[i];
    const u = UNITS[this.metric()];
    const raw = this.raw()[i];
    return {
      left: (x / W) * 100,
      top: (y / H) * 100,
      label:
        u.prefix +
        raw.toLocaleString('pt-BR', { minimumFractionDigits: u.decimals, maximumFractionDigits: u.decimals }) +
        u.suffix,
    };
  });

  readonly orders = computed(() => {
    const s = this.status();
    const { key, dir } = this.sort();
    return ORDERS.filter((o) => s === 'todos' || o.status === s)
      .sort((a, b) => (a[key] - b[key]) * dir)
      .slice(0, 5);
  });
  readonly totalFiltered = computed(() => {
    const s = this.status();
    return ORDERS.filter((o) => s === 'todos' || o.status === s).length;
  });

  constructor() {
    effect(() => {
      const target = this.normalize(this.raw());
      untracked(() => {
        this.cancelTween();
        this.cancelTween = tween(this.shown(), target, 750, (v) => this.shown.set(v));
      });
    });
  }

  ngOnDestroy() {
    this.cancelTween();
  }

  private normalize(v: number[]): number[] {
    const lo = Math.min(...v);
    const hi = Math.max(...v);
    return v.map((n) => 0.1 + ((n - lo) / (hi - lo || 1)) * 0.72);
  }

  setView(v: View) {
    this.view.set(v);
    if (v === 'pedidos') this.metric.set('pedidos');
    if (v === 'painel') this.metric.set('receita');
  }

  toggleSort(key: SortKey) {
    const cur = this.sort();
    this.sort.set(cur.key === key ? { key, dir: cur.dir === 1 ? -1 : 1 } : { key, dir: -1 });
  }

  ariaSort(key: SortKey) {
    const s = this.sort();
    return s.key === key ? (s.dir === 1 ? 'ascending' : 'descending') : 'none';
  }

  onChartMove(ev: PointerEvent) {
    const r = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
    this.hover.set(Math.round(t * (this.raw().length - 1)));
  }

  arrowKeys(ev: KeyboardEvent) {
    const n = this.raw().length;
    const cur = this.hover() ?? n - 1;
    if (ev.key === 'ArrowRight') this.hover.set(Math.min(n - 1, cur + 1));
    else if (ev.key === 'ArrowLeft') this.hover.set(Math.max(0, cur - 1));
    else return;
    ev.preventDefault();
  }

  money(n: number) {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
