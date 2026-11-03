# HALALNiaga — Brand and identity notes

## The idea

**The Verified Seal.** HALALNiaga's mark is an eight-point geometric seal with a
checkmark cut out of its centre.

- The eight-point star is a common motif in Islamic geometric pattern and Sabah's
  craft vocabulary. It signals a seal of assurance without using a crescent, dome
  or leaf.
- The check is the product: verification. It is negative space, not an added
  badge, so the mark cannot be mistaken for decoration.
- The mark is deliberately a *seal*, never a certification logo. It identifies a
  programme record, not a halal certificate.

The wordmark pairs a disciplined sans-serif **HALAL** with an italic serif
**Niaga** ("trade" in Malay). The contrast says: structured system, local
economy.

## Files

| File | Use |
| --- | --- |
| `public/logo.svg` | Primary seal, forest green |
| `public/logo-mono.svg` | One-colour print / embossing |
| `public/logo-reversed.svg` | Light mark on dark backgrounds |
| `public/favicon.svg` | App icon and favicon: seal reduced to a tile + check |
| `public/pattern.svg` | Subtle geometric background tile |
| `public/og.svg` | Social / presentation card |

## Construction

- Canvas: `viewBox="0 0 256 256"`.
- Outer radius 104, inner radius 68, 16 alternating vertices at 22.5° steps.
- Check: `M 92 132 L 116 156 L 164 100`, stroke 23, round caps and joins, cut
  out with a mask so the mark works on any background.
- Optical centre is the geometric centre; the check is weighted slightly below
  the midpoint so the mark feels grounded.

## Clear space and minimum size

- Clear space: at least **25% of the seal height** on every side. Do not let
  text, rules or other logos enter this zone.
- Minimum sizes: **24 px** for the seal in UI, **16 px** for the tile icon,
  **10 mm** for print.
- Never redraw, rotate, stretch or outline the mark.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| Forest 800 | `#0B4F3C` | Primary brand, seal, primary buttons |
| Forest 700 | `#0F6049` | Hover, links |
| Gold 400 | `#D8AE62` | Accent, seal on dark, recognition tier |
| Gold 100 | `#F4E8D2` | Soft accent surfaces |
| Ivory | `#FAF7F0` | Page background |
| Ink | `#10231D` | Primary text |
| Ink 3 | `#64766D` | Secondary text (meets contrast on ivory) |

Do not place gold text on ivory for body copy; use Forest 700 or Ink. The mark
may be rendered in one colour at any of the approved tones.

## Typography

- **Fraunces Variable** — display and pull quotes. Its soft serif keeps the
  identity human and food-adjacent rather than corporate.
- **Inter Variable** — interface, body copy and navigation.
- **IBM Plex Mono** — data labels, dates, certificate numbers and scores.

## Misuse

- Do not use the Malaysian halal logo, JAKIM marks or any certification logo in
  the identity.
- Do not add gradients, shadows, bevels or photographic fills to the seal.
- Do not place the seal inside a circular badge with the words "certified" or
  "halal certified".
- Do not imply government endorsement, supplier endorsement or partnership with
  any named retailer.
- Do not rename the programme recognition tiers to sound like certification.

## Voice

Plain, practical, specific. Short sentences. Avoid promises the system cannot
keep. Always distinguish:

- **Halal certification** — issued by JAKIM or a recognised state Islamic
  authority.
- **HALALNiaga programme recognition** — participation, training and evidence,
  maintained through monitoring.
