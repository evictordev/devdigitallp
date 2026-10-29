import { afterNextRender, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';

/**
 * Marca o elemento como "revelável": ele recebe `.in` ao entrar na viewport.
 * `ddReveal="mask"` é para títulos com linhas `.mask-line`.
 */
@Directive({
  selector: '[ddReveal]',
  host: { '[class.rv]': 'mode() !== "mask"', '[class.mk]': 'mode() === "mask"' },
})
export class RevealDirective implements OnDestroy {
  readonly mode = input<'fade' | 'mask' | ''>('', { alias: 'ddReveal' });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private io?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        this.el.classList.add('in');
        return;
      }
      this.io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            this.el.classList.add('in');
            this.io?.disconnect();
          }
        },
        { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
      );
      this.io.observe(this.el);
    });
  }

  ngOnDestroy() {
    this.io?.disconnect();
  }
}
