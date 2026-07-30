import { describe, it, expect, vi } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UppercaseDirective } from './uppercase.directive';

@Component({
  standalone: true,
  imports: [UppercaseDirective, ReactiveFormsModule],
  template: `<input appUppercase [formControl]="control" />`,
})
class HostWithControlComponent {
  control = new FormControl('');
}

@Component({
  standalone: true,
  imports: [UppercaseDirective],
  template: `<input appUppercase />`,
})
class HostWithoutControlComponent {}

function dispatchInput(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('UppercaseDirective', () => {
  describe('con NgControl (reactive form)', () => {
    it('should uppercase the input value on input event', () => {
      const fixture = TestBed.createComponent(HostWithControlComponent);
      fixture.detectChanges();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      dispatchInput(input, 'hola mundo');

      expect(input.value).toBe('HOLA MUNDO');
    });

    it('should update the FormControl value in uppercase, emitting only once via the forms mechanism', () => {
      const fixture = TestBed.createComponent(HostWithControlComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      const emitSpy = vi.fn();
      component.control.valueChanges.subscribe(emitSpy);

      dispatchInput(input, 'batman');

      expect(component.control.value).toBe('BATMAN');
      expect(emitSpy).toHaveBeenCalledTimes(1); // una sola emisión: la del DefaultValueAccessor, no la de la directiva
    });
  });

  describe('sin NgControl', () => {
    it('should still uppercase the input value directly on the DOM', () => {
      const fixture = TestBed.createComponent(HostWithoutControlComponent);
      fixture.detectChanges();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      dispatchInput(input, 'superman');

      expect(input.value).toBe('SUPERMAN');
    });
  });
});
