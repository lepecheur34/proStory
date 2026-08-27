// Liste des métiers paramétrables.
// Pour ajouter un métier : ajoute un objet ici, rien d'autre à toucher.
export const METIERS = [
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

export function getMetier(id) {
  return METIERS.find((m) => m.id === id) || METIERS[0];
}
