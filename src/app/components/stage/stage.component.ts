import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { clamp, lerp, prefersReducedMotion, smooth } from '../../core/motion';
import { DashboardDemoComponent } from '../dashboard-demo/dashboard-demo.component';

/** Afastamento de cada módulo no estado "explodido" do hero (espaço do painel). */
const EXPLODE_DESKTOP = [
  { x: -190, y: 90, z: -150, r: -7 }, // lateral
  { x: 90, y: -150, z: 100, r: 3 }, // barra
  { x: 230, y: -70, z: 40, r: -3 }, // indicadores
  { x: -130, y: 160, z: -50, r: 4 }, // gráfico
  { x: 200, y: 150, z: 120, r: -5 }, // tabela
];
const EXPLODE_MOBILE = EXPLODE_DESKTOP.map((p) => ({ x: p.x * 0.38, y: p.y * 0.6, z: p.z * 0.5, r: p.r }));

/** Ligações entre módulos (índices de EXPLODE_*). */
const LINKS: [number, number][] = [
  [0, 3],
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [3, 4],
];

const STEPS = ['Estrutura', 'Conexões', 'Interface', 'Dados', 'Controles', 'Pronto para usar'];
const STEP_AT = [0, 0.1, 0.24, 0.42, 0.56, 0.68];

/**
 * Hero + showcase como UMA cena fixada: ao rolar, os módulos soltos no espaço
 * se encaixam, se conectam, recebem dados e viram um painel utilizável.
 * Tudo escrito em CSS custom properties no rAF, fora do Angular.
 */
@Component({
  selector: 'dd-stage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DashboardDemoComponent],
  templateUrl: './stage.component.html',
  styleUrl: './stage.component.css',
})
export class StageComponent implements OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly dashWrap = viewChild.required<ElementRef<HTMLElement>>('dashWrap');
  private readonly linksEl = viewChild.required<ElementRef<SVGSVGElement>>('linksSvg');

  readonly steps = STEPS;
  readonly links = LINKS;
  readonly ready = signal(false);
  readonly reduced = signal(false);

  private cleanup: (() => void)[] = [];
  private raf = 0;
  private target = 0;
  private cur = 0;
  private mx = 0;
  private my = 0;
  private tmx = 0;
  private tmy = 0;
  private visible = true;
  private explode = EXPLODE_DESKTOP;
  private centers: { x: number; y: number }[] = [];
  private lines: SVGLineElement[] = [];
  private stepEls: HTMLElement[] = [];
  private lastStep = -1;
  private live = false;

  constructor() {
    afterNextRender(() => {
      this.reduced.set(prefersReducedMotion());
      this.lines = Array.from(this.linksEl().nativeElement.querySelectorAll('line'));
      this.stepEls = Array.from(this.host.querySelectorAll<HTMLElement>('.steps li'));
      this.measure();
      this.ready.set(true);

      this.zone.runOutsideAngular(() => {
        const on = <K extends keyof WindowEventMap>(t: Window, e: K, fn: (ev: WindowEventMap[K]) => void) => {
          t.addEventListener(e, fn as EventListener, { passive: true });
          this.cleanup.push(() => t.removeEventListener(e, fn as EventListener));
        };
        on(window, 'scroll', () => this.kick());
        on(window, 'resize', () => {
          this.measure();
          this.kick();
        });
        on(window, 'pointermove', (ev) => {
          if (ev.pointerType === 'touch') return;
          this.tmx = (ev.clientX / innerWidth) * 2 - 1;
          this.tmy = (ev.clientY / innerHeight) * 2 - 1;
          this.kick();
        });

        const io = new IntersectionObserver(([en]) => {
          this.visible = en.isIntersecting;
          if (this.visible) this.kick();
        });
        io.observe(this.host);
        this.cleanup.push(() => io.disconnect());

        const mq = matchMedia('(prefers-reduced-motion: reduce)');
        const onMq = () => {
          this.reduced.set(mq.matches);
          this.measure();
          this.kick();
        };
        mq.addEventListener('change', onMq);
        this.cleanup.push(() => mq.removeEventListener('change', onMq));

        this.cur = this.target = this.progress();
        this.frame(true);
      });
    });
  }

  ngOnDestroy() {
    if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.raf);
    this.cleanup.forEach((fn) => fn());
  }

  /** mede o painel, calcula o ajuste de escala e as posições explodidas */
  private measure() {
    const dash = this.host.querySelector<HTMLElement>('.dash')!;
    const w = dash.offsetWidth;
    const h = dash.offsetHeight;
    const mobile = innerWidth < 760;
    this.explode = mobile ? EXPLODE_MOBILE : EXPLODE_DESKTOP;

    const availW = innerWidth - (mobile ? 24 : 2 * 56);
    const availH = innerHeight - 68 - (mobile ? 72 : 112);
    const fit = Math.min(1, availW / w, availH / h);

    const s = this.host.style;
    s.setProperty('--fit', fit.toFixed(4));
    s.setProperty('--dw', `${w}px`);
    s.setProperty('--dh', `${h}px`);
    this.explode.forEach((p, i) => {
      s.setProperty(`--fx${i + 1}`, `${p.x}px`);
      s.setProperty(`--fy${i + 1}`, `${p.y}px`);
      s.setProperty(`--fz${i + 1}`, `${p.z}px`);
      s.setProperty(`--fr${i + 1}`, `${p.r}deg`);
    });

    const panels = Array.from(dash.querySelectorAll<HTMLElement>('.panel[data-p]')).sort(
      (a, b) => +a.dataset['p']! - +b.dataset['p']!,
    );
    this.centers = panels.map((el) => ({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 }));
    const svg = this.linksEl().nativeElement;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }

  private progress() {
    if (this.reduced()) return 1;
    const t = this.track().nativeElement;
    const rect = t.getBoundingClientRect();
    return clamp(-rect.top / Math.max(1, t.offsetHeight - innerHeight));
  }

  private kick() {
    if (!this.visible || this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.frame(false);
    });
  }

  private frame(force: boolean) {
    this.target = this.progress();
    // suaviza o scroll (inércia) sem atrasar a resposta
    this.cur = this.reduced() || force ? this.target : lerp(this.cur, this.target, 0.16);
    if (Math.abs(this.cur - this.target) < 0.0004) this.cur = this.target;
    this.mx = lerp(this.mx, this.tmx, 0.08);
    this.my = lerp(this.my, this.tmy, 0.08);

    this.write(this.cur);

    const moving = this.cur !== this.target || Math.abs(this.mx - this.tmx) > 0.002 || Math.abs(this.my - this.tmy) > 0.002;
    if (moving && this.visible) {
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        this.frame(false);
      });
    }
  }

  private write(p: number) {
    const s = this.host.style;
    const g = smooth(0.04, 0.5, p);
    const f = (n: number) => n.toFixed(4);

    s.setProperty('--g', f(g));
    for (let i = 0; i < 5; i++) s.setProperty(`--e${i + 1}`, f(smooth(0.04 + i * 0.06, 0.26 + i * 0.06, p)));
    s.setProperty('--k', f(smooth(0.5, 0.72, p)));
    s.setProperty('--copy', f(1 - smooth(0, 0.12, p)));
    s.setProperty('--links', f(1 - smooth(0.4, 0.58, p)));
    s.setProperty('--mx', f(this.reduced() ? 0 : this.mx));
    s.setProperty('--my', f(this.reduced() ? 0 : this.my));

    // ligações acompanham os módulos enquanto eles se encaixam
    for (let i = 0; i < this.links.length; i++) {
      const [a, b] = this.links[i];
      const ea = smooth(0.04 + a * 0.06, 0.26 + a * 0.06, p);
      const eb = smooth(0.04 + b * 0.06, 0.26 + b * 0.06, p);
      const ca = this.centers[a];
      const cb = this.centers[b];
      if (!ca || !cb) continue;
      const line = this.lines[i];
      line.setAttribute('x1', f(ca.x + this.explode[a].x * (1 - ea)));
      line.setAttribute('y1', f(ca.y + this.explode[a].y * (1 - ea)));
      line.setAttribute('x2', f(cb.x + this.explode[b].x * (1 - eb)));
      line.setAttribute('y2', f(cb.y + this.explode[b].y * (1 - eb)));
    }

    // etapa atual
    let step = 0;
    for (let i = 0; i < STEP_AT.length; i++) if (p >= STEP_AT[i]) step = i;
    if (step !== this.lastStep) {
      this.lastStep = step;
      this.stepEls.forEach((el, i) => {
        el.classList.toggle('done', i < step);
        el.classList.toggle('now', i === step);
        el.toggleAttribute('aria-current', i === step);
      });
    }

    // o painel só recebe foco/cliques quando está inteiro
    const live = p > 0.62;
    if (live !== this.live) {
      this.live = live;
      const wrap = this.dashWrap().nativeElement;
      wrap.toggleAttribute('inert', !live);
      wrap.dataset['live'] = live ? '1' : '0';
    }
  }
}
