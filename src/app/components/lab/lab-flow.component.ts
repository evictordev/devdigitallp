import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';

type NodeState = 'idle' | 'run' | 'done';

interface Step {
  title: string;
  system: string;
  ms: number;
  log: string;
}

/** Simulação determinística: mesmas etapas e mesmos tempos a cada execução. */
const STEPS: Step[] = [
  { title: 'Novo pedido', system: 'Loja', ms: 600, log: 'Pedido #2087 recebido pela loja' },
  { title: 'Pagamento', system: 'Gateway', ms: 900, log: 'Pix confirmado — R$ 312,40' },
  { title: 'Estoque', system: 'ERP', ms: 700, log: '3 itens reservados no ERP' },
  { title: 'Nota fiscal', system: 'Fiscal', ms: 1000, log: 'NF-e emitida e enviada por e-mail' },
  { title: 'Aviso ao cliente', system: 'WhatsApp', ms: 800, log: 'Mensagem de confirmação entregue' },
  { title: 'Painel', system: 'Dashboard', ms: 400, log: 'Indicadores do dia atualizados' },
];

@Component({
  selector: 'dd-lab-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lab-flow.component.html',
  styleUrl: './lab-flow.component.css',
})
export class LabFlowComponent implements OnDestroy {
  readonly steps = STEPS;
  readonly states = signal<NodeState[]>(STEPS.map(() => 'idle'));
  readonly log = signal<{ t: string; text: string }[]>([]);
  readonly running = signal(false);
  readonly finished = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  readonly total = (STEPS.reduce((a, s) => a + s.ms, 0) / 1000).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
  });

  run() {
    if (this.running()) return;
    clearTimeout(this.timer);
    this.states.set(STEPS.map(() => 'idle'));
    this.log.set([]);
    this.finished.set(false);
    this.running.set(true);
    this.advance(0, 0);
  }

  private advance(i: number, elapsed: number) {
    if (i >= STEPS.length) {
      this.running.set(false);
      this.finished.set(true);
      return;
    }
    this.set(i, 'run');
    this.timer = setTimeout(() => {
      const at = elapsed + STEPS[i].ms;
      this.set(i, 'done');
      this.log.update((l) => [
        ...l,
        { t: `+${(at / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1 })}s`, text: STEPS[i].log },
      ]);
      this.advance(i + 1, at);
    }, STEPS[i].ms);
  }

  private set(i: number, s: NodeState) {
    this.states.update((st) => st.map((v, k) => (k === i ? s : v)));
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }
}
