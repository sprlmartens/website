# Carrousel d'avis Google — Design

## Contexte

La section `Testimonials` de la page d'accueil (`src/components/home/Testimonials.tsx`, utilisée dans `src/app/(app)/page.tsx`) affiche actuellement 3 témoignages clients en dur, dans une mise en page en grille asymétrique (pas de navigation).

Objectif : la remplacer par un carrousel horizontal d'avis Google, affichant 3 avis visibles à la fois, navigable, avec un lien vers l'ensemble des avis Google de Martens Assurances.

## Décision : source des données

Les avis sont **codés en dur dans le fichier** (pas de CMS Sanity, pas d'API Google Places, pas de widget tiers). Raison : simplicité, pas de dépendance externe ni de clé API à gérer, mise à jour occasionnelle acceptable pour ce volume de contenu.

## Structure de données

Le composant est renommé `src/components/home/GoogleReviews.tsx`.

```ts
type GoogleReview = {
  name: string
  rating: 1 | 2 | 3 | 4 | 5
  quote: string
}
```

- Les 3 avis existants (Sébastien V., Thierry L., Christine M.) sont conservés avec leur texte actuel et `rating: 5` (confirmé par l'utilisateur — ce sont des avis Google 5 étoiles).
- 5 à 7 emplacements supplémentaires sont ajoutés avec des valeurs placeholder explicites et non trompeuses :
  ```ts
  {
    name: "TODO",
    rating: 5,
    quote: "TODO — coller un avis Google réel ici",
  }
  ```
  Chaque entrée placeholder est précédée d'un commentaire `// TODO: remplacer par un avis Google réel`. Le nombre exact d'emplacements placeholder : 6 (pour un total de 9 avis).

**Important** : ces placeholders ne doivent jamais être publiés tels quels — ce ne sont pas des avis inventés, ce sont des marqueurs à remplacer par du contenu réel avant mise en production de cette fonctionnalité.

## Mécanique du carrousel

- Ajout du composant shadcn `Carousel` via `npx shadcn@latest add carousel` (installe `embla-carousel-react` et génère `src/components/ui/carousel.tsx`), conformément aux conventions déjà en place dans `src/components/ui/`.
- Chaque avis occupe `basis-full sm:basis-1/2 lg:basis-1/3` (3 visibles sur desktop, dégradation propre sur tablette/mobile).
- Défilement un avis à la fois (pas par groupe de 3) via `CarouselPrevious` / `CarouselNext`.
- Pas de boucle infinie : les flèches se désactivent visuellement en début/fin de liste.
- Pas de défilement automatique.
- Swipe tactile natif sur mobile (comportement par défaut d'embla).

## Design visuel de la carte

Chaque carte conserve l'esprit visuel actuel (citation en `font-display`, guillemets stylisés en `text-accent`) et ajoute :

- **Notation en étoiles** (1 à 5, pleines/vides selon `rating`) en haut de la carte, en `text-accent`.
- **Logo Google** (petit SVG "G" multicolore inline, ~16px) à côté du nom en bas de carte, pour rappeler la source de l'avis.
- **Troncature du texte** (`line-clamp-6` ou équivalent) pour garder une hauteur de carte cohérente dans le carrousel, certains avis existants étant longs (ex. Christine M.).

## Lien vers tous les avis

Sous le carrousel, un lien "Voir tous nos avis Google →" pointant vers :

```
https://www.google.com/maps?cid=14258516955292374392&hl=fr-BE
```

Ouvert dans un nouvel onglet (`target="_blank" rel="noopener noreferrer"`).

Note : l'URL fournie initialement par l'utilisateur était une URL de résultats de recherche Google avec de nombreux paramètres de session/tracking non nécessaires (`sa`, `sca_esv`, `sxsrf`, `ved`, `biw`, `bih`, `dpr`, etc.). Le seul identifiant pertinent est le CID (`rldimm=14258516955292374392` dans l'URL d'origine), qui permet de construire un lien Google Maps stable et durable vers la fiche de l'établissement.

## Intégration

- Le fichier `src/components/home/Testimonials.tsx` est renommé/remplacé par `src/components/home/GoogleReviews.tsx`.
- `src/app/(app)/page.tsx` : l'import et l'usage de `Testimonials` sont mis à jour vers `GoogleReviews`.
- La structure de section existante (`<section aria-label="...">`, `container py-24 lg:py-32`, titre `"Ils nous font confiance"`) est conservée pour rester cohérente avec le reste de la page.

## Hors périmètre

- Pas de récupération automatique/API des avis Google (décision explicite de l'utilisateur).
- Pas de défilement automatique.
- Pas de boucle infinie du carrousel.
- Pas de champ date par avis (non demandé).
