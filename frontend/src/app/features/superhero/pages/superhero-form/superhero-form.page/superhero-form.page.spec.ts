import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SuperHeroFormPage } from './superhero-form.page';
import { SuperHeroService } from '../../../data/superhero-api.service';
import { SuperHero } from '../../../domain/superhero.models';

describe('SuperHeroFormPage', () => {
  let component: SuperHeroFormPage;
  let superHeroServiceMock: {
    getSuperHeroById: ReturnType<typeof vi.fn>;
    addSuperHero: ReturnType<typeof vi.fn>;
    updateSuperHero: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  const mockSuperHero: SuperHero = {
    id: 1,
    name: 'Superman',
    power: 'Vuelo',
    publisher: 'DC',
  };

  function setup(paramId: string | null = null): void {
    superHeroServiceMock = {
      getSuperHeroById: vi.fn().mockReturnValue(of(mockSuperHero)),
      addSuperHero: vi.fn().mockReturnValue(of(mockSuperHero)),
      updateSuperHero: vi.fn().mockReturnValue(of(mockSuperHero)),
    };
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [SuperHeroFormPage],
      providers: [
        { provide: SuperHeroService, useValue: superHeroServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(paramId ? { id: paramId } : {}) },
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(SuperHeroFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit
  }

  describe('modo alta (sin id en la ruta)', () => {
    beforeEach(() => setup(null));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should NOT be in edit mode', () => {
      expect(component.isEditMode()).toBe(false);
      expect(component.superheroId()).toBeNull();
    });

    it('should start with an empty form', () => {
      expect(component.form.value).toEqual({ name: '', power: '', publisher: '' });
    });

    it('should NOT call getSuperHeroById', () => {
      expect(superHeroServiceMock.getSuperHeroById).not.toHaveBeenCalled();
    });

    it('should mark form invalid when required fields are empty', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('should mark form valid when all required fields are filled', () => {
      component.form.setValue({ name: 'Flash', power: 'Velocidad', publisher: 'DC' });
      expect(component.form.valid).toBe(true);
    });

    it('should reject a name shorter than 2 characters', () => {
      component.form.controls.name.setValue('A');
      expect(component.form.controls.name.hasError('minlength')).toBe(true);
    });

    it('should not submit an invalid form', () => {
      component.onSubmit();
      expect(superHeroServiceMock.addSuperHero).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when submitting an invalid form', () => {
      component.onSubmit();
      expect(component.form.controls.name.touched).toBe(true);
    });

    it('should call addSuperHero with form value on valid submit', () => {
      component.form.setValue({ name: 'Flash', power: 'Velocidad', publisher: 'DC' });
      component.onSubmit();

      expect(superHeroServiceMock.addSuperHero).toHaveBeenCalledWith({
        name: 'Flash',
        power: 'Velocidad',
        publisher: 'DC',
      });
    });

    it('should navigate to /superheroes after successful add', () => {
      component.form.setValue({ name: 'Flash', power: 'Velocidad', publisher: 'DC' });
      component.onSubmit();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/superheroes']);
    });

    it('should set saving to false after add completes', () => {
      component.form.setValue({ name: 'Flash', power: 'Velocidad', publisher: 'DC' });
      component.onSubmit();

      expect(component.saving()).toBe(false);
    });

    it('should set saving to true while the request is in flight', () => {
      // Simulamos un observable que aún no resuelve
      let resolveFn!: (value: SuperHero) => void;
      superHeroServiceMock.addSuperHero.mockReturnValue({
        pipe: () => ({
          subscribe: (observer: { next: (v: SuperHero) => void }) => {
            resolveFn = observer.next;
          },
        }),
      });

      component.form.setValue({ name: 'Flash', power: 'Velocidad', publisher: 'DC' });
      component.onSubmit();

      expect(component.saving()).toBe(true);
    });

    it('should show error message and NOT navigate when addSuperHero fails (duplicate name)', () => {
      superHeroServiceMock.addSuperHero.mockReturnValue(
        throwError(() => new Error('Ya existe un superhéroe con ese nombre')),
      );

      component.form.setValue({ name: 'Superman', power: 'Vuelo', publisher: 'DC' });
      component.onSubmit();

      expect(component.errorMessage()).toBe('Ya existe un superhéroe con ese nombre');
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to /superheroes on cancel', () => {
      component.onCancel();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/superheroes']);
    });

    it('should mark power as invalid when empty', () => {
      expect(component.form.controls.power.hasError('required')).toBe(true);
    });

    it('should reject a power longer than 60 characters', () => {
      component.form.controls.power.setValue('a'.repeat(61));
      expect(component.form.controls.power.hasError('maxlength')).toBe(true);
    });

    it('should mark publisher as invalid when empty', () => {
      expect(component.form.controls.publisher.hasError('required')).toBe(true);
    });

    it('should reject a name longer than 40 characters', () => {
      component.form.controls.name.setValue('a'.repeat(41));
      expect(component.form.controls.name.hasError('maxlength')).toBe(true);
    });
  });

  describe('modo edición (con id en la ruta)', () => {
    beforeEach(() => setup('1'));

    it('should be in edit mode with correct superheroId', () => {
      expect(component.isEditMode()).toBe(true);
      expect(component.superheroId()).toBe(1);
    });

    it('should call getSuperHeroById with the route id', () => {
      expect(superHeroServiceMock.getSuperHeroById).toHaveBeenCalledWith(1);
    });

    it('should patch the form with superhero data', () => {
      expect(component.form.value).toEqual({
        name: 'Superman',
        power: 'Vuelo',
        publisher: 'DC',
      });
    });

    it('should call updateSuperHero with id and form value on submit', () => {
      component.form.patchValue({ name: 'Clark Kent' });
      component.onSubmit();

      expect(superHeroServiceMock.updateSuperHero).toHaveBeenCalledWith({
        id: 1,
        name: 'Clark Kent',
        power: 'Vuelo',
        publisher: 'DC',
      });
    });

    it('should navigate to /superheroes after successful update', () => {
      component.onSubmit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/superheroes']);
    });

    it('should NOT call addSuperHero in edit mode', () => {
      component.onSubmit();
      expect(superHeroServiceMock.addSuperHero).not.toHaveBeenCalled();
    });

    it('should set loading to true while fetching superhero and false after', () => {
      // loading ya resuelto por el mock síncrono (of()), así que verificamos el estado final
      expect(component.loading()).toBe(false);
    });

    it('should show error message and NOT navigate when updateSuperHero fails', () => {
      superHeroServiceMock.updateSuperHero.mockReturnValue(
        throwError(() => new Error('Ya existe otro superhéroe con ese nombre')),
      );

      component.form.patchValue({ name: 'Spiderman' });
      component.onSubmit();

      expect(component.errorMessage()).toBe('Ya existe otro superhéroe con ese nombre');
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should set saving to false after updateSuperHero fails', () => {
      superHeroServiceMock.updateSuperHero.mockReturnValue(throwError(() => new Error('fail')));

      component.onSubmit();

      expect(component.saving()).toBe(false);
    });
  });

  describe('cuando el héroe no existe', () => {
    beforeEach(() => {
      superHeroServiceMock = {
        getSuperHeroById: vi.fn().mockReturnValue(of(undefined)),
        addSuperHero: vi.fn(),
        updateSuperHero: vi.fn(),
      };
      routerMock = { navigate: vi.fn() };

      TestBed.configureTestingModule({
        imports: [SuperHeroFormPage],
        providers: [
          { provide: SuperHeroService, useValue: superHeroServiceMock },
          { provide: Router, useValue: routerMock },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: convertToParamMap({ id: '999' }) },
            },
          },
        ],
      });

      const fixture = TestBed.createComponent(SuperHeroFormPage);
      fixture.detectChanges();
    });

    it('should redirect to /superheroes if superhero is not found', () => {
      expect(routerMock.navigate).toHaveBeenCalledWith(['/superheroes']);
    });
  });
});
