import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[appUppercase]',
})
export class UppercaseDirective {
  @HostBinding('style.textTransform') transform = 'uppercase';
}
