import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { UserAuthService } from './user-auth.service';

/**
 * Ajoute l'en-tête Authorization selon la cible :
 * - /api/admin  → jeton administrateur
 * - autres /api → jeton du compte visiteur (si connecté)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/')) return next(req);

  const token = req.url.includes('/api/admin')
    ? inject(AuthService).token()
    : inject(UserAuthService).token();

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
