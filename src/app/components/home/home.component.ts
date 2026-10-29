import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CapacidadesComponent } from '../capacidades/capacidades.component';
import { ContatoComponent } from '../contato/contato.component';
import { FooterComponent } from '../footer/footer.component';
import { LabComponent } from '../lab/lab.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ProcessoComponent } from '../processo/processo.component';
import { StageComponent } from '../stage/stage.component';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent, StageComponent, CapacidadesComponent, LabComponent, ProcessoComponent, ContatoComponent, FooterComponent],
  template: `
    <dd-navbar />
    <main>
      <dd-stage />
      <dd-capacidades />
      <dd-lab />
      <dd-processo />
      <dd-contato />
    </main>
    <dd-footer />
  `,
})
export class HomeComponent {}
