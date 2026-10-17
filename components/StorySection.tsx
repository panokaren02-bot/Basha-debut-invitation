"use client"

import React from "react"
import localFont from "next/font/local"
import { Lora } from "next/font/google"
import { motion, useReducedMotion } from "motion/react"
import { sectionType, storyChapterTitleSize } from "@/lib/section-typography"
import Image from "next/image"
import { TornPaperEdge } from "./TornPaperEdge"

const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

// Upright, screen-friendly serif for chapter paragraphs on the pattern (easier to read than italic Goudy)
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
})

const lightBg = "var(--color-welcome-bg)"
const darkBg = "var(--color-welcome-green)"
const revealEase = [0.22, 1, 0.36, 1] as const

// Plain cards: flat palette colors — teal text on light cards, light text on teal cards
const TEAL = "var(--color-motif-teal)"
const ON_TEAL = "var(--color-motif-soft)"

export type LoveStoryEucalyptusDecos = {
  topLeft: string
  bottomRight: string
  timelineTop: string
  sectionBottom: string
}

interface StorySectionProps {
  imageSrc?: string
  title?: string
  text: React.ReactNode
  layout: "image-left" | "image-right"
  theme: "dark" | "light"
  isFirst?: boolean
  isLast?: boolean
  plain?: boolean
  chapterIndex?: number
  eucalyptusDecos?: LoveStoryEucalyptusDecos
  // Word before the number on plain cards, e.g. "Chapter" → "Chapter 01"
  chapterLabelText?: string
  // "pattern": no solid band — the section's circle pattern shows through and the
  // text sits on an ivory (light) or wine-glass (dark) card (see love-story-red.css)
  surface?: "solid" | "pattern"
}

// The Seasons (title face) lacks most punctuation — set any non-letter/number
// character (comma, hyphen, apostrophe, &, …) in Cinzel so it renders cleanly
function TitleText({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\p{N}\s])/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="story-title-special">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function PlainEucalyptusDecos({ decos }: { decos: LoveStoryEucalyptusDecos }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={decos.timelineTop}
        alt=""
        className="story-plain-card__euc story-plain-card__euc--center"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={decos.topLeft}
        alt=""
        className="story-plain-card__euc story-plain-card__euc--left"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={decos.bottomRight}
        alt=""
        className="story-plain-card__euc story-plain-card__euc--right"
      />
    </>
  )
}

function PlainChapterDivider({ dark }: { dark: boolean }) {
  const line = dark
    ? "color-mix(in srgb, var(--color-motif-soft) 45%, transparent)"
    : "color-mix(in srgb, var(--color-motif-teal) 35%, transparent)"
  return (
    <div className="mb-4 flex items-center justify-center gap-1.5 sm:mb-5">
      <span className="h-px w-8 sm:w-12" style={{ background: line }} />
      <span
        className="h-1 w-1 rotate-45"
        style={{ background: dark ? "var(--color-motif-blush)" : "var(--color-motif-deep)" }}
        aria-hidden
      />
      <span className="h-px w-8 sm:w-12" style={{ background: line }} />
    </div>
  )
}

export const StorySection: React.FC<StorySectionProps> = ({
  imageSrc,
  title,
  text,
  layout,
  theme,
  isFirst = false,
  isLast = false,
  plain = false,
  chapterIndex = 0,
  eucalyptusDecos,
  chapterLabelText = "Chapter",
  surface = "solid",
}) => {
  const onPattern = surface === "pattern"
  const isDark = theme === "dark"
  const textCardClass = onPattern
    ? ` story-pattern-card ${isDark ? "story-pattern-card--dark" : "story-pattern-card--light"}`
    : ""
  const showImage = !plain && Boolean(imageSrc)
  const reduceMotion = useReducedMotion()
  const slideFromLeft = layout === "image-left"

  const imageFrameStyle = isDark
    ? {
        background:
          "color-mix(in srgb, var(--color-welcome-bg-soft) 12%, var(--color-welcome-bg-soft))",
        boxShadow:
          "0 10px 28px color-mix(in srgb, var(--color-motif-accent) 35%, transparent)",
      }
    : {
        background: "var(--color-welcome-bg-soft)",
        border: "1px solid color-mix(in srgb, var(--color-motif-deep) 10%, transparent)",
        boxShadow:
          "0 8px 24px color-mix(in srgb, var(--color-motif-deep) 7%, transparent), inset 0 1px 0 color-mix(in srgb, white 70%, transparent)",
      }

  const rotation = layout === "image-left" ? "rotate-1 md:rotate-2" : "-rotate-1 md:-rotate-2"
  const flexDirection = layout === "image-left" ? "flex-row" : "flex-row-reverse"
  const plainAlign =
    layout === "image-left" ? "md:text-left md:items-start" : "md:text-right md:items-end"

  const chapterLabel = String(chapterIndex + 1).padStart(2, "0")
  const stagger = Math.min(chapterIndex * 0.07, 0.45)

  const plainInitial = reduceMotion
    ? { opacity: 1, x: 0, y: 0, scale: 1 }
    : {
        opacity: 0,
        x: slideFromLeft ? -36 : 36,
        y: 20,
        scale: 0.97,
      }

  const plainAnimate = { opacity: 1, x: 0, y: 0, scale: 1 }

  // Scroll reveal: the photo glides in from its own side, the text from the opposite side
  const imageInitial = reduceMotion
    ? { opacity: 1, x: 0, rotate: 0, filter: "blur(0px)" }
    : {
        opacity: 0,
        x: slideFromLeft ? -90 : 90,
        rotate: slideFromLeft ? -6 : 6,
        filter: "blur(6px)",
      }
  const imageInView = { opacity: 1, x: 0, rotate: 0, filter: "blur(0px)" }

  const textInitial = reduceMotion
    ? { opacity: 1, x: 0, filter: "blur(0px)" }
    : { opacity: 0, x: slideFromLeft ? 70 : -70, filter: "blur(6px)" }
  const textInView = { opacity: 1, x: 0, filter: "blur(0px)" }

  const sectionSurfaceClass = plain
    ? `love-story-plain-track love-story-plain-track--theme-${theme}${isFirst ? " love-story-plain-track--first" : ""}${isLast ? " love-story-plain-track--last" : ""}`
    : ""

  return (
    <div
      className={`${theSeasons.variable} relative z-[2] ${sectionSurfaceClass}`}
      style={plain || onPattern ? undefined : { background: isDark ? darkBg : lightBg }}
    >
      {plain && (
        <div className="story-plain-atmosphere" aria-hidden="true">
          <div className="story-plain-atmosphere__blobs">
            <span className="story-plain-atmosphere__blob story-plain-atmosphere__blob--a" />
            <span className="story-plain-atmosphere__blob story-plain-atmosphere__blob--b" />
            <span className="story-plain-atmosphere__blob story-plain-atmosphere__blob--c" />
          </div>
        </div>
      )}

      {!isDark && !plain && !onPattern && (
        <>
          {!isFirst && (
            <div className="pointer-events-none absolute left-0 top-0 z-20 -mt-[8px] w-full md:-mt-[20px]">
              <TornPaperEdge flipped={true} color={lightBg} />
            </div>
          )}
          <div className="pointer-events-none absolute bottom-0 left-0 z-20 -mb-[8px] w-full md:-mb-[20px]">
            <TornPaperEdge flipped={false} color={lightBg} />
          </div>
        </>
      )}

      <div
        className={`container relative z-10 mx-auto px-2 md:px-12 ${
          onPattern
            ? // even rhythm between chapters on the pattern: same gap above and below each one
              `px-4 py-7 sm:py-9 md:px-12 md:py-14 ${isFirst ? "pt-8 md:pt-12" : ""} ${isLast ? "pb-12 md:pb-20" : ""}`
            : `${showImage ? "py-12 md:py-32" : "py-1.5 md:py-14"} ${isFirst ? (showImage ? "pt-16 md:pt-36" : "pt-14 md:pt-16") : ""} ${isLast ? (showImage ? "pb-16 md:pb-36" : "pb-6 md:pb-16") : ""}`
        }`}
      >
        <div
          className={
            showImage
              ? `flex ${flexDirection} items-center justify-between ${onPattern ? "gap-4 sm:gap-6 md:gap-14" : "gap-3 md:gap-16"}`
              : `mx-auto flex max-w-2xl flex-col items-center px-2 text-center sm:px-4 ${plainAlign}`
          }
        >
          {showImage && imageSrc && (
            <div className="flex w-[45%] shrink-0 justify-center md:w-5/12">
              <motion.div
                className={`relative w-full md:max-w-md ${rotation}`}
                initial={imageInitial}
                whileInView={imageInView}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 1.3, ease: revealEase }}
              >
                <div
                  className={`w-full p-1.5 md:p-3${onPattern ? " story-pattern-frame" : ""}`}
                  style={onPattern ? undefined : imageFrameStyle}
                >
                  <div className="group relative aspect-[3/5] w-full overflow-hidden md:aspect-[5/7]">
                    <Image
                      src={imageSrc}
                      alt="Story moment"
                      fill
                      sizes="(max-width: 768px) 45vw, (max-width: 1024px) 40vw, 33vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      quality={90}
                      priority={chapterIndex < 2}
                    />
                    {isDark && (
                      <div className="pointer-events-none absolute inset-0 z-10 bg-black/5 mix-blend-multiply" />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {plain ? (
            <motion.article
              className={`story-plain-card w-full max-w-xl px-5 pb-7 pt-10 sm:rounded-2xl sm:px-8 sm:pb-9 sm:pt-12 md:px-9 md:pb-10 md:pt-14 ${isDark ? "story-plain-card--dark" : ""}`}
              initial={plainInitial}
              whileInView={plainAnimate}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.88, delay: stagger, ease: revealEase }}
            >
              {eucalyptusDecos ? (
                <PlainEucalyptusDecos decos={eucalyptusDecos} />
              ) : null}
              <span className="story-plain-card__frost" aria-hidden />
              <span className="story-plain-card__dot" aria-hidden />
              <div className="wedding-frame-inner hidden min-[400px]:block" aria-hidden />
              <div className="relative z-[2]">
              <p
                className={`${theSeasons.className} story-plain-chapter-label mb-2 text-[0.58rem] font-medium uppercase sm:text-[0.62rem]`}
              >
                {chapterLabelText} {chapterLabel}
              </p>
              {title ? (
                <h2
                  className={`${theSeasons.className} mb-3 uppercase leading-tight tracking-[0.08em] sm:mb-4 sm:tracking-[0.1em] md:tracking-[0.11em]`}
                  style={{
                    fontSize: storyChapterTitleSize,
                    color: isDark ? ON_TEAL : TEAL,
                  }}
                >
                  <TitleText text={title} />
                </h2>
              ) : null}
              <PlainChapterDivider dark={isDark} />
              <div
                style={{ color: isDark ? ON_TEAL : TEAL }}
                className={`font-goudy-italic space-y-3 sm:space-y-4 md:space-y-5 lg:leading-[1.7] ${sectionType.textRelaxed}`}
              >
                {text}
              </div>
              <div
                className={`story-plain-chapter-line mt-6 sm:mt-7 ${isDark ? "story-plain-chapter-line--dark" : ""}`}
                aria-hidden
              />
              </div>
              {!isLast && (
                <div className="story-plain-chapter-connector" aria-hidden>
                  <span className="story-plain-chapter-connector__stem" />
                </div>
              )}
            </motion.article>
          ) : (
            <motion.div
              className={`${
                showImage
                  ? "w-[55%] @container/story md:w-5/12"
                  : "w-full @container/story px-2 sm:px-4"
              }${textCardClass}`}
              style={onPattern ? undefined : { color: isDark ? lightBg : "var(--color-welcome-text)" }}
              initial={textInitial}
              whileInView={textInView}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.3, delay: 0.15, ease: revealEase }}
            >
              {title && (
                <h2
                  className={`${theSeasons.className} story-pattern-card__title mb-3 uppercase leading-tight tracking-[0.08em] sm:mb-4 sm:tracking-[0.1em] md:mb-6 md:tracking-[0.12em]`}
                  style={{
                    fontSize: storyChapterTitleSize,
                    color: onPattern ? undefined : isDark ? lightBg : "var(--color-welcome-navy)",
                  }}
                >
                  {onPattern && (
                    <span className="story-pattern-card__label">
                      {chapterLabelText} {chapterLabel}
                    </span>
                  )}
                  <TitleText text={title} />
                </h2>
              )}
              {onPattern && <span className="story-pattern-card__rule" aria-hidden />}
              <div
                className={
                  onPattern
                    ? `${lora.className} story-pattern-card__text space-y-3 sm:space-y-4 md:space-y-5`
                    : `font-goudy-italic space-y-3 sm:space-y-4 md:space-y-6 lg:leading-[1.7] ${sectionType.textRelaxed}`
                }
              >
                {text}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
