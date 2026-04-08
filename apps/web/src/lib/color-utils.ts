/**
 * Converts a hex color (#rrggbb or #rgb) to the HSL format used by Tailwind CSS variables.
 * Tailwind expects CSS vars as "H S% L%" (without the hsl() wrapper) so that it can compose:
 *   color: hsl(var(--primary) / <alpha>)
 *
 * @example hexToHsl("#1a56db") → "221 70% 48%"
 * @example hexToHsl("#fff")    → "0 0% 100%"
 */
export function hexToHsl(hex: string): string {
  const cleaned = hex.replace(/^#/, "")

  // Expand shorthand #rgb → #rrggbb
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned

  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    // Achromatic
    return `0 0% ${Math.round(l * 100)}%`
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    case b:
      h = ((r - g) / d + 4) / 6
      break
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Builds a CSS string with custom property overrides from a company branding config.
 * Only includes properties that are set (non-null).
 *
 * Maps backend color fields to the CSS var names used in globals.css / tailwind.config.ts.
 */
export function buildBrandingCssVars(config: {
  colorPrimary?: string | null
  colorSecondary?: string | null
  colorAccent?: string | null
  colorBackground?: string | null
  colorSurface?: string | null
  colorText?: string | null
  colorTextMuted?: string | null
}): string {
  const vars: string[] = []

  const add = (cssVar: string, hex: string | null | undefined) => {
    if (hex) vars.push(`${cssVar}: ${hexToHsl(hex)}`)
  }

  add("--primary", config.colorPrimary)
  add("--secondary", config.colorSecondary)
  add("--accent", config.colorAccent)
  add("--background", config.colorBackground)
  add("--surface", config.colorSurface)
  add("--foreground", config.colorText)
  add("--muted-foreground", config.colorTextMuted)

  return vars.join("; ")
}
