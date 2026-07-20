# NEXA Brand Design System

> Referencia completa: `brand/brand-guidelines.md`  
> Este archivo es una guía rápida para diseñadores y generadores de contenido.

## Identity

- **Brand:** NEXA
- **Tagline:** "Tecnología que trasciende"
- **Positioning:** Premium software development studio
- **Voice:** "Somos ingenieros que construyen" — técnico, directo, confiado sin arrogancia
- **Tone:** Profesional, educativo, jamás genérico ni vendedor agresivo

## Logo System

### Assets (in `brand/src/`)
- `logotipo-core.svg` — Full logotype: isotipo + "NEXA" text (400x100)
- `isotipo-core.svg` — Icon only: 7 interlocking isometric polygons (100x100, viewBox -40 -40 80 90)
- `isotipo-dark.svg` — Grayscale version for light backgrounds
- `banner-web.svg` — Web banner 1920x600

### Logo Mark Structure
The NEXA icon is an isometric "N" composed of 7 interlocking polygons:
- Polygon 1: front face → gradient `#34D399 → #10B981`
- Polygon 2: top left cap → `#34D399`
- Polygon 3: bottom left cap → `#059669`
- Polygon 4: back face center → `#10B981`
- Polygon 5: right side face → `#059669`
- Polygon 6: top right cap → `#34D399`
- Polygon 7: bottom right cap → `#059669`

### Usage Rules
- **Minimum size:** 32px height (digital), 10mm (print), 16x16px (favicon)
- **Clear space:** 50% of icon width on all sides
- **NEVER:** Stretch, rotate, add effects, change polygon colors, use on busy backgrounds without overlay
- See `brand/brand-guidelines.md` §3 for full rules

## Color Palette

### Backgrounds (Dark Theme)
| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#060A0E` | Page background |
| `bg2` | `#0B1117` | Cards, surfaces |
| `bg3` | `#111820` | Elevated surface, inputs |
| `bg4` | `#161F2A` | Hover/active states |

### Emerald (Primary Accent)
| Token | Hex | Usage |
|-------|-----|-------|
| `em` | `#10B981` | CTAs, links, accent |
| `em2` | `#059669` | Borders, secondary |
| `em3` | `#34D399` | Hover, highlights |
| `em4` | `#6EE7B7` | Tags, small accent text |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `txt` | `#F0F4F8` | Headlines, primary text |
| `txt2` | `#8A9BB0` | Body, labels |
| `txt3` | `#5E7085` | Captions, placeholders |

### Usage Rule: 80/20
- **80%** → Backgrounds (bg, bg2, bg3)
- **15%** → Text (txt, txt2, txt3)
- **5%** → Emerald accent only (CTAs, highlights, borders)

### Reference
- Visual swatches: `brand/src/color-palette.svg`
- Full rules: `brand/brand-guidelines.md` §4

## Typography

### Font Families
| Role | Font | Weights | Source |
|------|------|---------|--------|
| Display/Headlines | Syne | 400, 700, 800 | `brand/fonts/Syne-Variable.ttf` |
| Body | DM Sans | 400, 500, 700 | `brand/fonts/DMSans-Variable.ttf` |
| Code | DM Mono | 400, 500 | `brand/fonts/DMMono-Regular.ttf` |

### Type Scale (Social Media)
| Role | Size | Font | Weight | Tracking |
|------|------|------|--------|----------|
| Display | 64-80px | Syne | 800 | -0.02em |
| H1 | 44-52px | Syne | 800 | -0.02em |
| H2 | 32-40px | Syne | 700 | -0.02em |
| H3 | 22-28px | Syne | 700 | -0.02em |
| Body | 16-18px | DM Sans | 400 | 0 |
| Caption | 12-14px | DM Sans | 500 | +0.03em |
| Code | 13-15px | DM Mono | 400 | 0 |

### Rules
- Never mix Syne and DM Sans on the same line
- Always min 4px difference between headline levels
- Labels/captions: always +0.03em tracking for readability

### Reference
- Type specimen: `brand/src/typography-specimen.svg`
- Full scale: `brand/brand-guidelines.md` §5

## Spacing & Layout

### Grid
- Base unit: **4px** (all spacing multiples of 4)
- Max width: 1200px (content), full bleed for background sections
- Columns: 12, gutter 24px
- Page margins: 60px (feed), 40px (story)

### Spacing Scale
| Token | Value | Use |
|-------|-------|-----|
| `xs` | 4px | Internal gaps |
| `sm` | 8px | Badge padding |
| `md` | 12px | Small card padding |
| `lg` | 16px | Standard card padding |
| `xl` | 24px | Section padding |
| `2xl` | 32px | Section margins |
| `3xl` | 48px | Main sections |
| `4xl` | 64px | Hero separators |
| `5xl` | 96px | Hero margins |

### Border Radius
| Token | Value | Use |
|-------|-------|-----|
| `sm` | 6px | Badges, tags |
| `md/radius` | 12px | Cards, buttons |
| `lg` | 16px | Large cards |
| `xl` | 24px | Hero blocks |
| `full` | 9999px | Avatars, pills |

### Shadows
| Token | Value |
|-------|-------|
| `card` | `0 4px 24px rgba(0,0,0,0.40)` |
| `card-hover` | `0 8px 32px rgba(0,0,0,0.55)` |
| `glow` | `0 0 40px rgba(16,185,129,0.25)` |
| `glow-lg` | `0 0 80px rgba(16,185,129,0.15)` |

## Components

### Cards
- bg: `#0B1117`, border: `1px solid rgba(16,185,129,0.12)`
- hover: border → `rgba(16,185,129,0.30)`, glow shadow
- radius: 12px, padding: 24px

### Buttons
- **Primary:** bg `#10B981`, text `#060A0E`, font DM Sans 700
- **Secondary (Ghost):** transparent, border `#10B981@30%`, text `#10B981`
- **Tertiary:** bg `#111820`, border `rgba(255,255,255,0.06)`, text `#8A9BB0`

### Badges
- bg: `rgba(16,185,129,0.12)`, text: `#34D399`
- font: DM Sans 500 12px, radius: 6px, padding: 3px 10px

## Social Media Formats

| Format | Dimensions | File |
|--------|------------|------|
| IG Feed | 1080x1080 @2x | `brand/posts/ig/` |
| IG Story | 1080x1920 @2x | `brand/posts/stories/` |
| X/Twitter | 1600x900 @2x | `brand/posts/x/` |
| LinkedIn | 1200x627 @2x | `brand/posts/linkedin/` |
| Carousel | 1080x1080 @2x | `brand/posts/carrusel/` |

### Post Structure
Every post follows: Pillar Tag → Headline → Content → Bottom Bar (Logo + NEXA + URL)

## Design Principles for Social Media

1. **Dark canvas, luminous accents** — Near-black bg, emerald glows emerge from darkness
2. **Typographic hierarchy** — Syne 800 commands attention, DM Sans provides quiet authority
3. **Geometric precision** — Grid patterns, clean lines, isotipo as recurring motif
4. **Glassmorphism** — Translucent panels with subtle emerald borders
5. **Code as art** — Syntax-highlighted blocks are hero visuals
6. **Brand recognition** — Every post instantly recognizable as NEXA
7. **Less is more** — Max 5 hashtags, max 2 emojis, no visual clutter
