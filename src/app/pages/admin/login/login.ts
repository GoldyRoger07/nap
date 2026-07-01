import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, NgIcon],
  templateUrl: './login.html',
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected username = '';
  protected password = '';
  protected readonly error = signal('');
  protected readonly submitting = signal(false);

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/admin');
    }
  }

  submit(): void {
    if (!this.username || !this.password || this.submitting()) return;
    this.submitting.set(true);
    this.error.set('');
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigateByUrl('/admin'),
      error: (e) => {
        this.error.set(e?.error?.error ?? 'Connexion impossible. Réessayez.');
        this.submitting.set(false);
      },
    });
  }
}
