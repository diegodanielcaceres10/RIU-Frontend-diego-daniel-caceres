import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  function setup(data: ConfirmDialogData): void {
    dialogRefMock = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });

    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('con datos completos', () => {
    beforeEach(() => {
      setup({
        title: '¿Eliminar superhéroe?',
        message: 'Esta acción no se puede deshacer',
        confirmLabel: 'Sí, eliminar',
        cancelLabel: 'No, volver',
      });
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should expose the injected data', () => {
      expect(component.data.title).toBe('¿Eliminar superhéroe?');
      expect(component.data.message).toBe('Esta acción no se puede deshacer');
    });

    it('should render title and message in the template', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('.confirm-dialog__title')?.textContent).toContain(
        '¿Eliminar superhéroe?',
      );
      expect(el.querySelector('.confirm-dialog__message')?.textContent).toContain(
        'Esta acción no se puede deshacer',
      );
    });

    it('should render custom confirm and cancel labels', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const buttons = el.querySelectorAll('button');

      expect(buttons[0].textContent).toContain('No, volver');
      expect(buttons[1].textContent).toContain('Sí, eliminar');
    });

    it('should close the dialog with true on onConfirm', () => {
      component.onConfirm();
      expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });

    it('should close the dialog with false on onCancel', () => {
      component.onCancel();
      expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });

    it('should call onConfirm when the confirm button is clicked', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      const localComponent = fixture.componentInstance;
      const spy = vi.spyOn(localComponent, 'onConfirm');
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const confirmButton = el.querySelector<HTMLButtonElement>('.confirm-dialog__confirm');
      confirmButton?.click();

      expect(spy).toHaveBeenCalled();
    });

    it('should call onCancel when the cancel button is clicked', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      const localComponent = fixture.componentInstance;
      const spy = vi.spyOn(localComponent, 'onCancel');
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const buttons = el.querySelectorAll<HTMLButtonElement>('button');
      buttons[0].click(); // el primer botón es cancelar

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('sin labels personalizados (defaults)', () => {
    beforeEach(() => {
      setup({
        title: 'Confirmar acción',
        message: '¿Estás seguro?',
      });
    });

    it('should use the default cancel label "Cancelar"', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const buttons = el.querySelectorAll('button');

      expect(buttons[0].textContent).toContain('Cancelar');
    });

    it('should use the default confirm label "Eliminar"', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const buttons = el.querySelectorAll('button');

      expect(buttons[1].textContent).toContain('Eliminar');
    });
  });
});
