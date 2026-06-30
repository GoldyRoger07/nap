# Déploiement — Render (Angular SSR)

Ce projet se déploie sur Render comme **Web Service Node** (et non comme "Static Site",
ce qui désactiverait le SSR). Render lance le serveur Express SSR
(`dist/nap/server/server.mjs`) qui écoute sur `$PORT`.

## Fichiers de config dans ce repo
- `render.yaml` — Blueprint : crée le service avec les bonnes commandes build/start.
- `.node-version` → `22` — version de Node utilisée par Render.
- `package.json` → `engines.node: "22"` — cohérence de version.

---

## Déploiement (Blueprint — recommandé)

1. **Pousser le code sur GitHub** :
   ```bash
   git add .
   git commit -m "Configuration déploiement Render"
   git push
   ```

2. Sur https://dashboard.render.com → **New → Blueprint**.

3. Connecter le dépôt GitHub. Render lit `render.yaml` et propose le service `nap`.

4. **Apply** → Render build (`npm ci --include=dev && npm run build`) puis démarre
   (`npm run serve:ssr:nap`). À la fin, une URL publique `https://nap-xxxx.onrender.com`
   est fournie.

Ensuite, **chaque `git push` sur `main` redéploie automatiquement** (`autoDeploy: true`).

---

## Déploiement (manuel, sans Blueprint)

Si tu préfères configurer à la main : **New → Web Service**, connecter le repo, puis :

| Champ | Valeur |
|-------|--------|
| Runtime | `Node` |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm run serve:ssr:nap` |
| Health Check Path | `/` |
| Env var | `NODE_VERSION = 22` |
| Env var | `NG_ALLOWED_HOSTS = *` |

> Ne **pas** définir `PORT` : Render l'injecte et `src/server.ts` le lit déjà.

---

## Points d'attention

- **Plan `free`** : le service se met en veille après ~15 min d'inactivité ; la première
  requête suivante subit un *cold start* (quelques dizaines de secondes). Pour un service
  toujours actif, passer au plan **`starter`** (~7 $/mois) dans `render.yaml` ou le dashboard.
- **`--include=dev` est crucial** : Render met `NODE_ENV=production`, ce qui ferait sauter
  les devDependencies (`@angular/build`…) nécessaires au build. Le flag force leur installation.
- **`NG_ALLOWED_HOSTS` est obligatoire** : `angular.json` contient `security.allowedHosts: []`
  qui **rejette tous les hôtes** (HTTP 400 sur chaque requête, protection anti-SSRF d'Angular).
  Cette variable a la priorité sur le build et débloque le service. `*` autorise tout (sûr
  derrière le proxy de Render ; Angular affiche un avertissement, c'est attendu). **Pour plus
  de sécurité**, la remplacer par tes domaines réels une fois connus :
  `NG_ALLOWED_HOSTS = nap-xxxx.onrender.com,nap-haiti.org`. Modifiable dans le dashboard sans
  rebuild (juste un redémarrage).
- **Région** : `virginia` par défaut (proche Amérique/Haïti). Modifiable dans `render.yaml`
  (`oregon | ohio | virginia | frankfurt | singapore`).
- **Domaine personnalisé** : dashboard du service → **Settings → Custom Domains**
  (Render fournit les enregistrements DNS et le certificat HTTPS).
- Ne pas committer `dist/` ni `node_modules/` (déjà dans `.gitignore`) — Render build
  depuis les sources.
