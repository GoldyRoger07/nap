import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { SOCIALS } from '../../data/content';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, NgIcon],
  templateUrl: './footer.html'
})
export class Footer {
  protected readonly showNewsletter = true;
  protected readonly socials = SOCIALS;
  protected readonly nlSent = signal(false);

  onNewsletter(event: Event) {
    event.preventDefault();
    this.nlSent.set(true);
  }
}
