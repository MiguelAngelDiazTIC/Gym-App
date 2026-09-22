# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The owner and their family/friends, each with their own profile (name + optional photo) on a shared installation. Each person tracks their own body weight, workout routines, and nutrition independently.

## Product Purpose

A personal fitness tracker covering three areas — body weight over time, workout routines (organized as weeks → days → exercises → sets), and daily nutrition/macros — built to match exactly how the owner trains and eats, with nothing extra.

## Positioning

Full control and simplicity tailored to the owner's own training structure, instead of a generic commercial fitness app (Strong, MyFitnessPal, etc.): no accounts, no ads, no forced feature set — just the fields and workflow this household actually uses.

## Operating Context

Runs as a local web app (React + Vite + TypeScript), typically opened from a phone browser over the home LAN. Mobile-first layout (max-width ~480px, safe-area insets, sticky translucent header, bottom tab bar). Entry point is a profile-selection screen before any tab (Weight / Rutina / Nutrición) is reachable.

## Capabilities and Constraints

- Spanish-only UI; no multi-language support planned.
- Data is stored 100% locally (localStorage), no external database or cloud sync.
- Multi-profile: weight log, routine builder (weeks of days of exercises, with per-set reps/weight logging), and nutrition/macro tracking (meals grouped by type, per-item kcal/protein/carbs/fat).
- IDs must go through the project's `generateId()` helper rather than `crypto.randomUUID()` directly, since LAN access over plain HTTP is a non-secure context where `crypto.randomUUID` is unavailable.

## Product Principles

1. No accounts, no cloud, no ads — the owner keeps full control of their own data.
2. Ship exactly the fields the household needs (weight, per-day routine, macros) — no generic bloat.
3. One installation serves multiple real people via lightweight profile switching, not multi-tenant infrastructure.
4. Spanish-only, mobile-first — optimize for the actual use case (phone, home LAN) over broad compatibility.
5. Data stays on-device/local; no dependency on external services being up.
