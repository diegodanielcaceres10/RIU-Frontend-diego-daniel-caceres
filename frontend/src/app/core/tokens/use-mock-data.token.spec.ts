import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { USE_MOCK_DATA } from './use-mock-data.token';
import { environment } from '../../../environments/environment';

describe('USE_MOCK_DATA token', () => {
  it('should provide the value from environment.useMockData via its factory', () => {
    TestBed.configureTestingModule({});

    const value = TestBed.inject(USE_MOCK_DATA);

    expect(value).toBe(environment.useMockData);
  });
});
