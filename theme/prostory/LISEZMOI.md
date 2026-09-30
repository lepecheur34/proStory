# Thème ProStory

Thème WordPress sur mesure pour prostory.fr. Accroche : « Faites votre travail, ProStory s'occupe de le montrer. »

Vitrine de l'application, liens de téléchargement et espace de gestion des clients.

## Installation

1. Dans WordPress : **Apparence > Thèmes > Ajouter > Téléverser un thème**, choisissez `prostory.zip`, puis **Activer**.
2. **Réglages > Lecture** : laissez « Vos derniers articles » ou choisissez une page d'accueil statique. Dans les deux cas, l'accueil affiche la vitrine. Si la page d'accueil statique contient du texte, il s'affiche entre « Comment ça marche » et « Tarifs ».
3. **Apparence > Personnaliser > ProStory** : tous les textes, les écrans animés du téléphone (réalisation sur le site, avis Google, réseaux sociaux), les tarifs, la FAQ et les liens de téléchargement se modifient ici. Pour chaque écran animé, vous pouvez mettre une vraie photo de réalisation en fond (format vertical).
4. **Apparence > Personnaliser > Identité du site** : ajoutez votre logo (sinon le logotype ProStory s'affiche) et votre icône de site.

## Téléchargement de l'application

Dans **ProStory > Téléchargement**, collez vos liens App Store, Google Play et/ou un lien de téléchargement direct : fichier APK (dans **Médias** ou en ligne) ou page d'installation Expo. Un lien de fichier se télécharge directement, une page s'ouvre dans un nouvel onglet. Vérifiez toujours le lien dans une fenêtre de navigation privée, sans être connecté.

**Recommandé : héberger l'APK sur le site.** Les builds Expo expirent au bout de quelques semaines. Téléchargez le fichier .apk depuis la page du build (menu ⋮ > Download), envoyez-le dans **Médias** (le thème autorise les fichiers .apk pour les administrateurs ; vérifiez la taille maximale d'envoi de votre hébergeur), puis collez son adresse dans « Lien de téléchargement direct ».

**Selon l'appareil du visiteur** (réglage « Le téléchargement direct concerne : Android uniquement ») :
- sur Android, le bouton télécharge directement ;
- sur ordinateur, il ouvre une fenêtre avec un QR code à scanner avec le téléphone ;
- sur iPhone, il affiche un message indiquant que l'application est sur Android, avec un bouton pour être prévenu par e-mail.

Ces textes se modifient dans la même section du Personnaliseur. Seuls les liens renseignés s'affichent. Tant qu'aucun lien n'est saisi, un rappel visible uniquement par vous apparaît sur le site.

## Réalisations (plugin ProStory Connector)

Le thème prend en charge l'extension **ProStory Connector**. Une fois celle-ci installée et activée :

- l'entrée **Réalisations** apparaît dans le menu principal (si aucun menu personnalisé n'est assigné ; sinon, ajoutez-la dans Apparence > Menus, rubrique « Réalisations », lien « Archives ») ;
- la page `/realisations/` affiche le portfolio, 12 réalisations par page ;
- chaque réalisation a sa fiche : photo principale, texte, galerie de toutes les photos avec visionneuse plein écran (flèches, clavier, balayage sur mobile), navigation vers la précédente et la suivante, et un bandeau final vers les tarifs ;
- les 3 (ou 6) dernières réalisations s'affichent sur l'accueil, entre « Comment ça marche » et « Tarifs ».

Une mention « Réalisation générée automatiquement avec l'application ProStory », avec un lien vers « Comment ça marche », apparaît sur la page Réalisations et sur chaque fiche.

Les textes se règlent dans **Apparence > Personnaliser > ProStory > Réalisations**. Le thème remplace les gabarits de l'extension par les siens, pour garder la même identité que le reste du site ; sur les sites de vos clients, qui utilisent d'autres thèmes, l'extension continue d'afficher ses propres gabarits. Sans l'extension, le thème fonctionne normalement et n'affiche rien de tout cela.

Le shortcode d'avis Google de l'extension, `[prostory_avis]`, reprend aussi les couleurs et polices du site.

## Menus

Trois emplacements dans **Apparence > Menus** :

- **Menu principal** : sans menu assigné, il affiche automatiquement les ancres de l'accueil (Fonctionnalités, Comment ça marche, Tarifs, Questions).
- **Menu du pied de page**.
- **Liens légaux** : mentions légales, CGU, politique de confidentialité, gestion des cookies.

## Espace clients

Menu **Clients** dans l'administration (réservé aux administrateurs) :

- **Vue d'ensemble** : revenu mensuel récurrent HT, clients actifs / en essai / prospects, renouvellements à venir dans les 30 jours et renouvellements dépassés.
- **Tous les clients** : liste filtrable par statut et formule, triable par montant et date de renouvellement ; la recherche porte aussi sur le contact, l'e-mail, le téléphone, la ville, le SIRET et l'identifiant dans l'application.
- **Fiche client** : contact, e-mail, téléphone, ville, SIRET, métier, site internet, lien de la fiche Google, identifiant dans l'application, formule, statut, montant mensuel HT, dates, notes internes.
- **Export CSV** : compatible Excel (séparateur point-virgule, accents conservés).
- Un résumé apparaît aussi sur le **Tableau de bord** WordPress.

Les formules proposées dans les fiches (ProStory, ProStory + nouveau site) reprennent automatiquement celles saisies dans la section Tarifs. Une troisième formule peut être ajoutée depuis le Personnaliseur si besoin. Les fiches ne sont jamais visibles sur le site public.

Pour donner l'accès à un collaborateur non administrateur, attribuez à son rôle les droits `edit_prostory_clients` (et les droits associés) avec une extension comme *Members* ou *User Role Editor*.

## RGPD

Les polices sont hébergées avec le thème : aucune donnée n'est envoyée à Google Fonts. Pensez à installer une extension de consentement aux cookies si vous ajoutez des outils de mesure d'audience, et à déclarer le fichier clients dans votre registre de traitements.

## Structure

```
prostory/
├── style.css, functions.php, theme.json, screenshot.png
├── header.php, footer.php, front-page.php, index.php, page.php, single.php, 404.php, comments.php
├── template-parts/   hero, features, steps, realisations-home, realisation-card, pricing, faq, download, card
├── realisations/     archive (portfolio) et single (fiche réalisation)
├── inc/              defaults (textes par défaut), customizer, template-tags, clients, realisations
└── assets/           css (site, éditeur, admin), js, fonts
```
