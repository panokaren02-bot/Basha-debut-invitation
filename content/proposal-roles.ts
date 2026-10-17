import type { ProposalRoleDefinition } from "@/lib/proposal-types"

/**
 * Proposal invite roles — edit this file to add, remove, or update roles.
 * `roleCategory` must match the RoleCategory column in your entourage Google Sheet.
 *
 * Debut roles: 18 Roses, 18 Candles, 18 Cheers, 18 Treasure Gifts, 18 Monetary Gifts.
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
    id: "18-candles",
    title: "One of My 18 Candles",
    category: "Entourage",
    type: "entourage",
    roleCategory: "18 Candles",
    description:
      "To light a candle and share a wish for me — one of the eighteen ladies whose warmth, wisdom, and friendship have lit my way to this moment.",
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
    id: "18-treasures",
    title: "One of My 18 Treasure Gifts",
    category: "Entourage",
    type: "entourage",
    // Kept as "18 Treasures" so existing rows in the entourage sheet still match
    roleCategory: "18 Treasures",
    roleCategoryAliases: ["18 Treasure Gifts"],
    description:
      "To present a treasured gift and a few words from your heart — a keepsake I will carry with me long after the night ends, from someone whose presence has shaped who I am.",
  },
  {
    id: "18-monetary-gifts",
    title: "One of My 18 Monetary Gifts",
    category: "Entourage",
    type: "entourage",
    roleCategory: "18 Monetary Gifts",
    roleCategoryAliases: ["18 Bills", "Monetary Gift"],
    description:
      "To present a monetary gift with a blessing for my future — a token of love and encouragement as I take my first steps into adulthood and the dreams ahead of me.",
  },
]

/** Legacy proposal URLs that should still open the correct role. */
export const proposalRoleIdAliases: Record<string, string> = {
  roses: "18-roses",
  treasures: "18-treasures",
  cheers: "18-cheers",
  candles: "18-candles",
  "18-treasure-gifts": "18-treasures",
  "treasure-gifts": "18-treasures",
  monetary: "18-monetary-gifts",
  "monetary-gift": "18-monetary-gifts",
  "18-bills": "18-monetary-gifts",
}
