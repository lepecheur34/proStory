# ProStory — MVP

MVP mobile pour artisans : 3 photos d'une réalisation → génération IA de posts
(Facebook / Instagram / LinkedIn) + email de demande d'avis Google, éditables
avant envoi. Métiers paramétrables (garagiste, plombier, paysagiste, rénovation,
électricien — voir `src/data/metiers.js`). Espace client avec connexion,
inscription, historique synchronisé dans le cloud, et paramétrage des
connexions réseaux sociaux.

## Ce qui fonctionne dans ce MVP

- Inscription / connexion / mot de passe oublié (comptes réels via Supabase)
- **Onboarding à la première connexion** : métier, nom d'entreprise, ville et
  quelques mots sur son savoir-faire — réutilisés pour personnaliser le ton
  des contenus générés par l'IA
- Prise de photos (optionnel, jusqu'à 3), **description libre de
  l'intervention** (dictée vocale possible via le micro du clavier), choix
  des canaux à utiliser
- Génération IA réelle du contenu (si tu configures une clé API Anthropic —
  sinon **mode démo automatique**, l'appli reste testable sans rien configurer)
- Édition du texte généré avant validation
- Historique synchronisé dans le cloud, avec **page détail par réalisation** :
  photos en galerie, date, note de l'artisan, canaux existants avec statut
  d'envoi, **ajout d'un canal a posteriori** (ex : générer aussi un post
  LinkedIn après coup), et bouton d'envoi réel — **email envoyé
  automatiquement via Brevo** (si configuré, sinon repli sur l'appli mail du
  téléphone), et partage natif vers Facebook/Instagram/LinkedIn
- Accueil avec statistiques d'activité (réalisations totales, ce mois-ci,
  taux de canaux envoyés)
- Écran "Compte" listant les connexions Facebook / LinkedIn / Google, avec
  statut connecté / non connecté

## Ce qui est simulé ou nécessite une étape manuelle de ta part

- **Publication automatique sur Facebook / Instagram / LinkedIn** : le bouton
  "Connecter" dans l'écran Compte identifie bien le compte de l'artisan (vrai
  OAuth), mais la **publication automatique de posts** demande en plus que
  Meta et LinkedIn valident ton appli sur des permissions spécifiques
  (`pages_manage_posts` pour Meta, produit "Share on LinkedIn" pour LinkedIn).
  Ce sont des démarches à faire toi-même sur leurs consoles développeurs,
  parfois avec vérification d'entreprise, qui peuvent prendre plusieurs jours.
  Tant que ce n'est pas validé, l'artisan copie-colle le texte généré.
- **L'envoi réel de l'email** au client (nécessite un service comme Resend ou
  SendGrid) — pas encore branché, prochaine étape logique.

---

> Ce projet utilise **Expo SDK 54**. Assure-toi que l'appli Expo Go installée
> sur ton téléphone est à jour (Play Store / App Store) pour être compatible.

## Installation (Visual Studio Code)

### 1. Prérequis à installer sur ton ordinateur

- [Node.js](https://nodejs.org/) version 18 ou plus (installe la version LTS)
- L'appli **Expo Go** sur ton téléphone (App Store ou Google Play) — c'est
  elle qui va afficher l'appli en direct sur ton téléphone pendant que tu
  développes, sans rien publier sur les stores

### 2. Ouvrir le projet

1. Décompresse le fichier `.zip`
2. Ouvre le dossier `prostory` dans VS Code (`Fichier > Ouvrir le dossier...`)
3. Ouvre un terminal dans VS Code (`Terminal > Nouveau terminal`)

### 3. Installer les dépendances

Dans le terminal VS Code :

```bash
npm install
```

Ça va télécharger tout ce dont l'appli a besoin (ça peut prendre 1-2 minutes).

### 4. Configurer l'espace client (Supabase) — nécessaire pour la connexion/inscription

Sans cette étape, l'écran de connexion affiche un message d'avertissement et
ne peut pas fonctionner (l'appli n'a pas de backend où stocker les comptes).
Ça prend 5 minutes, c'est gratuit :

1. Va sur [supabase.com](https://supabase.com), crée un compte gratuit, puis
   crée un nouveau projet (choisis une région proche de toi, ex. `eu-west`).
2. Une fois le projet créé, va dans **SQL Editor** (menu de gauche), colle le
   contenu du fichier `supabase/schema.sql` de ce projet, et clique sur **Run**.
   Ça crée les tables nécessaires (profil, historique, connexions sociales) et
   les règles de sécurité (chaque artisan ne voit que ses propres données).

   > **Tu as déjà exécuté une version précédente de ce script ?** Ne relance
   > pas tout le fichier (ça ferait planter sur les tables déjà créées).
   > Vérifie d'abord dans **Table Editor** quelles tables existent déjà
   > (`profiles`, `realisations`, `social_connections`), puis n'exécute que
   > les blocs `create table` manquants. Si `realisations` existe déjà mais
   > sans les colonnes récentes, exécute :
   > ```sql
   > alter table public.realisations add column if not exists sent_channels text[] default '{}';
   > alter table public.realisations add column if not exists description text;
   > ```
   > Le bucket de stockage `realisations-photos` doit lui être créé à la main
   > depuis **Storage > New bucket** (coche "Public bucket") — le créer par
   > SQL n'est pas toujours fiable selon les projets.
3. Va dans **Project Settings > API**, copie les deux valeurs suivantes :
   - `Project URL`
   - `anon public` key
4. Copie le fichier `.env.example` en `.env`, et colle-les :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=ta-cle-anon-ici
   ```
5. Par défaut, Supabase demande une confirmation par email à l'inscription.
   **Pour une appli mobile en développement, désactive-la** dans
   **Authentication > Providers > Email > décoche "Confirm email"** — sinon
   le lien de confirmation tente de rediriger vers une page web qui n'existe
   pas et affiche une erreur. Tu pourras remettre une vraie vérification
   plus tard avec un lien profond (deep link) qui rouvre l'appli.

### 5. (Optionnel) Configurer la vraie génération IA

Sans cette étape, l'appli fonctionne quand même en **mode démo** (texte
d'exemple généré instantanément, pratique pour tester le parcours).

Pour brancher la vraie IA :

1. Récupère une clé API sur [console.anthropic.com](https://console.anthropic.com)
2. Colle-la dans `.env` :
   ```
   EXPO_PUBLIC_ANTHROPIC_API_KEY=ta-cle-ici
   ```

⚠️ **Important pour plus tard** : mettre la clé API directement dans l'appli
mobile n'est pas sécurisé pour une vraie mise en production (n'importe qui
pourrait la retrouver en inspectant l'appli). C'est très bien pour tester le
MVP, mais avant de lancer réellement le produit il faudra passer par un petit
serveur relais qui garde la clé secrète côté serveur.

### 6. (Optionnel) Configurer les connexions réseaux sociaux

Tant que cette étape n'est pas faite, les boutons "Connecter" de l'écran
Compte affichent simplement "non configuré" — l'appli ne plante pas.

**Google** (le plus simple, aucune validation requise pour le login) :
1. Va sur [console.cloud.google.com](https://console.cloud.google.com), crée
   un projet, puis **APIs & Services > Credentials > Create OAuth client ID**
2. Dans Supabase : **Authentication > Providers > Google**, active-le et
   colle le Client ID / Secret obtenus chez Google
3. Ajoute dans `.env` : `EXPO_PUBLIC_GOOGLE_CLIENT_ID=...`

**Facebook** :
1. Crée une appli sur [developers.facebook.com](https://developers.facebook.com)
2. Dans Supabase : **Authentication > Providers > Facebook**, active-le et
   colle l'App ID / Secret
3. Ajoute dans `.env` : `EXPO_PUBLIC_FACEBOOK_APP_ID=...`
4. Pour la publication automatique de posts plus tard, il faudra en plus
   demander la permission `pages_manage_posts` en App Review chez Meta.

**LinkedIn** :
1. Crée une appli sur [linkedin.com/developers](https://www.linkedin.com/developers/apps)
2. Dans Supabase : **Authentication > Providers > LinkedIn (OIDC)**, active-le
   et colle le Client ID / Secret
3. Ajoute dans `.env` : `EXPO_PUBLIC_LINKEDIN_CLIENT_ID=...`
4. Pour la publication automatique plus tard, il faudra demander le produit
   "Share on LinkedIn" en validation chez LinkedIn.

### 5. Lancer l'application

```bash
npm start
```

Un QR code apparaît dans le terminal.

- **Sur ton téléphone** : ouvre l'appli Expo Go, scanne le QR code → l'appli
  s'ouvre en direct sur ton téléphone
- Chaque modification que tu fais dans le code se recharge automatiquement
  sur le téléphone (pas besoin de relancer)

---

## Structure du projet

```
prostory/
├── App.js                     # Point d'entrée
├── supabase/
│   └── schema.sql             # À exécuter dans Supabase SQL Editor
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── ForgotPasswordScreen.js
│   │   ├── ProfileFormScreen.js  # Onboarding + édition du profil
│   │   ├── HomeScreen.js         # Accueil (métier issu du profil)
│   │   ├── CaptureScreen.js      # Photos + email
│   │   ├── ResultScreen.js       # Résultat IA éditable
│   │   ├── HistoryScreen.js      # Historique synchronisé
│   │   └── AccountScreen.js      # Profil + connexions réseaux sociaux
│   ├── navigation/
│   │   └── AppNavigator.js    # Auth → Onboarding (si besoin) → Onglets
│   ├── services/
│   │   ├── aiService.js       # Appel à l'API Anthropic (ou mode démo)
│   │   ├── supabaseClient.js
│   │   └── socialAuthService.js
│   ├── context/
│   │   ├── AuthContext.js     # Session utilisateur
│   │   ├── ProfileContext.js  # Métier + infos business
│   │   └── AppContext.js      # Historique synchronisé + cache local
│   └── data/
│       └── metiers.js         # Métiers paramétrables — ajoute-en ici
```

## Ajouter un nouveau métier

Ouvre `src/data/metiers.js` et ajoute un objet dans le tableau `METIERS` :

```js
{
  id: "peintre",
  label: "Peintre en bâtiment",
  emoji: "🎨",
  ton: "soigné et précis, met en avant la finition et le rendu final",
  hashtags: ["#peintre", "#renovation", "#artisanlocal"],
}
```

Rien d'autre à modifier, il apparaît automatiquement dans l'écran de choix.

### 7. (Optionnel) Envoi automatique d'email via Brevo

Sans cette étape, l'email d'avis Google fonctionne quand même : un clic sur
"Envoyer l'email" ouvre l'appli mail du téléphone avec tout pré-rempli, il
suffit d'appuyer sur envoyer. Avec Brevo, l'email part automatiquement dès le
clic, sans passer par l'appli mail.

Cette étape passe par une petite fonction serveur (Supabase Edge Function)
pour que la clé API Brevo ne se retrouve jamais dans l'appli mobile.

1. Crée un compte gratuit sur [brevo.com](https://www.brevo.com) (300 emails/jour gratuits)
2. Dans Brevo : **Settings > SMTP & API > API Keys > Generate a new API key**, copie la clé
3. Toujours dans Brevo, va dans **Settings > Senders & IP > Senders**, ajoute
   et valide l'adresse email que tu veux utiliser comme expéditeur (Brevo
   envoie un email de confirmation) — sans ça, tes envois seront bloqués ou
   finiront en spam
4. Installe la CLI Supabase si ce n'est pas déjà fait :
   ```bash
   npm install -g supabase
   ```
5. Connecte-toi et relie ton projet (le `<project-ref>` est dans l'URL de ton
   projet Supabase, ou dans Project Settings > General) :
   ```bash
   supabase login
   supabase link --project-ref <project-ref>
   ```
6. Enregistre tes secrets (jamais dans le `.env` de l'appli — ici c'est
   côté serveur, donc en sécurité) :
   ```bash
   supabase secrets set BREVO_API_KEY=ta-cle-brevo
   supabase secrets set BREVO_SENDER_EMAIL=contact@tonentreprise.fr
   supabase secrets set BREVO_SENDER_NAME=ProStory
   ```
7. Déploie la fonction :
   ```bash
   supabase functions deploy send-review-email
   ```

C'est tout : la prochaine fois que tu appuies sur "Envoyer l'email" dans la
fiche d'une réalisation, il part directement, sans ouvrir l'appli mail.

Si un jour tu changes de fournisseur d'email transactionnel (Sendgrid,
Mailgun, etc.), seul le fichier `supabase/functions/send-review-email/index.ts`
a besoin d'être adapté — rien à changer côté appli mobile.

## Prochaines étapes suggérées

1. Tester avec 2-3 vrais artisans (ex. le garagiste) sur le mode démo pour
   valider le parcours et le prix
2. Une fois validé, connecter la vraie IA (clé API)
3. Ajouter un petit backend relais (pour la sécurité de la clé API et pour
   brancher les vraies publications Facebook/Instagram/LinkedIn + l'envoi
   d'email)
4. Publier une première version sur TestFlight (iOS) / test interne
   (Android) via `eas build`
