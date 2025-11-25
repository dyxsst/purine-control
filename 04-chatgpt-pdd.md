MEGA PROMPT FOR FULL APP GENERATION IN FIREBASE STUDIO

Personal Meal, Nutrition & Purine Tracker App

Full Specification — User Requirements + Gemini Concepts + Claude PDD + Patch Integration

---

📱 BUILD THIS APP EXACTLY AS SPECIFIED

Generate the entire Firebase-backed application, including:

Flutter frontend

Firebase Authentication

Firestore models

Firebase Storage

Cloud Functions (Node.js / Typescript)

Theme engine

Ingredient consistency engine

AI ingestion (Gemini + OCR)

Meal Diary

Chart Gallery

What to Eat? Recommender

Settings

Custom Items system

“Save to Dictionary” from Meal Diary

Hydration tracking

Full animations and UI polish

Follow every instruction in this prompt with no omissions and no reinterpretation.

---

🎨 GLOBAL AESTHETIC: "Whimsical Candy Shop UI"

Use bright, fun, rounded, informal, whimsical visuals everywhere.

Typography

Headers: Fredoka One or Nunito ExtraBold

Body: Nunito or Inter Rounded

Core UI Motifs

Rounded corners (12–24px)

Bouncy button animations

Soft, pastel backgrounds

Vibrant main colors

Cute mascot reactions (happy/nervous/sick)

Confetti bursts for achievements

---

🔥 TECH STACK

Frontend

Flutter

State mgmt: Riverpod or Provider

fl_chart for graphs

Backend

Firebase Auth

Firestore

Storage

Cloud Functions (typescript/node)

AI

Gemini Vision + Gemini Text

Google Cloud Vision OCR for nutrition labels

Token Optimization (MANDATORY)

Only call AI for:

New text meal entry

New food photo

New nutrition label (OCR fallback)

Recommendation generation

Never call AI for:

Loading meals

Editing meals

Using custom items

Logging hydration

Recalculating totals

---

🗄️ FIRESTORE DATA MODEL

Users

/users/{userId}
  - name
  - sex
  - age
  - weight
  - dietaryNeeds
  - purineMin
  - purineMax
  - calorieMin
  - calorieMax
  - themePreset
  - customColor

Meals

/users/{userId}/meals/{mealId}
  - date: "YYYY-MM-DD"
  - timestamp
  - mealType: breakfast | lunch | dinner | snack | hydration
  - mealName
  - hydrationMl
  - imageUrls: []
  - ingredients: [
      {
        name
        normalizedName
        quantity
        unit
        nutrientsPerUnit: {
          calories
          protein
          carbs
          fat
          fiber
          sodium
          purines
        }
      }
    ]
  - totalNutrients: { ... }

Custom Items (Meals + Containers)

/users/{userId}/customItems/{itemId}
  - type: "meal" | "container"
  - name
  - ingredients: []        // if meal
  - totalNutrients: {}     // if meal
  - capacityMl: number     // if container

Ingredient Library (Global)

/ingredientLibrary/{normalizedName}
  - displayName
  - nutrientsPer100g: {...}
  - lastUsed
  - useCount
  - source: "ai" | "manual" | "usda"

---

⚙️ INGREDIENT CONSISTENCY ENGINE

For every new meal entry:

Normalize ingredient name
Check ingredientLibrary
If exists → reuse nutrients
If not → call Gemini to get per-100g nutrients
Compute nutrientsPerUnit = nutrientsPer100g × (quantity / 100)
Sum all ingredients → set totalNutrients
Cache new ingredient in library
Editing a meal must NOT call AI.

---

🍳 SAVE-TO-DICTIONARY FEATURE (PATCH INCLUDED)

Every logged meal card in Meal Diary must include:

[✏️ Edit]   [🗑️ Delete]   [📘 Save to Dictionary]

When user taps Save to Dictionary:

Open modal:

┌──────────────────────────────┐
│ ⭐ Save this Meal to Dictionary │
├──────────────────────────────┤
│ Name: [ pre-filled with mealName ]  │
│                                   │
│ Include ingredients exactly as logged?  │
│   ● Yes, save as-is (recommended)   │
│   ○ Let me edit first               │
│                                   │
│ [Save]   [Cancel]                  │
└──────────────────────────────┘

Behavior:

If Yes:

Create item in /customItems/ with:

type: "meal"

name

ingredients (copied from meal)

totalNutrients (copied)

No AI call

If Edit:

Show ingredient editor identical to Edit Meal

Save after edits

Confirmation animation:

A book "slams shut" with a cute poof

Confetti burst

Toast: “Saved to Your Stash!”

Autocomplete

When the user types in the Meal Diary:

Suggest items from /customItems/

Selecting one auto-fills:

ingredients

total nutrients

No AI.

---

🧠 AI PROMPTS (USE EXACTLY)

Meal Parsing

Parse this meal into structured data:
"[USER INPUT]"

Return ONLY valid JSON:
{
  "mealName": "...",
  "ingredients": [
    {"name": "...", "quantity": ..., "unit": "..."}
  ]
}

Ingredient Nutrition Estimation

Estimate nutrition per 100g for: "[INGREDIENT NAME]"

Return ONLY valid JSON:
{
  "calories": ...,
  "protein": ...,
  "carbs": ...,
  "fat": ...,
  "fiber": ...,
  "sodium": ...,
  "purines": ...
}

Vision Photo

Identify all food items in this image with estimated weights.

Return ONLY valid JSON:
{
  "items":[
    {"name":"...","quantity":...,"unit":"g"}
  ]
}

---

📸 IMAGE ANALYSIS RULES

If image is nutrition label:

Use Google Vision OCR first

Parse via regex

Only call Gemini if unclear

If food photo:

Always call Gemini Vision

Return structured JSON only

---

📅 SCREEN 1 — MEAL DIARY

Must include:

Top: Scrollable calendar strip

Meal Type pills (Breakfast / Lunch / Dinner / Snack)

Input box with:

text field

camera button

gallery upload button

“Log It!” button (big, bubbly)

Hydration quick-add:

+250ml

+500ml

+[ContainerName] (e.g., +Bucio)

Meal Cards

Nutrition totals section

Animated progress bars with threshold colors

Meal Card Actions:

Edit → open full ingredient editor

Delete

Save to Dictionary (NEW)

Thumbnail gallery

Ingredient list

Calories/purines for meal

After logging:

New meal card slides in

Totals recalc with animations

Mascot reacts

Possibly confetti burst

---

📊 SCREEN 2 — CHART GALLERY

Range selectors:

This Week

This Month

Custom

Grouping:

Daily

Weekly

Monthly

Filters:

Purines

Calories

Protein

Carbs

Fat

Hydration

Visualization:

Multi-line chart

Dotted limit lines for MAX + MIN

Tooltip bubble on tap

Colors follow theme rules

---

🍽️ SCREEN 3 — WHAT TO EAT? (AI RECOMMENDER)

Inputs:

Range: Today or Last 6 Days

Meal Type

Button: “Let’s Cook!” (big bouncing button)

Flow:

Compute remaining nutrient budget
Analyze meal history
Gather top frequent ingredients
Call Gemini with efficient prompt
Return 3 recommendations:
Old Reliable — matches eating habits

Twist — similar but varied

Wildcard — completely different

Cards must show:

Name

Description

Ingredients

Estimated calories/purines

“I Made This!” → logs directly (no AI)

“Tweak It” → opens Meal Diary preloaded

---

⚙️ SCREEN 4 — SETTINGS

Sections:

Profile

name

sex

age

weight

dietary needs

Nutrition Thresholds

purine min

purine max

calorie min

calorie max

My Custom Items

List all custom meals and containers

Edit/Delete

Buttons:

New Meal

New Container

Theme

Bright

Dark

High Contrast

Custom Color Picker

Live preview card

---

🎨 THEME ENGINE

Given one primary color, calculate:

background: 95% lightness of primary
surface: white tinted (98% lightness)
primary: user’s chosen color
secondary: complementary (hue + 180°)
text: very dark (≈15% lightness)
warning: 
#FFA726
danger: 
#EF5350
success: 
#66BB6A

All semantic colors must remain consistent even in custom themes.

---

☁️ CLOUD FUNCTIONS

analyzeAndLogMeal
Input:

{
  userId,
  date,
  mealType,
  textInput?,
  imageUrls?
}

Process:

If image:
detect label → OCR

else → Gemini Vision

If text:
parse with Gemini

For each ingredient:
normalize

check ingredientLibrary

estimate if new

compute nutrientsPerUnit

Aggregate nutrients
Save meal entry
Return structured meal object
generateRecommendations
Compute budget

Analyze history patterns

Create top ingredient list

Call Gemini with structured prompt

Return 3 meal objects

---

📦 PERFORMANCE & COST RULES

Cache daily totals client-side

Index meals by date and mealType

Minimize Firestore reads

Compress uploaded images

Use optimistic UI updates

Avoid re-calling AI for known ingredients

---

🧪 IMPLEMENTATION CHECKLIST

Phase 1

Firebase setup

Auth

Security rules

Theme engine

Navigation shell

Phase 2

Meal Diary (text only)

analyzeAndLogMeal (text only)

Ingredient library system

Daily totals

Edit meal (no AI)

Phase 3

Image uploads

OCR + Gemini Vision

Save to Dictionary (Patch)

Phase 4

Chart Gallery

Filters

Grouping

Phase 5

What to Eat? recommender

Custom items (meals + containers)

Hydration buttons

Phase 6

Offline support

Animations

Polish

---

🚀 FINAL INSTRUCTION FOR GEMINI

Generate the complete Flutter + Firebase application exactly as described in this document.
Implement every screen, every UI component, every backend function, every data model, every animation, and every AI interaction exactly as written.
No clarifications. No omissions. Build the full app.