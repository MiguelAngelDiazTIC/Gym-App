---
name: Gym-App
description: Personal dark-mode fitness tracker — weight, routines, and nutrition — for phone use over the home LAN
colors:
  void-black: "#08080c"
  glass-surface: "rgba(255,255,255,0.06)"
  glass-surface-hover: "rgba(255,255,255,0.09)"
  elevated-surface: "#18181f"
  hairline: "rgba(255,255,255,0.08)"
  hairline-strong: "rgba(255,255,255,0.16)"
  text-primary: "#f5f5f7"
  text-secondary: "#98989f"
  text-tertiary: "#57575f"
  ember-warm: "#ff6b4a"
  ember-hot: "#ff2d55"
  ember-coral: "#ff3b5c"
  ember-coral-soft: "rgba(255,59,92,0.14)"
  success-green: "#32d74b"
  signal-yellow: "#ffd60a"
  ice-blue: "#64d2ff"
  scrim: "rgba(4,4,8,0.72)"
typography:
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.5px"
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.2px"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14.5px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.1px"
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0px"
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "linear-gradient(135deg, {colors.ember-warm} 0%, {colors.ember-hot} 100%)"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "11px 20px"
  button-secondary:
    backgroundColor: "{colors.glass-surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "10px 18px"
  chip-active:
    backgroundColor: "{colors.text-primary}"
    textColor: "#0a0a0d"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  card:
    backgroundColor: "{colors.glass-surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "{colors.glass-surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "11px 14px"
---

# Design System: Gym-App

## Overview

**Creative North Star: "The Midnight Training Console"**

Gym-App reads like a focused instrument, not a lifestyle app: a near-black canvas that gets out of the way, translucent glass panels that layer content without cluttering it, and a single warm accent that appears only where it means something (a primary action, an active tab, a highlighted metric). Nothing is decorative. Every surface exists to get a number logged and get out of the user's way, on a phone, one-handed, mid-workout.

The one indulgence is motion: cards and sheets settle into place with critically-damped spring physics rather than linear fades, so the app feels alive without feeling loud. There is no hero imagery, no marketing flourish — the personality lives entirely in restraint, materials (glass, blur, soft shadow), and the rare warm gradient.

**Key Characteristics:**
- Near-black canvas (`#08080c`) with translucent "glass" surfaces layered on top, never flat white cards on black.
- One accent — a warm coral-to-red gradient — reserved for primary actions and active states.
- Cards float via soft diffuse shadow, never a hard border.
- Full pill radius on every button and chip; larger surfaces (cards, sheets) step down to 24px/32px corners instead.
- Motion is spring-based and critically damped (no bounce) everywhere except momentum/celebratory moments.
- A single typeface (Inter) carries the whole hierarchy through size and weight alone — no secondary display font.

## Colors

Almost entirely neutral (near-black, layered translucent whites) with one warm accent that is deliberately rare, plus three fixed macro-tracking colors that double as a small semantic palette.

### Primary
- **Ember Gradient** (`linear-gradient(135deg, #ff6b4a 0%, #ff2d55 100%)`): primary buttons, the active-tab indicator bar, avatar-initial badges. Always with a soft coral drop shadow beneath it.
- **Ember Coral** (`#ff3b5c`): the flat form of the accent — focus rings (`ember-coral-soft` at 14% opacity), the "active card" outline, and the protein macro color.

### Neutral
- **Void Black** (`#08080c`): app background, the only pure-dark surface.
- **Glass Surface** (`rgba(255,255,255,0.06)`): default card/input background — a faint white wash over black, not a separate hex.
- **Glass Surface Hover** (`rgba(255,255,255,0.09)`): hover/press state for the same surfaces.
- **Elevated Surface** (`#18181f`): the one solid (non-translucent) surface — bottom sheets and modals sit above the glass layer.
- **Hairline** (`rgba(255,255,255,0.08)`) / **Hairline Strong** (`rgba(255,255,255,0.16)`): reserved for header/tab-bar dividers, the drag handle on sheets, and the dashed "add" tile — never for card edges.
- **Text Primary** (`#f5f5f7`), **Text Secondary** (`#98989f`), **Text Tertiary** (`#57575f`): three-step text hierarchy, all warm-neutral off-white/gray rather than pure gray.

### Semantic (macro tracking)
- **Signal Yellow** (`#ffd60a`): carbs, and the shared `warning` role.
- **Ice Blue** (`#64d2ff`): fat.
- **Ember Coral** (`#ff3b5c`): protein — intentionally the same value as the primary accent rather than a fourth hue.
- **Success Green** (`#32d74b`): positive/confirmation states.

### Named Rules
**The One Voice Rule.** The ember gradient/coral is the only warm color in the system. It marks exactly one thing per screen — the primary action or the active state — never a decorative fill.

## Typography

**Body/UI Font:** Inter (with `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` fallback)

**Character:** A single grotesque sans carries every role. Hierarchy comes entirely from size, weight, and negative letter-spacing (tighter as text gets larger), never from a second family.

### Hierarchy
- **Headline** (800, 28px, 1.1 line-height, -0.5px tracking): screen titles (`ScreenTitle`) — one per tab.
- **Title** (700, 16px, 1.2, -0.2px): profile name in the header, card-level titles.
- **Body** (500, 14.5px, 1.4, -0.1px): buttons, general UI text. Inputs bump to 16px specifically to stop iOS Safari's zoom-on-focus.
- **Label** (600, 13px, 1.2): section labels, field labels, tab-bar captions (10.5px variant).

## Layout

Single-column mobile shell capped at `max-width: 480px` and centered — this is a phone app first, viewed in a browser. The viewport is `100dvh` with `overflow: hidden` on the outer shell; only the content region between the header and tab bar scrolls (`overflow-y: auto`), which avoids iOS Safari's chrome-jump on nested scrolling.

Structure is a fixed three-layer stack: a `sticky` translucent header (top), the single scrolling content region (middle, `padding-bottom: calc(90px + safe-area-inset-bottom)` to clear the tab bar), and a `fixed` translucent tab bar (bottom). Screen content uses a `1.25rem` (20px) gutter; card internal padding runs `0.9–1rem`; small gaps between related elements step through `4px / 6px / 8px / 10px`. All edge-hugging chrome (header top padding, tab bar bottom padding) adds `env(safe-area-inset-*)`.

## Elevation & Depth

Hybrid of soft shadow and translucent material — never a hard border for depth. Cards get a faint inset top highlight plus a diffuse drop shadow, reading as a "frosted" edge without an outline. The header, tab bar, and modal scrim use `backdrop-filter: blur(20px) saturate(180%)` over a translucent dark fill, so content behind them stays legible while they clearly float above it.

### Shadow Vocabulary
- **Card** (`inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 32px -12px rgba(0,0,0,0.55)`): default resting elevation for cards.
- **Floating** (`inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 48px -16px rgba(0,0,0,0.65)`): bottom sheets/modals — a deeper version of the same recipe.
- **Active card ring** (`0 0 0 1.5px {ember-coral}55` composed with the Card shadow): the only case a card gets a visible edge, marking selection.

### Named Rules
**The No Hard Edge Rule.** Depth comes from shadow and blur, never from a 1px border on a card. Borders/hairlines are reserved for dividers and the dashed "add" affordance.

## Shapes

Five-step radius scale, all circular corners (no cut/faceted geometry): `sm` 12px (icon buttons), `md` 16px (inputs), `lg` 24px (cards), `xl` 32px (modal top corners only — bottom sheets), `pill` 999px (every button and chip). Buttons and chips are always fully rounded regardless of size; only container-level surfaces (cards, sheets) use the smaller fixed-radius steps.

## Components

### Buttons
- **Shape:** always pill (999px radius) at every size.
- **Primary:** ember gradient fill, white text, 11px/20px padding, 14.5px/600 weight text, coral drop shadow (`0 4px 14px -4px rgba(255,45,85,0.5)`) beneath it.
- **Secondary:** glass-surface fill, secondary text color, no shadow — visually quiet next to Primary.
- **Icon:** ghost (no fill), secondary text color (bumped from tertiary — tertiary fails WCAG AA contrast on icon-only controls), `sm` (12px) radius, tighter padding. Every icon button requires a `label` prop (sets `aria-label`).
- **Chip (toggle):** glass-surface when inactive; inverts to solid `text-primary` fill with near-black text when active — the one place the app uses a light-on-dark inversion instead of the accent.
- **Hover/Press:** every button scales down on tap (`whileTap`, 0.85–0.96 depending on size) with the snappy spring (`bounce: 0, duration: 0.22`); no color hover state since this is a touch-first surface.

### Cards
- **Corner Style:** `lg` (24px).
- **Background:** glass-surface (translucent white-on-black).
- **Shadow Strategy:** Card shadow (see Elevation & Depth); no border.
- **Motion:** fade + 8px slide-in on mount, slight `0.985` scale-down on tap when interactive, animates out on removal instead of vanishing (e.g. deleting a logged set).

### Inputs / Fields
- **Style:** glass-surface fill, `md` (16px) radius, no visible border at rest, 16px font (iOS zoom guard).
- **Focus:** a 2px coral glow ring (`0 0 0 2px {ember-coral-soft}`) fades in via `box-shadow` transition — no border color shift, no outline.
- **Label:** 13px/600 secondary-color caption, 6px above the field.

### Navigation (bottom tab bar)
- **Style:** fixed, translucent blurred material, icon (21px, Lucide) over a 10.5px/600 label.
- **Active state:** icon and label switch to primary text color with a thicker stroke (2.4 vs 2.0), and a `layoutId`-animated 2px gradient bar slides beneath the active icon — the indicator moves via shared-layout spring rather than fading in/out.

### Bottom Sheet (Modal)
- **Corner Style:** `xl` (32px) top corners only; full-bleed bottom, capped at 480px width to match the shell.
- **Background:** the one solid surface (`elevated-surface`, `#18181f`), not glass — it needs to be legible over its own scrim.
- **Scrim:** near-black at 72% opacity with a 2px blur, tap-to-dismiss.
- **Entry/Exit:** slides up from `translateY(100%)` with the default spring; a 36×5px pill drag handle sits centered above the content as the only affordance signaling "sheet."
- **Keyboard:** tracks the on-screen keyboard inset and shifts up (`translateY(-keyboardInset)`) rather than letting the keyboard cover the field.

### Disclosure (expand/collapse)
- **Mechanism:** CSS Grid `grid-template-rows` tween (`0fr` → `1fr`) with an eased cubic-bezier, not a JS-measured height animation — stays correct even if the content resizes while open.

### Confirm-Delete Control
- **Mechanism:** the single control every destructive delete in the app routes through (`ui/ConfirmDeleteButton.tsx`). One tap arms it — the bare ghost trash icon swaps in place for an explicit Cancel (neutral) / Confirm (solid ember-coral) pair, auto-disarming after 4s if untouched. A second, spatially distinct tap on the coral button actually deletes. No modal, no interruption — the confirmation lives at the point of the tap itself.
- **Shape:** `pill` radius on every state, same as every other button/chip in the system.
- **Hit area:** every state (trigger, cancel, confirm) reserves a 44×44px minimum hit box regardless of the visual icon size (12–15px), so a delete never fires from an imprecise tap.
- **Color:** trigger uses the same ghost/secondary treatment as any icon button; only the armed Confirm button takes the ember accent — the one moment on that control where the accent's rarity (The One Voice Rule) is earned by the action actually being irreversible.

### Named Rules
**The Two-Tap Delete Rule.** Nothing in this app is ever deleted from a single tap — including an in-progress, unsaved session, not just a saved record. Every destructive or discard action arms on the first tap and requires a second, deliberate tap on a distinct control to confirm.

### Keyboard Focus
- **Mechanism:** no component sets its own `outline`; a single global rule in `index.css` gives every `<button>` and `role="button"` element a 2px ember-coral `:focus-visible` ring (12px radius, the `sm` step), suppressed on mouse/touch focus via `:focus:not(:focus-visible)`.
- **Coverage:** every click-only navigation control (profile selection, week rows, exercise/meal disclosures) is a real focusable `<button>` or a `role="button"` with Enter/Space handling — nothing that responds to a tap is keyboard-unreachable.

### Floating Action Button (Fab)
- **Mechanism:** the primary "create new" action for a list-home screen (`ui/Fab.tsx`) — pill-shaped, ember-gradient fill, portaled to `document.body` (same reason as Modal: a fixed-position child of App's animated tab-switch wrapper would otherwise get trapped in that wrapper's transformed box instead of the viewport).
- **Position:** fixed, bottom-right, floating just above the bottom tab bar — the reachable zone on a one-handed, mid-workout phone screen, not the header.
- **When to use:** the single highest-frequency "add" action on a list-home screen (a new weight entry, a new routine, a new week, a new nutrition day). Not for actions already anchored at the bottom of their own flow (e.g. "Finalizar entrenamiento," "Crear rutina") — those are already thumb-reachable full-width buttons at the end of their form.

## Do's and Don'ts

### Do:
- **Do** reserve the ember gradient/coral for exactly one thing per screen — a primary action or the active state (The One Voice Rule).
- **Do** convey card edges with the Card shadow (soft inset highlight + diffuse drop shadow); never add a border to a card.
- **Do** use the critically-damped spring (`bounce: 0, duration: 0.35`) as the motion default; reserve the slight-bounce spring (`0.25`) for momentum/celebratory moments only.
- **Do** keep any text-input font-size at 16px minimum to prevent iOS Safari's zoom-on-focus.
- **Do** give every button/chip full pill radius regardless of size; step containers down through the fixed `sm/md/lg/xl` scale instead.

### Don't:
- **Don't** add a hard 1px border to a card for definition — `hairline`/`hairline-strong` are for dividers and the dashed "add" tile only.
- **Don't** use bounce/elastic easing for standard taps or transitions; it's reserved for the rare momentum moment.
- **Don't** introduce a second accent hue — protein intentionally reuses the primary accent color rather than getting its own.
- **Don't** nest a second scroll container inside the content region; the header and tab bar are fixed/sticky specifically so there is exactly one scrollable area.
