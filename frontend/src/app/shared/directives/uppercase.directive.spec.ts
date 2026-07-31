import { describe, it, expect } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UppercaseDirective } from './uppercase.directive';

@Component({
  standalone: true,
  imports: [UppercaseDirective],
  template: `<input appUppercase />`,
})
class HostComponent {}

describe('UppercaseDirective', () => {
  it('should apply text-transform: uppercase to the host element', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(input.style.textTransform).toBe('uppercase');
  });

  it('should not modify the actual input value', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    input.value = 'hola mundo';
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe('hola mundo'); // el valor real no cambia, solo la presentación visual
  });
});
