import type React from "react"

/**
 * Gold dust rising behind a section's content (styles: components/sections/love-story-red.css).
 * Place it inside a `relative` section, after the background and before the content;
 * it sits at z-index 1, so content needs z-index 2 or higher. Hidden for reduced motion.
 */
export function RisingMotes({ count = 40 }: { count?: number }) {
  return (
    <div className="rising-motes" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="rising-mote"
          style={
            {
              "--x": `${(i * 37 + 11) % 100}%`,
              "--y": `${(i * 53 + 7) % 100 + ((i * 0.37) % 1)}%`,
              "--size": `${2 + ((i * 7) % 4)}px`,
              "--dur": `${12 + ((i * 5) % 10)}s`,
              "--delay": `${-((i * 3.1) % 18)}s`,
              "--drift": `${(i % 2 === 0 ? 1 : -1) * (10 + ((i * 11) % 22))}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
