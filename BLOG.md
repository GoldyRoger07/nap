# Blog NAP — publication d'articles

Le site dispose d'un blog dynamique avec un espace d'administration pour rédiger,
publier, modifier et supprimer des articles.

## Pages

| URL                          | Rôle                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| `/actualites`                | Liste publique des articles (filtres par thème)             |
| `/actualites/:slug`          | Page d'un article + **j'aime** et **commentaires**          |
| `/compte`                    | Inscription / connexion des visiteurs                       |
| `/admin/login`               | Connexion administrateur                                    |
| `/admin`                     | Tableau de bord : articles + **modération des commentaires** |

## Comptes visiteurs, j'aime et commentaires

- Les visiteurs créent un compte (**nom + email + mot de passe**) sur `/compte`.
- Un visiteur connecté peut **aimer** un article (1 like par personne, réversible)
  et **commenter**.
- Les commentaires passent en **modération** : ils sont « en attente » jusqu'à ce que
  tu les approuves depuis `/admin` → onglet **Commentaires** (le badge indique le
  nombre en attente). Tu peux approuver ou supprimer chaque commentaire.
- Comptes visiteurs et compte admin sont **distincts** (rôles séparés dans les jetons).

## Stockage (PostgreSQL)

Les articles et le compte admin sont stockés dans PostgreSQL. La connexion se fait
via la variable d'environnement `DATABASE_URL`. Au premier démarrage, les tables
sont créées automatiquement, le compte admin est initialisé et les articles de
démarrage (`src/app/data/content.ts`) sont importés.

> Sans `DATABASE_URL`, l'application bascule sur un **stockage en mémoire** (pratique
> en développement local). ⚠️ Dans ce mode, les articles publiés sont perdus au
> redémarrage — c'est normal.

## Configuration sur Render

1. **Créer la base** : dans le dashboard Render → *New* → *PostgreSQL* (offre gratuite).
   Copier l'*Internal Database URL*.
2. **Variables d'environnement** du service web (Render → *Environment*) :

   | Variable         | Valeur                                                        |
   | ---------------- | ------------------------------------------------------------- |
   | `DATABASE_URL`   | l'URL de la base Postgres créée à l'étape 1                    |
   | `ADMIN_USERNAME` | identifiant admin (défaut : `admin`)                          |
   | `ADMIN_PASSWORD` | **mot de passe admin** — à définir absolument en production   |
   | `AUTH_SECRET`    | chaîne aléatoire longue (signe les jetons de session)         |

3. Redéployer. Le blog est prêt : se connecter sur `/admin/login`.

### Identifiants par défaut (dev local, sans variables)

- Utilisateur : `admin`
- Mot de passe : `nap-admin-2026`

Changez impérativement `ADMIN_PASSWORD` (et définissez `AUTH_SECRET`) en production.

## Démarrer en local

```bash
npm start                      # dev server (http://localhost:4200)
# ou build + serveur SSR complet :
npm run build && npm run serve:ssr:nap   # http://localhost:4000
```

Pour tester avec Postgres en local, exportez `DATABASE_URL` avant de lancer le serveur.
