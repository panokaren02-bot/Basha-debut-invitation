'use client';

import { fillCelebrant } from '@/lib/celebrant';
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import { InvitePhotoBackdrop } from '@/components/loader/invite-photo-backdrop';
import { Bodoni_Moda, Montserrat } from 'next/font/google';
import localFont from 'next/font/local';
import { withRomanNumerals } from '@/components/title-numerals';
import './loading-screen.css';
import './loading-screen-velvet.css';

// Poster type: high-contrast serif for the name + headline, tracked sans for labels
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--ls-font-display',
});
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--ls-font-sans',
});

// Same lettering as the home hero (components/sections/hero.tsx): serif name + overlapping script line.
// Sizes and classes below mirror that file exactly.
const heroTitleSize = {
  main: 'clamp(2.7rem, min(13vw, 14.5cqi), 6.75rem)',
  script: 'clamp(2.2rem, min(10vw, 11.5cqi), 4.75rem)',
  overlap: 'clamp(-1.1rem, -2.2vw, -0.45rem)',
} as const;
const theSeasons = localFont({
  src: '../../Font/Fontspring-DEMO-theseasons-reg.otf',
  display: 'swap',
});
const aboveTheBeyond = localFont({
  src: '../../Font/above-the-beyond-script.otf',
  display: 'swap',
});

interface LoadingScreenProps {
  onComplete: () => void;
  onFadeStart?: () => void;
}

// Date cards enter one by one, 2s apart. CSS-delay driven (like plain mode) so they start on first
// paint together with the progress bar, not after hydration (see loading-screen-velvet.css)
const STAGGER_DELAY_MS = 2000;
const FIRST_BOX_DELAY_MS = 750;
const FADE_OUT_MS = 1400;
// Plain mode handoff: the card tucks away first, then the envelope hero starts arriving
const PLAIN_HANDOFF_LEAD_MS = 550;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Plain mode choreography — all CSS-delay driven so it plays in sync even before hydration:
// ornament → headline letters → countdown → names → date (day, month/year, weekday) → details
const PLAIN_LETTER_START_MS = 350;
const PLAIN_LETTER_STAGGER_MS = 75;
// Offsets below are measured from the moment the last headline letter has landed
const PLAIN_DATE_OFFSET_MS = 1300;
const PLAIN_DATE_STAGGER_MS = 800;

// Short joining words in the headline ("Save the Date") are set in script
const SCRIPT_WORDS = new Set(['the', 'of', 'and', '&', 'a']);

// Splits the headline into display words with a running letter index for staggering
function splitHeadline(headline: string) {
  let letterIndex = 0;
  return headline
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const script = SCRIPT_WORDS.has(word.toLowerCase());
      const start = letterIndex;
      letterIndex += script ? 2 : word.length;
      return { word, script, start };
    });
}

// Pearls, gold dust and rose petals drifting up over the velvet (plain mode)
const MOTE_COLORS = [
  'var(--color-motif-soft)',
  'var(--color-welcome-gold)',
  'var(--color-motif-silver)',
  'var(--color-motif-accent)',
  'var(--color-motif-blush)',
]

// Floating motes; every third one is a tumbling petal (plain mode)
const PLAIN_MOTES = Array.from({ length: 24 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  size: 4 + ((i * 7) % 6),
  dur: 14 + ((i * 5) % 10),
  delay: -((i * 3.1) % 18),
  drift: ((i % 2 === 0 ? 1 : -1) * (12 + ((i * 11) % 24))),
  spin: (i % 2 === 0 ? 1 : -1) * (180 + ((i * 47) % 360)),
  color: MOTE_COLORS[i % MOTE_COLORS.length],
  petal: i % 3 === 0,
}))

// Pearls placed along a quadratic curve (x/y in a 400×800 box)
function pearlsAlong(
  from: [number, number],
  control: [number, number],
  to: [number, number],
  count: number,
  radius: number,
) {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const x = (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * control[0] + t ** 2 * to[0];
    const y = (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * control[1] + t ** 2 * to[1];
    return { x, y, r: radius * (0.85 + 0.15 * Math.sin(i * 1.7)) };
  });
}

// Two strands draped across the velvet, like the pearls on a vanity poster
const PEARL_STRANDS = [
  pearlsAlong([-20, 120], [210, 330], [430, 70], 34, 5.2),
  pearlsAlong([-30, 640], [170, 470], [430, 760], 30, 4.6),
];

function PearlStrands() {
  return (
    <svg className="ls-velvet-pearls" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="ls-pearl" cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="var(--color-motif-soft)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--color-motif-teal-light) 70%, var(--color-coastal-deep))" />
        </radialGradient>
      </defs>
      {PEARL_STRANDS.map((strand, si) => (
        <g key={si} className={`ls-velvet-pearls__strand ls-velvet-pearls__strand--${si}`}>
          {strand.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="url(#ls-pearl)" />
          ))}
        </g>
      ))}
    </svg>
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, onFadeStart }) => {
  const siteConfig = useSiteConfig();
  // Fall back to the bundled config if a remote override is missing this block.
  const content = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen;
  const totalDurationMs = content.durationMs;
  const statusMessages = content.statusMessages;
  const isPlain = content.display === 'plain';
  const backgroundPhotos = useMemo(
    () => (content.backgroundPhotos ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotos],
  );
  const showBackdrop = !isPlain && backgroundPhotos.length > 0;
  const plainTheme = content.plainTheme ?? defaultSiteConfig.loadingScreen.plainTheme;
  const plainInvite = content.plainInvite ?? defaultSiteConfig.loadingScreen.plainInvite;

  const reduceMotion = useReducedMotion();
  const [fadeOut, setFadeOut] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const weddingDate = useMemo(() => new Date(siteConfig.wedding.date), [siteConfig.wedding.date]);
  const hasValidDate = !Number.isNaN(weddingDate.getTime());

  const countdownText = useMemo(() => {
    if (!hasValidDate) return '';
    const days = Math.round((startOfDay(weddingDate) - startOfDay(now)) / MS_PER_DAY);
    if (days < 0) return content.countdownPastText;
    if (days === 0) return content.countdownTodayText;
    if (days === 1) return content.countdownOneDayText;
    return content.countdownText.replace('{days}', days.toLocaleString());
  }, [content, hasValidDate, now, weddingDate]);

  const dateParts = hasValidDate
    ? [
        weddingDate.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        String(weddingDate.getDate()).padStart(2, '0'),
        String(weddingDate.getFullYear()),
      ]
    : [];

  // Plain display: full month + weekday for the engraved-style date line
  const silkDate = hasValidDate
    ? {
        weekday: weddingDate.toLocaleString('en-US', { weekday: 'long' }),
        month: weddingDate.toLocaleString('en-US', { month: 'long' }),
        day: String(weddingDate.getDate()).padStart(2, '0'),
        year: String(weddingDate.getFullYear()),
        label: weddingDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      }
    : null;

  const headlineWords = useMemo(() => splitHeadline(content.headline), [content.headline]);
  const headlineLetterCount = headlineWords.reduce(
    (n, w) => n + (w.script ? 2 : w.word.length),
    0,
  );
  // Plain mode: the rest of the card waits for the headline letters to land
  const afterHeadlineMs = isPlain
    ? PLAIN_LETTER_START_MS + headlineLetterCount * PLAIN_LETTER_STAGGER_MS + 250
    : 0;
  const revealDelay = (photoMs: number, plainOffsetMs: number) =>
    ({ '--ls-delay': `${isPlain ? afterHeadlineMs + plainOffsetMs : photoMs}ms` }) as React.CSSProperties;
  // Plain date steps: 0 = day, 1 = month & year, 2 = weekday
  const dateDelay = (step: number) =>
    ({
      '--ls-delay': `${afterHeadlineMs + PLAIN_DATE_OFFSET_MS + step * PLAIN_DATE_STAGGER_MS}ms`,
    }) as React.CSSProperties;

  const hero = siteConfig.hero ?? defaultSiteConfig.hero;
  const fill = (text: string) => fillCelebrant(text, siteConfig);
  const monogram = siteConfig.celebrant?.monogram;
  const fillDetail = (text: string) =>
    text
      .split('{guestsTime}').join(siteConfig.ceremony.guestsTime ?? '')
      .split('{programTime}').join(siteConfig.ceremony.time ?? '')
      .split('{endTime}').join(siteConfig.reception.time ?? '')
      .split('{venue}').join(siteConfig.ceremony.location ?? '');
  const highlights = content.highlights ?? [];
  const details = content.showCeremonyDetails
    ? (content.details ?? []).map((d) => ({ label: d.label, value: fillDetail(d.value) })).filter((d) => d.value)
    : [];


  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (statusMessages.length < 2) return;
    const step = totalDurationMs / statusMessages.length;
    const t = setInterval(
      () => setStatusIndex((i) => Math.min(i + 1, statusMessages.length - 1)),
      step,
    );
    return () => clearInterval(t);
  }, [statusMessages.length, totalDurationMs]);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let handoffTimer: ReturnType<typeof setTimeout> | undefined;
    const lead = isPlain && !reduceMotion ? PLAIN_HANDOFF_LEAD_MS : 0;
    const t = setTimeout(() => {
      setFadeOut(true);
      handoffTimer = setTimeout(() => {
        onFadeStart?.();
        fadeTimer = setTimeout(onComplete, reduceMotion ? 200 : FADE_OUT_MS);
      }, lead);
    }, totalDurationMs);
    return () => {
      clearTimeout(t);
      clearTimeout(handoffTimer);
      clearTimeout(fadeTimer);
    };
  }, [isPlain, onComplete, onFadeStart, reduceMotion, totalDurationMs]);

  return (
    <div
      className={`loading-screen loading-screen--invitation ls-velvet ${bodoni.variable} ${montserrat.variable}${isPlain ? ' loading-screen--plain' : ''} fixed inset-0 z-50 flex flex-col overflow-hidden overscroll-none h-dvh max-h-dvh w-screen${fadeOut ? ' is-fading' : ''}${reduceMotion ? ' is-reduced-motion' : ''}`}
      aria-live="polite"
      aria-busy={!fadeOut}
      aria-label="Loading invitation"
      style={
        {
          pointerEvents: fadeOut ? 'none' : 'auto',
          ...(isPlain && {
            '--ls-plain-bg': plainTheme.background,
            '--ls-plain-ink': plainTheme.text,
            '--ls-plain-accent': plainTheme.accent,
          }),
        } as React.CSSProperties
      }
    >
      {/* Same photo marquee + scrim as the envelope hero, so the handoff keeps one background */}
      {showBackdrop && (
        <>
          <InvitePhotoBackdrop className="invite-photo-backdrop--envelope" photos={backgroundPhotos} />
          <div className="env-invite-readability-scrim" aria-hidden="true" />
        </>
      )}

      {isPlain && (
        <>
          {/* Red velvet: folds of light, a gold baroque sun behind the name, draped pearls */}
          <div className="ls-velvet-bg" aria-hidden="true">
            <div className="ls-velvet-bg__folds" />
            {monogram && (
              <div
                className="ls-velvet-bg__sun"
                style={{ maskImage: `url("${monogram}")`, WebkitMaskImage: `url("${monogram}")` }}
              />
            )}
            <PearlStrands />
            <div className="ls-velvet-bg__vignette" />
          </div>
          {!reduceMotion && (
            <div className="ls-plain-motes" aria-hidden="true">
              {PLAIN_MOTES.map((m, i) => (
                <span
                  key={i}
                  className={`ls-plain-mote${m.petal ? ' ls-plain-mote--petal' : ''}`}
                  style={
                    {
                      '--x': `${m.x}%`,
                      '--size': `${m.size}px`,
                      '--dur': `${m.dur}s`,
                      '--delay': `${m.delay}s`,
                      '--drift': `${m.drift}px`,
                      '--spin': `${m.spin}deg`,
                      '--c': m.color,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      <div className="loading-screen__save-date">
        {(content.topLeft || content.topRight) && (
          <div className="ls-velvet-topbar ls-reveal" style={revealDelay(0, 0)}>
            <span className="ls-velvet-topbar__brand">
              {monogram && (
                <span
                  className="ls-velvet-topbar__mark"
                  aria-hidden="true"
                  style={{ maskImage: `url("${monogram}")`, WebkitMaskImage: `url("${monogram}")` }}
                />
              )}
              {content.topLeft}
            </span>
            <span className="ls-velvet-topbar__right">{content.topRight}</span>
          </div>
        )}

        <header className="flex flex-col items-center w-full pt-6 sm:pt-8 px-4 sm:px-6 flex-shrink-0">
          <h1 className="loading-screen__std-headline ls-headline" aria-label={content.headline}>
            {headlineWords.map(({ word, script, start }, wi) =>
              script ? (
                <span
                  key={wi}
                  className="ls-headline__script"
                  aria-hidden="true"
                  style={
                    {
                      '--ls-delay': `${PLAIN_LETTER_START_MS + start * PLAIN_LETTER_STAGGER_MS}ms`,
                    } as React.CSSProperties
                  }
                >
                  {word}
                </span>
              ) : (
                <span key={wi} className="ls-headline__word" aria-hidden="true">
                  {Array.from(word).map((ch, ci) => (
                    <span
                      key={ci}
                      className="ls-headline__letter"
                      style={
                        {
                          '--ls-delay': `${PLAIN_LETTER_START_MS + (start + ci) * PLAIN_LETTER_STAGGER_MS}ms`,
                        } as React.CSSProperties
                      }
                    >
                      {ch}
                    </span>
                  ))}
                </span>
              ),
            )}
          </h1>
          {countdownText && (
            <p className="loading-screen__std-kicker ls-reveal" style={revealDelay(250, 0)}>
              {countdownText}
            </p>
          )}
        </header>

        {plainInvite.lineAbove && (
          <p className="loading-screen__plain-line loading-screen__plain-line--above ls-reveal" style={revealDelay(350, 200)}>
            {plainInvite.lineAbove}
          </p>
        )}

        <div className="loading-screen__std-names-slot ls-reveal" style={revealDelay(450, 400)}>
          <h2
            className="ls-hero-title relative mx-auto w-full max-w-full @container text-center"
            aria-label={fill(hero.srTitle)}
            style={
              {
                '--hero-title-size': heroTitleSize.main,
                '--hero-script-size': heroTitleSize.script,
                '--hero-script-overlap': heroTitleSize.overlap,
              } as React.CSSProperties
            }
          >
            <span
              aria-hidden="true"
              className={`${theSeasons.className} ls-hero-title__main relative block uppercase leading-[0.78] tracking-[0.06em] min-[400px]:tracking-[0.09em] sm:tracking-[0.11em] md:tracking-[0.12em]`}
              style={{ fontSize: 'var(--hero-title-size)' }}
            >
              {fill(hero.titleMain)}
            </span>
            <span
              aria-hidden="true"
              className={`${aboveTheBeyond.className} ls-hero-title__script relative z-10 mx-auto block w-fit max-w-full px-1 leading-[0.82] sm:leading-[0.84]`}
              style={{
                marginTop: 'var(--hero-script-overlap)',
                fontSize: 'var(--hero-script-size)',
              }}
            >
              {withRomanNumerals(fill(hero.titleScript), theSeasons.className)}
            </span>
          </h2>
        </div>

        {plainInvite.lineBelow && (
          <p className="loading-screen__plain-line ls-reveal" style={revealDelay(550, 650)}>
            {plainInvite.lineBelow}
          </p>
        )}

        {isPlain && silkDate && (
          <div className="ls-silk-date px-4 pt-1 pb-3 sm:pb-4 flex-shrink-0" role="img" aria-label={silkDate.label}>
            {/* Entry order: day rises in → month & year glide out from it → weekday draws in */}
            <p className="ls-silk-date__weekday is-visible" style={dateDelay(2)}>
              {silkDate.weekday}
            </p>
            <div className="ls-silk-date__row">
              <span className="ls-silk-date__side ls-silk-date__side--month is-visible" style={dateDelay(1)}>
                {silkDate.month}
              </span>
              <span className="ls-silk-date__day is-visible" style={dateDelay(0)}>
                {Array.from(silkDate.day).map((digit, i) => (
                  <span key={i} className="ls-silk-date__digit" style={{ '--i': i } as React.CSSProperties}>
                    <span className="ls-silk-date__digit-inner">{digit}</span>
                  </span>
                ))}
              </span>
              <span className="ls-silk-date__side ls-silk-date__side--year is-visible" style={dateDelay(1)}>
                {silkDate.year}
              </span>
            </div>
          </div>
        )}

        {!isPlain && dateParts.length > 0 && (
          <div className="loading-screen__std-boxes flex items-stretch justify-center gap-3 sm:gap-4 md:gap-6 px-4 pt-1 pb-3 sm:pb-4 flex-shrink-0">
            {dateParts.map((value, i) => {
              const photo = content.photos[i % content.photos.length];
              return (
                <div
                  key={content.dateLabels[i] ?? i}
                  className="loading-screen__std-box relative flex-1 max-w-[28vw] sm:max-w-[140px] md:max-w-[160px] aspect-[3/4] overflow-hidden rounded-2xl"
                  style={{ '--ls-box-delay': `${FIRST_BOX_DELAY_MS + i * STAGGER_DELAY_MS}ms` } as React.CSSProperties}
                >
                  {photo && (
                    <Image
                      src={photo}
                      alt=""
                      fill
                      priority={i === 0}
                      className="loading-screen__std-box-img object-cover"
                      sizes="(max-width: 640px) 28vw, 160px"
                    />
                  )}
                  <div className="loading-screen__std-box-overlay absolute inset-0" />
                  <div className="loading-screen__std-box-caption absolute bottom-2.5 inset-x-0 sm:bottom-3 flex flex-col items-center">
                    <span className="loading-screen__std-box-num text-2xl sm:text-3xl md:text-4xl select-none leading-none text-center">
                      {value}
                    </span>
                    <span className="loading-screen__std-box-label text-[9px] sm:text-[10px] uppercase mt-1">
                      {content.dateLabels[i]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer className="loading-screen__std-footer flex flex-col items-center w-full pt-1 px-6 flex-shrink-0">
          {highlights.length > 0 && (
            <div className="ls-velvet-highlights ls-reveal" style={revealDelay(900, 3200)}>
              {highlights.map((h, i) => (
                <div key={h.label} className="ls-velvet-highlights__item">
                  <span className="ls-velvet-highlights__label">
                    {String(i + 1).padStart(2, '0')} {h.label}
                  </span>
                  <span className="ls-velvet-highlights__text">{h.text}</span>
                </div>
              ))}
            </div>
          )}
          {details.length > 0 && (
            <dl className="ls-velvet-details ls-reveal" style={revealDelay(1100, 3450)}>
              {details.map((d) => (
                <div key={d.label} className="ls-velvet-details__item">
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="loading-screen__std-rule" aria-hidden="true" />
          {statusMessages.length > 0 && (
            <p key={statusIndex} className="loading-screen__std-status">
              {statusMessages[statusIndex]}
            </p>
          )}
          <div
            className="w-full max-w-[200px] sm:max-w-xs mx-auto"
            role="progressbar"
            aria-label="Loading invitation"
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="loading-screen__std-track">
              <div
                className="loading-screen__std-bar"
                style={{ animationDuration: `${totalDurationMs}ms` }}
              />
              {isPlain && (
                <span
                  className="ls-plain-progress-glow"
                  style={{ animationDuration: `${totalDurationMs}ms` }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
