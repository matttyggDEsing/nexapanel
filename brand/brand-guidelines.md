# NEXA — Brand Guidelines

> **Version:** 1.0  
> **Date:** July 2026  
> **Status:** Official — todos los assets deben adherirse a estas reglas.

---

## 1. Visión General

**NEXA** es un estudio de desarrollo de software premium. No somos una agencia genérica — somos ingenieros que construyen productos digitales de alto impacto.

**Tagline oficial:** `Tecnología que trasciende`

**Posicionamiento:**
- Premium, no masivo
- Técnico, no genérico
- Confiable, no flashy
- Profesional, no corporativo

---

## 2. Identidad de Marca

### 2.1 Nombre

- **NEXA** — siempre en mayúsculas, siempre con esa ortografía.
- Nunca: Nexa, nexa, NEXA!, N.EXA, Nexa Labs.
- En body text: `NEXA` (no italic, no bold unless for emphasis).

### 2.2 Eslogan / Tagline

- **Principal:** `Tecnología que trasciende`
- Secundarios (uso interno o campañas):
  - `Somos ingenieros que construyen`
  - `Donde el código se convierte en producto`
  - `Desarrollo que escala`

### 2.3 Logotipo — Nombres y Definiciones

| Nombre | Descripción | Uso |
|--------|-------------|-----|
| **Logotipo** | Icono + palabra "NEXA" | Header de web, portadas, impresos grandes |
| **Isotipo** | Solo el icono (7 polígonos isométricos) | Favicon, redes sociales, app icon, sellado pequeño |
| **Logotipo de texto** | Solo la palabra "NEXA" | Lineas de texto, pies de página, referencias |
| **Tagline lockup** | Logotipo + "Tecnología que trasciende" | Presentaciones, documentación oficial |

---

## 3. Logo — Reglas de Uso

### 3.1 Estructura del Isotipo

El isotipo está compuesto por **7 polígonos isométricos** que forman una N tridimensional:

```
    ╱╲
   ╱  ╲
  ╱ 3  ╲╲
 ╱──────╲╲───
 ╲  1   ╱╱───  ← Front face (gradiente principal)
  ╲────╱╱
   ╲  ╱╱ 6
    ╲╱╱
     ╲╲ 7
      ╲╲
```

**Polígonos y sus colores:**
1. `#10B981` → Front face principal (emerald)
2. `#34D399` → Top left (light emerald)
3. `#34D399` → Top right face (light emerald)
4. `#10B981` → Back face central (emerald)
5. `#059669` → Side face right (dark emerald)
6. `#34D399` → Top cap right (light emerald)
7. `#059669` → Bottom cap right (dark emerald)

### 3.2 Clear Space

**Mínimo:** 50% del ancho del isotipo en cada lado libre.

```
  ┌──────────────────────────┐
  │        50% min           │
  │   ┌──────────────────┐   │
  │   │                  │   │
  │50%│    [ ISOTIPO ]   │50%│
  │   │                  │   │
  │   └──────────────────┘   │
  │        50% min           │
  └──────────────────────────┘
```

### 3.3 Tamaño Mínimo

| Medio | Mínimo absoluto |
|-------|----------------|
| Digital (pantalla) | 32px de alto |
| Impreso | 10mm de alto |
| Favicon | 16x16px (simplificado) |
| Redes sociales (profile pic) | isotipo solo, mínimo 100x100px |

### 3.4 Lo que NO hacer

- ❌ No rotar el logo
- ❌ No estirar o comprimir
- ❌ No cambiar los colores de los polígonos
- ❌ No agregar sombras, contornos, o efectos 3D adicionales
- ❌ No colocar sobre fondos con patrones densos sin contraste
- ❌ No usar el logotipo como isotipo (ni viceversa)
- ❌ No recortar ningún polígono
- ❌ No usar versiones rasterizadas a bajo resolución
- ❌ No animar los polígonos individualmente (el logo es estático)

### 3.5 Fondo permitido

| Fondo | Permitido | Notas |
|-------|-----------|-------|
| `#060A0E` (negro primario) | ✅ Preferido | Uso principal |
| `#0B1117` / `#111820` | ✅ Sí | En cards, secciones |
| Blanco `#FFFFFF` | ⚠️ Solo isotipo en grayscale | No logo verde sobre blanco |
| Gradientes oscuros | ✅ Sí | Que el fondo no compita con el emerald |
| Fotos oscuras | ✅ Sí | Con overlay oscuro mínimo 60% |

---

## 4. Paleta de Colores

### 4.1 Paleta Principal

| Token | Hex | RGB | Uso |
|-------|-----|-----|-----|
| **bg** | `#060A0E` | 6, 10, 14 | Fondo principal, body |
| **bg2** | `#0B1117` | 11, 17, 23 | Cards, superficies secundarias |
| **bg3** | `#111820` | 17, 24, 32 | Superficies terciarias, inputs |
| **bg4** | `#161F2A` | 22, 31, 42 | Hover states, active states |
| **emerald** | `#10B981` | 16, 185, 129 | Accent primario, CTAs, links |
| **emerald 2** | `#059669` | 5, 150, 105 | Borders, secondary accent |
| **emerald 3** | `#34D399` | 52, 211, 153 | Hover, highlights, icons |
| **emerald 4** | `#6EE7B7` | 110, 231, 183 | Textos pequeños accent, tags |
| **txt** | `#F0F4F8` | 240, 244, 248 | Texto primario (headlines) |
| **txt2** | `#8A9BB0` | 138, 155, 176 | Texto secundario (body, labels) |
| **txt3** | `#5E7085` | 94, 112, 133 | Texto terciario (placeholders, captions) |

### 4.2 Paleta de Estados (UI)

| Estado | Color | Hex |
|--------|-------|-----|
| Pending | Amarillo | `#FCD34D` |
| Active / Success | Emerald | `#34D399` |
| Completed | Índigo | `#A5B4FC` |
| Error / Cancelled | Rojo | `#FCA5A5` |
| Processing | Azul | `#93C5FD` |
| Warning | Naranja | `#FBBF24` |
| Info | Azul claro | `#93C5FD` |
| Purple | Violeta | `#C4B5FD` |

### 4.3 Reglas de Uso de Color

**Regla 80/20:**
- 80% — Negros profundos (`bg`, `bg2`, `bg3`)
- 15% — Textos (`txt`, `txt2`, `txt3`)
- 5% — Emerald accent (CTAs, highlights, bordes activos)

**Emerald NO se usa para:**
- Bloques de fondo grandes
- Texto body largo ( cansa la vista )
- Bordes de secciones completas

**Emerald SÍ se usa para:**
- Botones primarios
- Links y texto clickeable
- Iconos y labels accent
- Bordes de cards en hover
- Puntos y bullets
- Barras de progreso
- Tags y badges

### 4.4 Gradientes

```
Primary gradient:    #10B981 → #34D399   (emerald principal a light)
Background gradient: #060A0E → #0B1117   (negro a bg2)
Card glow:           rgba(16,185,129,0.10)  (emerald con 10% opacidad)
Text shimmer:        #10B981 → #6EE7B7 → #10B981  (animado, infinito)
```

---

## 5. Tipografía

### 5.1 Fuentes

| Familia | Peso | Uso | Archivo |
|---------|------|-----|---------|
| **Syne** | 400 (Regular) | Display titulares grandes | `brand/fonts/Syne-Variable.ttf` |
| **Syne** | 700 (Bold) | Headlines, secciones | `brand/fonts/Syne-Variable.ttf` |
| **Syne** | 800 (ExtraBold) | Hero titles, impacto | `brand/fonts/Syne-Variable.ttf` |
| **DM Sans** | 400 (Regular) | Body text, descripciones | `brand/fonts/DMSans-Variable.ttf` |
| **DM Sans** | 500 (Medium) | Labels, subtitiles, nav | `brand/fonts/DMSans-Variable.ttf` |
| **DM Sans** | 700 (Bold) | Énfasis dentro de body | `brand/fonts/DMSans-Variable.ttf` |
| **DM Mono** | 400 (Regular) | Código, datos, technical | `brand/fonts/DMMono-Regular.ttf` |
| **DM Mono** | 500 (Medium) | Código destacado | `brand/fonts/DMMono-Medium.ttf` |

### 5.2 Escala Tipográfica

| Nivel | Display (Syne) | Body (DM Sans) | Tamaño |
|-------|----------------|----------------|--------|
| **Hero** | 800 | — | 72px / 80px line-height |
| **H1** | 800 | — | 48px / 56px |
| **H2** | 700 | — | 36px / 44px |
| **H3** | 700 | 500 | 28px / 36px |
| **H4** | 700 | 500 | 22px / 30px |
| **Body** | — | 400 | 16px / 26px |
| **Body small** | — | 400 | 14px / 22px |
| **Caption** | — | 500 | 12px / 18px |
| **Code** | — | DM Mono 400 | 13px / 20px |
| **Micro** | — | 500 | 11px / 16px |

### 5.3 Reglas de Tipografía

- **Tracking (letter-spacing):**
  - Headlines Syne: `-0.02em` (ligeramente cerrado)
  - Body DM Sans: `0` (default)
  - Labels/Captions: `+0.03em` (abierto, legible)
  - Code: `0` (monospace no necesita ajuste)

- **Font fallbacks:** `font-family: 'Syne', system-ui, sans-serif`

- **Nunca:** Mezclar Syne y DM Sans en la misma línea de texto.

- **Jerarquía visual:** Siempre al menos 4px de diferencia entre niveles de headline.

---

## 6. Espaciado y Layout

### 6.1 Sistema de Espaciado

Basado en **4px grid**:

| Token | Valor | Uso |
|-------|-------|-----|
| `xs` | 4px | Gap interno entre elementos hermanos |
| `sm` | 8px | Padding de badges, tags pequeños |
| `md` | 12px | Padding de cards pequeños, gaps |
| `lg` | 16px | Padding estándar de cards |
| `xl` | 24px | Padding de secciones, gaps grandes |
| `2xl` | 32px | Margen entre secciones |
| `3xl` | 48px | Secciones principales |
| `4xl` | 64px | Hero sections, separadores grandes |
| `5xl` | 96px | Max spacing (hero margins) |

### 6.2 Layout Grid

- **Max width:** 1200px (contenido principal)
- **Full bleed:** Secciones con fondo distinto usan 100% del viewport
- **Columnas:** 12 columnas, 24px gutter
- **Breakpoints:**
  - Mobile: 375px — 1 columna
  - Tablet: 768px — 2-4 columnas
  - Desktop: 1024px — 8-12 columnas
  - Wide: 1440px — 12 columnas con max-width

### 6.3 Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 6px | Badges, tags, inputs pequeños |
| `radius` | 12px | Cards, botones, modales |
| `radius-lg` | 16px | Cards grandes, contenedores |
| `radius-xl` | 24px | Hero cards, feature blocks |
| `radius-full` | 9999px | Avatars, pills, dots |

---

## 7. Iconografía

### 7.1 Estilo

- **Stroke width:** 1.5px (consistente en todo)
- **Tamaño base:** 20x20px
- **Color heredado:** Usa `currentColor` (se adapta al contexto)
- **Estilo:** Líneas simples, sin relleno, esquinas redondeadas

### 7.2 Uso de Iconos

- **CTA buttons:** Icono a la izquierda del texto
- **Features:** Icono arriba del título, centrado
- **Navigation:** Icono solo (tooltip o aria-label)
- **Status:** Icono + badge color

### 7.3 Prohibiciones

- ❌ No usar iconos decorativos sin función
- ❌ No mezclar estilos (outline + filled en la misma sección)
- ❌ No iconos animados (excepto loading spinner)
- ❌ No iconos de más de 24px sin justificación

---

## 8. Componentes de UI

### 8.1 Cards

```
┌─────────────────────────────┐
│ bg: #0B1117                 │
│ border: 1px solid #10B981@12% │
│ radius: 12px                │
│ padding: 24px               │
│                             │
│  ┌─ Header ──────────────┐  │
│  │ Icono + Título        │  │
│  └───────────────────────┘  │
│                             │
│  ┌─ Body ────────────────┐  │
│  │ Descripción o contenido│  │
│  └───────────────────────┘  │
│                             │
│  ┌─ Footer (optional) ───┐  │
│  │ CTA o metadata        │  │
│  └───────────────────────┘  │
│                             │
│ hover: border → #10B981@30% │
│        shadow → 0 0 24px    │
│               emerald@10%   │
└─────────────────────────────┘
```

### 8.2 Botones

**Primario:**
```
bg:     #10B981
color:  #060A0E (negro sobre emerald)
font:   DM Sans 700, 14px
padding: 12px 24px
radius: 12px
hover:  bg → #059669
```

**Secundario (Ghost):**
```
bg:     transparent
border: 1px solid #10B981@30%
color:  #10B981
hover:  bg → #10B981@10%, border → #10B981@50%
```

**Terciario (Subtle):**
```
bg:     #111820
border: 1px solid rgba(255,255,255,0.06)
color:  #8A9BB0
hover:  bg → #161F2A, color → #F0F4F8
```

### 8.3 Inputs

```
bg:      #111820
border:  1px solid rgba(255,255,255,0.06)
color:   #F0F4F8
radius:  6px (small) o 12px (standard)
padding: 10px 14px
focus:   border → #10B981, shadow → 0 0 0 3px #10B981@15%
```

### 8.4 Badges / Tags

```
bg:      rgba(16,185,129,0.12)
color:   #34D399
font:    DM Sans 500, 12px
padding: 3px 10px
radius:  6px
```

### 8.5 Navegación (Top Bar)

```
height:  80px
bg:      rgba(6,10,14,0.8) + blur(24px)
border:  1px solid rgba(16,185,129,0.08)
logo:    isotipo 40x40 + "NEXA" Syne 700 20px
links:   DM Sans 500 14px, #8A9BB0, hover → #F0F4F8
```

---

## 9. Voz y Tono

### 9.1 Personalidad de Marca

NEXA habla como un **ingeniero senior confiado**, no como un vendedor:

| Somos | No somos |
|-------|----------|
| Técnicos y precisos | Vagos o genéricos |
| Confianza sin arrogancia | Presumidos o agresivos |
| Educativos | Condescendientes |
| Directos | Rudos |
| Profesionales | Corporativos fríos |
| Humanos | Informales o poco serios |

### 9.2 Tomo por Contexto

| Contexto | Tomo | Ejemplo |
|----------|------|---------|
| **Post técnico** | Authoritative, directo | "El patrón observer resuelve el acoplamiento excesivo entre componentes." |
| **Case study** | Orgulloso pero medido | "Logramos reducir el tiempo de carga un 60% migrando a arquitectura modular." |
| **Educación** | Paciente, claro | "¿Por qué usamos async/await? Porque bloquear el hilo principal deja tu app sin respuesta." |
| **Behind the scenes** | Cercano, humano | "Equipo de NEXA en modo build. Cuando el deploy funciona al primer intento." |
| **CTA** | Directo, sin presión | "¿Tenés un proyecto? Hablemos." |

### 9.3 Reglas de Copy

1. **Siempre en español** (adaptado al español rioplatense / neutro)
2. **Evitar muletillas:** "increíble", "revolucionario", "game changer", "disruptivo"
3. **Evitar superlativos vacíos:** "el mejor", "número 1", "sin igual"
4. **Usar datos concretos cuando sea posible:** "60% más rápido", "3 meses de desarrollo"
5. **No usar emojis** en copy de marca (excepto en redes sociales de forma muy limitada: max 2 por post)
6. **Punto final** siempre al final de oraciones en posts de carrusel/stories
7. **Hashtags:** máximo 5 por post, todos en minúsculas, separados por punto medio (`#desarrollo-web`)

---

## 10. Fotografía e Imagen

### 10.1 Estilo de Imágenes

| Permitido | Evitar |
|-----------|--------|
| Ambientes de trabajo reales | Stock photos genéricos |
| Code screenshots con theme oscuro | Screenshots con fondo blanco |
| Equipos en reuniones/standups | Retratos corporativos formales |
| Detalles de hardware (teclados, monitores) | Imágenes de "futuro" con IA generativa |
| Minimalista, mucho espacio negativo | Collages saturados |

### 10.2 Filtros y Tratamiento

- **Overlay oscuro mínimo:** 60% negro `#060A0E` sobre fotos que tengan texto encima
- **Tono:** Frío a neutro (evitar cálidos/naranja)
- **Saturación:** -10% a -20% (look serio, no vibrante)
- **Contraste:** +10% (look definido)
- **Nunca:** Viñetas, bordes redondeados en fotos, efecto film grain excesivo

---

## 11. Animaciones y Micro-interacciones

### 11.1 Principios

- **Propósito:** Cada animación tiene una razón (feedback, orientación, fluidez)
- **Rapidez:** Transiciones de 200-300ms son ideales
- **Easing:** `ease-out` para entradas, `ease-in` para salidas, `cubic-bezier(0.16, 1, 0.3, 1)` para spring
- **Reduced motion:** Respetar `prefers-reduced-motion: reduce`

### 11.2 Tokens de Animación

```
duration-fast:    150ms    (hover states, toggles)
duration-normal:  250ms    (transiciones de card, modales)
duration-slow:    400ms    (page transitions, reveals)
duration-slower:  600ms    (hero animations)

ease-out:         cubic-bezier(0.16, 1, 0.3, 1)
ease-in:          cubic-bezier(0.7, 0, 0.84, 0)
ease-in-out:      cubic-bezier(0.65, 0, 0.35, 1)
```

### 11.3 Animaciones Aprobadas

- ✅ Fade in/out (opacidad 0→1)
- ✅ Slide up (desde 16px abajo)
- ✅ Scale (0.98→1.02 en hover de cards)
- ✅ Glow pulse (emerald box-shadow suave)
- ✅ Shimmer en gradient text
- ✅ Spin en loading spinner (emerald, 800ms)

### 11.4 Animaciones Prohibidas

- ❌ Bounce / elastic en elementos UI
- ❌ Parallax excesivo en scroll
- ❌ Texto que aparece letter-by-letter (typing effect)
- ❌ Elementos que rotan continuamente
- ❌ Animaciones que duran más de 1 segundo sin pausa

---

## 12. Redes Sociales — Guía Visual

### 12.1 Formatos

| Formato | Dimensiones | Uso |
|---------|-------------|-----|
| **Instagram Feed** | 1080x1080 | Posts principales, tips, features |
| **Instagram Story** | 1080x1920 | Behind the scenes, quick tips, CTAs |
| **X/Twitter** | 1600x900 | Tips, code snippets, announcements |
| **LinkedIn** | 1200x627 | Case studies, thought leadership |
| **Carrusel** | 1080x1080 (multi-slide) | Tutoriales, guías, features |
| **YouTube Thumbnail** | 1920x1080 | Thumbnails de videos |

### 12.2 Estructura de Post

**Feed post (1080x1080):**
```
┌──────────────────────────┐
│  50px padding top         │
│  ┌─ Pillar Tag ────────┐ │
│  │ · TECH AUTHORITY    │ │
│  └─────────────────────┘ │
│                          │
│  HEADLINE (Syne 700)    │
│  ─────────────────────   │
│                          │
│  Content block / code    │
│  mockup / feature list   │
│                          │
│  ┌─ Bottom Bar ────────┐ │
│  │ Logo + NEXA + URL   │ │
│  └─────────────────────┘ │
│  50px padding bottom     │
└──────────────────────────┘
```

**Story (1080x1920):**
```
┌──────────────────────────┐
│  Isotipo + NEXA header   │
│                          │
│  (Full visual area)      │
│                          │
│  Bottom bar: CTA swipe   │
└──────────────────────────┘
```

### 12.3 Paleta para Social Media

Usar la misma paleta del sitio web. **Nunca** crear colores nuevos para redes.

### 12.4 Frecuencia

| Plataforma | Frecuencia mínima | Máxima |
|------------|-------------------|--------|
| Instagram | 5 posts/semana | 7 posts/semana |
| X/Twitter | 5 posts/semana | 14 posts/semana |
| LinkedIn | 2 posts/semana | 3 posts/semana |
| TikTok | 3 posts/semana | 5 posts/semana |
| YouTube | 1 video/semana | 2 videos/semana |

---

## 13. Archivos de Marca — Ubicación

```
brand/
├── brand-guidelines.md      ← Este documento
├── social-content.js        ← Copy y datos de posts (separado del visual)
├── social-posts-v3.js       ← Generador visual de posts
├── skill/
│   └── SKILL.md             ← Referencia rápida para diseño
├── fonts/
│   ├── Syne-Variable.ttf
│   ├── DMSans-Variable.ttf
│   ├── DMMono-Regular.ttf
│   └── DMMono-Medium.ttf
├── src/
│   ├── logotipo-core.svg    ← Logotipo completo (icono + NEXA)
│   ├── isotipo-core.svg     ← Solo isotipo (7 polígonos)
│   ├── isotipo-dark.svg     ← Isotipo para fondo claro (grayscale)
│   └── banner-web.svg       ← Banner 1920x600 para web
└── posts/                   ← Posts generados
    ├── ig/
    ├── stories/
    ├── x/
    ├── linkedin/
    └── carrusel/
```

---

## 14. Checklist de Marca

Antes de publicar CUALQUIER asset, verificar:

- [ ] Logo tiene clear space mínimo
- [ ] Colores usados son de la paleta oficial
- [ ] Tipografía: Syne para headlines, DM Sans para body, DM Mono para código
- [ ] Jerarquía visual clara (máximo 4 niveles de tamaño)
- [ ] Contraste WCAG AA mínimo (4.5:1 para texto, 3:1 para gráficos)
- [ ] No hay contenido que contradiga el tono de marca
- [ ] Formato correcto para la plataforma
- [ ] No hay errores tipográficos
- [ ] El logo no está recortado, distorsionado, o con efectos extra
- [ ] Si es animación: respeta `prefers-reduced-motion`

---

## 15. Autoridad de Marca

- **Única persona autorizada para aprobar cambios en brand guidelines:** Fundador / Director Creativo
- **Cambios en la paleta:** Requieren revisión de accesibilidad (contraste WCAG)
- **Nuevos colores acento:** Máximo 1 nuevo color por semestre
- **Font changes:** Solo si hay una razón técnica de peso (licencia, rendimiento, legibilidad)

---

*Documento oficial de marca NEXA. Cualquier uso fuera de estas guidelines requiere aprobación explícita.*
