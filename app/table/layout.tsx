import type { Metadata } from "next"
import { siteConfig, canonicalSiteUrl } from "@/content/site"
import { TABLE_FINDER_PATH } from "@/lib/table-finder"

const canonicalUrl = `${canonicalSiteUrl}${TABLE_FINDER_PATH}`
const celebrant = siteConfig.celebrant.nickname

export const metadata: Metadata = {
  title: "Find Your Table",
  description: `Search your name to find your table at ${celebrant}'s debut.`,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `Find Your Table | ${celebrant}'s Debut`,
    description: `Search your name to find your table at ${celebrant}'s debut.`,
    url: canonicalUrl,
    siteName: `${celebrant}'s Debut`,
    locale: "en_PH",
    type: "website",
  },
}

export default function TableFinderLayout({ children }: { children: React.ReactNode }) {
  return children
}
