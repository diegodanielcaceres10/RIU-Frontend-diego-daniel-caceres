import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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
          error: () => {},
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
        let completed = false;

        service.deleteSuperHero(999).subscribe({ complete: () => (completed = true) });

        expect(completed).toBe(true);
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
      const newHero: SuperHero = { id: 10, name: 'Batman', power: 'Intelecto', publisher: 'DC' };
      httpServiceMock.post.mockReturnValue(of(newHero));

      service.addSuperHero({ name: 'Batman', power: 'Intelecto', publisher: 'DC' }).subscribe();

      expect(httpServiceMock.post).toHaveBeenCalledWith('superheroes', {
        name: 'Batman',
        power: 'Intelecto',
        publisher: 'DC',
      });
      expect(service.allSuperHeroes()).toContainEqual(newHero);
    });

    it('should call httpService.put on updateSuperHero and sync the signal', () => {
      const updated: SuperHero = { id: 1, name: 'Clark Kent', power: 'Vuelo', publisher: 'DC' };
      httpServiceMock.put.mockReturnValue(of(updated));
      httpServiceMock.get.mockReturnValue(of(mockData));

      service.getSuperHeroes().subscribe();
      service.updateSuperHero(updated).subscribe();

      expect(httpServiceMock.put).toHaveBeenCalledWith('superheroes/1', updated);
      expect(service.allSuperHeroes().find((h) => h.id === 1)).toEqual(updated);
    });

    it('should call httpService.delete on deleteSuperHero and sync the signal', () => {
      httpServiceMock.get.mockReturnValue(of(mockData));
      httpServiceMock.delete.mockReturnValue(of(void 0));

      service.getSuperHeroes().subscribe();
      service.deleteSuperHero(1).subscribe();

      expect(httpServiceMock.delete).toHaveBeenCalledWith('superheroes/1');
      expect(service.allSuperHeroes().find((h) => h.id === 1)).toBeUndefined();
    });
  });
});
