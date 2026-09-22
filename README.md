# ProStory — MVP

MVP mobile pour artisans : photos + description d'une réalisation → génération IA de
posts (Facebook / Instagram / LinkedIn) + email de demande d'avis Google, éditables
avant envoi. Métiers paramétrables (garagiste, plombier, paysagiste, rénovation,
électricien — voir `src/data/metiers.js`). Espace client avec connexion,
inscription, historique synchronisé dans le cloud.

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
  téléphone en repli), avec le lien d'avis Google de l'artisan inséré
  automatiquement (configuré dans Compte)
- **Publication automatique en article WordPress** si l'artisan a connecté
  son site (plugin `wordpress-plugin/`, configuré dans Compte) — image à la
  une, contenu, méta-description SEO
- **Partage Facebook / Instagram / LinkedIn** : chaque réalisation a une page
  publique (photo + texte, balises Open Graph — ou l'article WordPress si
  connecté) partagée via le menu natif du téléphone. Facebook/LinkedIn
  affichent un aperçu riche automatiquement ; pour Instagram (qui ne
  supporte aucun lien-aperçu vers le fil), le texte est copié et l'app
  s'ouvre directement
- Historique synchronisé dans le cloud, avec **page détail par réalisation** :
  photos en galerie, date, note de l'artisan, canaux existants avec statut
  d'envoi, **ajout d'un canal a posteriori** (ex : générer aussi un post
  LinkedIn après coup), et bouton de partage pour les canaux pas encore
  envoyés
- Accueil avec statistiques d'activité (réalisations totales, ce mois-ci,
  taux de canaux envoyés)
- Écran "Compte" : lien d'avis Google + connexion du site WordPress

## Publication automatique directe sur Facebook/Instagram (API Graph) : abandonnée

Une version précédente tentait de publier directement sur la Page Facebook de
l'artisan via l'API Graph (OAuth complet, sélection de Page). Abandonné :
Meta exige un **token d'accès utilisateur système** (obtenu via un
portefeuille business) pour `pages_manage_posts`/`pages_read_engagement` — un
token utilisateur "personnel" ne peut pas obtenir ces permissions, quel que
soit le chemin emprunté. C'est la même contrainte que subissent des outils
comme Buffer/Hootsuite. Le partage via le menu natif du téléphone (voir
ci-dessus) offre un résultat similaire (aperçu riche automatique) sans cette
complexité. Le détail de cette exploration reste consultable dans l'historique
git si besoin d'y revenir un jour.

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

### 6. (Optionnel) Connecter un site WordPress (publication automatique d'articles)

Sans cette étape, les réalisations restent partageables normalement (menu
natif du téléphone vers une page publique générée par Supabase) — c'est
juste que rien n'est publié sur un site en plus.

1. Installe le plugin dans `wordpress-plugin/prostory-connector/` sur le
   site WordPress de l'artisan (voir `wordpress-plugin/README.md` pour le
   détail : compresser en zip, **Extensions > Ajouter > Téléverser**, puis
   **Activer**)
2. Sur le site : **Réglages > ProStory** affiche l'URL du site et une clé
   API générées automatiquement
3. Dans l'appli, écran **Compte > Site WordPress** : colle ces deux
   informations

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
├── wordpress-plugin/
│   └── prostory-connector/         # Plugin WP : publie les réalisations en articles
├── supabase/
│   ├── schema.sql                  # À exécuter dans Supabase SQL Editor
│   └── functions/
│       ├── send-review-email/      # Edge Function : envoi email via Brevo
│       └── realisation-page/       # Edge Function : page publique (Open Graph) par réalisation
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── ForgotPasswordScreen.js
│   │   ├── ProfileFormScreen.js     # Onboarding + édition du profil
│   │   ├── HomeScreen.js            # Accueil (métier issu du profil) + stats
│   │   ├── CaptureScreen.js         # Photos + description + canaux
│   │   ├── ResultScreen.js          # Résultat IA éditable + partage direct après enregistrement
│   │   ├── HistoryScreen.js         # Liste des réalisations
│   │   ├── RealisationDetailScreen.js  # Fiche complète par réalisation
│   │   └── AccountScreen.js         # Profil + lien d'avis Google + site WordPress
│   ├── navigation/
│   │   └── AppNavigator.js          # Auth → Onboarding (si besoin) → Onglets
│   ├── services/
│   │   ├── aiService.js             # Appel à l'API Anthropic (ou mode démo)
│   │   ├── emailService.js          # Envoi Brevo + repli appli mail
│   │   ├── supabaseClient.js
│   │   ├── socialAuthService.js     # Lien d'avis Google
│   │   ├── wordpressService.js      # Connexion + publication d'articles WordPress
│   │   └── shareService.js          # Partage natif Facebook/Instagram/LinkedIn
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
2. Ajouter le paiement (abonnement)
3. Préparer un vrai build installable (TestFlight / Play Store) via `eas build`
   — c'est aussi ce qui permettrait, plus tard, de détecter quelles apps sont
   réellement installées sur le téléphone pour n'afficher que les boutons de
   partage pertinents (impossible dans Expo Go)
