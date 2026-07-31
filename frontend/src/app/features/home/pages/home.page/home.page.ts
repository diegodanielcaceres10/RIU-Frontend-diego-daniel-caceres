import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatIconModule, MatCardModule, ButtonComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private router = inject(Router);

  goToList(): void {
    this.router.navigate(['/superheroes']);
  }

  goToAdd(): void {
    this.router.navigate(['/superheroes/form']);
  }
}
