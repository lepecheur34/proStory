# ProStory — MVP

MVP mobile pour artisans : photos + description d'une réalisation → génération IA de
posts (Facebook / Instagram / LinkedIn) + email de demande d'avis Google, éditables
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
- **Envoi automatique de l'email d'avis dès la validation** de la
  réalisation (si Brevo est configuré, sinon ouverture de l'appli mail du
  téléphone en repli)
- Historique synchronisé dans le cloud, avec **page détail par réalisation** :
  photos en galerie, date, note de l'artisan, canaux existants avec statut
  d'envoi, **ajout d'un canal a posteriori** (ex : générer aussi un post
  LinkedIn après coup), et bouton d'envoi/partage pour les canaux pas encore
  envoyés
- Accueil avec statistiques d'activité (réalisations totales, ce mois-ci,
  taux de canaux envoyés)
- Écran "Compte" listant les connexions Facebook / LinkedIn / Google, avec
  statut connecté / non connecté

## Ce qui est simulé ou nécessite une étape manuelle de ta part

- **Publication automatique sur Facebook / Instagram / LinkedIn** : pas
  encore active. Le texte généré par l'IA reste éditable et se partage via
  le bouton natif du téléphone (coller en un tap depuis "Mes
  réalisations"). L'écran Compte permet quand même de **connecter/identifier**
  ta Page Facebook (choix parmi les Pages gérées par l'artisan, via l'API
  Graph) — cette partie fonctionne, mais elle ne sert pour l'instant qu'à
  savoir quelle Page est associée à l'artisan, pas à publier automatiquement.

  **Pourquoi ce n'est pas branché** (pour reprendre plus tard sans tout
  redécouvrir) : Meta a strictement besoin d'un **token d'accès utilisateur
  système** (obtenu via un portefeuille business) pour autoriser
  `pages_manage_posts`/`pages_read_engagement` — un token d'accès utilisateur
  "personnel" (ce qu'on a mis en place) ne peut techniquement pas obtenir ces
  permissions, quel que soit le chemin emprunté (testé à la fois via
  Facebook Login classique et via une config "Facebook Login for Business").
  C'est la même contrainte que subissent des outils comme Buffer/Hootsuite,
  qui demandent eux aussi à l'utilisateur de passer par un portefeuille
  business.

  Ce qui est déjà en place et réutilisable si tu veux reprendre ce chantier :
  - Une app Meta dédiée (`4162843980518238`) avec les cas d'utilisation
    "Tout gérer sur votre Page" + "Gérer les messages et les contenus sur
    Instagram", liée à un portefeuille business ("FDPL Group")
  - Une configuration Facebook Login for Business (`config_id`) — à
    **recréer en choisissant "Token d'accès utilisateur système"** au lieu
    de "Token d'accès utilisateur" (ce choix ne peut pas être changé sur une
    config existante), ce qui débloquera la sélection des Pages/tâches
    directement dans la config
  - Le flux OAuth maison (bypass de `supabase.auth.linkIdentity`, qui force
    un scope `email` incompatible avec Facebook Login for Business) dans
    `src/services/facebookService.js`, avec son relais de redirection
    (`supabase/functions/facebook-oauth-relay`) et l'échange de code côté
    serveur (`supabase/functions/facebook-connect`)
  - Les fonctions `publishToFacebookPage()` / `publishToInstagram()` dans
    `facebookService.js` : déjà écrites et prêtes à être rebranchées dans
    `ResultScreen.js` / `RealisationDetailScreen.js` une fois qu'un token
    avec les bonnes permissions sera obtenu

---

## Installation (Visual Studio Code)

> Ce projet utilise **Expo SDK 54**. Assure-toi que l'appli Expo Go installée
> sur ton téléphone est à jour (Play Store / App Store) pour être compatible.

### 1. Prérequis à installer sur ton ordinateur

- [Node.js](https://nodejs.org/) version 18 ou plus (installe la version LTS)
- L'appli **Expo Go** sur ton téléphone (App Store ou Google Play)

### 2. Ouvrir le projet

1. Décompresse le fichier `.zip`
2. Ouvre le dossier `prostory` dans VS Code (`Fichier > Ouvrir le dossier...`)
3. Ouvre un terminal dans VS Code (`Terminal > Nouveau terminal`)

### 3. Installer les dépendances

```bash
npm install
```

### 4. Configurer l'espace client (Supabase) — nécessaire pour la connexion/inscription

1. Va sur [supabase.com](https://supabase.com), crée un compte gratuit, puis
   crée un nouveau projet (choisis une région proche de toi, ex. `eu-west`).
2. Dans **SQL Editor**, colle le contenu du fichier `supabase/schema.sql` de
   ce projet, et clique sur **Run**. Ça crée les tables nécessaires (profil,
   historique, connexions sociales) et les règles de sécurité.

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

3. Va dans **Project Settings > API**, copie :
   - `Project URL`
   - la clé **Publishable key** (ou `anon public` sur les projets plus
     anciens — jamais la **Secret key**, réservée au serveur)
4. Copie le fichier `.env.example` en `.env`, et colle-les :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=ta-cle-ici
   ```
5. Désactive la confirmation par email pendant le développement (sinon le
   lien de confirmation tente de rediriger vers une page web qui n'existe
   pas) : **Authentication > Providers > Email > décoche "Confirm email"**.

> Si ton projet Supabase se met en pause (arrive automatiquement après une
> période d'inactivité sur le plan gratuit), reviens sur le dashboard et
> clique **"Resume project"** — tes données ne sont jamais perdues.

### 5. (Optionnel) Configurer la vraie génération IA

Sans cette étape, l'appli fonctionne en **mode démo** (texte d'exemple
généré instantanément).

1. Récupère une clé API sur [console.anthropic.com](https://console.anthropic.com)
2. Colle-la dans `.env` :
   ```
   EXPO_PUBLIC_ANTHROPIC_API_KEY=ta-cle-ici
   ```

⚠️ Pour une vraie mise en prod, ne mets jamais une clé API directement dans
l'appli mobile — utilise un backend relais. Ce mode direct sert à tester le
MVP rapidement.

### 6. (Optionnel) Configurer les connexions réseaux sociaux

Tant que cette étape n'est pas faite, les boutons "Connecter" de l'écran
Compte affichent "non configuré" — l'appli ne plante pas.

**Google** :
1. [console.cloud.google.com](https://console.cloud.google.com) > créer un
   projet > **APIs & Services > Credentials > Create OAuth client ID**
2. Dans Supabase : **Authentication > Providers > Google**, colle Client
   ID/Secret
3. `.env` : `EXPO_PUBLIC_GOOGLE_CLIENT_ID=...`

**Facebook (connexion de la Page + publication directe des posts)** :

Contrairement à Google/LinkedIn (identification seulement), Facebook va ici
jusqu'à la **vraie publication de posts** sur la Page (et sur Instagram si un
compte Instagram Business y est lié). Ça demande un peu plus de configuration
Meta.

1. Sur [developers.facebook.com](https://developers.facebook.com/apps) crée
   une appli de type **Entreprise (Business)**.
2. Sur l'écran **"Ajouter des cas d'utilisation"** : cherche/prends le cas
   d'utilisation **"Connexion Facebook"** (ou **"Facebook Login for
   Business"** s'il apparaît — plus adapté ici puisqu'on veut accéder aux
   Pages de l'artisan, pas juste identifier une personne). Les cartes
   "Gestion du contenu" / "Publicités et monétisation" ne sont **pas** ce
   qu'il te faut ici : elles servent à publier des pubs/insights, pas à
   activer l'API Pages pour un login utilisateur. Si tu ne trouves pas
   "Connexion Facebook" dans les catégories affichées, utilise la barre de
   recherche en haut de cet écran — elle liste tous les cas d'utilisation
   disponibles.
3. Une fois le produit **Facebook Login** ajouté : va dans
   **Facebook Login > Paramètres**, et ajoute dans **"URI de redirection
   OAuth valides"** :
   ```
   https://<ton-projet>.supabase.co/auth/v1/callback
   ```
   (`<ton-projet>` = la référence de ton projet Supabase, visible dans
   l'URL du dashboard ou dans **Project Settings > General**). Active aussi
   **"Connexion OAuth côté client"** (Client OAuth Login) et
   **"Connexion OAuth web"** (Web OAuth Login).
4. Récupère l'**App ID** et l'**App Secret** : **Paramètres de l'application
   > Général**.
5. Dans Supabase : **Authentication > Providers > Facebook**, colle App
   ID/Secret, active le provider.
6. `.env` : `EXPO_PUBLIC_FACEBOOK_APP_ID=...` (l'App Secret, lui, ne va
   jamais dans `.env` — voir étape 8).
7. **Pendant que Meta n'a pas validé l'appli (App Review)**, seuls les
   comptes ajoutés comme administrateur/développeur/testeur peuvent utiliser
   la connexion Page. Ajoute-toi (et tes artisans pilotes) : **Rôles de
   l'application > Ajouter des personnes**.
8. Déploie la fonction serveur qui échange le token contre un accès longue
   durée et récupère les Pages (l'App Secret ne doit **jamais** être dans
   l'appli mobile — si la CLI Supabase n'est pas encore installée/liée à ton
   projet, fais d'abord les étapes 4 et 5 de la section 7 ci-dessous) :
   ```bash
   supabase functions deploy facebook-connect
   supabase secrets set FACEBOOK_APP_ID=ton-app-id FACEBOOK_APP_SECRET=ton-app-secret
   ```
9. Recolle le bloc `social_connections` de `supabase/schema.sql` dans
   **SQL Editor** côté Supabase (ajoute les colonnes `facebook_page_id`,
   `facebook_page_name`, `facebook_page_access_token`,
   `instagram_business_id`, `instagram_username` si elles n'existent pas
   encore).
10. Pour que ça marche pour **n'importe quel artisan** (pas juste tes
    comptes testeurs) : soumets l'appli à l'**App Review** de Meta en
    demandant les permissions `pages_show_list`, `pages_read_engagement`,
    `pages_manage_posts`, `business_management`, et si tu veux Instagram
    `instagram_basic` + `instagram_content_publish`. Ça demande une
    vérification d'entreprise et une démo vidéo du flux — compte plusieurs
    jours, parfois plus.

Concrètement : une fois les étapes 1 à 9 faites, **tu peux déjà tester toi-même**
(en tant qu'admin/testeur de l'appli Meta) la connexion de Page et la
publication réelle. Seule l'étape 10 est nécessaire pour ouvrir ça à tous tes
utilisateurs.

**LinkedIn** :
1. [linkedin.com/developers](https://www.linkedin.com/developers/apps) > créer une appli
2. Supabase : **Authentication > Providers > LinkedIn (OIDC)**
3. `.env` : `EXPO_PUBLIC_LINKEDIN_CLIENT_ID=...`
4. Pour publier automatiquement plus tard : demander le produit "Share on
   LinkedIn".

### 7. (Optionnel) Envoi automatique d'email via Brevo

Sans cette étape, l'email d'avis Google fonctionne quand même : à la
validation d'une réalisation, l'appli mail du téléphone s'ouvre avec tout
pré-rempli. Avec Brevo, l'email part automatiquement, sans ouvrir l'appli
mail.

Cette étape passe par une fonction serveur (Supabase Edge Function) pour que
la clé API Brevo ne se retrouve jamais dans l'appli mobile.

1. Crée un compte gratuit sur [brevo.com](https://www.brevo.com) (300 emails/jour gratuits)
2. Brevo : **Settings > SMTP & API > API Keys > Generate a new API key**
3. Brevo : **Settings > Senders & IP > Senders**, ajoute et valide l'adresse
   expéditrice (email de confirmation envoyé par Brevo) — sans ça, tes
   envois finiront bloqués ou en spam
4. Installe la CLI Supabase :
   ```bash
   npm install -g supabase
   ```
5. Connecte-toi et relie ton projet (`<project-ref>` dans l'URL Supabase ou
   Project Settings > General) :
   ```bash
   supabase login
   supabase link --project-ref <project-ref>
   ```
6. Enregistre tes secrets (jamais dans le `.env` de l'appli) :
   ```bash
   supabase secrets set BREVO_API_KEY=ta-cle-brevo
   supabase secrets set BREVO_SENDER_EMAIL=contact@tonentreprise.fr
   supabase secrets set BREVO_SENDER_NAME=ProStory
   ```
7. Déploie la fonction :
   ```bash
   supabase functions deploy send-review-email
   ```

### 8. Lancer l'application

```bash
npm start
```

Scanne le QR code avec Expo Go. Si ton réseau bloque la connexion directe
(Wi-Fi professionnel, isolation des clients...), utilise le mode tunnel :
```bash
npx expo start --tunnel
```

---

## Structure du projet

```
prostory/
├── App.js
├── supabase/
│   ├── schema.sql                  # À exécuter dans Supabase SQL Editor
│   └── functions/
│       ├── send-review-email/      # Edge Function : envoi email via Brevo
│       └── facebook-connect/       # Edge Function : échange token + liste des Pages Facebook
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── ForgotPasswordScreen.js
│   │   ├── ProfileFormScreen.js     # Onboarding + édition du profil
│   │   ├── HomeScreen.js            # Accueil (métier issu du profil) + stats
│   │   ├── CaptureScreen.js         # Photos + description + canaux
│   │   ├── ResultScreen.js          # Résultat IA éditable + envoi auto
│   │   ├── HistoryScreen.js         # Liste des réalisations
│   │   ├── RealisationDetailScreen.js  # Fiche complète par réalisation
│   │   └── AccountScreen.js         # Profil + connexions réseaux sociaux
│   ├── navigation/
│   │   └── AppNavigator.js          # Auth → Onboarding (si besoin) → Onglets
│   ├── services/
│   │   ├── aiService.js             # Appel à l'API Anthropic (ou mode démo)
│   │   ├── emailService.js          # Envoi Brevo + repli appli mail
│   │   ├── supabaseClient.js
│   │   ├── socialAuthService.js     # OAuth générique (Google/LinkedIn) + lien d'avis Google
│   │   └── facebookService.js       # Connexion Page Facebook + publication Facebook/Instagram
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── ProfileContext.js
│   │   └── AppContext.js
│   └── data/
│       └── metiers.js               # Métiers paramétrables
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

## Prochaines étapes suggérées

1. Tester avec de vrais artisans pour valider le parcours et le prix
2. Lancer les démarches de validation Meta/LinkedIn si tu veux automatiser
   complètement la publication sur les réseaux
3. Ajouter le paiement (abonnement)
4. Préparer un vrai build installable (TestFlight / Play Store) via `eas build`
