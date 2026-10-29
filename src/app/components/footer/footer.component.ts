import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'dd-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
