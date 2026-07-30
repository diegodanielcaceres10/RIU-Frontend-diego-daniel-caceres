import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RequestOptions {
  params?: HttpParams | { [param: string]: string | number | boolean };
  headers?: HttpHeaders | { [header: string]: string | string[] };
}

@Injectable({ providedIn: 'root' })
export class HttpService {
  private http = inject(HttpClient);
  private readonly useMock = environment.useMockData;
  private readonly baseUrl = environment.apiUrl;
  private readonly mockUrl = environment.mockUrl;

  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    if (this.useMock) {
      return this.mockGet<T>(endpoint, options);
    }
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options);
  }

  post<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    if (this.useMock) {
      return of({ ...(body as object), id: Date.now() } as T);
    }
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options);
  }

  put<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    if (this.useMock) {
      return of(body as T);
    }
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, options);
  }

  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    if (this.useMock) {
      return of({} as T);
    }
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options);
  }

  // --- Helpers for local mock ---

  private mockGet<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const resource = endpoint.split('/')[0]; // "superheroes/search" -> "superheroes"

    return this.http
      .get<any>(`${this.mockUrl}/${resource}.json`)
      .pipe(map((data) => this.applyMockLogic<T>(data, endpoint, options)));
  }

  private applyMockLogic<T>(data: any[], endpoint: string, options?: RequestOptions): T {
    const parts = endpoint.split('/');

    // GET /superheroes/:id
    if (parts.length === 2 && !isNaN(Number(parts[1]))) {
      return data.find((item) => item.id === Number(parts[1])) as T;
    }

    // GET /superheroes/search?name=xxx
    if (parts[1] === 'search' && options?.params) {
      const term = this.extractParam(options.params, 'name')?.toLowerCase() ?? '';
      return data.filter((item) => item.name.toLowerCase().includes(term)) as T;
    }

    // GET /superheroes (todos)
    return data as T;
  }

  private extractParam(
    params: HttpParams | { [key: string]: string | number | boolean },
    key: string,
  ): string | undefined {
    if (params instanceof HttpParams) {
      return params.get(key) ?? undefined;
    }
    return params[key] as string;
  }
}
