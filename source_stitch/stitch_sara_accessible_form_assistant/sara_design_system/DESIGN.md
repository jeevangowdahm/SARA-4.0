---
name: SARA Design System
colors:
  surface: '#f8f9fd'
  surface-dim: '#d9dade'
  surface-bright: '#f8f9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3f7'
  surface-container: '#edeef2'
  surface-container-high: '#e7e8ec'
  surface-container-highest: '#e1e2e6'
  on-surface: '#191c1f'
  on-surface-variant: '#45464d'
  inverse-surface: '#2e3134'
  inverse-on-surface: '#eff1f5'
  outline: '#76777e'
  outline-variant: '#c6c6ce'
  surface-tint: '#535e7a'
  primary: '#000002'
  on-primary: '#ffffff'
  primary-container: '#101b34'
  on-primary-container: '#7983a2'
  inverse-primary: '#bbc6e7'
  secondary: '#006b58'
  on-secondary: '#ffffff'
  secondary-container: '#6ef6d4'
  on-secondary-container: '#00705c'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#091f1b'
  on-tertiary-container: '#718983'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#bbc6e7'
  on-primary-fixed: '#101b34'
  on-primary-fixed-variant: '#3c4662'
  secondary-fixed: '#71f9d7'
  secondary-fixed-dim: '#50dcbc'
  on-secondary-fixed: '#002019'
  on-secondary-fixed-variant: '#005142'
  tertiary-fixed: '#cfe8e1'
  tertiary-fixed-dim: '#b3ccc5'
  on-tertiary-fixed: '#091f1b'
  on-tertiary-fixed-variant: '#354b46'
  background: '#f8f9fd'
  on-background: '#191c1f'
  surface-variant: '#e1e2e6'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.015em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

This design system establishes the visual and behavioral framework for an intelligent, assistive conversational agent. The product solves cognitive, language, literacy, and motor barriers across digital forms and complex workflows.

### Brand Personality
- **Reassuring & Patient:** Never rushed, anxious, or visually chaotic. Communicates calm authority and empathetic guidance.
- **Precision Engineered:** Imbued with Linear-grade typographic cadence, rigorous pixel alignment, and predictable information hierarchy.
- **Human-Centric & Transparent:** Employs Apple-inspired spatial clarity, approachable language primitives, and explicit system state feedback.
- **Futuristic yet Unobtrusive:** Expresses synthetic intelligence through organic, breathing kinetic states (voice orbs, subtle frequency waves) rather than decorative tech clutter.

### Design Movement & Aesthetic Tone
The style synthesizes **Precision Minimalist SaaS** with **Tactile Accessibility Ergonomics**. Interfaces balance ultra-refined low-contrast container framing with high-contrast, WCAG 2.2 AA compliant typography and interaction targets. Surfaces feel weightless, pristine, and deliberate.

## Colors

The palette establishes pristine contrast ratios, prioritizes legibility, and reserves vibrant pigmentation strictly for system presence, interactive affordances, and active voice assistance.

### Palette Architecture
- **Midnight Navy (`#101B34`):** Primary structural surface, inverted badges, high-priority buttons, and anchor brand marks.
- **Deep Navy (`#182746`):** Secondary structural element, dark container background, and deep state accents.
- **Primary Text (`#18243D`):** Applied across display headlines, body copy, and active labels. Yields a minimum contrast ratio of 12.6:1 against Ivory canvas backgrounds.
- **Secondary Text (`#68758D`):** Helper text, captions, and inactive meta-labels. Guarantees a minimum 4.8:1 contrast ratio against white/ivory containers, exceeding WCAG 2.2 AA standards.
- **Teal (`#17B99A`):** The primary kinetic signal. Represents AI comprehension, conversational turn-taking, active microphone state, and primary positive validation.
- **Soft Mint (`#DFF8F1`):** Ambient speech bubble tint, active step backdrops, and luminous highlight rings for voice synthesis orbs.
- **Ivory Canvas (`#F7F8FC`):** Soft, anti-glare primary canvas base reducing eye fatigue during sustained screen reading.
- **White (`#FFFFFF`):** High-level elevation containers, input backgrounds, and conversational surface cards.
- **System Borders (`#E5EAF2`):** Crisp boundary delineations between interactive components and baseline canvas.
- **Focus Ring Accent (`#17B99A`):** Pure 3px high-visibility outline offset by 2px white halo for universal assistive keyboard navigation.

## Typography

The typographic hierarchy uses **Plus Jakarta Sans** for headlines to convey human warmth, **Inter** for optimized body legibility, and **JetBrains Mono** for status flags and metadata.

### Typographic Principles
- **Readability Over Density:** Body line heights sit comfortably between 155% and 165% to support users with dyslexia or cognitive fatigue.
- **Strict Size Floor:** Never render functional interactive text below 14px (`body-sm`). Technical metadata may use `label-md` or `label-mono` (12px), restricted strictly to non-critical supplementary info.
- **Tabular & Monospace Accents:** JetBrains Mono is deployed for form step indices, speech recognition confidence metrics, audio timing, and state tags.

## Layout & Spacing

Layouts follow an 8pt architectural rhythm, calibrated to prevent spatial crowding and mis-clicks by users with fine-motor challenges.

### Layout Mechanics
- **Split-View Canvas:** Desktop layouts use a split model: a fixed-column conversational companion (480px) on the left/right and an adaptable fluid document workspace filling the remainder.
- **Max Readable Width:** Reading and conversational response blocks never exceed 680px (roughly 60–75 characters per line).
- **Responsive Adaptations:**
  - **Desktop (1024px+):** 12-column fluid grid, 2.5rem outer canvas margins, 1.5rem gutters.
  - **Tablet (768px - 1023px):** 8-column layout with conversational interface dockable as a bottom sheet or side panel.
  - **Mobile (<768px):** Single-column stacked stream. Conversational bar pinned to the bottom safe area with minimum touch heights of 48px.

## Elevation & Depth

This design system avoids heavy drop shadows, relying instead on structural surface tinting, hair-line borders, and luminous radial glows to indicate assistant states.

### Elevation Hierarchy
- **Level 0 (Canvas):** Base background rendered in `#F7F8FC`. No borders, no shadows.
- **Level 1 (Surface Cards & Fields):** Rendered in `#FFFFFF` with a crisp structural outline: `border: 1px solid #E5EAF2`. A micro-shadow provides depth: `0 1px 3px rgba(16, 27, 52, 0.04)`.
- **Level 2 (Interactive Floating Trays & Flyouts):** Active form overlays, dynamic auto-fill proposals, and speech modals sit at `#FFFFFF` with `border: 1px solid #E5EAF2` and shadow: `0 12px 32px -4px rgba(16, 27, 52, 0.08), 0 4px 12px -2px rgba(16, 27, 52, 0.03)`.
- **Level 3 (Conversational AI Orb / Voice Surface):** Ambient gradient luminescence using `#17B99A` with 20% to 40% alpha blur: `box-shadow: 0 0 40px 10px rgba(23, 185, 154, 0.20)`. The aura expands and contracts rhythmically using CSS scale transforms to indicate listening and speaking cycles.

## Shapes

The shape system employs roundedness level **2**, striking a balance between consumer-grade tactile comfort and high-utility SaaS precision.

### Geometric Application
- **Base Components (Inputs, Small Buttons, Badges):** 0.5rem (`rounded-base`).
- **Interactive Containers (Form Fields, Conversation Cards, Modals):** 1rem (`rounded-lg`).
- **Surface Enclosures (Assistant Docks, Major Panels):** 1.5rem (`rounded-xl`).
- **Pill Exceptions:** Voice controls, speech waveforms, and live status pills use fully rounded circular caps (`border-radius: 9999px`) to visually separate continuous audio signals from structured form inputs.

## Components

Every interactive element is designed to exceed WCAG 2.2 AA target size criteria (minimum interactive bounding box of 44x44px).

### Buttons
- **Primary Action:** Solid Midnight Navy (`#101B34`) fill, `#FFFFFF` text, `font-weight: 600`, 0.5rem corner radius. Minimum height 48px with 1.5rem horizontal padding. Focus state features a 3px outline in `#17B99A` offset by 2px.
- **Assistant Action (Voice Trigger):** Deep Navy (`#182746`) or Teal (`#17B99A`) gradient fill with dynamic wave icon. Shows audio pulse rings when active.
- **Secondary / Ghost:** `#FFFFFF` fill with `1px solid #E5EAF2` border, `#18243D` text. Hover shifts background to `#F7F8FC` with border `#68758D`.

### Conversational Orb & Waveform Display
- **Orb Structure:** Concentric radial pill/circle combining `#17B99A` and `#DFF8F1`.
- **States:**
  - *Idle:* Steady `#17B99A` perimeter ring, 40% opacity.
  - *Listening:* 4 animated SVG vertical bars modulating height inside the orb.
  - *Processing:* Smooth gradient sweep rotation across the perimeter.
  - *Speaking:* Smooth harmonic pulsing with `#DFF8F1` ambient back-glow.

### Form Inputs & Text Fields
- **Container:** High-contrast white card (`#FFFFFF`) with `1px solid #E5EAF2`. Height: 52px for single-line inputs.
- **Accessibility Enhancements:** Integrated assistant micro-action button docked inside the field's trailing edge (allowing 1-click voice dictation or assistive rephrasing).
- **Labels:** Rendered externally above the field in `body-sm` (`#18243D`, weight 600), never hidden inside placeholder text.
- **Validation:** Assistant suggestion pills appear below invalid inputs with clear, plain-language correction hints.

### Checkboxes & Radio Controls
- **Hit Area:** Outer bounding container is padded to a minimum of 44x44px.
- **Checkbox:** 22x22px square, 6px radius, `2px solid #E5EAF2`. Checked state: `#101B34` fill with white assistive checkmark icon.
- **Radio:** 22x22px circle, `2px solid #E5EAF2`. Selected state: `#101B34` border with `#17B99A` inner dot (8px).

### Assistant Suggestion Chips
- **Geometry:** 36px height, rounded-full pill.
- **Surface:** `#DFF8F1` background, `1px solid rgba(23, 185, 154, 0.4)` border, `#101B34` text.
- **Behavior:** Keyboard focusable via Tab key; actionable via Space/Enter to instantly populate complex form inputs.

### Live Transcript Cards
- **Human Bubble:** White `#FFFFFF` card, aligned right, `#18243D` typography, subtle `#E5EAF2` border.
- **Assistant Bubble:** Mint-tinted `#DFF8F1` card, aligned left, accented with a 3px solid `#17B99A` vertical left indicator stripe to reinforce AI authorship.