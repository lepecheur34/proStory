import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

// Côté le plus long conservé pour les photos envoyées : assez grand pour que
// le site en tire ses recadrages (16:9 en 1920, 4:3 en 1600, visionneuse
// plein écran) sans flou, sans envoyer les 12 Mpx bruts du téléphone.
const MAX_SIDE = 2560;
const JPEG_QUALITY = 0.9;

// Normalise une photo choisie : orientation corrigée, réduite si trop
// grande (jamais agrandie), un seul passage de compression JPEG de bonne
// qualité. En cas d'échec on garde la photo d'origine plutôt que de bloquer.
export async function optimizePhoto(asset) {
  try {
    const { uri, width, height } = asset;
    const context = ImageManipulator.manipulate(uri);
    if (width && height && Math.max(width, height) > MAX_SIDE) {
      context.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
    }
    const image = await context.renderAsync();
    const result = await image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
    return result.uri;
  } catch (e) {
    return asset.uri;
  }
}
