import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { UserAuthService } from '../../services/user-auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private readonly userAuth = inject(UserAuthService);
  protected readonly showAnnouncement = true;
  protected readonly user = this.userAuth.user;
  protected readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
