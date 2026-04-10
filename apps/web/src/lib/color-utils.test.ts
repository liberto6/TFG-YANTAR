import { describe, it, expect } from "vitest"
import { hexToHsl, buildBrandingCssVars } from "./color-utils"

describe("hexToHsl", () => {
  it("convierte blanco puro a 0 0% 100%", () => {
    expect(hexToHsl("#ffffff")).toBe("0 0% 100%")
  })

  it("convierte negro puro a 0 0% 0%", () => {
    expect(hexToHsl("#000000")).toBe("0 0% 0%")
  })

  it("convierte rojo puro a 0 100% 50%", () => {
    expect(hexToHsl("#ff0000")).toBe("0 100% 50%")
  })

  it("convierte verde puro a 120 100% 50%", () => {
    expect(hexToHsl("#00ff00")).toBe("120 100% 50%")
  })

  it("convierte azul puro a 240 100% 50%", () => {
    expect(hexToHsl("#0000ff")).toBe("240 100% 50%")
  })

  it("funciona sin # al inicio", () => {
    expect(hexToHsl("ffffff")).toBe("0 0% 100%")
  })

  it("expande formato corto #fff", () => {
    expect(hexToHsl("#fff")).toBe("0 0% 100%")
  })

  it("expande formato corto #000", () => {
    expect(hexToHsl("#000")).toBe("0 0% 0%")
  })

  it("convierte un azul corporativo real (#1a56db)", () => {
    const result = hexToHsl("#1a56db")
    // Hue debería estar cerca de 221
    const [h] = result.split(" ")
    expect(parseInt(h)).toBeGreaterThanOrEqual(218)
    expect(parseInt(h)).toBeLessThanOrEqual(224)
  })

  it("convierte un gris neutral (#6b7280)", () => {
    const result = hexToHsl("#6b7280")
    const parts = result.split(" ")
    expect(parts).toHaveLength(3)
    expect(parts[1]).toMatch(/\d+%/)
    expect(parts[2]).toMatch(/\d+%/)
  })
})

describe("buildBrandingCssVars", () => {
  it("devuelve string vacío si no hay colores", () => {
    expect(buildBrandingCssVars({})).toBe("")
  })

  it("genera variable --primary si hay colorPrimary", () => {
    const result = buildBrandingCssVars({ colorPrimary: "#ff0000" })
    expect(result).toContain("--primary: 0 100% 50%")
  })

  it("ignora valores null", () => {
    const result = buildBrandingCssVars({ colorPrimary: "#ff0000", colorAccent: null })
    expect(result).toContain("--primary")
    expect(result).not.toContain("--accent")
  })

  it("genera múltiples variables separadas por ;", () => {
    const result = buildBrandingCssVars({
      colorPrimary: "#ff0000",
      colorBackground: "#ffffff",
    })
    expect(result).toContain("--primary")
    expect(result).toContain("--background")
    expect(result).toContain(";")
  })

  it("mapea colorText a --foreground", () => {
    const result = buildBrandingCssVars({ colorText: "#000000" })
    expect(result).toContain("--foreground")
  })

  it("mapea colorTextMuted a --muted-foreground", () => {
    const result = buildBrandingCssVars({ colorTextMuted: "#6b7280" })
    expect(result).toContain("--muted-foreground")
  })
})
