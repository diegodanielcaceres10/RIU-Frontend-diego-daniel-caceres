import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

type ButtonActionVariant = 'regular' | 'primary';
type ButtonActionType = 'button' | 'submit';

@Component({
  selector: 'app-ui-button',
  imports: [MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly innerText = input.required<string>();
  readonly leftMatIcon = input<string>('');
  readonly rightArrowMatIcon = input<string>('');
  readonly variant = input<ButtonActionVariant>('regular');
  readonly type = input<ButtonActionType>('button');
  readonly disabled = input<boolean>(false);
  readonly showSpinner = input<boolean>(false);

  readonly onClick = output<void>();
}
