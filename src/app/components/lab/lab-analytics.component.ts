import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AnimatedNumberComponent } from '../../core/animated-number.component';

type Range = 'semana' | 'mes' | 'ano';
type Kind = 'visitas' | 'leads' | 'vendas';

const LABELS: Record<Range, string[]> = {
  semana: ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'],
  mes: ['sem 1', 'sem 2', 'sem 3', 'sem 4', 'sem 5', 'sem 6', 'sem 7'],
  ano: ['jan', 'mar', 'mai', 'jul', 'set', 'nov', 'dez'],
};

const DATA: Record<Kind, Record<Range, number[]>> = {
  visitas: {
    semana: [820, 940, 910, 1080, 1210, 760, 690],
    mes: [5100, 5600, 6200, 5900, 6800, 7300, 7050],
    ano: [18200, 21400, 24100, 26800, 29500, 33100, 36400],
  },
  leads: {
    semana: [31, 38, 35, 46, 52, 24, 19],
    mes: [190, 214, 236, 228, 262, 281, 270],
    ano: [690, 820, 940, 1030, 1180, 1320, 1470],
  },
  vendas: {
    semana: [6, 9, 7, 11, 13, 4, 3],
    mes: [38, 44, 49, 46, 55, 61, 58],
    ano: [140, 168, 190, 214, 243, 276, 305],
  },
};

@Component({
  selector: 'dd-lab-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimatedNumberComponent],
  templateUrl: './lab-analytics.component.html',
  styleUrl: './lab-analytics.component.css',
})
export class LabAnalyticsComponent {
  readonly ranges: { id: Range; label: string }[] = [
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mês' },
    { id: 'ano', label: 'Ano' },
  ];
  readonly kinds: { id: Kind; label: string }[] = [
    { id: 'visitas', label: 'Visitas' },
    { id: 'leads', label: 'Contatos' },
    { id: 'vendas', label: 'Vendas' },
  ];

  readonly range = signal<Range>('semana');
  readonly kind = signal<Kind>('visitas');
  readonly picked = signal<number | null>(null);

  readonly values = computed(() => DATA[this.kind()][this.range()]);
  readonly labels = computed(() => LABELS[this.range()]);
  readonly max = computed(() => Math.max(...this.values()));
  readonly bars = computed(() =>
    this.values().map((v, i) => ({ v, h: v / this.max(), label: this.labels()[i], top: v === this.max() })),
  );
  readonly total = computed(() => this.values().reduce((a, b) => a + b, 0));
  readonly shownValue = computed(() => {
    const i = this.picked();
    return i === null ? this.total() : this.values()[i];
  });
  readonly shownLabel = computed(() => {
    const i = this.picked();
    return i === null ? 'total do período' : this.labels()[i];
  });
  readonly delta = computed(() => {
    const v = this.values();
    return ((v[v.length - 1] - v[0]) / v[0]) * 100;
  });

  rangeIndex() {
    return this.ranges.findIndex((r) => r.id === this.range());
  }

  kindIndex() {
    return this.kinds.findIndex((k) => k.id === this.kind());
  }

  toggle(i: number) {
    this.picked.set(this.picked() === i ? null : i);
  }
}
