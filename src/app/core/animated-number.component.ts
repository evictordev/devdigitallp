import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  signal,
  untracked,
} from '@angular/core';
import { tween } from './motion';

/** Número que transita até o novo valor em vez de trocar de uma vez. */
@Component({
  selector: 'dd-num',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ text() }}`,
  styles: `:host { font-variant-numeric: tabular-nums; }`,
})
export class AnimatedNumberComponent implements OnDestroy {
  readonly value = input.required<number>();
  readonly decimals = input(0);
  readonly prefix = input('');
  readonly suffix = input('');
  readonly ms = input(700);

  private readonly shown = signal<number | null>(null);
  private cancel = () => {};

  readonly text = computed(() => {
    const v = this.shown() ?? this.value();
    return (
      this.prefix() +
      v.toLocaleString('pt-BR', {
        minimumFractionDigits: this.decimals(),
        maximumFractionDigits: this.decimals(),
      }) +
      this.suffix()
    );
  });

  constructor() {
    effect(() => {
      const target = this.value();
      untracked(() => {
        const from = this.shown() ?? target;
        this.cancel();
        this.cancel = tween([from], [target], this.ms(), ([v]) => this.shown.set(v));
      });
    });
  }

  ngOnDestroy() {
    this.cancel();
  }
}
