import { toPlainText, type PortableTextBlock } from "next-sanity"
import type { ArbitraryTypedObject } from "@portabletext/types"

export function portableTextToPlainText(
  blocks: (PortableTextBlock | ArbitraryTypedObject)[] | null | undefined,
  maxLength = 160
): string {
  const text = toPlainText(blocks ?? [])
    .replace(/\s+/g, " ")
    .trim()

  return text.length > maxLength
    ? `${text.slice(0, maxLength).trimEnd()}…`
    : text
}
