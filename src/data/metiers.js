// Liste des métiers paramétrables.
// Pour en ajouter un : ajoute une ligne [id?, libellé, emoji] dans la bonne
// catégorie de CATEGORIES ci-dessous (le ton et les hashtags viennent de la
// catégorie, sauf si tu définis le métier à la main dans METIERS_DETAILLES).

// Métiers historiques : ids stables (déjà enregistrés dans les profils et
// les réalisations existants) avec leur ton et leurs hashtags dédiés.
const METIERS_DETAILLES = [
  {
    id: "garagiste",
    label: "Garagiste",
    emoji: "🔧",
    ton: "technique et rassurant, met en avant le savoir-faire mécanique et la fiabilité",
    hashtags: ["#garage", "#mecanique", "#entretienauto", "#artisanlocal"],
  },
  {
    id: "plombier",
    label: "Plombier",
    emoji: "🚿",
    ton: "réactif et pro, met en avant la rapidité d'intervention et le sérieux",
    hashtags: ["#plombier", "#depannage", "#renovation", "#artisanlocal"],
  },
  {
    id: "paysagiste",
    label: "Paysagiste",
    emoji: "🌳",
    ton: "chaleureux et visuel, met en avant le rendu esthétique et le soin apporté",
    hashtags: ["#paysagiste", "#jardin", "#amenagementexterieur", "#artisanlocal"],
  },
  {
    id: "renovation",
    label: "Rénovation / BTP",
    emoji: "🏗️",
    ton: "concret et valorisant, met en avant la transformation avant/après",
    hashtags: ["#renovation", "#btp", "#artisan", "#travaux"],
  },
  {
    id: "electricien",
    label: "Électricien",
    emoji: "💡",
    ton: "précis et sécurisant, met en avant la conformité et le sérieux technique",
    hashtags: ["#electricien", "#electricite", "#renovation", "#artisanlocal"],
  },
];

// Chaque catégorie fournit le ton et des hashtags communs ; le hashtag propre
// au métier est ajouté automatiquement à partir de son libellé.
const CATEGORIES = [
  {
    ton: "concret et valorisant, met en avant la qualité de finition et le sérieux du chantier",
    hashtags: ["#artisan", "#travaux", "#artisanlocal"],
    metiers: [
      ["Maçon", "🧱"], ["Plâtrier-plaquiste", "🧱"], ["Peintre en bâtiment", "🎨"], ["Carreleur", "🔲"],
      ["Menuisier", "🪚"], ["Charpentier", "🪵"], ["Couvreur", "🏠"], ["Façadier", "🏢"],
      ["Serrurier", "🔑"], ["Vitrier", "🪟"], ["Chauffagiste", "🔥"], ["Climaticien", "❄️"],
      ["Installateur de cuisines", "🍳"], ["Installateur de salles de bain", "🛁"], ["Poseur de parquet et sols", "🪵"],
      ["Terrassier", "🚜"], ["Étancheur", "💧"], ["Isolation thermique", "🧤"], ["Ramoneur", "🧹"],
      ["Installateur photovoltaïque", "☀️"], ["Diagnostiqueur immobilier", "📋"], ["Architecte", "📐"],
      ["Architecte d'intérieur", "🛋️"], ["Maître d'œuvre", "🏗️"], ["Géomètre", "📏"], ["Pisciniste", "🏊"],
      ["Constructeur de maisons", "🏡"], ["Ferronnier", "⚒️"], ["Métallier", "🔩"],
      ["Installateur de stores et volets", "🪟"], ["Installateur de portails et clôtures", "🚪"],
      ["Poseur de fenêtres", "🪟"], ["Domoticien", "📲"], ["Démolition et déconstruction", "🔨"],
      ["Désamianteur", "😷"], ["Échafaudeur", "🏗️"], ["Cordiste", "🧗"],
    ],
  },
  {
    ton: "technique et rassurant, met en avant le savoir-faire et la fiabilité",
    hashtags: ["#auto", "#mecanique", "#artisanlocal"],
    metiers: [
      ["Carrossier", "🚗"], ["Mécanicien moto", "🏍️"], ["Pneumaticien", "🛞"], ["Contrôleur technique", "✅"],
      ["Dépanneur remorqueur", "🚨"], ["Vendeur de véhicules d'occasion", "🚙"], ["Lavage auto et detailing", "🧽"],
      ["Vitrage automobile", "🪟"], ["Mécanicien poids lourds", "🚛"], ["Réparateur de vélos", "🚲"],
      ["Spécialiste camping-cars", "🚐"], ["Auto-école", "🚘"], ["Location de véhicules", "🔑"],
      ["Électricien automobile", "🔋"], ["Préparateur automobile", "🏁"],
    ],
  },
  {
    ton: "chaleureux et visuel, met en avant le soin apporté et le résultat",
    hashtags: ["#nature", "#exterieur", "#artisanlocal"],
    metiers: [
      ["Jardinier", "🌱"], ["Élagueur", "🌲"], ["Pépiniériste", "🪴"], ["Fleuriste", "💐"],
      ["Arboriste", "🌳"], ["Entretien d'espaces verts", "🌿"], ["Horticulteur", "🌷"],
      ["Apiculteur", "🐝"], ["Maraîcher", "🥕"], ["Agriculteur", "🚜"], ["Viticulteur", "🍇"],
      ["Éleveur", "🐄"], ["Producteur local", "🧺"], ["Créateur de terrasses et pergolas", "🏡"],
    ],
  },
  {
    ton: "élégant et chaleureux, met en avant le soin, l'écoute et le résultat",
    hashtags: ["#beaute", "#bienetre", "#local"],
    metiers: [
      ["Coiffeur", "✂️"], ["Barbier", "💈"], ["Esthéticienne", "💅"], ["Prothésiste ongulaire", "💅"],
      ["Maquilleur", "💄"], ["Masseur", "💆"], ["Praticien bien-être", "🌸"], ["Tatoueur", "🖋️"],
      ["Coach sportif", "🏋️"], ["Professeur de yoga", "🧘"], ["Sophrologue", "🌬️"], ["Naturopathe", "🌿"],
      ["Ostéopathe", "🦴"], ["Kinésithérapeute", "🦵"], ["Diététicien nutritionniste", "🥗"],
      ["Psychologue", "🧠"], ["Hypnothérapeute", "🌀"], ["Coach de vie", "🌟"], ["Podologue", "🦶"],
      ["Opticien", "👓"], ["Dentiste", "🦷"], ["Infirmier libéral", "🩺"], ["Vétérinaire", "🐾"],
      ["Toiletteur canin", "🐶"], ["Éducateur canin", "🐕"], ["Sage-femme", "🤱"], ["Orthophoniste", "🗣️"],
      ["Acupuncteur", "📍"], ["Réflexologue", "👣"], ["Spa et institut de beauté", "🧖"],
    ],
  },
  {
    ton: "gourmand et convivial, met en avant la qualité des produits et le savoir-faire",
    hashtags: ["#gourmand", "#fabriquelocalement", "#local"],
    metiers: [
      ["Restaurateur", "🍽️"], ["Boulanger", "🥖"], ["Pâtissier", "🥐"], ["Boucher", "🥩"],
      ["Charcutier traiteur", "🥓"], ["Poissonnier", "🐟"], ["Traiteur", "🍱"], ["Chocolatier", "🍫"],
      ["Glacier", "🍦"], ["Fromager", "🧀"], ["Caviste", "🍷"], ["Brasseur", "🍺"], ["Torréfacteur", "☕"],
      ["Food truck", "🚚"], ["Chef à domicile", "👨‍🍳"], ["Barista", "☕"], ["Épicier", "🛒"],
      ["Primeur", "🍎"], ["Pizzaiolo", "🍕"], ["Sommelier", "🍾"], ["Gérant de bar", "🍹"],
      ["Gérant de café", "☕"], ["Crêperie", "🥞"], ["Producteur de miel", "🍯"],
    ],
  },
  {
    ton: "moderne et professionnel, met en avant l'expertise et les résultats concrets",
    hashtags: ["#digital", "#tech", "#freelance"],
    metiers: [
      ["Concepteur d'application", "📱"], ["Développeur web", "💻"], ["Développeur mobile", "📲"],
      ["Webdesigner", "🖥️"], ["Designer UX/UI", "🎯"], ["Community manager", "💬"], ["Consultant SEO", "🔍"],
      ["Consultant en marketing digital", "📈"], ["Graphiste", "🎨"], ["Motion designer", "🎞️"],
      ["Vidéaste", "🎥"], ["Photographe", "📷"], ["Monteur vidéo", "🎬"], ["Infographiste 3D", "🧊"],
      ["Développeur de jeux vidéo", "🎮"], ["Data analyst", "📊"], ["Consultant informatique", "🖱️"],
      ["Dépanneur informatique", "🖥️"], ["Administrateur systèmes et réseaux", "🌐"],
      ["Expert cybersécurité", "🔒"], ["Réparateur de smartphones", "🔧"], ["Consultant en intelligence artificielle", "🤖"],
      ["Rédacteur web", "✍️"], ["Créateur de contenu", "📹"], ["Créateur de sites internet", "🌍"],
      ["Agence web", "🏢"], ["Chef de projet digital", "🗂️"], ["Développeur logiciel", "⌨️"],
      ["Pilote de drone", "🚁"], ["Startup", "🚀"],
    ],
  },
  {
    ton: "créatif et authentique, met en avant le geste, la matière et l'unicité de chaque pièce",
    hashtags: ["#fabriquemain", "#creation", "#artisanat"],
    metiers: [
      ["Couturier", "🧵"], ["Retoucheur", "🪡"], ["Brodeur", "🧶"], ["Tapissier", "🛋️"], ["Ébéniste", "🪑"],
      ["Potier céramiste", "🏺"], ["Souffleur de verre", "🫙"], ["Bijoutier", "💍"], ["Horloger", "⌚"],
      ["Cordonnier", "👞"], ["Maroquinier", "👜"], ["Luthier", "🎻"], ["Sculpteur", "🗿"], ["Artiste peintre", "🖼️"],
      ["Encadreur", "🖼️"], ["Relieur", "📚"], ["Doreur", "✨"], ["Sellier", "🐴"], ["Forgeron", "⚒️"],
      ["Tailleur de pierre", "🪨"], ["Coutelier", "🔪"], ["Créateur de mode", "👗"], ["Créateur de bougies", "🕯️"],
      ["Fabricant de meubles sur mesure", "🪚"], ["Restaurateur d'art", "🎭"], ["Graveur", "🔖"],
      ["Calligraphe", "🖋️"], ["Tisserand", "🧶"], ["Modéliste", "✂️"], ["Créateur de bijoux", "💎"],
    ],
  },
  {
    ton: "chaleureux et professionnel, met en avant l'accueil, l'organisation et les beaux souvenirs",
    hashtags: ["#evenement", "#moments", "#local"],
    metiers: [
      ["Wedding planner", "💒"], ["DJ", "🎧"], ["Musicien", "🎵"], ["Animateur", "🎤"],
      ["Décorateur événementiel", "🎈"], ["Organisateur d'événements", "🎉"], ["Magicien", "🎩"],
      ["Location de salle", "🏛️"], ["Décorateur d'intérieur", "🛋️"], ["Home stager", "🏠"],
      ["Photographe immobilier", "📸"], ["Agent immobilier", "🏘️"], ["Chasseur immobilier", "🔎"],
      ["Conciergerie", "🗝️"], ["Gîte et chambres d'hôtes", "🏡"], ["Hôtelier", "🏨"],
      ["Guide touristique", "🧭"], ["Agence de voyages", "✈️"], ["Location de matériel", "📦"],
    ],
  },
  {
    ton: "rassurant et sérieux, met en avant la fiabilité, la disponibilité et la confiance",
    hashtags: ["#service", "#confiance", "#local"],
    metiers: [
      ["Aide à domicile", "🤝"], ["Assistante maternelle", "👶"], ["Entreprise de nettoyage", "🧹"],
      ["Pressing et blanchisserie", "👔"], ["Déménageur", "📦"], ["Taxi et VTC", "🚕"], ["Ambulancier", "🚑"],
      ["Coursier livreur", "🛵"], ["Dératisation et désinsectisation", "🐭"], ["Débarras et encombrants", "🚛"],
      ["Homme à tout faire", "🛠️"], ["Comptable", "🧾"], ["Expert-comptable", "📒"], ["Avocat", "⚖️"],
      ["Notaire", "📜"], ["Conseiller en gestion de patrimoine", "💼"], ["Assureur", "☂️"],
      ["Courtier", "🤝"], ["Coach professionnel", "🎯"], ["Formateur", "🎓"], ["Consultant", "💡"],
      ["Recruteur", "👥"], ["Assistante virtuelle", "🗂️"], ["Écrivain public", "✒️"], ["Imprimeur", "🖨️"],
      ["Professeur particulier", "✏️"], ["Professeur de musique", "🎼"], ["Traducteur", "🌐"],
      ["Sécurité et gardiennage", "🛡️"], ["Serrurier dépanneur", "🔑"],
    ],
  },
  {
    ton: "dynamique et motivant, met en avant l'énergie, les progrès et le plaisir de pratiquer",
    hashtags: ["#sport", "#passion", "#local"],
    metiers: [
      ["Moniteur de plongée", "🤿"], ["Moniteur de ski", "⛷️"], ["Guide de haute montagne", "🏔️"],
      ["Éducateur sportif", "🏅"], ["Professeur de danse", "💃"], ["Salle de sport", "💪"],
      ["Loueur de bateaux", "⛵"], ["Skipper", "🚤"], ["Pêcheur", "🎣"], ["Moniteur d'équitation", "🐴"],
      ["Golf", "⛳"], ["Instructeur de fitness", "🏃"], ["Arts martiaux", "🥋"], ["Surf et sports nautiques", "🏄"],
    ],
  },
  {
    ton: "professionnel et humain, met en avant le savoir-faire et la relation client",
    hashtags: ["#entrepreneur", "#local", "#independant"],
    metiers: [["Autre activité", "💼"]],
  },
];

const ACCENTS = {
  à: "a", â: "a", ä: "a", á: "a", ã: "a", å: "a", ç: "c", è: "e", é: "e", ê: "e", ë: "e",
  ì: "i", í: "i", î: "i", ï: "i", ñ: "n", ò: "o", ó: "o", ô: "o", ö: "o", õ: "o", œ: "oe",
  ù: "u", ú: "u", û: "u", ü: "u", ý: "y", ÿ: "y",
};

// Minuscules sans accents, pour comparer "electricien" à "Électricien".
export function deaccent(text) {
  return String(text)
    .toLowerCase()
    .replace(/[àâäáãåçèéêëìíîïñòóôöõœùúûüýÿ]/g, (c) => ACCENTS[c]);
}

function slugify(label) {
  return deaccent(label)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const generated = CATEGORIES.flatMap((category) =>
  category.metiers.map(([label, emoji]) => {
    const id = slugify(label);
    return {
      id,
      label,
      emoji,
      ton: category.ton,
      hashtags: [`#${id.replace(/-/g, "")}`, ...category.hashtags],
    };
  })
);

const detailedIds = new Set(METIERS_DETAILLES.map((m) => m.id));

export const METIERS = [...METIERS_DETAILLES, ...generated.filter((m) => !detailedIds.has(m.id))].sort((a, b) =>
  deaccent(a.label).localeCompare(deaccent(b.label))
);

export function getMetier(id) {
  return METIERS.find((m) => m.id === id) || METIERS_DETAILLES[0];
}

// Recherche insensible à la casse et aux accents, sur le libellé.
export function searchMetiers(query) {
  const q = deaccent(query || "").trim();
  if (!q) return METIERS;
  return METIERS.filter((m) => deaccent(m.label).includes(q));
}
