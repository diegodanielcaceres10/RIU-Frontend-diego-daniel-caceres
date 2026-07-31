import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
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
    MatCardModule,
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
  isEditMode = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    power: ['', [Validators.required, Validators.maxLength(60)]],
    publisher: ['', Validators.required],
  });

  isLoading = computed(() => this.superHeroService.isLoading());

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);
      this.superheroId.set(id);
      this.isEditMode.set(true);
      this.loadSuperHero(id);
    }
  }

  private loadSuperHero(id: number): void {
    this.loading.set(true);
    this.superHeroService
      .getSuperHeroById(id)
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

    const value = this.form.getRawValue();

    const request$ = this.isEditMode()
      ? this.superHeroService.updateSuperHero({ id: this.superheroId()!, ...value })
      : this.superHeroService.addSuperHero(value);

    request$.pipe().subscribe({
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
