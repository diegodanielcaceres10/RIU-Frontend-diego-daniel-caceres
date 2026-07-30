import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SuperHeroListPage } from './superhero-list.page';
import { SuperHeroService } from '../../../data/superhero-api.service';
import { SuperHero } from '../../../domain/superhero.models';

describe('SuperHeroListPage', () => {
  let component: SuperHeroListPage;
  let superHeroServiceMock: {
    allSuperHeroes: ReturnType<typeof signal<SuperHero[]>>;
    getSuperHeroes: ReturnType<typeof vi.fn>;
    deleteSuperHero: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let dialogMock: { open: ReturnType<typeof vi.fn> };

  const mockSuperHeroes: SuperHero[] = [
    { id: 1, name: 'Superman', power: 'Vuelo', publisher: 'DC' },
    { id: 2, name: 'Spiderman', power: 'Agilidad', publisher: 'Marvel' },
    { id: 3, name: 'Batman', power: 'Intelecto', publisher: 'DC' },
  ];

  beforeEach(() => {
    const superHeroesSignal = signal<SuperHero[]>(mockSuperHeroes);

    superHeroServiceMock = {
      allSuperHeroes: superHeroesSignal,
      getSuperHeroes: vi.fn().mockReturnValue(of(mockSuperHeroes)),
      deleteSuperHero: vi.fn().mockReturnValue(of(void 0)),
    };

    routerMock = { navigate: vi.fn() };
    dialogMock = { open: vi.fn() };

    TestBed.configureTestingModule({
      imports: [SuperHeroListPage],
      providers: [
        { provide: SuperHeroService, useValue: superHeroServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    });

    const fixture = TestBed.createComponent(SuperHeroListPage);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getSuperHeroes on init', () => {
    expect(superHeroServiceMock.getSuperHeroes).toHaveBeenCalled();
  });

  it('should set loading to false after getSuperHeroes resolves', () => {
    expect(component.loading()).toBe(false);
  });

  it('should filter superheroes by keyword (case-insensitive)', () => {
    component.keyword.set('man');
    const result = component.filteredSuperHeroes();

    expect(result.map((h) => h.name)).toEqual(
      expect.arrayContaining(['Superman', 'Spiderman', 'Batman']),
    );
  });

  it('should sort filtered superheroes alphabetically', () => {
    component.keyword.set('');
    const result = component.filteredSuperHeroes();

    expect(result.map((h) => h.name)).toEqual(['Batman', 'Spiderman', 'Superman']);
  });

  it('should return empty array when no superhero matches keyword', () => {
    component.keyword.set('xyz-no-match');
    expect(component.filteredSuperHeroes()).toEqual([]);
  });

  it('should paginate superheroes according to pageIndex and pageSize', () => {
    component.pageSize.set(2);
    component.pageIndex.set(0);
    expect(component.pagedSuperHeroes().length).toBe(2);

    component.pageIndex.set(1);
    expect(component.pagedSuperHeroes().length).toBe(1);
  });

  it('should reset pageIndex when filter changes', () => {
    component.pageIndex.set(2);
    component.onFilterChange('bat');

    expect(component.pageIndex()).toBe(0);
    expect(component.keyword()).toBe('bat');
  });

  it('should update pageIndex and pageSize on page change', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 3 });

    expect(component.pageIndex()).toBe(1);
    expect(component.pageSize()).toBe(10);
  });

  it('should navigate to add form', () => {
    component.goToAdd();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/superheroes/form']);
  });

  it('should navigate to edit form with superhero id', () => {
    component.goToEdit(5);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/superheroes/form', 5]);
  });

  describe('onDelete', () => {
    it('should open confirm dialog with superhero name in message', () => {
      dialogMock.open.mockReturnValue({ afterClosed: () => of(false) });

      component.onDelete(1, 'Superman');

      expect(dialogMock.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          data: expect.objectContaining({
            message: expect.stringContaining('Superman'),
          }),
        }),
      );
    });

    it('should call deleteSuperHero when dialog is confirmed', () => {
      dialogMock.open.mockReturnValue({ afterClosed: () => of(true) });

      component.onDelete(1, 'Superman');

      expect(superHeroServiceMock.deleteSuperHero).toHaveBeenCalledWith(1);
      expect(component.loading()).toBe(false);
    });

    it('should NOT call deleteSuperHero when dialog is cancelled', () => {
      dialogMock.open.mockReturnValue({ afterClosed: () => of(false) });

      component.onDelete(1, 'Superman');

      expect(superHeroServiceMock.deleteSuperHero).not.toHaveBeenCalled();
    });
  });

  describe('manejo de errores', () => {
    it('should set loading to false even when getSuperHeroes fails', () => {
      superHeroServiceMock.getSuperHeroes.mockReturnValue(
        throwError(() => new Error('Error de red')),
      );

      const fixture = TestBed.createComponent(SuperHeroListPage);
      fixture.detectChanges();
      const localComponent = fixture.componentInstance;

      expect(localComponent.loading()).toBe(false);
    });

    it('should set loading to false when deleteSuperHero fails after confirmation', () => {
      superHeroServiceMock.deleteSuperHero.mockReturnValue(
        throwError(() => new Error('Error al eliminar')),
      );
      dialogMock.open.mockReturnValue({ afterClosed: () => of(true) });

      component.onDelete(1, 'Superman');

      expect(component.loading()).toBe(false);
    });
  });
});
