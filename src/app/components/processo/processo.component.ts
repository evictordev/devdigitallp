import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { clamp, prefersReducedMotion } from '../../core/motion';
import { RevealDirective } from '../../core/reveal.directive';

@Component({
  selector: 'dd-processo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  templateUrl: './processo.component.html',
  styleUrl: './processo.component.css',
})
export class ProcessoComponent implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private off = () => {};

  readonly steps = [
    { title: 'Análise', text: 'Entendemos o seu negócio, quem vai usar e o que precisa funcionar primeiro.' },
    { title: 'Design', text: 'Desenhamos interfaces claras e testamos o fluxo antes de escrever a versão final.' },
    { title: 'Desenvolvimento', text: 'Construímos com as melhores tecnologias, em entregas curtas que você acompanha.' },
    { title: 'Lançamento', text: 'Testes rigorosos e publicação com segurança, seguidos de suporte contínuo.' },
  ];

  readonly promises = [
    { title: 'Velocidade', text: 'Sites e sistemas otimizados para carregar rápido.' },
    { title: 'Resultado', text: 'Soluções pensadas para gerar resultados mensuráveis.' },
    { title: 'Suporte contínuo', text: 'Acompanhamos o projeto depois que ele entra no ar.' },
    { title: 'Equipe dedicada', text: 'Um time jovem e comprometido com o seu projeto.' },
  ];

  constructor() {
    afterNextRender(() => {
      const rail = this.host.querySelector<HTMLElement>('.rail');
      if (!rail) return;
      if (prefersReducedMotion()) {
        rail.style.setProperty('--p', '1');
        return;
      }
      let raf = 0;
      const update = () => {
        raf = 0;
        const r = rail.getBoundingClientRect();
        rail.style.setProperty('--p', clamp((innerHeight * 0.62 - r.top) / r.height).toFixed(4));
      };
      const onScroll = () => (raf ||= requestAnimationFrame(update));
      this.zone.runOutsideAngular(() => {
        addEventListener('scroll', onScroll, { passive: true });
        addEventListener('resize', onScroll, { passive: true });
      });
      update();
      this.off = () => {
        removeEventListener('scroll', onScroll);
        removeEventListener('resize', onScroll);
        cancelAnimationFrame(raf);
      };
    });
  }

  ngOnDestroy() {
    this.off();
  }
}
