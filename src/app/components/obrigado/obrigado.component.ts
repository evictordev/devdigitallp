import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-obrigado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent, FooterComponent, RouterLink],
  template: `
    <dd-navbar />
    <main class="ty">
      <div class="wrap">
        <h1>Recebemos o seu pedido.</h1>
        <p>
          Nossa equipe vai ler os detalhes do projeto e responder em breve com os próximos passos. Se quiser
          adiantar a conversa, chame no WhatsApp.
        </p>
        <div class="ty__cta">
          <a class="btn" href="https://api.whatsapp.com/send?phone=+558592778126&text=Olá, acabei de enviar um pedido pelo site" target="_blank" rel="noopener">Falar no WhatsApp</a>
          <a class="btn btn--ghost" href="https://www.instagram.com/dev_digitall/" target="_blank" rel="noopener">Ver o Instagram</a>
          <a class="btn btn--ghost" routerLink="/">Voltar ao início</a>
        </div>
      </div>
    </main>
    <dd-footer />
  `,
  styles: `
    .ty {
      display: grid;
      align-items: center;
      min-height: 100svh;
      padding: calc(var(--nav-h) + 40px) 0 60px;
      background: radial-gradient(900px 520px at 20% 30%, rgba(0, 59, 140, 0.6), transparent 70%), var(--ink-0);
    }
    h1 { font-size: clamp(2.6rem, 7vw, 6rem); font-weight: 650; letter-spacing: -0.04em; max-width: 12ch; }
    p { max-width: 46ch; margin-top: 22px; color: var(--fg-dim); font-size: 1.1rem; }
    .ty__cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
  `,
})
export class ObrigadoComponent {}
