# NEXA Social Posts — Design Fix Plan

## Problemas Encontrados

### 1. Logo del Carousel — No centrado, muy chico
**Slide 1 (Cover):**
- `${logotipo(440, 340, 1.3)}` — viewBox del isotipo es `-40 -40 80 90`
- Ancho real: `80 * 1.3 = 104px`, alto: `90 * 1.3 = 117px`
- Centro X del canvas: `540`, centro del logo: `440 + 52 = 492` → **48px descentrado a la izquierda**
- Centro Y del canvas: `540`, centro del logo: `340 + 58 = 398` → **142px arriba del centro**

**Slide 3 (CTA):**
- `${logotipo(490, 710, 0.7)}` — ancho: `80*0.7=56`, alto: `90*0.7=63`
- Centro X: `490 + 28 = 518` → **22px descentrado**
- Centro Y: `710 + 31 = 741` → muy abajo, encima del bottom bar

### 2. Fonts se enciman — Spacing insuficiente
En todos los posts, el gap entre líneas de headline es **60px** para font-size **50px**:
- Syne 800 a 50px tiene line-height ≈ 60px (1.2em)
- Gap real entre baseline de línea 1 y top de línea 2: solo ~10px
- **Resultado: textos se tocan o se superponen visualmente**

Ejemplo concreto (Tech Authority Feed):
```
Línea 1: y=145, font-size=50  → bottom ≈ y+50 = 195
Línea 2: y=205, font-size=50  → top ≈ y-40 = 165
Superposición: 30px
```

### 3. Subtítulo se junta con headline
```
Headline 2: y=205, bottom ≈ 255
Subtitle:   y=250, font-size=17
Gap real: solo 5px → se ven pegados
```

### 4. Bottom bar logo extremadamente chico
`${logotipo(0, -18, 0.22)}` → `80*0.22 = 18px` de ancho. Invisible.

### 5. Code block — 19 líneas en 560px de alto
- Header: 40px
- Offset inicial: 24px
- 19 líneas × 22px = 418px
- Total: 40 + 24 + 418 = 482px → cabe, pero visualmente queda mucho espacio vacío abajo

### 6. Story posts — Tips se salen del canvas
Education Story: 5 tips × 180px de alto + y=430 start = 430 + 900 = 1330px
Bottom bar arranca en `1920 - 72 = 1848` → cabe, pero el último tip queda a y=1150, bottom del tip a 1300, gap de 548px al bottom bar. Mucho espacio vacío.

---

## Plan de Corrección

### A. Centro de gravedad del logo en Carousel

**Slide 1 — Cover:**
```js
// Antes: logotipo(440, 340, 1.3)
// isotipo viewBox: -40 -40 80 90
// Logo ancho real: 80 * scale, alto: 90 * scale
// Para centrar en canvas 1080x1080:
// x = 540 - (80 * scale / 2)
// y = 380 - (90 * scale / 2)  (centrado visual, no matemático)
logotipo(540 - (80*1.3/2), 380 - (90*1.3/2), 1.3)
// = logotipo(488, 320, 1.3)
```

**Slide 3 — CTA:**
```js
// Logo debajo del botón CTA, centrado
// Canvas 1080x1080, bottomBar arranca en 1008
// Logo entre CTA button (y=576) y bottom bar
logotipo(540 - (80*0.8/2), 760 - (90*0.8/2), 0.8)
// = logotipo(508, 724, 0.8)
```

### B. Spacing entre headline lines

**Regla:** Gap mínimo entre líneas de headline = `fontSize * 0.35`

| Post | Font size | Gap actual | Gap nuevo | y línea 1 | y línea 2 | y línea 3 |
|------|-----------|------------|-----------|-----------|-----------|-----------|
| Tech Authority Feed | 50px | 60px | 70px | 145 | 215 | — |
| Services Feed | 48px | 60px | 68px | 145 | 213 | — |
| Education Feed | 42px | 55px | 60px | 145 | 205 | — |
| Brand Story Feed | 44px | 60px | 65px | 260 | 325 | 405→425 |
| Social Proof Feed | 48px | 60px | 68px | 145 | 213 | — |
| Stories (todos) | 50-54px | 70px | 78px | — | — | — |

### C. Subtitle spacing
**Regla:** Subtitle siempre con gap mínimo de `12px` después del último headline.

### D. Bottom bar logo
Cambiar de `0.22` a `0.35` de scale:
```js
// Antes: logotipo(0, -18, 0.22)  → 18px ancho
// Después: logotipo(0, -18, 0.35) → 28px ancho (visible pero no dominante)
```

### E. Code block — optimizar uso del espacio
- Reducir height de 560 a 520 en Feed
- Ajustar lineHeight de 22 a 21 si es necesario
- 19 líneas × 21 = 399 + 40 + 24 = 463px → cabe cómodo en 520px

### F. Stories — re-distribuir espacio vertical
- Mover contenido más abajo para reducir espacio vacío entre último item y bottom bar
- Tip cards: reducir gap de 180 a 165px

---

## Formato de Prueba

Cada corrección se testea **post por post**, generando solo el SVG (sin PNG) para revisión rápida.

**Orden de prueba:**
1. Carousel Cover (Slide 1) — logo centrado
2. Carousel CTA (Slide 3) — logo centrado
3. Tech Authority Feed — spacing headline
4. Services Feed — spacing headline + cards
5. Education Feed — spacing headline + tips
6. Brand Story Feed — headline 4 líneas
7. Social Proof Feed — headline + big stat
8. Tech Authority Story — spacing vertical
9. Services Story — cards spacing
10. Education Story — tips spacing
11. Brand Story Story — headline 4 líneas
12. Tech Authority X — layout completo
13. Brand Story X — headline + stats
14. Social Proof X — big stat + metrics
15. Social Proof LinkedIn — layout completo

Cada post se genera como SVG individual, el usuario revisa, y dice cuáles están listos para PNG final.
