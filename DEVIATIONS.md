# Purine Control - Deviations Log

**Project:** Purine Control - "The Dragon Keeper's Nutrition Tracker"  
**Document Purpose:** Track all decisions and deviations from the original PDD during development  
**Started:** November 25, 2025  
**Last Updated:** November 25, 2025

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

---

### DEV-005: Stash Page Restructured as "Dragon's Hoard"

| Field | Value |
|-------|-------|
| **Date** | November 25, 2025 |
| **Section** | Screen Specifications |
| **Original Spec** | Custom items in Settings, hydration containers as simple list |
| **New Decision** | Dedicated "Stash" page with three tabs: Saved Meals, Custom Ingredients, Hydration Bottles |
| **Rationale** | Better UX to have stash items easily accessible; matches "Dragon's Hoard" theme; separation of concerns |
| **Impact** | Navigation now has 5 tabs: Diary, Charts, Stash (new), Oracle, Settings |

---

### DEV-006: Meal Button Labels

| Field | Value |
|-------|-------|
| **Date** | November 25, 2025 |
| **Section** | Screen Specifications (6.1) |
| **Original Spec** | Meal type buttons with combined icon+text |
| **New Decision** | Stacked layout with icon on top, short label below (e.g., "🍳" + "Brekkie") |
| **Rationale** | Better visibility on mobile; cleaner layout; allows shorter labels like "Brekkie" |
| **Impact** | CSS updated for vertical flex layout in meal-type-btn |

---

### DEV-007: Threshold Calculation Enhancement

| Field | Value |
|-------|-------|
| **Date** | November 25, 2025 |
| **Section** | Nutrition Logic (Section 2) |
| **Original Spec** | Basic Mifflin-St Jeor for calories, fixed values for others |
| **New Decision** | Smart calculations for ALL 9 nutrients based on profile, sex, age, activity, and dietary conditions |
| **Rationale** | More personalized recommendations; medical conditions affect multiple nutrients (e.g., diabetes affects carbs AND sugar) |
| **Impact** | `calculateAllThresholds()` in `lib/nutrition.js` now returns condition-aware values |

**Calculation Details:**
- Calories: Mifflin-St Jeor BMR × activity multiplier
- Purines: 400mg default, 200mg for gout, 150mg for kidney disease
- Protein: 0.8-1.2g/kg based on activity level
- Carbs: 45-55% of calories, reduced 15% for diabetes
- Fat: 25-30% of calories
- Fiber: 25-38g based on sex and age
- Sodium: 2300mg, reduced to 1500mg for kidney disease
- Sugar: 50g, reduced to 25g for diabetes or gout
- Hydration: 30ml/kg × activity multiplier

---

### DEV-008: Hydration Adjustment Buttons

| Field | Value |
|-------|-------|
| **Date** | November 25, 2025 |
| **Section** | Screen Specifications (6.1) |
| **Original Spec** | Only add water buttons (+250, +500, +Chalice) |
| **New Decision** | Added −250ml button for corrections |
| **Rationale** | User may accidentally add too much; easy corrections improve UX |
| **Impact** | Added `btn-danger-outline` style for negative adjustment |

---

### DEV-009: Default Hydration Bottles

| Field | Value |
|-------|-------|
| **Date** | November 25, 2025 |
| **Section** | Data Architecture |
| **Original Spec** | User must create custom containers |
| **New Decision** | Pre-populated with 3 default bottles: Water Glass (250ml), Water Bottle (500ml), Dragon Chalice (750ml) |
| **Rationale** | Better onboarding experience; common sizes readily available |
| **Impact** | Demo data in Stash page; will become defaults in database |

---

## Pending Decisions
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

## Implementation Notes

### NOTE-001: Daily Status Panel Positioning
**Date:** November 25, 2025  
**Issue:** Original PDD showed Daily Status as sticky at bottom, but this caused overlap with meal card buttons  
**Resolution:** Changed to regular card in page flow (no sticky positioning)  
**Files Affected:** `app/src/pages/Diary/Diary.css`

### NOTE-002: Vite Default Styles Conflict
**Date:** November 25, 2025  
**Issue:** Default Vite template styles in `index.css` and `App.css` were conflicting with global styles, causing UI shrinkage  
**Resolution:** Removed all Vite default styles; using only `src/styles/global.css`  
**Files Affected:** `app/src/index.css`, `app/src/App.css`

### NOTE-003: Git Dist Tracking for GitHub Pages
**Date:** November 25, 2025  
**Issue:** `dist` folder was in `.gitignore`, preventing built assets from being deployed  
**Resolution:** Removed `dist` from `.gitignore` so build artifacts are automatically tracked  
**Files Affected:** `app/.gitignore`

### NOTE-004: Calendar Date Parsing
**Date:** November 25, 2025  
**Issue:** Date display was off by one day due to timezone issues with `new Date(dateString)`  
**Resolution:** Created `parseLocalDate()` helper that splits YYYY-MM-DD and constructs local date  
**Files Affected:** `app/src/pages/Diary/Diary.jsx`

### NOTE-005: Hydration Storage Refactor
**Date:** November 25, 2025  
**Issue:** Original implementation created multiple `meals` entries with `meal_type='hydration'` for each +/- adjustment, causing database bloat  
**Resolution:** Created dedicated `hydration` collection with single record per user per day; `amount_ml` field updated on each adjustment  
**Files Affected:** `app/src/hooks/useData.js`, `PDD.md` (schema updated)

### NOTE-006: Meal Sorting with useMemo
**Date:** November 25, 2025  
**Issue:** Meals were displaying in inconsistent order (breakfast showing last)  
**Resolution:** Moved `MEAL_ORDER` constant outside hook, used `useMemo` for stable sorting reference  
**Files Affected:** `app/src/hooks/useData.js`

---

### DEV-012: Ingredient Weight Estimation Bug Fix

| Field | Value |
|-------|-------|
| **Date** | December 2, 2025 |
| **Section** | Nutrition Logic (4.2), AI Integration (5.1) |
| **Original Spec** | Static `UNIT_TO_GRAMS` lookup table used for all ingredients (slice=30g, piece=50g, etc.) |
| **New Decision** | AI provides food-specific gram estimates in `parseMealDescription()` |
| **Rationale** | Static conversion was fundamentally flawed: a bread slice (~30g) ≠ cucumber slice (~7g) ≠ tomato slice (~15g). AI can provide accurate estimates per food type. |
| **Impact** | - Updated `parseMealDescription` prompt to include `grams` field<br>- AI provides realistic weights (bread ~30g, cucumber slice ~7g)<br>- `convertToGrams()` kept as fallback only<br>- Renamed `nutrients_per_unit` → `nutrients` for clarity (with backward compat) |

**Files Affected:** `app/src/lib/gemini.js`, `app/src/pages/Diary/Diary.jsx`

**User Action Required:** Delete meals logged before Dec 2, 2025 - they have incorrect gram weights and nutrient calculations.

---

### DEV-010: Stash Tab Restructure - Removed Ingredients Tab

| Field | Value |
|-------|-------|
| **Date** | November 25, 2025 |
| **Section** | Screen Specifications, Data Architecture |
| **Original Spec** | Three tabs: Saved Meals, Custom Ingredients, Hydration Bottles |
| **New Decision** | Two tabs only: Saved Meals, Bottles |
| **Rationale** | PDD schema doesn't have a separate "ingredient" type in customItems - only 'meal' and 'container'. Custom ingredients would need schema changes. |
| **Impact** | Stash page simplified; ingredient creation deferred to future phase |

---

### DEV-011: Saved Meal "Use" Button Implementation

| Field | Value |
|-------|-------|
| **Date** | November 25, 2025 |
| **Section** | Screen Specifications (Stash) |
| **Original Spec** | Not explicitly defined how "Use" button works |
| **New Decision** | "Use" logs the saved meal to today's diary as a snack (user can edit type), increments `use_count`, then navigates to diary |
| **Rationale** | Quick way to re-log favorite meals; default to snack since user can change in diary edit modal |
| **Impact** | Added `useMeals` hook to Stash page; Use button now functional |

---

## Current Implementation Status

> ✅ **UPDATED ASSESSMENT (Dec 10, 2025):** Core app is feature-complete for MVP. AI parsing, ingredient management, charts, and settings all working. Missing: Authentication, Oracle recommendations.

### What We Have: Full Meal Diary with AI Intelligence + Ingredient Management

The app now has complete meal logging with AI analysis and a full ingredient management system:

| Layer | Status | Notes |
|-------|--------|-------|
| **UI Components** | ✅ Done | All pages functional |
| **Database Connection** | ✅ Done | InstantDB working with proper UUIDs |
| **Basic CRUD** | ✅ Done | Meals, hydration, stash |
| **AI Parsing** | ✅ Done | Text + Image analysis via Gemini (Spanish) |
| **Ingredient Cache** | ✅ Done | Reduces AI calls on repeat ingredients |
| **Ingredient Manager** | ✅ Done | Edit, delete, merge, propagate to meals |
| **Local Recalc** | ✅ Done | Edit quantities without AI |
| **Image Processing** | ✅ Done | Camera, gallery, OCR, food ID |
| **Charts** | ✅ Done | Recharts LineChart with filters |
| **Data Export** | ✅ Done | CSV export from Charts |
| **Stats** | ✅ Done | Live computed from meals DB |
| **Authentication** | ❌ None | Hardcoded `local-user` |
| **Oracle** | ❌ Shell | AI recommendations not wired |

### ✅ UI Layer Complete
| Feature | Notes |
|---------|-------|
| Project setup (Vite + React) | React 19.2.0 + Vite 7.2.4 |
| GitHub Pages deployment | Live at https://dyxsst.github.io/purine-control/ |
| Theme engine | 3 presets working |
| Navigation (5 tabs) | All pages have shells |
| EmberMascot component | State-based CSS animations |
| Calendar ribbon | Week view with navigation |
| Meal type selector | 4 buttons |
| Meal cards display | Sorted by type, edit/copy/delete/stash |
| Daily status panel | 9 nutrient progress bars |
| Settings form | All profile fields + Ingredient Manager |
| Stash page | 2 tabs with CRUD |
| Charts page | Line charts, date ranges, CSV export |

### ✅ Database Layer Complete
| Feature | Notes |
|---------|-------|
| InstantDB connection | Hooks working with UUID IDs |
| User persistence | Profile saves/loads |
| Meals CRUD | Add/edit/delete working |
| Hydration tracking | Single record per day |
| Stash items | Meals + bottles |
| Theme persistence | Saves to user record |
| Ingredient Library | Cache with proper UUIDs, backfill from meals |

### ✅ Intelligence Layer Complete
| Feature | PDD Section | Current State |
|---------|-------------|---------------|
| **AI Meal Parsing** | 5.1 Prompt 1 | ✅ `parseMealWithNutrition()` - text + images, Spanish |
| **Ingredient Extraction** | 5.1 | ✅ Full ingredients array with nutrients |
| **Nutrition Lookup** | 5.1 Prompt 2 | ✅ `getNutritionForIngredient()` for cache misses |
| **Ingredient Library** | 3.2, 4.2 | ✅ `useIngredientLibrary()` hook + cache |
| **Cache Lookups** | 4.2 | ✅ `normalizeIngredientName()` + `lookupIngredient()` |
| **Local Recalculation** | 4.3 | ✅ `recalculateIngredient()` + UI integration |
| **Unit Conversion** | 4.2 | ✅ AI-provided `grams` field for each ingredient |
| **Image Analysis** | 5.2 | ✅ Camera + gallery + Gemini Vision |
| **Charts/Visualization** | 6.2 | ✅ Recharts LineChart with all features |
| **Ingredient Manager** | N/A (new) | ✅ Edit, merge, delete, propagate to meals |
| **Recommendations** | 5.1 Prompt 4 | ❌ Oracle page still shell |

### ❌ Account Layer Missing
| Feature | Notes |
|---------|-------|
| Authentication | Using hardcoded `local-user` ID |
| User registration | None |
| Login/logout | None |
| Multi-device sync | Impossible without auth |
| Data export | None |
| Account deletion | None |

---

## Pending Decisions

### PENDING-002: Image Storage Solution
**Status:** Still pending  
**Options:** 
- InstantDB blobs (if supported)
- External service (Cloudinary, ImageKit)
- Base64 encoding (for small images only)

### ~~PENDING-003: AI Provider~~ → RESOLVED
**Decision:** Google Gemini  
**Date:** November 26, 2025  
**Models:**
- `gemini-1.5-flash` for text parsing and nutrition lookup (fast, cost-effective)
- `gemini-1.5-pro` for image analysis and complex recommendations

**Rationale:**
- Generous free tier (15 RPM)
- Vision capabilities built-in
- Good JSON output support
- Competitive pricing for production

**Unblocks:**
- Meal text parsing (Section 5.1 Prompt 1)
- Ingredient nutrition lookup (Section 5.1 Prompt 2)
- Image analysis (Section 5.2)
- Oracle recommendations (Section 5.1 Prompt 4)

### PENDING-004: Authentication Method
**Status:** Still pending  
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
| 1.1 | Nov 25, 2025 | Update | Added DEV-005 through DEV-009, resolved PENDING-001, added implementation notes |
| 1.2 | Nov 25, 2025 | Update | Added DEV-010, DEV-011, NOTE-005, NOTE-006; comprehensive status review |
| 1.3 | Nov 26, 2025 | Correction | **Honest reassessment** - phases were incorrectly marked complete. UI layer done, intelligence layer missing. |
| 1.4 | Dec 2, 2025 | Milestone | **Intelligence layer complete!** AI parsing, ingredient cache, local recalculation, image analysis all working. |
| 1.5 | Dec 2, 2025 | Feature | **Charts page complete!** Recharts integration, date ranges, grouping, nutrient toggles, CSV export. Fixed ingredient weight estimation bug (DEV-012). |
| 1.6 | Dec 10, 2025 | Feature | **Ingredient Manager complete!** Edit/merge/delete cached ingredients, propagate changes to meals. Stats fixed. Multiple bug fixes. |
| 1.7 | Dec 10, 2025 | Feature | **UX improvements:** Meal input autocomplete, AI re-analyze button, 404 fix for GitHub Pages SPA routing. |

---

### DEV-013: Stats Counter Simplification

| Field | Value |
|-------|-------|
| **Date** | December 3, 2025 |
| **Section** | Data Architecture, UI |
| **Original Spec** | User stats stored as counters in user record (`total_meals_logged`, `current_streak_days`) |
| **New Decision** | Stats calculated dynamically from meals collection queries |
| **Rationale** | Stored counters became out of sync with actual data (showed 0 or wrong values). Querying the actual meals ensures accuracy and handles deletions correctly. |
| **Impact** | - `useAllMeals()` hook queries all meals to compute stats<br>- `totalMeals` = count of all meals<br>- `calculateStreak()` computes streak from meal dates<br>- No more stale counter bugs |

**Files Affected:** `app/src/hooks/useData.js`, `app/src/pages/Settings/Settings.jsx`

---

### DEV-014: Ingredient Library with InstantDB UUIDs

| Field | Value |
|-------|-------|
| **Date** | December 3, 2025 |
| **Section** | Data Architecture (Section 3.2) |
| **Original Spec** | Ingredient cache using normalized name as record ID |
| **New Decision** | Use `crypto.randomUUID()` for all ingredientLibrary records; `normalized_name` stored as field for lookups |
| **Rationale** | InstantDB requires UUIDs for record IDs. Using `penne_pasta` as ID caused silent failures and empty ingredient cache. |
| **Impact** | - All CRUD operations now use UUID-based IDs<br>- `addIngredient()`, `updateIngredient()`, `deleteIngredient()` look up by `normalized_name` then use `id`<br>- Backfill function generates UUIDs for each ingredient |

**Files Affected:** `app/src/hooks/useData.js`, `app/src/contexts/UserContext.jsx`

---

### DEV-015: Ingredient Manager Feature

| Field | Value |
|-------|-------|
| **Date** | December 3, 2025 |
| **Section** | Screen Specifications (Settings) |
| **Original Spec** | No ingredient management UI specified |
| **New Decision** | Full Ingredient Manager modal in Settings with: view all cached ingredients, edit nutrients (per 100g), delete, merge duplicates, propagate changes to past meals |
| **Rationale** | Users need to correct AI-estimated values and consolidate duplicate ingredients (e.g., same ingredient in different languages) |
| **Impact** | - Settings page has "🧪 Ingredient Manager" button<br>- Edit modal with all 8 nutrient fields<br>- Propagate scope: none/week/month/all meals<br>- Merge mode: select 2+, pick primary, optionally average values<br>- Backfill on first open populates cache from existing meals |

**Files Affected:** `app/src/pages/Settings/Settings.jsx`, `app/src/pages/Settings/Settings.css`, `app/src/hooks/useData.js`

---

### DEV-016: Spanish Language Default for AI

| Field | Value |
|-------|-------|
| **Date** | December 3, 2025 |
| **Section** | AI Integration (Section 5.1) |
| **Original Spec** | AI returns ingredient names in same language as input |
| **New Decision** | AI always returns ingredient names in Spanish |
| **Rationale** | User's primary language is Spanish; prevents duplicate ingredients in different languages (e.g., "Chicken" vs "Pollo") |
| **Impact** | - All prompts include: "IMPORTANT: Always return ingredient names in SPANISH"<br>- New meals will have Spanish ingredient names<br>- Merge feature helps consolidate existing English entries |

**Files Affected:** `app/src/lib/gemini.js`

---

### DEV-017: Propagation Bug Fix - Grams Field

| Field | Value |
|-------|-------|
| **Date** | December 4, 2025 |
| **Section** | Nutrition Logic (Section 4.3) |
| **Original Spec** | `propagateToMeals()` should recalculate nutrients based on ingredient weight |
| **Bug Found** | Code used `ing.quantity_g` which doesn't exist; AI stores weight in `ing.grams`. This caused all propagations to default to 100g. |
| **Fix** | Changed to `ing.grams || ing.quantity_g || 100` and also update `nutrients_per_100g` in the meal's ingredient entry |
| **Impact** | - Propagation now correctly uses actual gram weights<br>- Per-100g reference values are updated in meals<br>- Meal totals recalculated properly |

**Files Affected:** `app/src/hooks/useData.js`

---

### DEV-018: Meal Input Autocomplete/Search

| Field | Value |
|-------|-------|
| **Date** | December 10, 2025 |
| **Section** | Screen Specifications (6.1 Diary) |
| **Original Spec** | Simple text input for meal description |
| **New Decision** | Input now shows autocomplete suggestions from: saved meals (stash), historical meals, cached ingredients |
| **Rationale** | Faster meal logging for repeat items; reduces AI calls; better UX for logging familiar foods |
| **Impact** | - Type 2+ characters to see suggestions<br>- Arrow keys + Enter for keyboard navigation<br>- Selecting a stashed/historical meal logs it directly<br>- Selecting an ingredient fills the input field |

**Files Affected:** `app/src/pages/Diary/Diary.jsx`, `app/src/pages/Diary/Diary.css`

---

### DEV-019: AI Re-analyze Button on Meal Cards

| Field | Value |
|-------|-------|
| **Date** | December 10, 2025 |
| **Section** | Screen Specifications (6.1 Diary) |
| **Original Spec** | Meal cards only had Edit, Copy, Delete, Stash actions |
| **New Decision** | Added "🔄 AI" button to re-analyze meal nutrients using Gemini |
| **Rationale** | Users may want to refresh nutrient data after ingredient library improvements; allows AI to re-estimate using updated knowledge |
| **Impact** | - Shows confirmation dialog before re-analyzing<br>- Uses original meal description for AI input<br>- Updates ingredients and totals with new AI analysis<br>- Marks meal with `analysis_method: 'ai-reanalyzed'` |

**Files Affected:** `app/src/pages/Diary/Diary.jsx`

---

### DEV-020: GitHub Pages SPA 404 Fix

| Field | Value |
|-------|-------|
| **Date** | December 10, 2025 |
| **Section** | Infrastructure |
| **Original Spec** | Standard BrowserRouter with basename, no 404 handling |
| **Bug Found** | Directly navigating to `/purine-control/charts` or refreshing on subpages returned 404 because GitHub Pages tries to serve actual files |
| **Fix** | Created `404.html` that captures the intended path and redirects to `index.html` with path preserved via sessionStorage |
| **Impact** | - `public/404.html` captures path and redirects<br>- `index.html` script restores path via `history.replaceState`<br>- React Router then handles the correct route |

**Files Affected:** `app/public/404.html`, `app/index.html`

---

*Keep this document updated throughout development. Every significant deviation should be logged for future reference and documentation.*

