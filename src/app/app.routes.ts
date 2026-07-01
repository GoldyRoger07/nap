import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Apropos } from './pages/apropos/apropos';
import { Blog } from './pages/blog/blog';
import { ArticlePage } from './pages/article/article';
import { Contact } from './pages/contact/contact';
import { Compte } from './pages/compte/compte';
import { AdminLogin } from './pages/admin/login/login';
import { AdminDashboard } from './pages/admin/dashboard/dashboard';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Accueil — Nouvelle Alliance pour la Patrie',
    data: {
      description:
        "La Nouvelle Alliance pour la Patrie (NAP) rassemble les citoyens d'Haïti et de la " +
        'diaspora pour unir, reconstruire et transformer le pays : sécurité, gouvernance, ' +
        'démocratie et développement durable.',
    },
  },
  {
    path: 'a-propos',
    component: Apropos,
    title: 'À propos — Nouvelle Alliance pour la Patrie',
    data: {
      description:
        'Mission, vision et valeurs de la Nouvelle Alliance pour la Patrie : un leadership ' +
        "intègre, le dialogue et le rassemblement des forces vives d'Haïti autour d'un projet commun.",
    },
  },
  {
    path: 'actualites',
    component: Blog,
    title: 'Actualités — Nouvelle Alliance pour la Patrie',
    data: {
      description:
        'Actualités, analyses et propositions de la NAP sur la sécurité, la gouvernance, ' +
        "la jeunesse, la diaspora et le développement économique d'Haïti.",
    },
  },
  {
    path: 'actualites/:slug',
    component: ArticlePage,
    title: 'Actualités — Nouvelle Alliance pour la Patrie',
    data: {
      description:
        'Article de la Nouvelle Alliance pour la Patrie sur la sécurité, la gouvernance, ' +
        "la jeunesse, la diaspora et le développement d'Haïti.",
    },
  },
  {
    path: 'contact',
    component: Contact,
    title: 'Contact — Nouvelle Alliance pour la Patrie',
    data: {
      description:
        "Contactez la Nouvelle Alliance pour la Patrie et engagez-vous : citoyens d'Haïti " +
        "et de la diaspora, votre voix compte dans l'alliance.",
    },
  },
  {
    path: 'compte',
    component: Compte,
    title: 'Mon compte — Nouvelle Alliance pour la Patrie',
    data: {
      description:
        'Connectez-vous ou créez un compte pour aimer et commenter les articles de la ' +
        'Nouvelle Alliance pour la Patrie.',
    },
  },
  {
    path: 'admin/login',
    component: AdminLogin,
    title: 'Connexion — Administration NAP',
  },
  {
    path: 'admin',
    component: AdminDashboard,
    title: 'Administration — NAP',
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
