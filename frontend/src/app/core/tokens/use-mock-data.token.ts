import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export const USE_MOCK_DATA = new InjectionToken<boolean>('USE_MOCK_DATA', {
  providedIn: 'root',
  factory: () => environment.useMockData,
});
