# Stratégie de cache pour les données Sanity

**Date :** 2026-08-03
**Statut :** accepté
**Décision :** rendu dynamique (`force-dynamic`) sur les routes qui lisent Sanity.
Pas de webhook de revalidation pour le moment.

## Contexte

Un article publié dans Sanity n'apparaissait pas sur `/blog` en production alors
qu'il s'affichait en local.

Cause racine : `/blog` était prérendu au build. `sanityFetch` (via `defineLive`)
met ses requêtes en cache avec `next: { revalidate: false }`, c'est-à-dire
indéfiniment. Le seul mécanisme capable d'invalider ce cache est
`revalidateTag`, déclenché par `<SanityLive />` **depuis le navigateur** lorsqu'un
événement Live arrive. L'article ayant été créé avant que quiconque n'ouvre la
page, aucun événement n'a été émis et la page est restée figée sur un instantané
vide datant du déploiement.

`/blog/[slug]` fonctionnait car il appelle `await params`, une API de requête qui
force le rendu dynamique.

## Options envisagées

### A — Rendu dynamique (retenue)

`export const dynamic = "force-dynamic"` sur les routes qui lisent Sanity.
D'après la documentation Next 16, cela équivaut à forcer chaque `fetch()` du
segment en `{ cache: 'no-store', next: { revalidate: 0 } }`, ce qui neutralise
bien le `revalidate: false` de `sanityFetch`.

Piège écarté : `export const revalidate = 60` **ne fonctionne pas** ici. La
documentation Next 16 précise que le `revalidate` de segment « ne remplace pas la
valeur définie par les requêtes `fetch` individuelles ».

### B — Webhook Sanity vers `revalidateTag`

Les pages restent statiques ; Sanity appelle une route handler à la publication,
qui invalide les tags de cache.

Implique : taguer explicitement chaque `sanityFetch` (`tags: ['post']`, car les
sync tags automatiques sont des hachages opaques inutilisables côté serveur), une
route handler avec validation de signature (`parseBody` de `next-sanity/webhook`),
un secret partagé dans l'environnement, et une configuration de webhook dans
`sanity.io/manage`.

À noter : l'exemple officiel Sanity utilise `revalidateTag(tag)` à un seul
argument, **déprécié en Next 16**. La forme correcte pour un webhook est
`revalidateTag(tag, { expire: 0 })`.

## Mesures

Relevés sur le déploiement Vercel (5 requêtes, après chauffe) :

| Route | Mode | TTFB | Démarrage à froid |
| --- | --- | --- | --- |
| `/contact` | statique, edge `cdg1` | 0,23–0,33 s | — |
| `/blog/[slug]` | dynamique, fonction `iad1` | 0,37–0,44 s | 2,03 s |

Écart en régime stable : environ +120 ms.

Une part importante de cet écart n'est pas due à Sanity mais à la région
d'exécution : l'edge répond depuis `cdg1` (Paris) tandis que les fonctions
s'exécutent en `iad1` (Washington), soit un aller-retour transatlantique par
requête dynamique.

## Raisons du choix

1. **La page la plus visitée est déjà statique.** `<FeaturedArticles />` ayant été
   retiré de la page d'accueil, celle-ci ne lit plus Sanity et se construit en
   statique. Les seules routes dynamiques sont `/blog` et `/sitemap.xml`, à faible
   trafic.
2. **L'option B réintroduit un mode de panne silencieux** — exactement celui qui a
   motivé cette investigation. Si le webhook est mal configuré ou échoue, les pages
   se figent sans erreur visible. Le rendu dynamique, lui, ne peut pas devenir
   obsolète.
3. **Les previews resteraient cassées.** Un webhook pointe vers une seule URL ; les
   déploiements de preview ne seraient pas revalidés.
4. **Le gain mesuré est faible** et sera en grande partie récupéré gratuitement en
   changeant la région des fonctions Vercel.

## Conséquences

- `/blog` et `/sitemap.xml` interrogent Sanity à chaque requête (via le CDN Sanity).
- Toute nouvelle route lisant Sanity doit soit être dynamique, soit être couverte
  par une stratégie de revalidation explicite. Sans quoi elle se figera au build.
- Les commentaires `force-dynamic` dans le code renvoient à cette note ; ne pas les
  retirer au nom de la performance sans relire ce qui précède.

## À revoir si

- La région des fonctions Vercel passe en `cdg1`/`fra1` et le TTFB reste jugé trop
  élevé après nouvelle mesure.
- Le trafic augmente au point que les requêtes Sanity par vue posent un problème de
  quota.
- Du contenu Sanity est réintroduit sur la page d'accueil, qui redeviendrait alors
  dynamique — le calcul changerait, car il s'agirait de la page la plus visitée.
