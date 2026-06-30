# Déploiement — Firebase App Hosting (Angular SSR)

Ce projet est configuré pour **Firebase App Hosting**, qui exécute le serveur Node SSR
(`dist/nap/server/server.mjs`) sur une infrastructure Cloud Run gérée, avec CDN et HTTPS.

Le déploiement se fait **depuis GitHub** : chaque `git push` sur la branche de production
déclenche un build (`npm run build`) puis un déploiement automatique.

## Fichiers de config dans ce repo
- `apphosting.yaml` — réglages du runtime (instances, CPU, mémoire, variables d'env).
- `package.json` → `engines.node: "22"` — version de Node utilisée pour le build cloud.

---

## Prérequis (une seule fois)

1. **Le code sur GitHub** (App Hosting déploie depuis un dépôt Git).
   ```bash
   git add .
   git commit -m "Configuration Firebase App Hosting"
   git push
   ```

2. **Un projet Firebase en plan Blaze** (pay-as-you-go ; obligatoire pour App Hosting,
   mais l'offre gratuite couvre largement un site à trafic modéré).
   Créer le projet : https://console.firebase.google.com

3. **La CLI Firebase** (version récente) :
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

---

## Créer le backend App Hosting (une seule fois)

```bash
firebase apphosting:backends:create --project <ID_DU_PROJET>
```

L'assistant va demander :
- la **région** (ex. `us-central1` ou `europe-west4`) ;
- de **connecter le dépôt GitHub** (autoriser l'app Firebase sur GitHub) ;
- le **dépôt** et le **répertoire racine** (laisser `/`) ;
- la **branche de production** (ex. `main`) ;
- un **nom de backend** (ex. `nap`).

> Alternative tout-en-un : `firebase init apphosting` (crée aussi un `firebase.json`).

À la fin, App Hosting lance un premier déploiement et affiche l'URL publique
(`https://<backend>--<projet>.<region>.hosted.app`).

---

## Déploiements suivants

Automatiques : il suffit de pousser sur la branche de production.
```bash
git push           # → build + déploiement déclenchés
```

Suivi des builds et rollbacks : **console Firebase → App Hosting**.

Déploiement manuel ponctuel (sans push) :
```bash
firebase apphosting:rollouts:create <backend> --project <ID_DU_PROJET>
```

---

## Domaine personnalisé
Console Firebase → App Hosting → ton backend → **Add custom domain**
(ex. `nap-haiti.org`). Firebase fournit les enregistrements DNS et le certificat HTTPS.

---

## Notes
- **`PORT`** est injecté automatiquement par App Hosting — déjà géré dans `src/server.ts`.
  Ne pas le définir dans `apphosting.yaml`.
- **Ne pas committer** `dist/` ni `node_modules/` (déjà dans `.gitignore`) :
  App Hosting build à partir des sources.
- Pour ajouter des **variables d'environnement / secrets**, voir les commentaires
  dans `apphosting.yaml`.
- `minInstances: 0` → coût nul au repos, au prix d'un léger *cold start* sur la
  première requête après une période d'inactivité. Passer à `1` pour l'éliminer
  (petit coût permanent).
