import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SuperHeroService } from '../../../data/superhero-api.service';
import { Router } from '@angular/router';

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

  displayedColumns = ['name', 'power', 'publisher', 'actions'];

  loading = signal(false);
  keyword = signal('');
  pageIndex = signal(0);
  pageSize = signal(5);

  filteredHeroes = computed(() => {
    const keyword = this.keyword().toLowerCase();
    return this.superHeroService
      .allHeroes()
      .filter((h) => h.name.toLowerCase().includes(keyword))
      .sort((a, b) => a.name.localeCompare(b.name));
  });
  pagedHeroes = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredHeroes().slice(start, start + this.pageSize());
  });
  totalHeroes = computed(() => this.filteredHeroes().length);

  ngOnInit(): void {
    void this.loadHeroes();
  }

  private loadHeroes(): void {
    this.loading.set(true);
    this.superHeroService
      .getHeroes()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe();
  }

  onFilterChange(value: string): void {
    this.keyword.set(value);
    this.pageIndex.set(0);
    this.loadHeroes();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadHeroes();
  }

  goToAdd(): void {
    this.router.navigate(['/superheroes/form']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/superheroes/form', id]);
  }

  onDelete(id: number, name: string): void {}
}
