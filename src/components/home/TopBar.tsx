import { Mail, MapPin, MessageCircle, PhoneCall } from "lucide-react"

export default function TopBar() {
  return (
    <div className="bg-primary text-white">
      <div className="container flex h-10 items-center justify-between gap-6 text-sm font-medium">
        <div className="flex items-center gap-6">
          <a
            href="tel:+3242461363"
            className="flex items-center gap-2 transition-colors hover:text-navy-200"
          >
            <PhoneCall className="h-3.5 w-3.5 shrink-0" />
            +32 4 246 13 63
          </a>
          <a
            href="https://wa.me/32470231036"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-navy-200"
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0" />
            WhatsApp 0470 23 10 36
          </a>
          <a
            href="mailto:assurances@sprlmartens.be"
            className="hidden items-center gap-2 transition-colors hover:text-navy-200 sm:flex"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" />
            assurances@sprlmartens.be
          </a>
        </div>

        <p className="hidden items-center gap-2 lg:flex">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          Rue François Lefebvre 10/B, 4000 Rocourt
        </p>
      </div>
    </div>
  )
}
