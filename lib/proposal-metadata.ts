import type { Metadata } from "next"
import { siteConfig, canonicalSiteUrl } from "@/content/site"

const canonicalBase = canonicalSiteUrl

export const PROPOSAL_OG_IMAGE_PATH = siteConfig.linkPreviewImage
export const PROPOSAL_OG_IMAGE_URL = `${canonicalBase}${PROPOSAL_OG_IMAGE_PATH}`

const celebrant = siteConfig.celebrant.nickname

export function buildProposalMetadata(options?: {
  roleTitle?: string
  path?: string
}): Metadata {
  const roleTitle = options?.roleTitle
  const path = options?.path ?? "/will-you-be-proposal"
  const url = `${canonicalBase}${path}`

  const title = roleTitle
    ? `Will You Be ${roleTitle}?`
    : "Will You Be Part of My Debut?"

  const description = roleTitle
    ? `${celebrant} would love for you to be ${/^One of My/i.test(roleTitle) ? roleTitle.replace(/^One of My/i, "one of her") : `her ${roleTitle}`} at her debut. Open this special invitation and share your response.`
    : `${celebrant} has a special debut invitation for you. Open your link to view it and respond.`

  const ogTitle = `${title} | ${celebrant}'s Debut`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: `${celebrant}'s Debut`,
      locale: "en_PH",
      type: "website",
      images: [
        {
          url: PROPOSAL_OG_IMAGE_URL,
          secureUrl: PROPOSAL_OG_IMAGE_URL,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: roleTitle
            ? `Will you be ${roleTitle}? — ${celebrant}'s Debut`
            : `${celebrant}'s Debut`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [PROPOSAL_OG_IMAGE_URL],
    },
  }
}
