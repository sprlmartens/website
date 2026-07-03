export default function Manifesto() {
  return (
    <section id="manifeste" className="bg-primary text-white">
      <div className="container py-24 lg:py-36">
        <h2 className="reveal mt-14 max-w-5xl font-display text-3xl font-medium leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.5rem]">
          Une assurance n&rsquo;est pas un contrat.
          <br />
          C&rsquo;est une promesse, et une promesse
          <br className="hidden lg:block" /> mérite{" "}
          <span className="pen-underline">un conseiller</span>, pas un call
          center.
        </h2>

        <div className="reveal mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 lg:mt-20 lg:ml-[16.66%] lg:gap-12">
          <div>
            <p className="text-base font-medium text-accent">01</p>
            <h3 className="mt-3 text-base font-semibold">
              Le contrat ne suffit pas
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Les petites lignes ne protègent personne. Ce qui protège,
              c&rsquo;est de comprendre votre situation, vos risques réels, et
              de choisir en connaissance de cause. Notre métier commence là.
            </p>
          </div>
          <div>
            <p className="text-base font-medium text-accent">02</p>
            <h3 className="mt-3 text-base font-semibold">
              Le conseil change tout
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Une vie change : un enfant, une maison, une activité, une
              transmission. À chaque étape, les bonnes décisions de protection
              et de placement se prennent avec quelqu&rsquo;un qui vous connaît.
            </p>
          </div>
          <div>
            <p className="text-base font-medium text-accent">03</p>
            <h3 className="mt-3 text-base font-semibold">
              L&rsquo;indépendance vous protège
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Nous ne vendons les produits d&rsquo;aucune compagnie en
              particulier. Nous comparons le marché et négocions pour vous.
              Quand les intérêts divergent, nous sommes de votre côté.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
