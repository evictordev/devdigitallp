import { AfterViewChecked, Directive, ElementRef, inject, input } from '@angular/core';
import { prefersReducedMotion, spring } from './motion';

/**
 * FLIP com mola: toda vez que a view é verificada, compara a posição/tamanho
 * dos filhos `[data-flip]` com a medição anterior e anima a diferença.
 * Usa offset* (ignora transform), então não depende de scroll nem de animações em curso.
 */
@Directive({ selector: '[ddFlip]' })
export class FlipDirective implements AfterViewChecked {
  /** estiffness / damping da mola */
  readonly ddFlip = input<'soft' | 'snappy' | ''>('');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private prev = new Map<string, { x: number; y: number; w: number; h: number }>();

  ngAfterViewChecked() {
    if (typeof requestAnimationFrame === 'undefined') return;
    const next = new Map<string, { x: number; y: number; w: number; h: number }>();
    const reduced = prefersReducedMotion();
    const sp = this.ddFlip() === 'snappy' ? spring(320, 26) : spring(190, 21);

    this.host.querySelectorAll<HTMLElement>('[data-flip]').forEach((el) => {
      const key = el.dataset['flip']!;
      const box = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
      next.set(key, box);
      const before = this.prev.get(key);
      if (!before || reduced) return;
      const dx = before.x - box.x;
      const dy = before.y - box.y;
      const resized = before.w !== box.w || before.h !== box.h;
      if (!dx && !dy && !resized) return;

      const from: Keyframe = { transform: `translate(${dx}px, ${dy}px)` };
      const to: Keyframe = { transform: 'translate(0, 0)' };
      if (resized) {
        from['width'] = `${before.w}px`;
        from['height'] = `${before.h}px`;
        to['width'] = `${box.w}px`;
        to['height'] = `${box.h}px`;
      }
      el.animate([from, to], { duration: sp.duration, easing: sp.easing });
    });
    this.prev = next;
  }
}
