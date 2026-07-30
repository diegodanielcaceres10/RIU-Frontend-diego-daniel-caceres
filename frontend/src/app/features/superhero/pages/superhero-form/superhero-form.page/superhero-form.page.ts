import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SuperHeroService } from '../../../data/superhero-api.service';
import { UppercaseDirective } from '../../../../../shared/directives/uppercase.directive';

@Component({
  selector: 'app-superhero-form-page',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    UppercaseDirective,
  ],
  templateUrl: './superhero-form.page.html',
  styleUrl: './superhero-form.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperHeroFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private superHeroService = inject(SuperHeroService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  superheroId = signal<number | null>(null);
  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    power: ['', [Validators.required, Validators.maxLength(60)]],
    publisher: ['', Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);
      this.superheroId.set(id);
      this.isEditMode.set(true);
      this.loadHero(id);
    }
  }

  private loadHero(id: number): void {
    this.loading.set(true);
    this.superHeroService
      .getHeroById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((superhero) => {
        if (!superhero) {
          this.router.navigate(['/superheroes']);
          return;
        }
        this.form.patchValue({
          name: superhero.name,
          power: superhero.power,
          publisher: superhero.publisher,
        });
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    const request$ = this.isEditMode()
      ? this.superHeroService.updateHero({ id: this.superheroId()!, ...value })
      : this.superHeroService.addHero(value);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => this.router.navigate(['/superheroes']),
      error: (err: Error) => {
        this.errorMessage.set(err.message);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/superheroes']);
  }
}
