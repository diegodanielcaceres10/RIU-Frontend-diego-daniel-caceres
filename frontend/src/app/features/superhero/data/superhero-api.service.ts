import { Injectable, signal, inject } from '@angular/core';
import { delay, finalize, of, tap, throwError } from 'rxjs';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { SuperHero } from '../domain/superhero.models';
import { USE_MOCK_DATA } from '../../../core/tokens/use-mock-data.token';

@Injectable({ providedIn: 'root' })
export class SuperHeroService {
  private httpService = inject(HttpService);
  private readonly useMock = inject(USE_MOCK_DATA);
  private readonly resource = 'superheroes';

  private superheroes = signal<SuperHero[]>([]);
  private loading = signal<boolean>(false);
  private loaded = signal<boolean>(false);
  private nextId = signal<number>(1);

  readonly allSuperHeroes = this.superheroes.asReadonly();
  readonly isLoading = this.loading.asReadonly();

  getSuperHeroes(): Observable<SuperHero[]> {
    if (this.loaded()) {
      return of(this.superheroes());
    }

    const source$ = this.useMock
      ? this.httpService.getLocal<SuperHero[]>()
      : this.httpService.get<SuperHero[]>(this.resource);

    return source$.pipe(
      tap((superheroes) => {
        this.superheroes.set(superheroes);
        this.loaded.set(true);
        this.nextId.set(Math.max(0, ...superheroes.map((item) => item.id)) + 1);
      }),
    );
  }

  getSuperHeroById(id: number): Observable<SuperHero | undefined> {
    if (this.useMock) {
      return of(this.superheroes().find((item) => item.id === id));
    }
    return this.httpService.get<SuperHero>(`${this.resource}/${id}`);
  }

  addSuperHero(superhero: Omit<SuperHero, 'id'>): Observable<SuperHero> {
    this.loading.set(true);
    if (this.useMock) {
      const alreadyExists = this.superheroes().some(
        (item) => item.name.toLowerCase() === superhero.name.toLowerCase(),
      );
      if (alreadyExists) {
        this.loading.set(false);
        return throwError(() => new Error('Ya existe un superhéroe con ese nombre'));
      }

      const newSuperHero: SuperHero = { ...superhero, id: this.nextId() };
      this.superheroes.update((list) => [...list, newSuperHero]);
      this.nextId.update((n) => n + 1);
      return of(newSuperHero).pipe(
        delay(2000),
        finalize(() => this.loading.set(false)),
      );
    }

    return this.httpService.post<SuperHero>(this.resource, superhero).pipe(
      delay(2000),
      tap((newSuperHero) => {
        this.superheroes.update((list) => [...list, newSuperHero]);
        this.loading.set(false);
      }),
    );
  }

  updateSuperHero(superhero: SuperHero): Observable<SuperHero> {
    this.loading.set(true);
    if (this.useMock) {
      const alreadyExists = this.superheroes().some(
        (item) =>
          item.id !== superhero.id && item.name.toLowerCase() === superhero.name.toLowerCase(),
      );
      if (alreadyExists) {
        this.loading.set(false);
        return throwError(() => new Error('Ya existe otro superhéroe con ese nombre'));
      }
      this.superheroes.update((list) =>
        list.map((item) => (item.id === superhero.id ? superhero : item)),
      );
      return of(superhero).pipe(
        delay(2000),
        finalize(() => this.loading.set(false)),
      );
    }

    return this.httpService.put<SuperHero>(`${this.resource}/${superhero.id}`, superhero).pipe(
      delay(2000),
      tap((updated) => {
        this.superheroes.update((list) => list.map((h) => (h.id === updated.id ? updated : h)));
        this.loading.set(false);
      }),
    );
  }

  deleteSuperHero(id: number): Observable<void> {
    this.loading.set(true);
    if (this.useMock) {
      this.superheroes.update((list) => list.filter((h) => h.id !== id));
      return of(void 0).pipe(
        delay(2000),
        finalize(() => this.loading.set(false)),
      );
    }

    return this.httpService.delete<void>(`${this.resource}/${id}`).pipe(
      delay(2000),
      tap(() => {
        this.superheroes.update((list) => list.filter((h) => h.id !== id));
        this.loading.set(false);
      }),
    );
  }
}
