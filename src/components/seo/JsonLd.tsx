/**
 * Injecte un bloc de données structurées schema.org dans le HTML rendu côté
 * serveur, afin que Google le voie sans exécuter de JavaScript.
 *
 * Le `<` est échappé pour empêcher qu'une chaîne issue du contenu ne puisse
 * refermer la balise <script> prématurément.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
