#!/usr/bin/env node
/**
 * Vérifie que les URL de l'ancien site WordPress redirigent bien vers
 * leur équivalent sur le nouveau site.
 *
 * La liste ci-dessous provient des sitemaps Yoast de www.sprlmartens.be
 * (page-sitemap.xml, post-sitemap.xml, category-sitemap.xml, author-sitemap.xml)
 * relevés avant la migration. C'est la source de vérité : ne pas retirer
 * d'entrée sans vérifier que l'URL n'est plus indexée.
 *
 * Usage:
 *   node scripts/check-redirects.mjs                       # http://localhost:3000
 *   node scripts/check-redirects.mjs https://exemple.com   # cible déployée
 */

const BASE = (process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "")

/** @type {{from: string, to: string, status?: number, note?: string}[]} */
const cases = [
  // --- Articles WordPress (18 URL indexées) ---
  ...[
    ["/2022/08/code-orange/", "code-orange"],
    ["/2022/09/rentree-scolaire/", "rentree-scolaire"],
    ["/2022/09/srl-martens/", "srl-martens"],
    ["/2022/10/epargne-long-terme-fiscalement-deductible/", "epargne-long-terme-fiscalement-deductible"],
    ["/2022/10/la-sprl-martens-est-au-24h-2cv-de-francorchamps/", "la-sprl-martens-est-au-24h-2cv-de-francorchamps"],
    ["/2022/10/pensez-a-demain-des-aujourdhui/", "pensez-a-demain-des-aujourdhui"],
    ["/2022/10/protection-juridique/", "protection-juridique"],
    ["/2022/10/voiture-electrique/", "voiture-electrique"],
    ["/2022/10/vous-etes-inoubliable-mais-pas-eternel/", "vous-etes-inoubliable-mais-pas-eternel"],
    ["/2023/06/les-orages-arrivent/", "les-orages-arrivent"],
    ["/2023/10/la-famille-blaise-victorieuse-des-24hrs-2cv-de-francorchamps/", "la-famille-blaise-victorieuse-des-24hrs-2cv-de-francorchamps"],
    ["/2024/01/epargne-pension-la-bonne-resolution-de-debut-dannee/", "epargne-pension-la-bonne-resolution-de-debut-dannee"],
    ["/2025/10/quelques-secondes-qui-peuvent-tout-changer/", "quelques-secondes-qui-peuvent-tout-changer"],
    ["/2025/11/le-bon-dassurance-bon-pour-vos-economies/", "le-bon-dassurance-bon-pour-vos-economies"],
    ["/2025/12/diminuer-vos-impots-il-est-encore-temps-mais-ne-trainez-pas/", "diminuer-vos-impots-il-est-encore-temps-mais-ne-trainez-pas"],
    ["/2026/01/constituer-une-epargne-reguliere-pour-vos-enfants-ou-petits-enfants/", "constituer-une-epargne-reguliere-pour-vos-enfants-ou-petits-enfants"],
    ["/2026/05/dela-une-protection-contre-les-frais-funeraires-et-une-aide-administrative/", "dela-une-protection-contre-les-frais-funeraires-et-une-aide-administrative"],
    ["/2026/05/un-accident-de-voiture-que-faut-il-faire-que-prevoir/", "un-accident-de-voiture-que-faut-il-faire-que-prevoir"],
  ].map(([from, slug]) => ({
    from,
    to: `/blog/${slug}`,
    // La cible doit répondre 200. Tant que l'article n'est pas migré dans
    // Sanity, elle renvoie 404 : la redirection est correcte mais le contenu
    // manque, ce qui est signalé comme AVERTISSEMENT (et non comme succès).
    status: 200,
    warnIf404: "article non migré dans Sanity",
  })),

  // --- Index d'actualités ---
  { from: "/notre-actualite/", to: "/blog", status: 200 },
  { from: "/actualites/", to: "/blog", status: 200 },

  // --- Taxonomies WordPress ---
  { from: "/category/non-classe/", to: "/blog", status: 200 },
  { from: "/author/olivier/", to: "/blog", status: 200 },
  { from: "/author/srlmartens/", to: "/blog", status: 200 },

  // --- Page conservée (normalisation du slash final uniquement) ---
  { from: "/contact/", to: "/contact", status: 200 },

  // --- Page d'exemple WordPress : 404 volontaire, ne pas rediriger ---
  { from: "/page-d-exemple/", to: "/page-d-exemple", status: 404, note: "404 attendu" },
]

/** Suit la chaîne de redirections et renvoie le parcours complet. */
async function trace(path, maxHops = 10) {
  const hops = []
  let url = BASE + path

  for (let i = 0; i < maxHops; i++) {
    const res = await fetch(url, { redirect: "manual" })
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location")
      if (!location) break
      hops.push(res.status)
      url = new URL(location, url).toString()
      continue
    }
    return { finalUrl: url, finalStatus: res.status, hops }
  }
  return { finalUrl: url, finalStatus: null, hops, error: "trop de redirections" }
}

const results = []
for (const c of cases) {
  const { finalUrl, finalStatus, hops, error } = await trace(c.from)
  const finalPath = decodeURIComponent(new URL(finalUrl).pathname)

  const pathOk = finalPath === c.to && !error
  const statusOk = finalStatus === c.status

  // La redirection elle-même est bonne, mais la cible n'existe pas encore.
  const warn = pathOk && !statusOk && finalStatus === 404 && Boolean(c.warnIf404)

  results.push({
    ...c,
    finalPath,
    finalStatus,
    hops,
    error,
    warn,
    ok: pathOk && (statusOk || warn),
  })
}

const pad = (s, n) => String(s).padEnd(n)
const width = Math.max(...results.map((r) => r.from.length)) + 2
const failures = results.filter((r) => !r.ok)
const warnings = results.filter((r) => r.warn)

console.log(`\nVérification des redirections — ${BASE}\n`)
console.log(pad("", 3) + pad("source", width) + pad("hops", 8) + pad("statut", 8) + "destination")
console.log("-".repeat(width + 60))
for (const r of results) {
  const mark = !r.ok ? "✗" : r.warn ? "!" : "✓"
  console.log(
    pad(mark, 3) +
      pad(r.from, width) +
      pad(r.hops.join("→") || "-", 8) +
      pad(r.error ?? r.finalStatus, 8) +
      r.finalPath +
      (r.note ? `  (${r.note})` : "")
  )
}
console.log("-".repeat(width + 60))

const passed = results.filter((r) => r.ok && !r.warn).length
console.log(`${passed} OK · ${warnings.length} avertissement(s) · ${failures.length} échec(s)\n`)

if (warnings.length > 0) {
  console.warn(`! ${warnings.length} redirection(s) correcte(s) mais pointant vers un 404 :`)
  for (const w of warnings) console.warn(`    ${w.from} → ${w.finalPath}  (${w.warnIf404})`)
  console.warn("  La redirection fonctionne ; c'est le contenu cible qui manque.\n")
}

if (failures.length > 0) {
  console.error("✗ Redirections cassées :")
  for (const f of failures) {
    console.error(`    ${f.from}`)
    console.error(`      attendu : ${f.to} (${f.status})`)
    console.error(`      obtenu  : ${f.finalPath} (${f.error ?? f.finalStatus})`)
  }
  process.exit(1)
}
