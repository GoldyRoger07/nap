import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { API_BASE } from './api.token';

const STORAGE_KEY = 'nap_admin_token';

interface LoginResponse {
  token: string;
  username: string;
}

/** Gère l'authentification admin : login, stockage du jeton, déconnexion. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);

  private readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly token = signal<string | null>(this.readToken());

  private readToken(): string | null {
    if (!this.isBrowser) return null;
    try {
      return this.doc.defaultView?.localStorage.getItem(STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/api/auth/login`, { username, password })
      .pipe(tap((res) => this.setToken(res.token)));
  }

  logout(): void {
    this.setToken(null);
  }

  private setToken(token: string | null): void {
    this.token.set(token);
    if (!this.isBrowser) return;
    try {
      const storage = this.doc.defaultView?.localStorage;
      if (!storage) return;
      if (token) storage.setItem(STORAGE_KEY, token);
      else storage.removeItem(STORAGE_KEY);
    } catch {
      /* stockage indisponible : on garde le jeton en mémoire uniquement */
    }
  }
}
