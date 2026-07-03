export default function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-2xl font-semibold tracking-tight text-white">
              Martens
            </p>
            <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.18em]">
              Assurances &amp; Placements
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed">
              Courtier indépendant en assurances et en placements, au service des
              familles, des indépendants et des entreprises depuis plus de 20 ans.
            </p>
          </div>

          <nav aria-label="Pied de page" className="md:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Nos domaines
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#particuliers" className="rule-sweep">Particuliers &amp; familles</a></li>
              <li><a href="#independants" className="rule-sweep">Indépendants</a></li>
              <li><a href="#entreprises" className="rule-sweep">Entreprises</a></li>
              <li><a href="#sinistre" className="rule-sweep">Déclarer un sinistre</a></li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Bureau
            </p>
            <p className="mt-4 text-sm leading-relaxed">
              Chaussée de Tongres 240
              <br />
              4000 Rocourt (Liège)
              <br />
              <a href="tel:+3242630000" className="rule-sweep">04 263 00 00</a>
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-navy-300 sm:flex-row">
          <p>© {new Date().getFullYear()} Martens SPRL — Tous droits réservés.</p>
          <p>
            Courtier en assurances agréé FSMA n° 000000&nbsp;A — RPM Liège — BE&nbsp;0000.000.000
          </p>
        </div>
      </div>
    </footer>
  )
}
