import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  NgZone,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'dd-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnDestroy {
  private readonly zone = inject(NgZone);
  readonly links = [
    { id: 'capacidades', label: 'Capacidades' },
    { id: 'laboratorio', label: 'Laboratório' },
    { id: 'processo', label: 'Processo' },
  ];
  readonly open = signal(false);
  readonly active = signal('');
  readonly solid = signal(false);
  private io?: IntersectionObserver;
  private onScroll = () => this.solid.set(scrollY > 24);

  constructor() {
    afterNextRender(() => {
      this.onScroll();
      this.zone.runOutsideAngular(() => addEventListener('scroll', this.onScroll, { passive: true }));
      // marca a seção que ocupa o meio da tela
      this.io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) this.active.set(e.target.id);
        },
        { rootMargin: '-45% 0px -50% 0px' },
      );
      ['inicio', ...this.links.map((l) => l.id), 'contato'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) this.io!.observe(el);
      });
    });
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') removeEventListener('scroll', this.onScroll);
    this.io?.disconnect();
  }

  @HostListener('document:keydown.escape')
  close() {
    this.open.set(false);
  }
}
