import type { SiteConfig } from "@/lib/site-config"

/** The celebrant's display name (nickname → full name). */
export function celebrantName(config: SiteConfig): string {
  const c = config.celebrant
  return c?.nickname || c?.fullName || config.couple.brideNickname || config.couple.bride
}

/** Replace {celebrant} (and the template's legacy {couple}) in config text. */
export function fillCelebrant(text: string, config: SiteConfig): string {
  const name = celebrantName(config)
  return text.split("{celebrant}").join(name).split("{couple}").join(name)
}
