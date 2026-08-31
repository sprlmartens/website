"use client"

import { Button } from "@/components/ui/button"

type QuoteDraftBannerProps = {
  savedAt: number
  onRestore: () => void
  onDiscard: () => void
}

export function QuoteDraftBanner({
  savedAt,
  onRestore,
  onDiscard,
}: QuoteDraftBannerProps) {
  const date = new Date(savedAt)
  const formatted = `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")} à ${String(date.getHours()).padStart(2, "0")}h${String(
    date.getMinutes()
  ).padStart(2, "0")}`

  return (
    <div
      role="status"
      className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
    >
      <p className="text-sm text-foreground">
        Une demande commencée le {formatted} a été retrouvée sur cet appareil.
      </p>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={onRestore}>
          Reprendre
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDiscard}>
          Recommencer
        </Button>
      </div>
    </div>
  )
}
