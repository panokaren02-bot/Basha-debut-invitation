"use client"

import { useEffect } from "react"
import { useAudio } from "@/contexts/audio-context"
import { useSiteConfig } from "@/hooks/use-site-config"

const TARGET_VOLUME = 0.6
const FADE_DURATION_MS = 1500

// Gestures that browsers count as "user activation" (scroll/wheel do not)
const UNLOCK_EVENTS = ["pointerdown", "touchend", "click", "keydown"] as const

const BackgroundMusic = () => {
  const siteConfig = useSiteConfig()
  const { audioRef } = useAudio()

  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    let fadeFrame: number | null = null
    let unlocked = false

    const fadeIn = () => {
      if (fadeFrame !== null) cancelAnimationFrame(fadeFrame)
      const start = performance.now()
      audioEl.volume = 0
      const step = (now: number) => {
        const progress = Math.min((now - start) / FADE_DURATION_MS, 1)
        audioEl.volume = TARGET_VOLUME * progress
        fadeFrame = progress < 1 ? requestAnimationFrame(step) : null
      }
      fadeFrame = requestAnimationFrame(step)
    }

    const removeUnlockListeners = () => {
      UNLOCK_EVENTS.forEach((evt) => document.removeEventListener(evt, handleUserInteraction, true))
    }

    const handleUserInteraction = () => {
      if (unlocked) return
      audioEl.muted = false
      audioEl
        .play()
        .then(() => {
          unlocked = true
          removeUnlockListeners()
          fadeIn()
        })
        .catch((error) => {
          console.log("Playback blocked:", error)
        })
    }

    const setupUserInteraction = () => {
      UNLOCK_EVENTS.forEach((evt) =>
        document.addEventListener(evt, handleUserInteraction, { capture: true, passive: true }),
      )
    }

    const tryAutoplay = async () => {
      // 1. Try unmuted autoplay (works on returning visitors / high media-engagement sites)
      try {
        audioEl.muted = false
        await audioEl.play()
        unlocked = true
        fadeIn()
        return
      } catch {
        // fall through
      }

      // 2. Unmuted was blocked: start muted (always allowed) so the track is already
      //    running, then unmute on the very first user gesture.
      try {
        audioEl.muted = true
        await audioEl.play()
      } catch (error) {
        console.log("Muted autoplay blocked, waiting for user interaction:", error)
      }
      setupUserInteraction()
    }

    // Attempt as soon as possible; if the element isn't ready yet, retry once it can play
    if (audioEl.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      tryAutoplay()
    } else {
      audioEl.addEventListener("canplay", tryAutoplay, { once: true })
      audioEl.load()
    }

    return () => {
      // Do NOT pause here — the audio element lives in the root layout and
      // must keep playing across client-side navigations.
      audioEl.removeEventListener("canplay", tryAutoplay)
      removeUnlockListeners()
      if (fadeFrame !== null) cancelAnimationFrame(fadeFrame)
    }
  }, [audioRef])

  return (
    <audio
      ref={audioRef}
      // Use an encoded URI to avoid issues with spaces/parentheses on some mobile browsers
      src={encodeURI(siteConfig.couple.backgroundMusic)}
      loop
      // Start fetching immediately so playback can begin the moment the page loads
      preload="auto"
      // playsInline helps iOS treat this as inline media rather than requiring fullscreen behavior
      playsInline
      style={{ display: "none" }}
    />
  )
}

export default BackgroundMusic
