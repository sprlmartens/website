import React from "react"
import { draftMode } from "next/headers"
import { VisualEditing } from "next-sanity/visual-editing"

import { DisableDraftMode } from "@/components/disable-draft-mode"
import { SanityLive } from "@/sanity/lib/live"

import Header from "@/components/home/Header"
import Footer from "@/components/home/Footer"

import "./globals.css"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <div className="min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
      <SanityLive />
      {isDraftMode && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
    </div>
  )
}
