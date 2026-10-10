import type React from "react"

/**
 * Celebrant name lettering.
 * - `image` set → the PNG is used as a mask and filled with the motif colors
 *   (--couple-name-fill* in app/globals.css).
 * - `image` "" → the name is written in the script font with the same fill.
 */
export function NameLockup({
  image,
  label,
  className = "",
  style,
}: {
  image?: string
  label: string
  className?: string
  style?: React.CSSProperties
}) {
  if (image) {
    return (
      <div
        className={`${className} couple-name-lockup`}
        role="img"
        aria-label={label}
        style={{
          maskImage: `url("${image}")`,
          WebkitMaskImage: `url("${image}")`,
          ...style,
        }}
      />
    )
  }

  return (
    <div className={`${className} couple-name-lockup name-lockup--text`} style={style}>
      {label}
    </div>
  )
}
