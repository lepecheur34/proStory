# ProStory Connector (plugin WordPress)

Plugin WordPress qui reçoit les réalisations créées depuis l'appli mobile
ProStory (voir le reste de ce dépôt) et les publie automatiquement en
**articles WordPress réels** — image à la une, contenu, méta-description SEO
— plutôt que la page technique générée par la fonction Supabase
(`realisation-page`) utilisée jusqu'ici. Chaque réalisation devient une vraie
page indexable, avec une URL propre sur le site de l'artisan.

Toutes les réalisations sont publiées dans un Custom Post Type dédié
("Réalisations") et rangées dans une unique catégorie WordPress
"Réalisations". Le plugin fournit aussi sa **propre mise en page premium**
(fiche réalisation en pleine largeur avec photo d'en-tête, et galerie qui les
liste toutes en grille) via ses propres gabarits et sa propre feuille de
style (`templates/`, `assets/prostory-style.css`) — inutile de toucher au
thème du site pour que ce soit soigné.

## Installation sur un site WordPress

1. Compresse le dossier `prostory-connector/` en `.zip` (le zip doit
   contenir directement `prostory-connector.php` à sa racine, ou le
   sous-dossier `prostory-connector/` selon comment WordPress l'attend —
   les deux formes sont acceptées par l'installeur WordPress).
2. Sur le site WordPress : **Extensions > Ajouter > Téléverser une
   extension**, sélectionne le zip, installe, puis **Activer**.
3. Va dans **Réglages > ProStory** : tu y trouveras l'**URL du site** et la
   **clé API** générée automatiquement — à renseigner côté appli ProStory,
   dans l'écran **Compte > Site WordPress**.

## Contrat de l'API REST exposée

```
POST https://<site-wordpress>/wp-json/prostory/v1/realisations
Authorization: Bearer <clé API>
Content-Type: application/x-www-form-urlencoded (ou JSON)

Paramètres :
  title             (requis)    Titre SEO (balise <title>, et Yoast/RankMath si présents)
  h1                (optionnel) Titre affiché en haut de l'article ; à défaut, reprend "title"
  content           (requis)    Corps de l'article (HTML basique autorisé)
  meta_description  (optionnel) Description SEO (Yoast/RankMath si présents)
  image_url         (optionnel) URL publique de la photo à mettre en image à la une
  gallery_urls      (optionnel) Tableau d'URLs publiques de photos supplémentaires,
                                 affichées dans un carousel sur la fiche

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
  -d "meta_description=Réalisation de test"
```

Si tout fonctionne, la réponse contient l'URL du nouvel article publié.

## Mise en page premium

Le plugin sert lui-même deux gabarits, sans dépendre du thème actif :

- `templates/single-realisation.php` : fiche réalisation (photo en en-tête
  pleine largeur, contenu, lien retour vers la galerie).
- `templates/archive-realisations.php` : galerie en grille de toutes les
  réalisations (utilisée à la fois pour l'archive du Custom Post Type et pour
  la page de la catégorie "Réalisations").

Ils sont injectés via le filtre `template_include` et stylés par
`assets/prostory-style.css` (chargée uniquement sur ces deux pages). Pour
personnaliser le rendu, il suffit de modifier ces fichiers directement dans
le plugin.

## Sécurité

- La clé API est générée aléatoirement à l'activation (32 caractères),
  régénérable depuis **Réglages > ProStory** si elle a fuité.
- Comparaison de la clé avec `hash_equals()` (résistant aux attaques par
  mesure de temps).
- Le plugin ne modifie que le strict nécessaire (création d'articles,
  catégories, image à la une) — aucun accès à d'autres données du site.
