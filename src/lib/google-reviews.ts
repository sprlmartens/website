/**
 * Note agrégée de la fiche Google Business Profile.
 *
 * ⚠️ Valeurs saisies à la main — dernière vérification : 26/08/2026.
 * À revérifier chaque trimestre sur la fiche Google (lien `url` ci-dessous).
 *
 * Afficher une note ou un nombre d'avis qui ne correspond plus à la réalité
 * constitue une pratique commerciale trompeuse (directive Omnibus, transposée
 * au Code de droit économique). En tant qu'intermédiaire agréé FSMA, ces
 * chiffres doivent rester exacts : ne les modifier qu'en les relevant sur la
 * fiche Google.
 *
 * Pour automatiser plus tard : Places API (New), `GET /v1/places/{placeId}`
 * avec l'en-tête `X-Goog-FieldMask: rating,userRatingCount`. Ces deux champs
 * relèvent du SKU « Enterprise ». Avec un `revalidate` quotidien on reste à
 * ~30 appels/mois, largement dans le quota gratuit, et sous la limite de
 * 30 jours de mise en cache imposée par les conditions d'utilisation Google.
 */
export const GOOGLE_REVIEWS = {
  /** Note sur 5, en chiffre — sert au schema.org et à l'arrondi des étoiles. */
  rating: 4.9,
  /** Même note, formatée à la belge (virgule décimale) pour l'affichage. */
  ratingLabel: "4,9",
  count: 95,
  url: "https://www.google.com/maps?cid=14258516955292374392&hl=fr-BE",
} as const
