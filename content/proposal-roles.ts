import type { ProposalRoleDefinition } from "@/lib/proposal-types"

/**
 * Proposal invite roles — edit this file to add, remove, or update roles.
 * `roleCategory` must match the RoleCategory column in your entourage Google Sheet.
 *
 * Debut roles: 18 Roses, 18 Treasures, 18 Cheers, 18 Candles, Escort, Cotillion.
 */
export const proposalRoleDefinitions: ProposalRoleDefinition[] = [
  {
    id: "18-roses",
    title: "One of My 18 Roses",
    category: "Entourage",
    type: "entourage",
    roleCategory: "18 Roses",
    description:
      "To offer a single red rose and share a dance with me — one of the eighteen gentlemen who have guarded, guided, and cheered me on as I step into this new chapter of my life.",
  },
  {
    id: "18-treasures",
    title: "One of My 18 Treasures",
    category: "Entourage",
    type: "entourage",
    roleCategory: "18 Treasures",
    description:
      "To present a treasure and a few words from your heart — a keepsake I will carry with me long after the night ends, from someone whose presence has shaped who I am.",
  },
  {
    id: "18-cheers",
    title: "One of My 18 Cheers",
    category: "Entourage",
    type: "entourage",
    roleCategory: "18 Cheers",
    description:
      "To raise a glass and share a toast, a memory, or a wish for my future — lifting the night with your words as I turn eighteen.",
  },
  {
    id: "18-candles",
    title: "One of My 18 Candles",
    category: "Entourage",
    type: "entourage",
    roleCategory: "18 Candles",
    description:
      "To light a candle and share a wish for me — one of the eighteen ladies whose warmth, wisdom, and friendship have lit my way to this moment.",
  },
  {
    id: "escort",
    title: "Escort",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Escort",
    description:
      "To walk beside me as I make my entrance and stay by my side through the night — a steady arm and a familiar smile on one of the most important evenings of my life.",
  },
  {
    id: "cotillion",
    title: "Cotillion Dancer",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Cotillion",
    description:
      "To dance the cotillion with me — learning the steps together and opening my debut with grace, elegance, and a little bit of magic.",
  },
]

/** Legacy proposal URLs that should still open the correct role. */
export const proposalRoleIdAliases: Record<string, string> = {
  roses: "18-roses",
  treasures: "18-treasures",
  cheers: "18-cheers",
  candles: "18-candles",
}
