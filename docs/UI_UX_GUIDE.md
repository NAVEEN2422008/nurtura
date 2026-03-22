# NURTURA — UI/UX Design Guide

This document describes the UI/UX system for NURTURA and how the current experience supports safety, clarity, and maternal trust.

---

## 1) Design Goals

- Calm, non‑anxious visual language.
- Clear hierarchy for low‑stress decision making.
- Mobile‑first with large tap targets.
- High contrast for readability.
- Reinforce safety and “decision support, not diagnosis.”

---

## 2) Visual Direction

**Look & feel**
- Soft medical calm with warm accents.
- Clean, airy surfaces and gentle depth.
- Neutral backgrounds with subtle gradients to avoid clinical harshness.

**Primary emotions**
- Safety
- Reassurance
- Clarity
- Trust

---

## 3) Typography

- Display font: `Fraunces` (headings, section titles)
- Body font: `Manrope` (all body content and UI)

Applied in:
- `frontend/src/pages/_app.tsx`
- `frontend/src/styles/globals.css`

---

## 4) Color System

**Core palette (Tailwind)**
- `primary`: `#2f6f6d`
- `accent`: `#e58c6b`
- `soft-lavender`: `#f4f6f2`
- `soft-peach`: `#fce7d8`
- `soft-mint`: `#dff3ee`
- `soft-blue`: `#e6f0ff`

**Meaning**
- Primary = trust and guidance
- Accent = warmth and highlights
- Soft tones = safe backgrounds and calm surfaces

Defined in:
- `frontend/tailwind.config.js`
- `frontend/src/styles/globals.css`

---

## 5) Layout & Spacing

- Max width containers for focus (`max-w-7xl`, `max-w-4xl`).
- Generous padding (`p-6` to `p-10`) for touch devices.
- Cards and sections separated by 24–32px vertical rhythm.

---

## 6) Core UI Primitives

Reusable classes in `frontend/src/styles/globals.css`:

- `.nurtura-bg` — soft layered radial background
- `.card-surface` — glassy surface for key content
- `.card-strong` — heavier container for modals and alerts
- `.surface-muted` — small muted surfaces for hints
- `.chip` — small status labels
- `.btn-primary` — main CTA
- `.btn-secondary` — secondary actions
- `.btn-ghost` — light utility actions
- `.input-surface` — standard text inputs

---

## 7) Navigation System

- Mobile uses **bottom navigation** (Home, Symptom Check, AI Assistant, Emergency).
- Desktop uses a **sidebar navigation** with the same 4 items.
- Implemented in `frontend/src/components/AppShell.tsx`.

---

## 8) Interaction Patterns

**Confirmation-first**
- All advice flows require confirmation before sending.
- Confirm modal uses `ConfirmSheet`.

**Emergency escalation**
- High risk surfaces a strong emergency overlay.
- Actions: Call hospital, share location.

**Voice flow**
- STT → confirm → send → TTS reply.
- Avoids accidental message submission.

---

## 9) Mobile UX Principles

- Buttons minimum 44px height.
- Important actions pinned to bottom or primary in view.
- Input forms use simple stacked blocks.
- Reduced visual noise in small screens.

---

## 10) Accessibility

- High contrast CTA and text.
- Large font sizes for key actions.
- Clear labels + error messaging.
- Emergency actions are unambiguous and bold.

---

## 11) Page-Level Notes

**Landing**
- Safety story and decision‑support framing.
- Structured onboarding CTA.

**Home (Smart Care Cards)**
- Personalized greeting and pregnancy progress ring.
- Status card with reassurance and safety framing.
- Quick actions for symptom check, AI assistant, and emergency.
- Daily tip and language reminder cards.

**Symptom Checker**
- Step-by-step flow: select → confirm → results.
- Structured inputs only.

**AI Chat**
- Empathy + explanation + action layout.
- Voice + TTS buttons visible and friendly.

**Emergency Screen**
- Red‑dominant, urgent call‑to‑action.
- Immediate steps list and breathing support.

**Language Selection**
- Simple list with clarity on safe templates.

---

## 12) Motion & Feedback

- Subtle hover elevation on buttons/cards.
- Soft transitions (no aggressive motion).
- Loading states with calm spinners.

---

## 13) Safety Copy Rules

- No diagnosis language.
- Use “decision support” language.
- Always recommend consulting a provider.
- Keep sentences short and neutral.

---

## 14) Key Files

- `frontend/src/styles/globals.css`
- `frontend/tailwind.config.js`
- `frontend/src/pages/index.tsx`
- `frontend/src/pages/dashboard.tsx`
- `frontend/src/pages/symptom-checker.tsx`
- `frontend/src/pages/ai-chat.tsx`
- `frontend/src/pages/emergency.tsx`
- `frontend/src/pages/language.tsx`
- `frontend/src/components/ConfirmSheet.tsx`
- `frontend/src/components/EmergencyAlert.tsx`
- `frontend/src/components/AppShell.tsx`
