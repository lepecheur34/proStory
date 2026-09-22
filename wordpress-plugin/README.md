# ProStory Connector (plugin WordPress)

Plugin WordPress qui reçoit les réalisations créées depuis l'appli mobile
ProStory (voir le reste de ce dépôt) et les publie automatiquement en
**articles WordPress réels** — image à la une, contenu, méta-description SEO
— plutôt que la page technique générée par la fonction Supabase
(`realisation-page`) utilisée jusqu'ici. Chaque réalisation devient une vraie
page indexable, avec une URL propre sur le site de l'artisan.

## Installation sur un site WordPress

1. Compresse le dossier `prostory-connector/` en `.zip` (le zip doit
   contenir directement `prostory-connector.php` à sa racine, ou le
   sous-dossier `prostory-connector/` selon comment WordPress l'attend —
   les deux formes sont acceptées par l'installeur WordPress).
2. Sur le site WordPress : **Extensions > Ajouter > Téléverser une
   extension**, sélectionne le zip, installe, puis **Activer**.
3. Va dans **Réglages > ProStory** : tu y trouveras l'**URL du site** et la
   **clé API** générée automatiquement — c'est ce qu'il faudra renseigner
   côté appli ProStory (à venir : écran "Compte > Site web").

## Contrat de l'API REST exposée

```
POST https://<site-wordpress>/wp-json/prostory/v1/realisations
Authorization: Bearer <clé API>
Content-Type: application/x-www-form-urlencoded (ou JSON)

Paramètres :
  title             (requis)  Titre de l'article
  content           (requis)  Corps de l'article (HTML basique autorisé)
  meta_description  (optionnel) Description SEO (Yoast/RankMath si présents)
  image_url         (optionnel) URL publique de la photo à mettre en image à la une
  metier            (optionnel) Nom du métier, utilisé comme catégorie WordPress

Réponse (200) :
  { "id": 123, "url": "https://<site-wordpress>/mon-article/" }

Erreurs :
  401 — clé API absente ou invalide
  400 — title ou content manquant
  500 — échec de création de l'article
```

## Tester manuellement (avant le branchement côté appli)

```bash
curl -X POST "https://www.euroconform.eu/wp-json/prostory/v1/realisations" \
  -H "Authorization: Bearer <colle-la-clé-API-ici>" \
  -d "title=Test ProStory" \
  -d "content=Ceci est un test de publication automatique." \
  -d "meta_description=Réalisation de test" \
  -d "metier=Électricien"
```

Si tout fonctionne, la réponse contient l'URL du nouvel article publié.

## Ce qu'il reste à faire côté appli ProStory

- Nouvel écran/champ dans **Compte** pour saisir l'URL du site + la clé API
  de l'artisan (même schéma que la connexion Google/Facebook déjà en
  place : stocké dans `social_connections`, ou une nouvelle table dédiée
  `wordpress_connections`).
- Appeler cette API REST au moment de `addRealisation()` (dans
  `AppContext.js` côté appli), en passant le texte généré (`facebook` ou
  `linkedin`, au choix) comme corps d'article, et la première photo
  publique comme `image_url`.
- Utiliser l'URL WordPress retournée comme `pageUrl` dans
  `shareService.js`, à la place de (ou en complément de) la page Supabase
  actuelle, pour le partage vers Facebook/Instagram/LinkedIn.
- Prévoir un repli propre si l'artisan n'a pas connecté de site WordPress
  (garder la page Supabase actuelle comme solution par défaut).

## Sécurité

- La clé API est générée aléatoirement à l'activation (32 caractères),
  régénérable depuis **Réglages > ProStory** si elle a fuité.
- Comparaison de la clé avec `hash_equals()` (résistant aux attaques par
  mesure de temps).
- Le plugin ne modifie que le strict nécessaire (création d'articles,
  catégories, image à la une) — aucun accès à d'autres données du site.
