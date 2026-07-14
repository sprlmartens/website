"use client"

import { Mail } from "lucide-react"
import type { SVGProps } from "react"

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.559V9h3.555v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.05 0C5.495 0 .17 5.316.168 11.85c0 2.09.546 4.13 1.583 5.928L.057 24l6.377-1.65a11.9 11.9 0 0 0 5.612 1.428h.005c6.554 0 11.88-5.317 11.883-11.85 0-3.166-1.232-6.144-3.472-8.382A11.822 11.822 0 0 0 12.05 0zm0 21.667h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.968.999-3.648-.235-.374a9.847 9.847 0 0 1-1.51-5.271c.002-5.45 4.435-9.881 9.887-9.881a9.83 9.83 0 0 1 6.988 2.898 9.813 9.813 0 0 1 2.895 6.985c-.003 5.45-4.435 9.915-9.887 9.915z" />
    </svg>
  )
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.061C22 6.505 17.523 2 12 2S2 6.505 2 12.061c0 5.022 3.657 9.184 8.438 9.939v-7.03H7.898v-2.909h2.54V9.845c0-2.526 1.492-3.921 3.777-3.921 1.094 0 2.238.197 2.238.197v2.476h-1.26c-1.243 0-1.63.775-1.63 1.57v1.884h2.773l-.443 2.909h-2.33V22c4.78-.755 8.437-4.917 8.437-9.939z" />
    </svg>
  )
}

type ShareButtonsProps = {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const shareLinks = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offer/?url=${encodeURIComponent(url)}`,
      icon: LinkedInIcon,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: WhatsAppIcon,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: FacebookIcon,
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
      icon: Mail,
    },
  ]

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Partager :</span>
      {shareLinks.map(({ name, href, icon: Icon }) => (
        <a
          key={name}
          href={href}
          target={name === "Email" ? undefined : "_blank"}
          rel={name === "Email" ? undefined : "noopener noreferrer"}
          aria-label={`Partager sur ${name}`}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon className="size-5" />
        </a>
      ))}
    </div>
  )
}
