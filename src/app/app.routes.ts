import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Apropos } from './pages/apropos/apropos';
import { Blog } from './pages/blog/blog';
import { Contact } from './pages/contact/contact';

export const routes: Routes = [
  { path: '', component: Home, title: 'Accueil — Nouvelle Alliance pour la Patrie' },
  { path: 'a-propos', component: Apropos, title: 'À propos — Nouvelle Alliance pour la Patrie' },
  { path: 'actualites', component: Blog, title: 'Actualités — Nouvelle Alliance pour la Patrie' },
  { path: 'contact', component: Contact, title: 'Contact — Nouvelle Alliance pour la Patrie' },
  { path: '**', redirectTo: '' },
];
