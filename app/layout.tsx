import type { Metadata } from "next"
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  metadataBase: new URL("https://vayubridge.com"),
  title: {
    default: "VayuBridge — Break Free from Airtable Limits",
    template: "%s | VayuBridge",
  },
  description:
    "Sync your Airtable data to a real PostgreSQL database and unlock unlimited records, automations, and API access — without leaving Airtable.",
  keywords: [
    "airtable record limit",
    "airtable automation limit",
    "airtable 50000 records",
    "airtable postgresql sync",
    "airtable middleware",
    "remove airtable limits",
    "airtable alternative",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "VayuBridge — Break Free from Airtable Limits",
    description:
      "Remove Airtable's record caps, automation limits, and API restrictions. Keep your existing bases. No migration required.",
    type: "website",
    url: "https://vayubridge.com",
    siteName: "VayuBridge",
  },
  twitter: {
    card: "summary_large_image",
    title: "VayuBridge — Break Free from Airtable Limits",
    description:
      "Remove Airtable's record caps, automation limits, and API restrictions. Keep your existing bases. No migration required.",
  },
  alternates: {
    canonical: "https://vayubridge.com",
  },
}

const geistMonoHeading = Geist_Mono({ subsets: ["latin"], variable: "--font-heading" })

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        jetbrainsMono.variable,
        geistMonoHeading.variable,
      )}
    >
      <body className="font-sans" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
