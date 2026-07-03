const items = [
  { index: "1", label: "20+ ans d'expérience" },
  { index: "2", label: "Conseil indépendant" },
  { index: "3", label: "Réactivité en cas de sinistre" },
  { index: "4", label: "Particuliers, indépendants et entreprises" },
  { index: "5", label: "FSMA agréé" },
]

export default function TrustBar() {
  return (
    <section
      aria-label="Nos engagements"
      className="reveal border-y border-border"
    >
      <div className="container">
        <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5">
          {items.map((item, i) => (
            <li
              key={item.index}
              className={`flex items-baseline gap-3 py-5 sm:px-6 lg:py-7 ${
                i > 0 ? "lg:border-l lg:border-border" : "lg:pl-0"
              }`}
            >
              <span className="text-sm text-accent">{item.index}.</span>
              <span className="text-[0.8rem] font-medium uppercase tracking-[0.14em] text-foreground/70">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
