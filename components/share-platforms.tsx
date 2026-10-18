"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Check, Copy, ExternalLink, Instagram, Link2, Mail, MessageSquare, Share2, X } from "lucide-react"

export type SharePlatformId =
  | "messenger"
  | "viber"
  | "telegram"
  | "whatsapp"
  | "instagram"
  | "tiktok"
  | "x"
  | "email"
  | "sms"

export type SharePayload = {
  /** Full invite message (already includes the link). */
  text: string
  /** Personal invite link on its own. */
  url: string
  /** Email subject line. */
  subject: string
}

type SharePlatform = {
  id: SharePlatformId
  label: string
  /** Tile background (brand color or gradient). */
  background: string
  icon: ReactNode
  /** True when the app can't receive pre-filled text, so the guest's message must be pasted. */
  pasteOnly?: boolean
  /**
   * Phones: go through the system share menu instead of a deep link. Messenger's old
   * `fb-messenger://share` link only opens the app's home screen now, while the share menu
   * hands Messenger the full message and lets you pick the recipient.
   */
  nativeShareOnMobile?: boolean
  getHref: (payload: SharePayload, mobile: boolean) => string
  /** Shown if an app link (viber:, sms:, mailto:…) doesn't seem to open anything. */
  getFallback?: (payload: SharePayload, mobile: boolean) => { note: string; label?: string; href?: string }
}

const enc = encodeURIComponent

const isIOS = () => typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent)

/** Phones and tablets (iPadOS reports a Mac user agent, so check for touch too). */
export const isMobileDevice = () =>
  typeof navigator !== "undefined" &&
  (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1))

const ICON = "h-6 w-6"

export const SHARE_PLATFORMS: SharePlatform[] = [
  {
    id: "messenger",
    label: "Messenger",
    background: "linear-gradient(135deg, #0099FF 0%, #A033FF 60%, #FF5280 100%)",
    pasteOnly: true,
    nativeShareOnMobile: true,
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} aria-hidden="true">
        <path
          fill="#fff"
          d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.13.26.35.27.57l.05 1.78c.04.57.61.94 1.13.71l1.98-.87c.17-.07.36-.09.53-.04.9.25 1.87.38 2.9.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2z"
        />
        <path
          fill="#7B4DFF"
          d="m6 14.5 2.94-4.66a1.5 1.5 0 0 1 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63l-2.94 4.66a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63z"
        />
      </svg>
    ),
    getHref: ({ url }, mobile) => (mobile ? `fb-messenger://share/?link=${enc(url)}` : "https://www.messenger.com/"),
    getFallback: () => ({
      note: "Messenger didn't open? Open it in your browser and paste the message.",
      label: "Open messenger.com",
      href: "https://www.messenger.com/",
    }),
  },
  {
    id: "viber",
    label: "Viber",
    background: "#7360F2",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} aria-hidden="true" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.6c-4.9 0-8.6 2.4-8.6 8.1 0 3 1 4.9 2.8 6v3.7l3-2.4c.9.2 1.8.2 2.8.2 4.9 0 8.6-2.4 8.6-7.5 0-5.7-3.7-8.1-8.6-8.1z" />
        <path fill="#fff" stroke="none" d="M9.4 6.9c.3-.2.7-.1.9.2l.9 1.4c.2.3.1.7-.1.9l-.5.4c-.2.2-.2.4-.1.6.5 1 1.3 1.8 2.3 2.3.2.1.4.1.6-.1l.4-.5c.2-.3.6-.3.9-.1l1.4.9c.3.2.4.6.2.9-.4.7-1.1 1.2-1.9 1-2.6-.6-4.6-2.6-5.2-5.2-.2-.8.3-1.5 1-1.9z" />
        <path d="M13 5.8a3.6 3.6 0 0 1 3.2 3.2M13 7.6c.8.2 1.4.8 1.6 1.6" />
      </svg>
    ),
    getHref: ({ text }) => `viber://forward?text=${enc(text)}`,
    getFallback: (_, mobile) => ({
      note: mobile
        ? "Viber didn't open? Make sure the Viber app is installed."
        : "Viber didn't open? It needs the Viber Desktop app on this computer — or send it from your phone.",
      label: "Get Viber",
      href: "https://www.viber.com/en/download/",
    }),
  },
  {
    id: "telegram",
    label: "Telegram",
    background: "#229ED9",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} aria-hidden="true">
        <path
          fill="#fff"
          d="M21.2 3.6 2.9 10.7c-1.1.4-1.1 1.9.1 2.2l4.5 1.4 1.7 5.4c.3 1 1.5 1.2 2.1.5l2.5-2.5 4.7 3.5c.8.6 1.9.1 2.1-.9l3.2-15.1c.2-1.1-.8-2-1.9-1.6zM9.6 14.2l8.3-7.4-6.6 8.7-.3 3-1.4-4.3z"
        />
      </svg>
    ),
    getHref: ({ text, url }) => `https://t.me/share/url?url=${enc(url)}&text=${enc(text.replace(url, "").trim())}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    background: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} aria-hidden="true">
        <path
          fill="#fff"
          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"
        />
      </svg>
    ),
    getHref: ({ text }, mobile) =>
      mobile ? `https://wa.me/?text=${enc(text)}` : `https://web.whatsapp.com/send?text=${enc(text)}`,
  },
  {
    id: "instagram",
    label: "Instagram",
    background: "linear-gradient(45deg, #FEDA75 0%, #FA7E1E 25%, #D62976 55%, #962FBF 80%, #4F5BD5 100%)",
    pasteOnly: true,
    icon: <Instagram className={`${ICON} text-white`} strokeWidth={2} />,
    getHref: () => "https://www.instagram.com/direct/inbox/",
  },
  {
    id: "tiktok",
    label: "TikTok",
    background: "#000",
    pasteOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" aria-hidden="true">
        <path
          fill="#fff"
          d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
        />
      </svg>
    ),
    getHref: () => "https://www.tiktok.com/messages",
  },
  {
    id: "x",
    label: "X",
    background: "#000",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#fff"
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        />
      </svg>
    ),
    getHref: ({ text }) => `https://x.com/messages/compose?text=${enc(text)}`,
  },
  {
    id: "email",
    label: "Email",
    background: "#EA4335",
    icon: <Mail className={`${ICON} text-white`} strokeWidth={2} />,
    getHref: ({ text, subject }) => `mailto:?subject=${enc(subject)}&body=${enc(text)}`,
    getFallback: ({ text, subject }) => ({
      note: "No email app opened? Write it in Gmail instead — the message is filled in.",
      label: "Open Gmail",
      href: `https://mail.google.com/mail/?view=cm&fs=1&su=${enc(subject)}&body=${enc(text)}`,
    }),
  },
  {
    id: "sms",
    label: "Message",
    background: "#34C759",
    icon: <MessageSquare className={`${ICON} fill-white text-white`} strokeWidth={2} />,
    // iOS expects `sms:&body=`, Android expects `sms:?body=`
    getHref: ({ text }) => (isIOS() ? `sms:&body=${enc(text)}` : `sms:?body=${enc(text)}`),
    getFallback: (_, mobile) => ({
      note: mobile
        ? "Messages didn't open? Open your messaging app and paste the message."
        : "This computer can't send text messages. Use Copy, then send it from your phone.",
    }),
  },
]

/**
 * Copies synchronously so the clipboard is filled before the app takes over the page
 * (the async Clipboard API can be cut off when we navigate to an app scheme right after).
 */
export function copyTextNow(text: string): boolean {
  let copied = false
  try {
    const area = document.createElement("textarea")
    area.value = text
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.opacity = "0"
    area.style.fontSize = "16px" // stops iOS zooming in
    document.body.appendChild(area)
    area.select()
    area.setSelectionRange(0, text.length)
    copied = document.execCommand("copy")
    document.body.removeChild(area)
  } catch {
    /* fall through to the Clipboard API */
  }
  navigator.clipboard?.writeText(text).catch(() => {})
  return copied || !!navigator.clipboard
}

export type SharePlatformItem = (typeof SHARE_PLATFORMS)[number]

/**
 * Copies the whole invite, then opens the app — the guest only has to pick who to send it to
 * (and paste, for apps that can't be pre-filled).
 * Must run synchronously inside the click handler so browsers don't block the open.
 * Calls `onNotOpened` when an app link (viber:, sms:, mailto:…) doesn't take the page away.
 */
export function openSharePlatform(platform: SharePlatformItem, payload: SharePayload, onNotOpened?: () => void) {
  copyTextNow(payload.text)
  const mobile = isMobileDevice()
  const href = platform.getHref(payload, mobile)
  if (href.startsWith("http")) {
    window.open(href, "_blank", "noopener,noreferrer")
    return
  }

  // App links give no success signal, so watch for the page losing focus instead.
  let left = false
  const markLeft = () => {
    left = true
  }
  const onVisibility = () => document.visibilityState === "hidden" && markLeft()
  window.addEventListener("blur", markLeft, { once: true })
  document.addEventListener("visibilitychange", onVisibility)
  window.location.href = href
  window.setTimeout(() => {
    window.removeEventListener("blur", markLeft)
    document.removeEventListener("visibilitychange", onVisibility)
    if (!left) onNotOpened?.()
  }, 1800)
}

type AppTileProps = {
  label: string
  background: string
  icon: ReactNode
  active?: boolean
  onClick: () => void
  ariaLabel: string
}

function AppTile({ label, background, icon, active, onClick, ariaLabel }: AppTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="group relative flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-1.5 rounded-2xl px-1 py-2 outline-none transition-colors hover:bg-dash-surface focus-visible:ring-2 focus-visible:ring-dash-accent sm:w-auto"
    >
      <span
        className="relative flex h-[3.25rem] w-[3.25rem] items-center justify-center overflow-hidden rounded-[17px] shadow-[0_6px_14px_-8px_rgba(0,0,0,0.55)] transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-95"
        style={{ background }}
      >
        {/* soft top highlight, like an app icon */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
        <span className="relative">{icon}</span>
      </span>
      <span className="w-full truncate text-center text-[11px] font-medium text-dash-ink">{label}</span>
      {active && (
        <span className="absolute right-2 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-dash-accent text-white ring-2 ring-white">
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

type ShareSheetProps = {
  open: boolean
  onClose: () => void
  guestName: string
  roleTitle: string
  payload: SharePayload
  /** Browser supports the system share sheet (navigator.share). */
  canNativeShare: boolean
}

type ShareStatus = { platformId: SharePlatformId | "copy" | "link"; notOpened?: boolean; viaShareMenu?: boolean }

/** "Share invite" sheet: bottom sheet on phones, centered dialog on desktop. */
export function ShareSheet({ open, onClose, guestName, roleTitle, payload, canNativeShare }: ShareSheetProps) {
  const [status, setStatus] = useState<ShareStatus | null>(null)
  const [mobile, setMobile] = useState(false)
  const clearTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    setMobile(isMobileDevice())
  }, [])

  useEffect(() => {
    if (!open) setStatus(null)
  }, [open])

  useEffect(() => () => window.clearTimeout(clearTimer.current), [])

  if (!open) return null

  const flash = (next: ShareStatus, ms = 8000) => {
    setStatus(next)
    window.clearTimeout(clearTimer.current)
    clearTimer.current = window.setTimeout(() => setStatus(null), ms)
  }

  const handleApp = (platform: SharePlatformItem) => {
    if (mobile && platform.nativeShareOnMobile && canNativeShare) {
      copyTextNow(payload.text)
      flash({ platformId: platform.id, viaShareMenu: true }, 15000)
      navigator.share({ text: payload.text }).catch(() => {
        /* share cancelled — nothing to do */
      })
      return
    }
    flash({ platformId: platform.id })
    openSharePlatform(platform, payload, () => flash({ platformId: platform.id, notOpened: true }, 15000))
  }

  const handleCopy = (what: "copy" | "link") => {
    copyTextNow(what === "copy" ? payload.text : payload.url)
    flash({ platformId: what }, 3000)
  }

  const handleNativeShare = async () => {
    try {
      await navigator.share({ text: payload.text })
    } catch {
      /* share cancelled — nothing to do */
    }
  }

  const activePlatform = SHARE_PLATFORMS.find((p) => p.id === status?.platformId)
  const fallback = activePlatform && status?.notOpened ? activePlatform.getFallback?.(payload, mobile) : undefined
  const firstName = guestName.split(/\s+/)[0] || guestName
  const initials = guestName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" onClick={onClose}>
      <div className="dash-share-backdrop absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Share invite with ${guestName}`}
        onClick={(e) => e.stopPropagation()}
        className="dash-share-panel relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-16px_40px_-20px_rgba(0,0,0,0.5)] sm:max-w-[30rem] sm:rounded-3xl sm:shadow-2xl"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-dash-border sm:hidden" />

        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-3 sm:px-6 sm:pt-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dash-primary text-sm font-semibold tracking-wide text-white">
            {initials || "?"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-tight text-dash-ink">Share invite</p>
            <p className="mt-0.5 truncate text-[12.5px] text-gray-500">
              To <span className="font-medium text-dash-text">{guestName}</span> · {roleTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dash-surface text-dash-text transition-colors hover:bg-dash-tint"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {/* Steps */}
          <ol className="mx-5 flex items-center gap-1.5 rounded-xl bg-dash-surface px-3 py-2 text-[11.5px] text-dash-text sm:mx-6">
            {["Tap an app", `Pick ${firstName}`, "Send"].map((step, i) => (
              <li key={step} className="flex min-w-0 items-center gap-1.5">
                {i > 0 && <span className="text-dash-border">›</span>}
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-dash-primary ring-1 ring-dash-border">
                  {i + 1}
                </span>
                <span className="truncate">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mx-5 mt-2 text-[11px] text-gray-500 sm:mx-6">
            The message copies automatically, so you can paste it if the app doesn&apos;t fill it in.
          </p>

          {/* Apps: swipe row on phones, grid on desktop */}
          <div className="relative mt-3">
            <div className="dash-app-row flex snap-x snap-mandatory overflow-x-auto scroll-px-3 px-3 sm:grid sm:grid-cols-5 sm:gap-y-1 sm:overflow-visible sm:px-5">
              {SHARE_PLATFORMS.map((platform) => (
                <AppTile
                  key={platform.id}
                  label={platform.label}
                  background={platform.background}
                  icon={platform.icon}
                  active={status?.platformId === platform.id}
                  onClick={() => handleApp(platform)}
                  ariaLabel={`Copy message and open ${platform.label}`}
                />
              ))}
              <AppTile
                label={status?.platformId === "copy" ? "Copied!" : "Copy"}
                background="#F1F1F1"
                icon={
                  status?.platformId === "copy" ? (
                    <Check className="h-6 w-6 text-dash-accent" strokeWidth={2.5} />
                  ) : (
                    <Copy className="h-6 w-6 text-neutral-700" strokeWidth={2} />
                  )
                }
                onClick={() => handleCopy("copy")}
                ariaLabel="Copy message"
              />
              {/* breathing room after the last tile when swiping */}
              <span className="w-2 shrink-0 sm:hidden" aria-hidden="true" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent sm:hidden" />
          </div>

          {/* Status */}
          <div aria-live="polite" className="mx-5 sm:mx-6">
            {status && (
              <div
                className={`mt-3 flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-[12px] leading-snug ${
                  status.notOpened ? "border-amber-200 bg-amber-50 text-amber-900" : "border-dash-border bg-dash-surface text-dash-text"
                }`}
              >
                {activePlatform ? (
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4"
                    style={{ background: activePlatform.background }}
                  >
                    {activePlatform.icon}
                  </span>
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-dash-accent text-white">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  {status.platformId === "copy" && (
                    <p>
                      <span className="font-semibold text-dash-ink">Message copied!</span> Paste it into any chat.
                    </p>
                  )}
                  {status.platformId === "link" && (
                    <p>
                      <span className="font-semibold text-dash-ink">Link copied!</span> Paste it anywhere.
                    </p>
                  )}
                  {activePlatform && status?.viaShareMenu && (
                    <p>
                      <span className="font-semibold text-dash-ink">Choose {activePlatform.label}</span> in the share
                      menu, then pick {firstName} and send — the message is already filled in.
                    </p>
                  )}
                  {activePlatform && !fallback && !status?.viaShareMenu && (
                    <p>
                      <span className="font-semibold text-dash-ink">Message copied!</span>{" "}
                      {activePlatform.pasteOnly
                        ? `In ${activePlatform.label}, find ${firstName}, then paste and send.`
                        : `In ${activePlatform.label}, pick ${firstName} and send. If the message isn't there, paste it.`}
                    </p>
                  )}
                  {fallback && (
                    <>
                      <p>{fallback.note}</p>
                      {fallback.href && (
                        <a
                          href={fallback.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 font-semibold text-dash-primary underline-offset-2 hover:underline"
                        >
                          {fallback.label}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* More options */}
          <div className="mx-5 mt-4 overflow-hidden rounded-2xl border border-dash-border sm:mx-6">
            <button
              type="button"
              onClick={() => handleCopy("link")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-dash-surface"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dash-tint text-dash-primary">
                {status?.platformId === "link" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-dash-ink">
                  {status?.platformId === "link" ? "Link copied!" : "Copy link only"}
                </span>
                <span className="block truncate font-mono text-[10.5px] text-gray-500">{payload.url}</span>
              </span>
            </button>
            {canNativeShare && (
              <button
                type="button"
                onClick={() => void handleNativeShare()}
                className="flex w-full items-center gap-3 border-t border-dash-border px-4 py-3 text-left transition-colors hover:bg-dash-surface"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dash-tint text-dash-primary">
                  <Share2 className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-dash-ink">More apps</span>
                  <span className="block text-[10.5px] text-gray-500">
                    {mobile ? "Open your phone's share menu" : "Open your device's share menu"}
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
