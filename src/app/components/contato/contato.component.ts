import { afterNextRender, ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { RevealDirective } from '../../core/reveal.directive';

@Component({
  selector: 'dd-contato',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxMaskDirective, RevealDirective],
  providers: [provideNgxMask()],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.css',
})
export class ContatoComponent {
  readonly nome = signal('');
  readonly email = signal('');
  readonly fone = signal('');
  readonly texto = signal('');
  /** endereço absoluto da página de agradecimento; só existe no navegador */
  readonly next = signal('');

  readonly fields = computed(() => [
    { id: 'nome', label: 'Nome', done: this.nome().trim().length > 1 },
    { id: 'email', label: 'E-mail', done: /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(this.email()) },
    { id: 'fone', label: 'Telefone', done: this.fone().replace(/\D/g, '').length >= 10 },
    { id: 'texto', label: 'Projeto', done: this.texto().trim().length > 9 },
  ]);
  readonly count = computed(() => this.fields().filter((f) => f.done).length);
  readonly status = computed(() =>
    this.count() === 4 ? 'Pronto para enviar' : `Faltam ${4 - this.count()} ${4 - this.count() === 1 ? 'campo' : 'campos'}`,
  );

  readonly whatsapp =
    'https://api.whatsapp.com/send?phone=+558592778126&text=' +
    encodeURIComponent('Olá, estou interessado em começar um projeto');
  readonly instagram = 'https://www.instagram.com/dev_digitall/';

  constructor() {
    afterNextRender(() => this.next.set(`${location.origin}/obrigado`));
  }

  bind(sig: { set(v: string): void }, ev: Event) {
    sig.set((ev.target as HTMLInputElement).value);
  }
}
