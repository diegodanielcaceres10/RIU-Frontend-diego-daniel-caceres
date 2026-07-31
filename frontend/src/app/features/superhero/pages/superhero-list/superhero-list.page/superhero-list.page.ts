import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { SuperHeroService } from '../../../data/superhero-api.service';
import { Router } from '@angular/router';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-superhero-list-page',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './superhero-list.page.html',
  styleUrl: './superhero-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperHeroListPage {
  private superHeroService = inject(SuperHeroService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  displayedColumns = ['name', 'power', 'publisher', 'actions'];

  loading = signal<boolean>(false);
  keyword = signal<string>('');
  pageIndex = signal<number>(0);
  pageSize = signal<number>(5);
  errorMessage = signal<string | null>(null);

  filteredSuperHeroes = computed(() => {
    const keyword = this.keyword().toLowerCase();
    return this.superHeroService
      .allSuperHeroes()
      .filter((h) => h.name.toLowerCase().includes(keyword))
      .sort((a, b) => a.name.localeCompare(b.name));
  });
  pagedSuperHeroes = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredSuperHeroes().slice(start, start + this.pageSize());
  });
  totalSuperHeroes = computed(() => this.filteredSuperHeroes().length);
  serviceIsLoading = computed(() => this.superHeroService.isLoading());

  ngOnInit(): void {
    void this.loadSuperHeroes();
  }

  private loadSuperHeroes(): void {
    this.loading.set(true);
    this.superHeroService
      .getSuperHeroes()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        error: (err: Error) => this.errorMessage.set(err.message),
      });
  }

  onFilterChange(value: string): void {
    this.keyword.set(value);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  goToAdd(): void {
    this.router.navigate(['/superheroes/form']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/superheroes/form', id]);
  }

  onDelete(id: number, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar héroe',
        message: `¿Seguro que deseas eliminar a ${name}? Esta acción no se puede deshacer.`,
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.superHeroService
          .deleteSuperHero(id)
          .pipe()
          .subscribe({
            error: (err: Error) => this.errorMessage.set(err.message),
          });
      }
    });
  }
}
