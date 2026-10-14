import type React from "react"

// Script titles like "Yohana XVII": the name stays in script, standalone Roman
// numerals render upright in the serif face (pass its className), on the same baseline.
export function withRomanNumerals(text: string, serifClassName: string): React.ReactNode {
  return text.split(/\b([IVXLCDM]{2,})\b/).map((part, i) =>
    i % 2 === 1 ? (
      <span
        key={i}
        className={`${serifClassName} title-numerals inline-block align-baseline`}
        style={{ fontSize: "1.3em", letterSpacing: "0.1em", marginLeft: "0.12em" }}
      >
        {part}
      </span>
    ) : (
      part
    ),
  )
}
