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

- **Publication automatique sur Facebook / Instagram / LinkedIn** : le bouton
  "Connecter" dans l'écran Compte identifie bien le compte de l'artisan (vrai
  OAuth), mais la **publication automatique de posts** demande en plus que
  Meta et LinkedIn valident ton appli sur des permissions spécifiques
  (`pages_manage_posts` pour Meta, produit "Share on LinkedIn" pour LinkedIn).
  Ce sont des démarches à faire toi-même sur leurs consoles développeurs,
  parfois avec vérification d'entreprise, qui peuvent prendre plusieurs jours.
  Tant que ce n'est pas validé, le partage natif du téléphone permet à
  l'artisan de coller le texte généré en un tap.

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

**Facebook** :
1. [developers.facebook.com](https://developers.facebook.com) > créer une appli
2. Supabase : **Authentication > Providers > Facebook**
3. `.env` : `EXPO_PUBLIC_FACEBOOK_APP_ID=...`
4. Pour publier automatiquement plus tard : demander `pages_manage_posts` en
   App Review chez Meta.

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
│       └── send-review-email/      # Edge Function : envoi email via Brevo
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
│   │   └── socialAuthService.js
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
