import { Injectable, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { SuperHero } from '../domain/superhero.models';

@Injectable({ providedIn: 'root' })
export class SuperHeroService {
  private httpService = inject(HttpService);
  private readonly resource = 'superheroes';

  private superheroes = signal<SuperHero[]>([]);
  readonly allHeroes = this.superheroes.asReadonly();

  getHeroes(): Observable<SuperHero[]> {
    return this.httpService
      .get<SuperHero[]>(this.resource)
      .pipe(tap((superheroes) => this.superheroes.set(superheroes)));
  }

  getHeroById(id: number): Observable<SuperHero> {
    return this.httpService.get<SuperHero>(`${this.resource}/${id}`);
  }

  searchHeroesByName(term: string): Observable<SuperHero[]> {
    return this.httpService.get<SuperHero[]>(`${this.resource}/search`, {
      params: { name: term },
    });
  }

  addHero(superhero: Omit<SuperHero, 'id'>): Observable<SuperHero> {
    return this.httpService
      .post<SuperHero>(this.resource, superhero)
      .pipe(tap((newHero) => this.superheroes.update((list) => [...list, newHero])));
  }

  updateHero(superhero: SuperHero): Observable<SuperHero> {
    return this.httpService
      .put<SuperHero>(`${this.resource}/${superhero.id}`, superhero)
      .pipe(
        tap((updated) =>
          this.superheroes.update((list) => list.map((h) => (h.id === updated.id ? updated : h))),
        ),
      );
  }

  deleteHero(id: number): Observable<void> {
    return this.httpService
      .delete<void>(`${this.resource}/${id}`)
      .pipe(tap(() => this.superheroes.update((list) => list.filter((h) => h.id !== id))));
  }
}
