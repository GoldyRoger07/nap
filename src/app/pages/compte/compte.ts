import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAuthService } from '../../services/user-auth.service';

@Component({
  selector: 'app-compte',
  imports: [FormsModule],
  templateUrl: './compte.html',
})
export class Compte {
  private readonly auth = inject(UserAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly user = this.auth.user;
  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly error = signal('');
  protected readonly submitting = signal(false);

  protected name = '';
  protected email = '';
  protected password = '';

  private readonly redirect = this.route.snapshot.queryParamMap.get('redirect') || '/actualites';

  switchTo(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.error.set('');
  }

  submit(): void {
    if (this.submitting()) return;
    const email = this.email.trim();
    if (!email || !this.password || (this.mode() === 'register' && !this.name.trim())) {
      this.error.set('Merci de remplir tous les champs.');
      return;
    }
    this.submitting.set(true);
    this.error.set('');

    const request =
      this.mode() === 'register'
        ? this.auth.register(this.name.trim(), email, this.password)
        : this.auth.login(email, this.password);

    request.subscribe({
      next: () => this.router.navigateByUrl(this.redirect),
      error: (e) => {
        this.error.set(e?.error?.error ?? 'Une erreur est survenue. Réessayez.');
        this.submitting.set(false);
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
