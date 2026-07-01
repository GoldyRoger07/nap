import { DOCUMENT, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import type { PublicUser } from '../models/community';
import { API_BASE } from './api.token';

const TOKEN_KEY = 'nap_user_token';
const USER_KEY = 'nap_user';

interface AuthResponse {
  token: string;
  user: PublicUser;
}

/** Authentification des comptes visiteurs (inscription, connexion, session). */
@Injectable({ providedIn: 'root' })
export class UserAuthService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly token = signal<string | null>(this.read(TOKEN_KEY));
  readonly user = signal<PublicUser | null>(this.readUser());
  readonly isLoggedIn = computed(() => !!this.token());

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/api/auth/register`, { name, email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/api/auth/user-login`, { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  logout(): void {
    this.token.set(null);
    this.user.set(null);
    this.write(TOKEN_KEY, null);
    this.write(USER_KEY, null);
  }

  private persist(res: AuthResponse): void {
    this.token.set(res.token);
    this.user.set(res.user);
    this.write(TOKEN_KEY, res.token);
    this.write(USER_KEY, JSON.stringify(res.user));
  }

  private read(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return this.doc.defaultView?.localStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private readUser(): PublicUser | null {
    const raw = this.read(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PublicUser;
    } catch {
      return null;
    }
  }

  private write(key: string, value: string | null): void {
    if (!this.isBrowser) return;
    try {
      const storage = this.doc.defaultView?.localStorage;
      if (!storage) return;
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, value);
    } catch {
      /* stockage indisponible */
    }
  }
}
