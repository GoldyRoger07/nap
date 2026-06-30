import { Component, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { SOCIALS } from '../../data/content';

interface ContactInfo { label: string; value: string; sub: string; icon: string; }

@Component({
  selector: 'app-contact',
  imports: [NgIcon],
  templateUrl: './contact.html'
})
export class Contact {
  protected readonly submitted = signal(false);
  protected readonly socials = SOCIALS;

  protected readonly contactInfo: ContactInfo[] = [
    { label: 'Siège', value: 'Port-au-Prince, Haïti', sub: 'Coordination nationale du mouvement', icon: 'lucideMapPin' },
    { label: 'E-mail', value: 'contact@nap-haiti.org', sub: 'Réponse sous 48 heures', icon: 'lucideMail' },
    { label: 'Diaspora', value: 'Amérique · Europe · Caraïbes', sub: 'Antennes de la diaspora haïtienne', icon: 'lucideGlobe' },
  ];

  onSubmit(event: Event) {
    event.preventDefault();
    this.submitted.set(true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.submitted.set(false);
  }
}
