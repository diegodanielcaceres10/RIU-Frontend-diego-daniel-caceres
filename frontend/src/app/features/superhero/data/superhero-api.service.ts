import { Injectable, signal, inject } from '@angular/core';
import { of, tap, throwError } from 'rxjs';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { SuperHero } from '../domain/superhero.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SuperHeroService {
  private httpService = inject(HttpService);
  private readonly useMock = environment.useMockData;
  private readonly resource = 'superheroes';

  private superheroes = signal<SuperHero[]>([]);
  readonly allHeroes = this.superheroes.asReadonly();

  private loaded = signal(false);
  private nextId = signal(1);

  getHeroes(): Observable<SuperHero[]> {
    if (this.loaded()) {
      return of(this.superheroes());
    }

    const source$ = this.useMock
      ? this.httpService.getLocal<SuperHero[]>()
      : this.httpService.get<SuperHero[]>(this.resource);

    return source$.pipe(
      tap((heroes) => {
        this.superheroes.set(heroes);
        this.loaded.set(true);
        this.nextId.set(Math.max(0, ...heroes.map((h) => h.id)) + 1);
      }),
    );
  }

  getHeroById(id: number): Observable<SuperHero | undefined> {
    if (this.useMock) {
      return of(this.superheroes().find((item) => item.id === id));
    }
    return this.httpService.get<SuperHero>(`${this.resource}/${id}`);
  }

  searchHeroesByName(keyword: string): Observable<SuperHero[]> {
    if (this.useMock) {
      const term = keyword.toLowerCase();
      return of(this.superheroes().filter((item) => item.name.toLowerCase().includes(term)));
    }
    return this.httpService.get<SuperHero[]>(`${this.resource}/search`, {
      params: { name: keyword },
    });
  }

  addHero(superhero: Omit<SuperHero, 'id'>): Observable<SuperHero> {
    if (this.useMock) {
      const alreadyExists = this.superheroes().some(
        (item) => item.name.toLowerCase() === superhero.name.toLowerCase(),
      );
      if (alreadyExists) {
        return throwError(() => new Error('Ya existe un superhéroe con ese nombre'));
      }

      const newHero: SuperHero = { ...superhero, id: this.nextId() };
      this.superheroes.update((list) => [...list, newHero]);
      this.nextId.update((n) => n + 1);
      return of(newHero);
    }

    return this.httpService
      .post<SuperHero>(this.resource, superhero)
      .pipe(tap((newHero) => this.superheroes.update((list) => [...list, newHero])));
  }

  updateHero(superhero: SuperHero): Observable<SuperHero> {
    if (this.useMock) {
      const alreadyExists = this.superheroes().some(
        (item) =>
          item.id !== superhero.id && item.name.toLowerCase() === superhero.name.toLowerCase(),
      );
      if (alreadyExists) {
        return throwError(() => new Error('Ya existe otro superhéroe con ese nombre'));
      }
      this.superheroes.update((list) =>
        list.map((item) => (item.id === superhero.id ? superhero : item)),
      );
      return of(superhero);
    }

    return this.httpService
      .put<SuperHero>(`${this.resource}/${superhero.id}`, superhero)
      .pipe(
        tap((updated) =>
          this.superheroes.update((list) => list.map((h) => (h.id === updated.id ? updated : h))),
        ),
      );
  }

  deleteHero(id: number): Observable<void> {
    if (this.useMock) {
      this.superheroes.update((list) => list.filter((h) => h.id !== id));
      return of(void 0);
    }

    return this.httpService
      .delete<void>(`${this.resource}/${id}`)
      .pipe(tap(() => this.superheroes.update((list) => list.filter((h) => h.id !== id))));
  }
}
