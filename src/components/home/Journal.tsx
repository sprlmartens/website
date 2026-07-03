const posts = [
  {
    category: 'Pension',
    date: 'Juin 2026',
    title: 'PLCI, EIP, épargne-pension : que choisir quand on est indépendant ?',
    excerpt:
      'Trois piliers, trois fiscalités. Comment les combiner intelligemment selon votre âge et vos revenus.',
  },
  {
    category: 'Habitation',
    date: 'Mai 2026',
    title: 'Inondations : ce que votre assurance incendie couvre (vraiment)',
    excerpt:
      'Depuis les inondations de la Vesdre, les questions affluent. Le point sur les garanties et leurs limites.',
  },
  {
    category: 'Mobilité',
    date: 'Avril 2026',
    title: 'Voiture électrique : faut-il adapter votre contrat auto ?',
    excerpt:
      'Batterie, borne de recharge, assistance : les points à vérifier avant de passer à l’électrique.',
  },
]

export default function Journal() {
  return (
    <section aria-label="Le journal" className="border-t border-ink/10">
      <div className="container py-24 lg:py-32">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Le journal
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-stone-500">
            Des réponses claires aux questions que nos clients nous posent vraiment.
          </p>
        </div>

        <div className="reveal mt-12">
          {posts.map((post) => (
            <article key={post.title} className="group border-t border-ink/10 last:border-b">
              <a href="#contact" className="grid grid-cols-1 gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-6">
                <div className="flex items-baseline gap-4 md:col-span-3 md:block">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {post.category}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400 md:mt-2">
                    {post.date}
                  </p>
                </div>
                <h3 className="font-display text-xl font-medium leading-snug tracking-tight text-ink transition-colors group-hover:text-navy-600 sm:text-2xl md:col-span-6">
                  {post.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-500 md:col-span-3">
                  {post.excerpt}
                  <span
                    aria-hidden
                    className="ml-2 inline-block text-accent opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  >
                    →
                  </span>
                </p>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
