import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { AnimatedNumberComponent } from '../../core/animated-number.component';
import { prefersReducedMotion, spring } from '../../core/motion';

type Save = 'idle' | 'saving' | 'saved';

@Component({
  selector: 'dd-lab-micro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimatedNumberComponent],
  templateUrl: './lab-micro.component.html',
  styleUrl: './lab-micro.component.css',
})
export class LabMicroComponent implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly save = signal<Save>('idle');
  readonly billing = signal<'mensal' | 'anual'>('mensal');
  readonly notify = signal(true);
  readonly sync = signal(false);
  readonly email = signal('');
  readonly touched = signal(false);
  readonly tab = signal(0);
  readonly open = signal<number | null>(0);

  readonly tabs = [
    { label: 'Componentes', text: 'Botões, campos, tabelas e gráficos desenhados como uma única família, com estados para cada situação de uso.' },
    { label: 'Estados', text: 'Carregando, vazio, erro e sucesso fazem parte do projeto desde o início, não são remendos de última hora.' },
    { label: 'Acessibilidade', text: 'Foco visível, navegação por teclado, contraste adequado e respeito a quem prefere menos movimento.' },
  ];
  readonly faq = [
    { q: 'Trabalham com prazos fixos?', a: 'Sim. Definimos o escopo da primeira entrega junto com você e combinamos datas antes de começar.' },
    { q: 'Posso pedir ajustes depois do lançamento?', a: 'Pode. O suporte contínuo faz parte do trabalho: acompanhamos o sistema depois de publicado.' },
    { q: 'O sistema é meu?', a: 'O que construímos é feito para o seu negócio e conversamos sobre acesso e documentação desde o início.' },
  ];

  private timer?: ReturnType<typeof setTimeout>;
  private cleanup: (() => void)[] = [];

  constructor() {
    afterNextRender(() => {
      this.host.style.setProperty('--spring', spring(260, 19).easing);
      this.host.style.setProperty('--spring-ms', `${spring(260, 19).duration}ms`);
    });
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
    this.cleanup.forEach((f) => f());
  }

  get valid() {
    return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(this.email());
  }

  get emailState() {
    if (!this.touched() && !this.email()) return 'idle';
    return this.valid ? 'ok' : 'bad';
  }

  doSave() {
    if (this.save() !== 'idle') return;
    this.save.set('saving');
    this.timer = setTimeout(() => {
      this.save.set('saved');
      this.timer = setTimeout(() => this.save.set('idle'), 1800);
    }, 1100);
  }

  onInput(ev: Event) {
    this.email.set((ev.target as HTMLInputElement).value);
  }

  toggleFaq(i: number) {
    this.open.set(this.open() === i ? null : i);
  }

  tabKey(ev: KeyboardEvent) {
    const n = this.tabs.length;
    const d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    ev.preventDefault();
    const next = (this.tab() + d + n) % n;
    this.tab.set(next);
    this.host.querySelectorAll<HTMLElement>('[role=tab]')[next]?.focus();
  }

  /** inclinação do cartão: só para mouse; no toque o cartão apenas "sobe" ao tocar */
  tilt(ev: PointerEvent) {
    if (ev.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = ev.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const px = (ev.clientX - r.left) / r.width;
    const py = (ev.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${((px - 0.5) * 12).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - py) * 10).toFixed(2)}deg`);
    el.style.setProperty('--px', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--py', `${(py * 100).toFixed(1)}%`);
  }

  untilt(ev: PointerEvent) {
    const el = ev.currentTarget as HTMLElement;
    el.style.removeProperty('--ry');
    el.style.removeProperty('--rx');
  }
}
