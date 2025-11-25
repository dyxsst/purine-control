# Purine Control - Deviations Log

**Project:** Purine Control - "The Dragon Keeper's Nutrition Tracker"  
**Document Purpose:** Track all decisions and deviations from the original PDD during development  
**Started:** November 25, 2025

---

## How to Use This Document

When a decision is made that differs from the PDD, log it here with:
- **Date** of decision
- **Section affected** in PDD
- **Original spec** (what was planned)
- **New decision** (what we're doing instead)
- **Rationale** (why the change was made)
- **Impact** (what else might be affected)

---

## Deviations Log

### DEV-001: Platform Change from Firebase to VS Code/Web

| Field | Value |
|-------|-------|
| **Date** | November 25, 2025 |
| **Section** | Tech Stack (Section 9) |
| **Original Spec** | Flutter + Firebase (Auth, Firestore, Storage, Cloud Functions) for cross-platform mobile app |
| **New Decision** | Web-based application developed in VS Code, using InstantDB as the database |
| **Rationale** | User decision to develop in VS Code environment; simpler development workflow for single developer; web-first approach allows easier iteration |
| **Impact** | - No native mobile apps initially (PWA possible later)<br>- Different auth system needed<br>- Cloud Functions replaced with client-side logic or serverless functions<br>- Image storage solution TBD<br>- Lottie animations replaced with CSS/JS animations or Lottie-web |

**Action Items from this deviation:**
- [x] Update PDD to reflect web-based stack
- [ ] Choose frontend framework (React, Vue, Svelte, or vanilla)
- [ ] Configure InstantDB schema
- [ ] Determine image storage solution
- [ ] Plan AI integration approach (direct API calls vs. serverless)

---

### DEV-002: Database Change from Firestore to InstantDB

| Field | Value |
|-------|-------|
| **Date** | November 25, 2025 |
| **Section** | Data Architecture (Section 3) |
| **Original Spec** | Firestore with collections: /users, /users/{id}/meals, /users/{id}/customItems, /ingredientLibrary |
| **New Decision** | InstantDB (App ID: fb13a3d0-35ab-493b-9aa6-64a77363fe93) |
| **Rationale** | InstantDB chosen for: real-time sync, offline support, simpler query syntax, and integrated with modern web development |
| **Impact** | - Schema structure adapted for InstantDB patterns<br>- Query syntax will differ<br>- Real-time updates handled differently<br>- May need to adjust indexing strategy |

---

### DEV-003: App Name Discussion

| Field | Value |
|-------|-------|
| **Date** | November 25, 2025 |
| **Section** | General |
| **Original Spec** | Various names suggested: "The Purine Dragon Tracker", "Purine Pixie", "The Gobbly Dragon" |
| **New Decision** | Working title: "Purine Control" (repository name); Final branding TBD |
| **Rationale** | Using repository name as working title; final whimsical name to be decided during polish phase |
| **Impact** | None - cosmetic decision for later |

---

### DEV-004: Mascot Name and Design

| Field | Value |
|-------|-------|
| **Date** | November 25, 2025 |
| **Section** | Design System (Section 1.2) |
| **Original Spec** | Multiple mascot concepts: "Ember" (dragon), "Purine Pixie" (fairy), "Gobbly" (dragon) |
| **New Decision** | Adopted "Ember" the dragon as primary mascot |
| **Rationale** | Dragon theme fits best with "Dragon Keeper" narrative; Ember name is simple and memorable; dragon works well for the "feeding" metaphor |
| **Impact** | All mascot animations and empty states will feature dragon theme |

---

## Pending Decisions

These items need decisions before development can proceed:

### ~~PENDING-001: Frontend Framework~~ → RESOLVED
**Decision:** React + Vite  
**Date:** November 25, 2025  
**Rationale:**
- InstantDB has first-class React hooks (`useQuery`, `useMutation`)
- Rich ecosystem for charts (Recharts) and animations (lottie-react)
- Developer familiarity (Kanban project uses React)
- Easy PWA conversion for future mobile support
- Vite 7.1.12 already available globally

### PENDING-002: Image Storage Solution
**Options:** 
- InstantDB blobs (if supported)
- External service (Cloudinary, ImageKit)
- Base64 encoding (for small images only)

### PENDING-003: AI Provider
**Options:** 
- OpenAI (GPT-4 Vision)
- Google Gemini
- Both (with fallback)

**Considerations:**
- Cost per call
- Vision capabilities
- Nutrition data accuracy
- Rate limits

### PENDING-004: Authentication Method
**Options:**
- InstantDB built-in auth
- OAuth providers (Google, GitHub)
- Email/password
- Magic links

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 25, 2025 | Initial | Document created with initial deviations |

---

*Keep this document updated throughout development. Every significant deviation should be logged for future reference and documentation.*
