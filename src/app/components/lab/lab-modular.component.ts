import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FlipDirective } from '../../core/flip.directive';

type Mode = 'grade' | 'lista' | 'foco';

interface Tile {
  id: string;
  label: string;
  value: string;
  note: string;
  pct: number;
}

@Component({
  selector: 'dd-lab-modular',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlipDirective],
  templateUrl: './lab-modular.component.html',
  styleUrl: './lab-modular.component.css',
})
export class LabModularComponent {
  readonly modes: { id: Mode; label: string }[] = [
    { id: 'grade', label: 'Grade' },
    { id: 'lista', label: 'Lista' },
    { id: 'foco', label: 'Foco' },
  ];
  readonly tiles: Tile[] = [
    { id: 'pedidos', label: 'Pedidos hoje', value: '128', note: '+14 desde ontem', pct: 78 },
    { id: 'entregas', label: 'Entregas no prazo', value: '96%', note: '3 atrasadas', pct: 96 },
    { id: 'estoque', label: 'Estoque baixo', value: '7 itens', note: 'reposição sugerida', pct: 22 },
    { id: 'meta', label: 'Meta do mês', value: '78%', note: 'faltam 9 dias', pct: 78 },
    { id: 'tickets', label: 'Atendimentos abertos', value: '12', note: 'tempo médio 4 min', pct: 40 },
    { id: 'uptime', label: 'Disponibilidade', value: '99,98%', note: 'últimos 30 dias', pct: 99 },
  ];

  readonly mode = signal<Mode>('grade');
  readonly focus = signal('pedidos');

  modeIndex() {
    return this.modes.findIndex((m) => m.id === this.mode());
  }

  pick(id: string) {
    this.focus.set(id);
    if (this.mode() === 'grade') this.mode.set('foco');
  }
}
