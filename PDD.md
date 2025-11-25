# Purine Control - Product Design Document
## "The Dragon Keeper's Nutrition Tracker"

**Version:** 1.0  
**Date:** November 25, 2025  
**Repository:** https://github.com/dyxsst/purine-control  
**Database:** InstantDB (App ID: fb13a3d0-35ab-493b-9aa6-64a77363fe93)

---

## 📋 Executive Summary

A personal nutrition tracking application focused on purine management, designed for users with gout or those monitoring their uric acid levels. The app combines serious health tracking with a whimsical, colorful aesthetic featuring a dragon mascot named "Ember."

**Core Philosophy:** Serious nutrition math meets whimsical fantasy aesthetics.

---

## 1. 🎨 DESIGN SYSTEM

### 1.1 Visual Philosophy

- **Theme:** "Dragon Keeper's Journal" - The user is caring for their personal dragon (their body) through mindful feeding
- **Style:** Colorful, whimsical, informal, but functionally precise
- **Approach:** "Candy Shop" aesthetics with soft pastels and bold, rounded elements

### 1.2 The Dragon Mascot: "Ember"

**Purpose:** Emotional feedback, empty state illustrations, and user engagement

**States (Animations):**
| State | Trigger | Visual |
|-------|---------|--------|
| Curious | Empty Diary | Dragon sniffing around, looking for food |
| Happy | Good Log | Small fire breath puffs, content expression |
| Satisfied | Within Limits | Curled up napping, gentle breathing |
| Stuffed | Warning Threshold | Holding belly, uncomfortable waddle |
| Sick | Danger Threshold | Green-tinted scales, queasy expression |
| Celebrating | Badge Earned | Flying loop-de-loops, sparkles trailing |
| Hoarding | Save to Stash | Sitting on pile of food treasures |

### 1.3 Typography

- **Headers:** Fredoka One (rounded, bold, playful)
- **Body:** Nunito (friendly, readable)
- **Data/Numbers:** Roboto Mono (clear, precise)

### 1.4 Theme Engine: "Dragon Scale Shimmer"

User picks ONE seed color (their dragon's scale color), and the app generates:

```javascript
function generateFromSeed(seedHex) {
  const hsl = hexToHSL(seedHex);
  
  return {
    primary: seedHex,
    background: hslToHex(hsl.h, hsl.s * 0.3, 95),      // Very light wash
    surface: hslToHex(hsl.h, hsl.s * 0.1, 98),         // Near-white tint
    surfaceVariant: hslToHex(hsl.h, hsl.s * 0.2, 92),  // Subtle cards
    secondary: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l), // Complementary
    text: hslToHex(hsl.h, hsl.s * 0.5, 15),            // Very dark
    textSecondary: hslToHex(hsl.h, hsl.s * 0.3, 40),
    
    // Semantic colors (MUST remain recognizable for safety)
    success: '#66BB6A',   // Green family
    warning: '#FFA726',   // Orange/yellow family
    danger: '#EF5350',    // Red family (safety-critical)
  };
}
```

**Preset Themes:**
| Theme | Seed Color | Description |
|-------|------------|-------------|
| Emerald Dragon (Default) | #66BB6A | Mint green, bright, cheerful |
| Midnight Dragon | #7B2CBF | Deep purple, dark mode |
| Crystal Dragon | #0000FF | High contrast, accessibility focused |

### 1.5 UI Motifs

- **Rounded corners:** 16px standard, 24px for major cards
- **Animations:** Bouncy scale (0.95 on tap, spring back)
- **Confetti:** 20-30 particles on achievements
- **Dragon reactions:** 300ms delay for feels
- **Shadows:** Soft, subtle (removed in high contrast mode)

### 1.6 Status Color System

Applied to progress bars, charts, badges:

```javascript
function getStatusColor(value, min, max, theme) {
  if (value > max) return theme.danger;        // 🔴 Red
  if (value > max * 0.8) return theme.warning; // 🟡 Yellow
  if (value < min * 0.8) return theme.warning; // 🟡 Yellow
  return theme.success;                         // 🟢 Green
}
```

---

## 2. 🧠 NUTRITION LOGIC SYSTEM

### 2.1 Tracked Nutrients (8 Fields + Hydration)

| Nutrient | Unit | Icon |
|----------|------|------|
| Calories | kcal | 🔥 |
| Purines | mg | 🧬 |
| Protein | g | 💪 |
| Carbs | g | 🍞 |
| Fat | g | 🥑 |
| Fiber | g | 🌾 |
| Sodium | mg | 🧂 |
| Sugar | g | 🍯 |
| **Hydration** | ml | 💧 |

### 2.2 Auto-Threshold Calculation

**Calories (Mifflin-St Jeor Equation):**
```
Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
Female: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

Daily Needs = BMR × Activity Multiplier
  - Sedentary: 1.2
  - Light: 1.375
  - Moderate: 1.55
  - Active: 1.725
  - Very Active: 1.9
```

**Purines:**
| Condition | Daily Limit |
|-----------|-------------|
| General Population | 400mg |
| Gout Management | 200mg |
| Kidney Disease | 150mg |

**Macros (Balanced Diet Percentages):**
- Protein: 15-20% of calories (÷4 for grams)
- Carbs: 45-55% of calories (÷4 for grams)
- Fat: 25-30% of calories (÷9 for grams)
- Fiber: 25-30g (fixed)
- Sodium: <2300mg (fixed)
- Sugar: <50g (fixed)

**Hydration:** 30ml × weight_kg (adjusted for activity)

**Warning/Danger Thresholds:**
- Min (Warning): 80% of target
- Max (Danger): 120% of target

---

## 3. 🗄️ DATA ARCHITECTURE

### 3.1 Database: InstantDB

**App ID:** `fb13a3d0-35ab-493b-9aa6-64a77363fe93`  
**Documentation:** https://www.instantdb.com/docs

### 3.2 Schema

#### Users Collection
```javascript
{
  id: string,           // Auto-generated
  name: string,
  email: string,
  
  profile: {
    sex: 'male' | 'female' | 'other',
    age: number,
    weight_kg: number,
    height_cm: number,
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    dietary_conditions: string[], // ['gout', 'diabetes', 'vegetarian']
  },
  
  thresholds: {
    calories_min: number,
    calories_max: number,
    purines_min: number,
    purines_max: number,
    protein_target: number,
    carbs_target: number,
    fat_target: number,
    fiber_target: number,
    sodium_max: number,
    sugar_max: number,
    hydration_target: number,
  },
  
  theme: {
    preset: 'emerald' | 'midnight' | 'crystal' | 'custom',
    seed_color_hex: string,
  },
  
  badges: string[],
  
  stats: {
    total_meals_logged: number,
    current_streak_days: number,
    longest_streak_days: number,
    meals_saved_to_stash: number,
  },
  
  created_at: timestamp,
  updated_at: timestamp,
}
```

#### Meals Collection
```javascript
{
  id: string,
  user_id: string,       // Foreign key
  date: string,          // YYYY-MM-DD for easy querying
  timestamp: timestamp,  // Exact ordering within day
  
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'hydration',
  meal_name: string,
  
  ingredients: [
    {
      name: string,
      normalized_name: string,  // For cache lookups
      quantity: number,
      unit: string,
      nutrients_per_unit: {     // Frozen at log time
        calories: number,
        purines: number,
        protein: number,
        carbs: number,
        fat: number,
        fiber: number,
        sodium: number,
        sugar: number,
      }
    }
  ],
  
  total_nutrients: {
    calories: number,
    purines: number,
    protein: number,
    carbs: number,
    fat: number,
    fiber: number,
    sodium: number,
    sugar: number,
  },
  
  hydration_ml: number,
  image_urls: string[],
  analysis_method: 'text' | 'image' | 'label' | 'custom_item' | 'manual' | 'recommendation',
  
  created_at: timestamp,
  updated_at: timestamp,
}
```

#### Custom Items Collection
```javascript
{
  id: string,
  user_id: string,
  type: 'meal' | 'container',
  name: string,
  
  // For type='meal'
  ingredients: [...],       // Same structure as meals
  total_nutrients: {...},
  
  // For type='container'
  capacity_ml: number,
  
  created_at: timestamp,
}
```

#### Ingredient Library (Global Cache)
```javascript
{
  normalized_name: string,  // Primary key
  display_name: string,
  
  nutrients_per_100g: {
    calories: number,
    purines: number,
    protein: number,
    carbs: number,
    fat: number,
    fiber: number,
    sodium: number,
    sugar: number,
  },
  
  use_count: number,
  last_used: timestamp,
  source: 'ai' | 'manual' | 'usda',
  
  created_at: timestamp,
}
```

---

## 4. ⚡ TOKEN OPTIMIZATION ENGINE

### 4.1 The Golden Rules

**Call AI ONLY for:**
1. New text meal entry (user types description)
2. New food photo upload
3. New nutrition label (after OCR if ambiguous)
4. Recommendation generation ("What to Devour?" feature)

**NEVER call AI for:**
- Loading existing meals
- Editing meal quantities (recalculate locally)
- Using custom items from stash
- Hydration logging
- Switching dates
- Deleting meals
- Chart generation

### 4.2 Ingredient Consistency Algorithm

```javascript
function normalizeIngredientName(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/s$/, '')           // Remove plural 's'
    .replace(/ies$/, 'y')        // berries -> berry
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_');       // Spaces to underscores
}

async function processIngredient(name, quantity, unit) {
  const normalizedName = normalizeIngredientName(name);
  
  // Check cache first
  const cached = await db.ingredientLibrary.get(normalizedName);
  
  let nutrientsPer100g;
  
  if (cached) {
    // CACHE HIT - Zero API cost!
    nutrientsPer100g = cached.nutrients_per_100g;
    await db.ingredientLibrary.update(normalizedName, {
      use_count: cached.use_count + 1,
      last_used: Date.now(),
    });
  } else {
    // CACHE MISS - Call AI
    nutrientsPer100g = await fetchNutrientsFromAI(name);
    await db.ingredientLibrary.create({
      normalized_name: normalizedName,
      display_name: name,
      nutrients_per_100g: nutrientsPer100g,
      use_count: 1,
      last_used: Date.now(),
      source: 'ai',
    });
  }
  
  // Calculate for specific quantity
  const conversionFactor = convertToGrams(quantity, unit) / 100;
  const nutrientsPerUnit = multiplyNutrients(nutrientsPer100g, conversionFactor);
  
  return {
    name,
    normalized_name: normalizedName,
    quantity,
    unit,
    nutrients_per_unit: nutrientsPerUnit,
  };
}
```

### 4.3 Edit Meal Logic (Local Calculation)

```javascript
// NO AI CALL - Instant update!
function recalculateIngredient(storedIngredient, newQuantity) {
  const ratio = newQuantity / storedIngredient.quantity;
  
  return {
    ...storedIngredient,
    quantity: newQuantity,
    nutrients_per_unit: multiplyNutrients(
      storedIngredient.nutrients_per_unit,
      ratio
    ),
  };
}
```

---

## 5. 🤖 AI INTEGRATION

### 5.1 AI Prompts

**Prompt 1: Meal Parsing (Text Input)**
```
Parse this meal description into structured ingredient data:

"[USER_INPUT]"

Return ONLY valid JSON with no markdown formatting:
{
  "meal_name": "short descriptive name (max 50 chars)",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "g" | "ml" | "cup" | "tbsp" | "tsp" | "oz" | "slice" | "piece"
    }
  ]
}

Rules:
- Make reasonable portion estimates if not specified
- Convert to metric units when possible
- If ambiguous, choose the most common interpretation
```

**Prompt 2: Nutrition Estimation (Single Ingredient)**
```
Estimate complete nutritional information per 100g for this ingredient:

"[INGREDIENT_NAME]"

Return ONLY valid JSON with no markdown formatting:
{
  "calories": number,
  "purines": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sodium": number,
  "sugar": number
}

All values in standard units:
- calories: kcal
- purines: mg
- all others: grams (g) except sodium (mg)

Use USDA database values when available. If uncertain, provide conservative estimates.
```

**Prompt 3: Vision Analysis (Food Photo)**
```
Analyze this food image and identify all visible food items with estimated weights.

Return ONLY valid JSON with no markdown formatting:
{
  "meal_name": "descriptive name for the meal",
  "items": [
    {
      "name": "food item name",
      "quantity": number,
      "unit": "g"
    }
  ]
}

Provide gram estimates based on typical portion sizes.
```

**Prompt 4: Recommendation Generation**
```
Generate 3 [MEAL_TYPE] meal recommendations.

User Context:
- Dietary conditions: [CONDITIONS]
- Remaining daily budget: [CALORIES] kcal, [PURINES] mg purines
- Frequently eaten ingredients: [TOP_INGREDIENTS]
- Today's meals so far: [MEAL_SUMMARIES]

Return ONLY valid JSON array with no markdown formatting:
[
  {
    "type": "familiar",
    "name": "meal name",
    "description": "2-3 sentence description",
    "ingredients": [{"name": "...", "quantity": number, "unit": "..."}],
    "estimated_nutrients": {
      "calories": number,
      "purines": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  },
  { "type": "twist", ... },
  { "type": "wild", ... }
]

Requirements:
- "familiar": Uses user's frequent ingredients, safe choice
- "twist": Similar ingredients but different cuisine/preparation
- "wild": Creative, different ingredients, unexpected flavors
- ALL must stay within remaining budget
```

### 5.2 Image Analysis Strategy

```javascript
async function analyzeImage(imageUrl) {
  // Step 1: Detect if nutrition label
  const isLabel = await detectNutritionLabel(imageUrl);
  
  if (isLabel) {
    // Step 2a: Extract text with OCR (cheaper)
    const text = await extractText(imageUrl);
    const parsed = parseNutritionLabel(text);
    
    if (parsed.confidence > 0.8) {
      return parsed;
    }
    // Fallback to AI for ambiguous labels
    return await aiAnalyzeNutritionLabel(imageUrl);
  }
  
  // Step 3: Food photo - Use AI Vision directly
  return await aiAnalyzeFoodPhoto(imageUrl);
}
```

---

## 6. 📱 SCREEN SPECIFICATIONS

### 6.1 SCREEN 1: "The Dragon's Feeding Log" (Meal Diary)

**Layout:**
```
┌─────────────────────────────────────┐
│ 🐉 Dragon Keeper    [Settings ⚙️]   │
├─────────────────────────────────────┤
│ ◀ [M][T][*W*][T][F][S][S] ▶        │  ← Calendar ribbon
├─────────────────────────────────────┤
│ [🍳 Breakfast] [🌮 Lunch]           │
│ [🍝 Dinner] [🍪 Snack]              │  ← Meal type selector
├─────────────────────────────────────┤
│ What did your dragon eat? 🔥        │
│ ┌───────────────────────────────┐  │
│ │ [Text input..............]   │  │
│ │ [🎤 Voice] [📸 Camera] [🖼️]   │  │
│ └───────────────────────────────┘  │
│      [Log It! 🎉]                   │
├─────────────────────────────────────┤
│ 💧 Dragon's Hydration               │
│ [████████████░░░░] 1500/2000ml      │
│ [+250ml] [+500ml] [+Chalice]        │
├─────────────────────────────────────┤
│ TODAY'S FEAST                        │
│ ┌─ 🍳 Breakfast ──────────────────┐ │
│ │ Oatmeal & Dragon Berries        │ │
│ │ • Oats (50g) • Blueberries (30g)│ │
│ │ 🔥 250 cal  🧬 20mg purines     │ │
│ │ [✏️ Edit][🗑️ Delete][📚 Stash]  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 📊 DRAGON'S DAILY STATUS (Sticky)   │
│ 🔥 Calories: 850/2000 [████░░] 🟢  │
│ 🧬 Purines: 180/300mg [██████] 🟡  │
│ [Tap to see all nutrients ▼]        │
└─────────────────────────────────────┘
│ [🍽️ Diary][📊 Charts][🔮 Oracle][⚙️]│
└─────────────────────────────────────┘
```

**Meal Ordering:** Display meals in fixed order regardless of timestamp:
1. Breakfast → 2. Lunch → 3. Dinner → 4. Snack

**Save to Stash Modal:**
```
┌─────────────────────────────┐
│ 🐉 Add to Dragon's Hoard     │
├─────────────────────────────┤
│ Name: [Oatmeal Bowl]        │
│                             │
│ ● Save as-is (recommended)  │
│ ○ Edit ingredients first    │
│                             │
│ [Cancel]  [Stash It! 🎉]    │
└─────────────────────────────┘
```

### 6.2 SCREEN 2: "The Scroll of History" (Chart Gallery)

**Layout:**
```
┌─────────────────────────────────────┐
│ 📊 Dragon's Scroll                   │
├─────────────────────────────────────┤
│ [This Week] [This Month] [Custom]   │
├─────────────────────────────────────┤
│ Group By: [●Daily][○Weekly][○Monthly]│
├─────────────────────────────────────┤
│ Nutrients:                           │
│ [✓Cal][✓Purine][○Protein][○Carbs]...│
├─────────────────────────────────────┤
│    ^                                │
│ 400│            🔴─────── max line  │
│ 300│     ●──●──●                    │
│ 200│  ●──         ●──●              │
│ 100│                  ●             │
│    └────────────────────>           │
│   Mon Tue Wed Thu Fri Sat Sun       │
├─────────────────────────────────────┤
│ 🔵 Calories  🔴 Purines             │
│ [Export Scroll 📤]                  │
└─────────────────────────────────────┘
```

**Features:**
- Default views: "This Week" / "This Month"
- Custom date range picker
- Grouping: Daily / Weekly / Monthly averages
- Nutrient filters: Toggle lines on/off
- Limit lines: Dotted horizontal for max/min values
- Tooltips: Tap data point for exact values

### 6.3 SCREEN 3: "The Dragon Oracle" (What to Devour?)

**Layout:**
```
┌─────────────────────────────────────┐
│ 🔮 Dragon Oracle                     │
├─────────────────────────────────────┤
│ Consider:                            │
│ ● Today's meals only                │
│ ○ Last 6 days of feasting           │
├─────────────────────────────────────┤
│ What meal needs wisdom?             │
│ [Breakfast ▼]                       │
├─────────────────────────────────────┤
│     [Let's Cook! 👨‍🍳]                │
│     (disabled until selections)     │
├─────────────────────────────────────┤
│ Your dragon can still enjoy:        │
│ 🔥 850 cal  🧬 120mg purines        │
├─────────────────────────────────────┤
│ ORACLE'S VISIONS                    │
│                                     │
│ ┌─ 🏺 The Familiar Feast ─────────┐ │
│ │ Grilled Chicken                 │ │
│ │ Tender chicken with spices!     │ │
│ │ 📊 380 cal | 65mg purines       │ │
│ │ [I Made This! 🍽️] [Tweak It ✏️] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ 🌟 The Twisted Tale ───────────┐ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ 🎲 The Wild Adventure ─────────┐ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Recommendation Types:**
1. **Familiar** 🏺: Uses user's frequent ingredients, safe choice
2. **Twist** 🌟: Similar ingredients, different cuisine/prep
3. **Wild** 🎲: Creative, different ingredients, unexpected

### 6.4 SCREEN 4: "The Dragon's Lair" (Settings)

**Sections:**
1. **Keeper's Profile:** Name, sex, age, weight, height, activity, dietary conditions
2. **Calculate Needs:** Auto-fill thresholds button
3. **Nutrition Thresholds:** Min/max sliders for all nutrients
4. **Dragon's Hoard:** Custom meals and containers list
5. **Dragon Scale Theme:** Presets + custom color picker
6. **Trophy Room:** Earned badges display
7. **Statistics:** Total meals, streaks, etc.
8. **Account:** Export data, sign out, delete account

---

## 7. 🏆 GAMIFICATION: Badge System

### 7.1 Badge Types

| Badge | Name | Trigger |
|-------|------|---------|
| 🏆 | Week Warrior | 7-day logging streak |
| 💧 | Hydra Slayer | Met hydration goal 7 days in row |
| 🐉 | Purine Master | Stayed under purine limit 14 days |
| 📸 | Pixel Perfect | Logged a meal with photo |
| 📦 | The Hoarder | Saved 5 meals to custom dictionary |
| 🔥 | Streak Lord | 30-day logging streak |

### 7.2 Badge Unlock Animation
- Confetti burst (20-30 particles)
- Ember celebration animation
- Vibration feedback
- Toast notification: "Achievement Unlocked!"

---

## 8. 🚀 IMPLEMENTATION PHASES

### Phase 1: Foundation
- [ ] Project setup (Vite + React/Vue)
- [ ] InstantDB integration
- [ ] Authentication system
- [ ] Theme engine implementation
- [ ] Navigation structure
- [ ] Base component library

### Phase 2: Meal Diary (Core)
- [ ] Calendar ribbon component
- [ ] Meal type selector
- [ ] Text input + AI parsing
- [ ] Ingredient consistency engine
- [ ] Meal cards display
- [ ] Daily totals calculation
- [ ] Edit meal (local recalc)
- [ ] Delete meal

### Phase 3: Enhanced Input
- [ ] Image upload to storage
- [ ] OCR for nutrition labels
- [ ] AI vision for food photos
- [ ] Voice input integration
- [ ] Save to Stash feature
- [ ] Hydration tracking

### Phase 4: Analytics
- [ ] Chart Gallery screen
- [ ] Date range selection
- [ ] Grouping (daily/weekly/monthly)
- [ ] Nutrient filters
- [ ] Threshold lines
- [ ] Interactive tooltips
- [ ] Export functionality

### Phase 5: Recommendations
- [ ] "What to Devour?" screen
- [ ] Budget calculation
- [ ] History analysis
- [ ] AI recommendation generation
- [ ] "I Made This!" quick-log
- [ ] "Tweak It" pre-fill

### Phase 6: Polish
- [ ] Settings screen complete
- [ ] Custom items management
- [ ] Badge system
- [ ] Animations (Ember mascot)
- [ ] Offline support
- [ ] Accessibility (high contrast, voice)
- [ ] Performance optimization
- [ ] Testing

---

## 9. 🛠️ TECH STACK

### Frontend
- **Framework:** Web-based (Vite + React or Vue) - *See Deviations*
- **State Management:** TBD based on framework choice
- **Charts:** Chart.js or similar
- **Animations:** CSS animations / Lottie-web

### Backend
- **Database:** InstantDB (real-time sync, offline support)
- **Authentication:** InstantDB Auth or external provider
- **Storage:** For images (TBD - could be InstantDB blobs or external)
- **AI Integration:** API calls to Gemini/OpenAI

### Development
- **IDE:** VS Code
- **Version Control:** GitHub
- **Repository:** https://github.com/dyxsst/purine-control

---

## 10. 📊 PERFORMANCE & COST RULES

1. **Cache aggressively:** Ingredient library, daily totals, chart data
2. **Minimize AI calls:** Use consistency engine, never on edits
3. **Optimistic UI:** Show changes before server confirms
4. **Batch queries:** Fetch related data together
5. **Compress images:** Before upload
6. **Index queries:** date, meal_type for meals collection

---

## 11. 📝 INFORMAL UI LANGUAGE

Use playful, informal labels throughout:

| Standard | Dragon Keeper Style |
|----------|---------------------|
| Snack | Nibble Time |
| Add Water | Glug Gauge |
| Save Meal | Stash in Hoard |
| Recommendations | Oracle's Visions |
| Submit | Log It! 🎉 |
| Charts | Dragon's Scroll |
| Settings | Dragon's Lair |

---

*This document serves as the single source of truth for the Purine Control application development.*
