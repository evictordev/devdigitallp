import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal } from '@angular/core';
import { RevealDirective } from '../../core/reveal.directive';

type Kind =
  | 'bar' | 'hero' | 'media' | 'card' | 'nav' | 'form' | 'detail' | 'list'
  | 'node' | 'plan' | 'kpi' | 'chart' | 'table' | 'btn' | 'toast';

interface Blk {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  kind: Kind;
  t?: string;
  hot?: boolean;
}

interface Capability {
  id: string;
  title: string;
  text: string;
  blocks: (Blk | null)[];
  edges?: [number, number][];
}

const HIDE = null;

/** Seis capacidades sobre os mesmos 10 blocos: o que muda é a composição. */
const CAPS: Capability[] = [
  {
    id: 'web',
    title: 'Sistemas web',
    text: 'Sites e sistemas que carregam rápido, funcionam em qualquer tela e apresentam sua marca com clareza.',
    blocks: [
      { x: 4, y: 5, w: 92, h: 9, kind: 'bar' },
      { x: 4, y: 18, w: 56, h: 33, kind: 'hero' },
      { x: 64, y: 18, w: 32, h: 33, kind: 'media' },
      { x: 4, y: 55, w: 29, h: 38, kind: 'card' },
      { x: 35.5, y: 55, w: 29, h: 38, kind: 'card' },
      { x: 67, y: 55, w: 29, h: 38, kind: 'card' },
      HIDE, HIDE, HIDE, HIDE,
    ],
  },
  {
    id: 'apps',
    title: 'Aplicações personalizadas',
    text: 'Ferramentas feitas para a rotina do seu negócio: cadastros, fluxos e telas que seguem o seu processo, não o contrário.',
    blocks: [
      { x: 4, y: 5, w: 92, h: 9, kind: 'bar' },
      { x: 4, y: 18, w: 16, h: 75, kind: 'nav' },
      { x: 23, y: 18, w: 43, h: 43, kind: 'form' },
      { x: 69, y: 18, w: 27, h: 43, kind: 'detail' },
      { x: 23, y: 64, w: 73, h: 29, kind: 'list' },
      HIDE, HIDE, HIDE, HIDE, HIDE,
    ],
  },
  {
    id: 'auto',
    title: 'Automação e integração',
    text: 'Sistemas conversando entre si: pedidos, pagamentos, notas e avisos acontecem sem que alguém precise repassar dados.',
    blocks: [
      { x: 3, y: 40, w: 17, h: 20, kind: 'node', t: 'Pedido' },
      { x: 29, y: 18, w: 17, h: 20, kind: 'node', t: 'Pagamento' },
      { x: 29, y: 62, w: 17, h: 20, kind: 'node', t: 'Estoque' },
      { x: 55, y: 40, w: 17, h: 20, kind: 'node', t: 'Nota fiscal', hot: true },
      { x: 80, y: 18, w: 17, h: 20, kind: 'node', t: 'WhatsApp' },
      { x: 80, y: 62, w: 17, h: 20, kind: 'node', t: 'Painel' },
      HIDE, HIDE, HIDE, HIDE,
    ],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5]],
  },
  {
    id: 'saas',
    title: 'Plataformas SaaS',
    text: 'Produtos com contas, planos e cobrança recorrente, desenhados para crescer sem reescrever a base.',
    blocks: [
      { x: 4, y: 5, w: 92, h: 9, kind: 'bar' },
      { x: 4, y: 19, w: 29, h: 74, kind: 'plan', t: 'Essencial' },
      { x: 35.5, y: 15, w: 29, h: 80, kind: 'plan', t: 'Equipe', hot: true },
      { x: 67, y: 19, w: 29, h: 74, kind: 'plan', t: 'Empresa' },
      HIDE, HIDE, HIDE, HIDE, HIDE, HIDE,
    ],
  },
  {
    id: 'dash',
    title: 'Dashboards e gestão',
    text: 'Os números do negócio num só lugar: indicadores, gráficos e tabelas que respondem a filtros em tempo real.',
    blocks: [
      { x: 4, y: 5, w: 92, h: 9, kind: 'bar' },
      { x: 4, y: 18, w: 22, h: 22, kind: 'kpi' },
      { x: 28, y: 18, w: 22, h: 22, kind: 'kpi' },
      { x: 52, y: 18, w: 22, h: 22, kind: 'kpi' },
      { x: 4, y: 44, w: 58, h: 49, kind: 'chart' },
      { x: 65, y: 44, w: 31, h: 49, kind: 'table' },
      { x: 76, y: 18, w: 20, h: 22, kind: 'kpi' },
      HIDE, HIDE, HIDE,
    ],
  },
  {
    id: 'ui',
    title: 'Interfaces interativas',
    text: 'Experiências que reagem a quem usa: movimento com propósito, detalhes de acabamento e identidade própria.',
    blocks: [
      { x: 7, y: 9, w: 50, h: 15, kind: 'hero' },
      { x: 7, y: 28, w: 38, h: 10, kind: 'bar' },
      { x: 7, y: 46, w: 22, h: 13, kind: 'btn', t: 'Começar' },
      { x: 52, y: 22, w: 40, h: 36, kind: 'media', r: -4 },
      { x: 60, y: 52, w: 34, h: 24, kind: 'card', r: 3 },
      { x: 30, y: 66, w: 28, h: 18, kind: 'toast', r: -2 },
      HIDE, HIDE, HIDE, HIDE,
    ],
  },
];

@Component({
  selector: 'dd-capacidades',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  templateUrl: './capacidades.component.html',
  styleUrl: './capacidades.component.css',
})
export class CapacidadesComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly caps = CAPS;
  readonly index = signal(0);
  readonly cap = computed(() => CAPS[this.index()]);

  /** 10 slots; blocos ocultos recolhem para o centro e somem */
  readonly slots = computed(() =>
    Array.from({ length: 10 }, (_, i) => {
      const b = this.cap().blocks[i] ?? null;
      return b
        ? { ...b, o: 1 }
        : { x: 50, y: 50, w: 0, h: 0, r: 0, kind: 'card' as Kind, t: '', hot: false, o: 0 };
    }),
  );

  readonly edges = computed(() => {
    const c = this.cap();
    const bl = c.blocks;
    return (c.edges ?? []).map(([a, b]) => {
      const A = bl[a]!;
      const B = bl[b]!;
      const x1 = A.x + A.w;
      const y1 = A.y + A.h / 2;
      const x2 = B.x;
      const y2 = B.y + B.h / 2;
      const mx = (x1 + x2) / 2;
      return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
    });
  });

  select(i: number) {
    this.index.set(i);
  }

  onKey(ev: KeyboardEvent) {
    const d = ev.key === 'ArrowDown' || ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowUp' || ev.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    ev.preventDefault();
    const n = CAPS.length;
    const next = (this.index() + d + n) % n;
    this.index.set(next);
    this.host.querySelectorAll<HTMLElement>('[role=tab]')[next]?.focus();
  }
}
