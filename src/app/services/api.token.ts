import { InjectionToken } from '@angular/core';

/**
 * Préfixe des appels API.
 * - Navigateur : '' (URL relative, même origine).
 * - SSR : origine absolue du serveur Node (fetch côté serveur exige une URL absolue).
 */
export const API_BASE = new InjectionToken<string>('API_BASE', {
  providedIn: 'root',
  factory: () => '',
});
