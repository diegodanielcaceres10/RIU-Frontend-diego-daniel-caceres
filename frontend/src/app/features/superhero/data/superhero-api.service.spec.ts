import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SuperHeroService } from './superhero-api.service';
import { HttpService } from '../../../core/services/http.service';
import { USE_MOCK_DATA } from '../../../core/tokens/use-mock-data.token';
import { SuperHero } from '../domain/superhero.models';

describe('SuperHeroService', () => {
  let service: SuperHeroService;
  let httpServiceMock: {
    get: ReturnType<typeof vi.fn>;
    getLocal: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockData: SuperHero[] = [
    { id: 1, name: 'Superman', power: 'Vuelo', publisher: 'DC' },
    { id: 2, name: 'Spiderman', power: 'Agilidad', publisher: 'Marvel' },
  ];

  function setup(useMock: boolean): void {
    httpServiceMock = {
      get: vi.fn().mockReturnValue(of(mockData)),
      getLocal: vi.fn().mockReturnValue(of(mockData)),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpService, useValue: httpServiceMock },
        { provide: USE_MOCK_DATA, useValue: useMock }, // <- clave: reemplaza el token, no el environment
      ],
    });

    service = TestBed.inject(SuperHeroService);
  }

  describe('modo mock (useMockData: true)', () => {
    beforeEach(() => setup(true));

    describe('getSuperHeroes', () => {
      it('should load heroes from local mock on first call', () => {
        service.getSuperHeroes().subscribe((heroes) => {
          expect(heroes).toEqual(mockData);
        });

        expect(httpServiceMock.getLocal).toHaveBeenCalled();
      });

      it('should populate the allSuperHeroes signal after loading', () => {
        service.getSuperHeroes().subscribe();
        expect(service.allSuperHeroes()).toEqual(mockData);
      });

      it('should NOT call getLocal again on subsequent calls (cached)', () => {
        service.getSuperHeroes().subscribe();
        service.getSuperHeroes().subscribe();

        expect(httpServiceMock.getLocal).toHaveBeenCalledTimes(1);
      });
    });

    describe('getSuperHeroById', () => {
      beforeEach(() => {
        service.getSuperHeroes().subscribe();
      });

      it('should return the hero when found', () => {
        service.getSuperHeroById(1).subscribe((hero) => {
          expect(hero).toEqual(mockData[0]);
        });
      });

      it('should return undefined when not found', () => {
        service.getSuperHeroById(999).subscribe((hero) => {
          expect(hero).toBeUndefined();
        });
      });
    });

    describe('addSuperHero', () => {
      beforeEach(() => {
        service.getSuperHeroes().subscribe();
      });

      it('should add a new hero with an incremented id', () => {
        service
          .addSuperHero({ name: 'Batman', power: 'Intelecto', publisher: 'DC' })
          .subscribe((newHero) => {
            expect(newHero).toEqual({ id: 3, name: 'Batman', power: 'Intelecto', publisher: 'DC' });
          });
      });

      it('should reject adding a hero with a duplicate name (case-insensitive)', () => {
        let error: Error | undefined;

        service.addSuperHero({ name: 'superman', power: 'x', publisher: 'DC' }).subscribe({
          error: (err) => (error = err),
        });

        expect(error?.message).toBe('Ya existe un superhéroe con ese nombre');
      });

      it('should NOT modify the signal when rejecting a duplicate', () => {
        service.addSuperHero({ name: 'Superman', power: 'x', publisher: 'DC' }).subscribe({
          error: vi.fn(),
        });

        expect(service.allSuperHeroes()).toHaveLength(2);
      });
    });

    describe('updateSuperHero', () => {
      beforeEach(() => {
        service.getSuperHeroes().subscribe();
      });

      it('should update an existing hero', () => {
        const updated: SuperHero = { id: 1, name: 'Clark Kent', power: 'Vuelo', publisher: 'DC' };

        service.updateSuperHero(updated).subscribe((result) => {
          expect(result).toEqual(updated);
        });

        expect(service.allSuperHeroes().find((h) => h.id === 1)?.name).toBe('Clark Kent');
      });

      it('should allow keeping the same name for the same id', () => {
        const updated: SuperHero = {
          id: 1,
          name: 'Superman',
          power: 'Vuelo mejorado',
          publisher: 'DC',
        };
        let error: Error | undefined;

        service.updateSuperHero(updated).subscribe({ error: (err) => (error = err) });

        expect(error).toBeUndefined();
      });

      it('should reject updating to a name already used by another hero', () => {
        const updated: SuperHero = { id: 1, name: 'Spiderman', power: 'Vuelo', publisher: 'DC' };
        let error: Error | undefined;

        service.updateSuperHero(updated).subscribe({ error: (err) => (error = err) });

        expect(error?.message).toBe('Ya existe otro superhéroe con ese nombre');
      });
    });

    describe('deleteSuperHero', () => {
      beforeEach(() => {
        service.getSuperHeroes().subscribe();
      });

      it('should remove the hero from the signal', () => {
        service.deleteSuperHero(1).subscribe();
        expect(service.allSuperHeroes()).toHaveLength(1);
      });

      it('should complete without error when id does not exist', () => {
        vi.useFakeTimers();
        let completed = false;

        service.deleteSuperHero(999).subscribe({ complete: () => (completed = true) });

        vi.advanceTimersByTime(2000);
        expect(completed).toBe(true);

        vi.useRealTimers();
      });
    });

    describe('manejo de errores', () => {
      it('should propagate error when getLocal fails', () => {
        httpServiceMock.getLocal.mockReturnValue(
          throwError(() => new Error('Error al cargar datos locales')),
        );

        let error: Error | undefined;
        service.getSuperHeroes().subscribe({ error: (err) => (error = err) });

        expect(error?.message).toBe('Error al cargar datos locales');
      });

      it('should NOT populate the signal when getLocal fails', () => {
        httpServiceMock.getLocal.mockReturnValue(throwError(() => new Error('fail')));

        service.getSuperHeroes().subscribe({ error: vi.fn() });

        expect(service.allSuperHeroes()).toEqual([]);
      });
    });
  });

  describe('modo API real (useMockData: false)', () => {
    beforeEach(() => setup(false));

    it('should call httpService.get (not getLocal) on getSuperHeroes', () => {
      service.getSuperHeroes().subscribe();

      expect(httpServiceMock.get).toHaveBeenCalledWith('superheroes');
      expect(httpServiceMock.getLocal).not.toHaveBeenCalled();
    });

    it('should call httpService.get with id on getSuperHeroById', () => {
      httpServiceMock.get.mockReturnValue(of(mockData[0]));

      service.getSuperHeroById(1).subscribe((hero) => {
        expect(hero).toEqual(mockData[0]);
      });

      expect(httpServiceMock.get).toHaveBeenCalledWith('superheroes/1');
    });

    it('should call httpService.post on addSuperHero and sync the signal', () => {
      vi.useFakeTimers();
      const newHero: SuperHero = { id: 10, name: 'Batman', power: 'Intelecto', publisher: 'DC' };
      httpServiceMock.post.mockReturnValue(of(newHero));

      service.addSuperHero({ name: 'Batman', power: 'Intelecto', publisher: 'DC' }).subscribe();
      vi.advanceTimersByTime(2000);

      expect(httpServiceMock.post).toHaveBeenCalledWith('superheroes', {
        name: 'Batman',
        power: 'Intelecto',
        publisher: 'DC',
      });
      expect(service.allSuperHeroes()).toContainEqual(newHero);

      vi.useRealTimers();
    });

    it('should call httpService.put on updateSuperHero and sync the signal', () => {
      vi.useFakeTimers();
      const updated: SuperHero = { id: 1, name: 'Clark Kent', power: 'Vuelo', publisher: 'DC' };
      httpServiceMock.put.mockReturnValue(of(updated));
      httpServiceMock.get.mockReturnValue(of(mockData));

      service.getSuperHeroes().subscribe();
      service.updateSuperHero(updated).subscribe();
      vi.advanceTimersByTime(2000);

      expect(httpServiceMock.put).toHaveBeenCalledWith('superheroes/1', updated);
      expect(service.allSuperHeroes().find((h) => h.id === 1)).toEqual(updated);

      vi.useRealTimers();
    });

    it('should call httpService.delete on deleteSuperHero and sync the signal', () => {
      vi.useFakeTimers();
      httpServiceMock.get.mockReturnValue(of(mockData));
      httpServiceMock.delete.mockReturnValue(of(void 0));

      service.getSuperHeroes().subscribe();
      service.deleteSuperHero(1).subscribe();
      vi.advanceTimersByTime(2000);

      expect(httpServiceMock.delete).toHaveBeenCalledWith('superheroes/1');
      expect(service.allSuperHeroes().find((h) => h.id === 1)).toBeUndefined();

      vi.useRealTimers();
    });

    describe('manejo de errores', () => {
      it('should propagate error when get fails on getSuperHeroes', () => {
        httpServiceMock.get.mockReturnValue(throwError(() => new Error('Error de servidor')));

        let error: Error | undefined;
        service.getSuperHeroes().subscribe({ error: (err) => (error = err) });

        expect(error?.message).toBe('Error de servidor');
      });

      it('should propagate error when get fails on getSuperHeroById (not found / 404)', () => {
        httpServiceMock.get.mockReturnValue(
          throwError(() => new Error('Superhéroe no encontrado')),
        );

        let error: Error | undefined;
        service.getSuperHeroById(999).subscribe({ error: (err) => (error = err) });

        expect(error?.message).toBe('Superhéroe no encontrado');
        expect(httpServiceMock.get).toHaveBeenCalledWith('superheroes/999');
      });

      it('should propagate error when post fails on addSuperHero', () => {
        httpServiceMock.post.mockReturnValue(
          throwError(() => new Error('Error al crear superhéroe')),
        );

        let error: Error | undefined;
        service
          .addSuperHero({ name: 'Batman', power: 'Intelecto', publisher: 'DC' })
          .subscribe({ error: (err) => (error = err) });

        expect(error?.message).toBe('Error al crear superhéroe');
      });

      it('should NOT update the signal when post fails on addSuperHero', () => {
        httpServiceMock.get.mockReturnValue(of(mockData));
        httpServiceMock.post.mockReturnValue(throwError(() => new Error('fail')));

        service.getSuperHeroes().subscribe();
        service.addSuperHero({ name: 'Batman', power: 'x', publisher: 'DC' }).subscribe({
          error: vi.fn(),
        });

        expect(service.allSuperHeroes()).toHaveLength(2); // no se agregó nada
      });

      it('should propagate error when put fails on updateSuperHero', () => {
        httpServiceMock.get.mockReturnValue(of(mockData));
        httpServiceMock.put.mockReturnValue(throwError(() => new Error('Error al actualizar')));

        service.getSuperHeroes().subscribe();

        let error: Error | undefined;
        service
          .updateSuperHero({ id: 1, name: 'Clark Kent', power: 'Vuelo', publisher: 'DC' })
          .subscribe({ error: (err) => (error = err) });

        expect(error?.message).toBe('Error al actualizar');
      });

      it('should NOT modify the signal when put fails on updateSuperHero', () => {
        httpServiceMock.get.mockReturnValue(of(mockData));
        httpServiceMock.put.mockReturnValue(throwError(() => new Error('fail')));

        service.getSuperHeroes().subscribe();
        service
          .updateSuperHero({ id: 1, name: 'Clark Kent', power: 'Vuelo', publisher: 'DC' })
          .subscribe({ error: vi.fn() });

        expect(service.allSuperHeroes().find((h) => h.id === 1)?.name).toBe('Superman'); // sin cambios
      });

      it('should propagate error when delete fails on deleteSuperHero', () => {
        httpServiceMock.get.mockReturnValue(of(mockData));
        httpServiceMock.delete.mockReturnValue(throwError(() => new Error('Error al eliminar')));

        service.getSuperHeroes().subscribe();

        let error: Error | undefined;
        service.deleteSuperHero(1).subscribe({ error: (err) => (error = err) });

        expect(error?.message).toBe('Error al eliminar');
      });

      it('should NOT remove the hero from the signal when delete fails', () => {
        httpServiceMock.get.mockReturnValue(of(mockData));
        httpServiceMock.delete.mockReturnValue(throwError(() => new Error('fail')));

        service.getSuperHeroes().subscribe();
        service.deleteSuperHero(1).subscribe({ error: vi.fn() });

        expect(service.allSuperHeroes()).toHaveLength(2); // sigue estando
      });
    });
  });
});
