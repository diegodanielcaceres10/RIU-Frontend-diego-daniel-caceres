import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[appUppercase]',
  standalone: true,
})
export class UppercaseDirective {
  @HostBinding('style.textTransform') transform = 'uppercase';
}
