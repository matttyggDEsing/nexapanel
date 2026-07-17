/**
 * Textura de grano muy sutil sobre toda la landing — rompe la
 * planitud típica de los fondos degradados oscuros. Generada con un
 * filtro SVG (feTurbulence), sin imágenes externas ni peso extra de
 * bundle. mix-blend-mode + opacity bajísima para que sea casi
 * subliminal, nunca "ruidoso" de verdad.
 */
export default function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  )
}
