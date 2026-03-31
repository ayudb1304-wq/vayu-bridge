import type { Metadata } from "next"
import { Hero } from "@/components/landing/hero"
import { PainSection } from "@/components/landing/pain-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { PricingSection } from "@/components/landing/pricing-section"
import { BlogSection } from "@/components/landing/blog-section"
import { getLivePosts } from "@/lib/posts"

export const metadata: Metadata = {
  title: "VayuBridge — Break Free from Airtable Limits",
  description:
    "VayuBridge syncs your Airtable base to a real PostgreSQL database — removing the 50,000-record cap, 50-automation limit, and API rate restrictions without changing how your team works.",
  alternates: { canonical: "https://vayubridge.com" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://vayubridge.com/#organization",
      name: "VayuBridge",
      url: "https://vayubridge.com",
      description:
        "Middleware SaaS that syncs Airtable data to PostgreSQL and removes record, automation, and API limits.",
    },
    {
      "@type": "WebSite",
      "@id": "https://vayubridge.com/#website",
      url: "https://vayubridge.com",
      name: "VayuBridge",
      publisher: { "@id": "https://vayubridge.com/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      name: "VayuBridge",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
        { "@type": "Offer", name: "Growth", price: "29", priceCurrency: "USD" },
        { "@type": "Offer", name: "Scale", price: "79", priceCurrency: "USD" },
      ],
      description:
        "Sync Airtable to PostgreSQL and remove record caps, automation limits, and API rate restrictions without migrating your team away from Airtable.",
    },
  ],
}

export default function LandingPage() {
  const livePosts = getLivePosts()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <PainSection />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <BlogSection posts={livePosts} />
    </>
  )
}
