import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../core/reveal.directive';
import { LabAnalyticsComponent } from './lab-analytics.component';
import { LabFlowComponent } from './lab-flow.component';
import { LabMicroComponent } from './lab-micro.component';
import { LabModularComponent } from './lab-modular.component';

@Component({
  selector: 'dd-lab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, LabModularComponent, LabAnalyticsComponent, LabFlowComponent, LabMicroComponent],
  templateUrl: './lab.component.html',
  styleUrl: './lab.component.css',
})
export class LabComponent {}
