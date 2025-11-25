# ULTIMATE MEGA PROMPT: "The Purine Dragon Tracker"
## Complete Firebase Studio Build Specification

**Role:** You are an Expert Flutter & Firebase Architect building a production-ready personal nutrition tracker.

**Theme:** "Whimsical Dragon Keeper" - The user is caring for their personal dragon (their body) through mindful feeding.

**Strict Adherence:** Implement every UI element, data structure, logic flow, and optimization rule described below with no omissions.

---

## 1. 🎨 DESIGN SYSTEM: "Dragon Keeper's Journal"

### Visual Philosophy
Serious nutrition tracking meets whimsical fantasy aesthetics. Rounded, colorful, informal, but functionally precise.

### The Dragon Mascot: "Ember"
**Purpose:** Emotional feedback and empty state illustrations (Lottie animations)

**States:**
- **Curious** (Empty Diary): Dragon sniffing around, looking for food
- **Happy** (Good Log): Small fire breath puffs, content expression
- **Satisfied** (Within Limits): Curled up napping, gentle breathing
- **Stuffed** (Warning Threshold): Holding belly, uncomfortable waddle
- **Sick** (Danger Threshold): Green-tinted scales, queasy expression, small smoke clouds
- **Celebrating** (Badge Earned): Flying loop-de-loops, sparkles trailing
- **Hoarding** (Save to Stash): Sitting on pile of food treasures, protective pose

### Typography
- **Headers:** Fredoka One (rounded, bold, playful)
- **Body:** Nunito (friendly, readable)
- **Data/Numbers:** Roboto Mono (clear, precise)

### The "Dragon Scale Shimmer" Theme Engine

**User picks ONE seed color** (their dragon's scale color)

**HSL Generation Algorithm:**
```dart
ThemePalette generateFromSeed(String seedHex) {
  final hsl = hexToHSL(seedHex);
  
  return ThemePalette(
    primary: seedHex,
    background: hslToHex(hsl.h, hsl.s * 0.3, 95),  // Very light wash
    surface: hslToHex(hsl.h, hsl.s * 0.1, 98),     // Near-white tint
    surfaceVariant: hslToHex(hsl.h, hsl.s * 0.2, 92), // Subtle cards
    secondary: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l), // Complementary
    text: hslToHex(hsl.h, hsl.s * 0.5, 15),        // Very dark
    textSecondary: hslToHex(hsl.h, hsl.s * 0.3, 40),
    
    // Semantic colors (adapt intensity, preserve hue recognition)
    success: hslToHex(140, 50, 55),   // Green family
    warning: hslToHex(35, 90, 60),    // Orange/yellow family
    danger: hslToHex(5, 80, 60),      // Red family (safety-critical)
  );
}
```

**Preset Themes:**
- **Emerald Dragon** (Default): Mint green seed (#66BB6A)
- **Midnight Dragon** (Dark Mode): Deep purple seed (#7B2CBF) with inverted lightness values
- **Crystal Dragon** (High Contrast): Pure blue (#0000FF) with accessibility-compliant contrasts

### UI Motifs
- Rounded corners: 16px standard, 24px for major cards
- Bouncy animations: Scale down to 0.95 on tap, spring back
- Confetti: Spawn 20-30 particles on achievements
- Dragon reactions: Animate in response to user actions (300ms delay for feels)

---

## 2. 🧠 THE COMPLETE NUTRITION LOGIC SYSTEM

### A. Tracked Nutrients (The "Dragon's Diet Requirements")

**MUST track these 8 fields everywhere:**
1. **Calories** (kcal)
2. **Purines** (mg) ⭐ Primary focus
3. **Protein** (g)
4. **Carbs** (g)
5. **Fat** (g)
6. **Fiber** (g)
7. **Sodium** (mg)
8. **Sugar** (g)

**Additional Tracking:**
9. **Hydration** (ml) - Separate from food nutrients

### B. Auto-Threshold Calculation (The "Dragon Keeper's Wisdom")

**Location:** Settings > Profile > "Calculate My Dragon's Needs" button

**Formulas:**

**Calories (Mifflin-St Jeor Equation):**
```
For Male:
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5

For Female:
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

Daily Needs = BMR × Activity Multiplier
  - Sedentary: 1.2
  - Light: 1.375
  - Moderate: 1.55
  - Active: 1.725
  - Very Active: 1.9
```

**Purines:**
- Default: 400mg/day (general population)
- Gout Management: 200mg/day
- Kidney Disease: 150mg/day

**Macros (Balanced Diet Percentages):**
- Protein: 15-20% of calories (÷4 for grams)
- Carbs: 45-55% of calories (÷4 for grams)
- Fat: 25-30% of calories (÷9 for grams)
- Fiber: 25-30g (fixed)
- Sodium: <2300mg (fixed)
- Sugar: <50g (fixed, 10% of 2000 cal diet)

**Hydration:**
- Base: 30ml × weight_kg
- Adjusted for activity level

**Warning/Danger Thresholds:**
- Min (Warning): 80% of calculated target
- Max (Danger): 120% of calculated target

### C. The Color System (Dragon's Health Indicators)

**Applied to progress bars, charts, badges:**
- 🟢 **Green (Healthy):** < 80% of max OR > 100% of min (for targets like protein)
- 🟡 **Yellow (Caution):** 80-100% of max OR 80-100% of min
- 🔴 **Red (Danger):** > 100% of max OR < 80% of min

**Visual Implementation:**
```dart
Color getStatusColor(double value, double min, double max) {
  if (value > max) return theme.danger;
  if (value > max * 0.8) return theme.warning;
  if (value < min * 0.8) return theme.warning;
  return theme.success;
}
```

---

## 3. 🗄️ FIRESTORE DATA ARCHITECTURE

### Collection: `/users/{userId}`
```typescript
{
  name: string,
  email: string,
  
  // Profile for calculations
  profile: {
    sex: 'male' | 'female' | 'other',
    age: number,
    weight_kg: number,
    height_cm: number,
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    dietary_conditions: string[], // ['gout', 'diabetes', 'vegetarian']
  },
  
  // Nutrition targets (manually adjustable or auto-calculated)
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
  
  // Visual customization
  theme: {
    preset: 'emerald' | 'midnight' | 'crystal' | 'custom',
    seed_color_hex: string, // Only used if preset='custom'
  },
  
  // Gamification
  badges: string[], // ['streak_7', 'hydration_hero', 'purine_master']
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

### Collection: `/users/{userId}/meals/{mealId}`
```typescript
{
  date: string, // YYYY-MM-DD for easy querying
  timestamp: timestamp, // For exact ordering within day
  
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'hydration',
  meal_name: string,
  
  // CRITICAL: Store nutrientsPerUnit to avoid recalculation
  ingredients: [
    {
      name: string, // Display name
      normalized_name: string, // For cache lookups
      quantity: number,
      unit: string,
      nutrients_per_unit: { // Frozen at log time
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
  
  // Pre-calculated totals (sum of all ingredients)
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
  
  // Optional hydration tracking
  hydration_ml: number, // Only for hydration entries or if meal includes drinks
  
  // Optional image attachments
  image_urls: string[], // Firebase Storage URLs
  
  // Metadata
  analysis_method: 'text' | 'image' | 'label' | 'custom_item' | 'manual',
  created_at: timestamp,
  updated_at: timestamp,
}
```

### Collection: `/users/{userId}/customItems/{itemId}`
```typescript
{
  type: 'meal' | 'container',
  name: string,
  
  // For type='meal'
  ingredients?: [
    {
      name: string,
      normalized_name: string,
      quantity: number,
      unit: string,
      nutrients_per_unit: {...},
    }
  ],
  total_nutrients?: {...},
  
  // For type='container'
  capacity_ml?: number,
  
  created_at: timestamp,
}
```

### Global Collection: `/ingredientLibrary/{normalizedName}`
```typescript
{
  display_name: string,
  
  // The golden source of truth for new entries
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
  
  // Usage tracking for cache maintenance
  use_count: number,
  last_used: timestamp,
  
  // Source tracking
  source: 'ai' | 'manual' | 'usda',
  
  created_at: timestamp,
}
```

### Indexes Required
```
meals: (date ASC, timestamp ASC)
meals: (date ASC, meal_type ASC)
ingredientLibrary: (last_used ASC, use_count ASC) // For pruning
```

---

## 4. ⚡ THE TOKEN OPTIMIZATION ENGINE

### The Golden Rules (MANDATORY)

**Call AI (Gemini) ONLY for:**
1. New text meal entry (user types description)
2. New food photo upload
3. New nutrition label (after OCR extraction if ambiguous)
4. Recommendation generation ("What to Devour?" feature)

**NEVER call AI for:**
- Loading existing meals (read from Firestore)
- Editing meal quantities (recalculate locally using stored `nutrients_per_unit`)
- Using custom items from stash (copy data directly)
- Hydration logging (pure math)
- Switching dates (just query different date range)
- Deleting meals (pure database operation)
- Chart generation (query and aggregate locally)

### The Consistency Algorithm

**Ingredient Normalization Function:**
```typescript
function normalizeIngredientName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/s$/, '') // Remove plural 's'
    .replace(/ies$/, 'y') // berries -> berry
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_'); // Spaces to underscores
}
```

**The Flow (Cloud Function Logic):**
```typescript
async function processIngredient(
  name: string, 
  quantity: number, 
  unit: string
): Promise<IngredientData> {
  
  // Step 1: Normalize
  const normalizedName = normalizeIngredientName(name);
  
  // Step 2: Check cache
  const cached = await db
    .collection('ingredientLibrary')
    .doc(normalizedName)
    .get();
  
  let nutrientsPer100g;
  
  if (cached.exists) {
    // CACHE HIT - Zero API cost! 🎉
    nutrientsPer100g = cached.data().nutrients_per_100g;
    
    // Update usage stats
    await cached.ref.update({
      use_count: admin.firestore.FieldValue.increment(1),
      last_used: admin.firestore.FieldValue.serverTimestamp(),
    });
    
  } else {
    // CACHE MISS - Call Gemini
    nutrientsPer100g = await fetchNutrientsFromAI(name);
    
    // Store for future use
    await db.collection('ingredientLibrary').doc(normalizedName).set({
      display_name: name,
      nutrients_per_100g: nutrientsPer100g,
      use_count: 1,
      last_used: admin.firestore.FieldValue.serverTimestamp(),
      source: 'ai',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  
  // Step 3: Calculate for this specific quantity
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

**Edit Meal Logic (Local Calculation):**
```typescript
// User changes quantity from 150g to 100g
function recalculateIngredient(
  storedIngredient: IngredientData,
  newQuantity: number
): IngredientData {
  
  // Get the per-unit nutrients that were stored at log time
  const oldQuantity = storedIngredient.quantity;
  const ratio = newQuantity / oldQuantity;
  
  return {
    ...storedIngredient,
    quantity: newQuantity,
    nutrients_per_unit: multiplyNutrients(
      storedIngredient.nutrients_per_unit,
      ratio
    ),
  };
}
// NO AI CALL - Instant update!
```

---

## 5. 🤖 AI INTEGRATION SPECIFICATIONS

### A. Gemini Prompts (Use Exactly As Written)

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
Generate 3 meal recommendations for [MEAL_TYPE].

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
    "description": "2-3 sentence whimsical description with dragon puns",
    "ingredients": [
      {"name": "...", "quantity": ..., "unit": "..."}
    ],
    "estimated_nutrients": {
      "calories": number,
      "purines": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  },
  {
    "type": "twist",
    ...
  },
  {
    "type": "wild",
    ...
  }
]

Recommendation types:
1. "familiar" - Uses user's frequent ingredients, safe choice
2. "twist" - Similar ingredients but different preparation/cuisine
3. "wild" - Creative option with different ingredients, still within budget

Ensure all recommendations stay within the remaining budget.
```

### B. Image Analysis Strategy

**Type Detection Logic:**
```typescript
async function analyzeImage(imageUrl: string): Promise<AnalysisResult> {
  // Step 1: Quick Vision API call to detect if it's a nutrition label
  const visionLabels = await visionAPI.detectLabels(imageUrl);
  const isLabel = visionLabels.some(label => 
    label.description.match(/nutrition|facts|label|ingredients/i)
  );
  
  if (isLabel) {
    // Step 2a: Extract text with Vision OCR (cheaper than Gemini)
    const text = await visionAPI.extractText(imageUrl);
    
    // Step 2b: Parse nutrition facts with regex
    const parsed = parseNutritionLabel(text);
    
    if (parsed.confidence > 0.8) {
      return parsed; // Success!
    } else {
      // Fallback to Gemini for ambiguous labels
      return await gemini.analyzeNutritionLabel(imageUrl);
    }
    
  } else {
    // Step 3: Food photo - Use Gemini Vision directly
    return await gemini.analyzeFood Photo(imageUrl);
  }
}
```

**Nutrition Label Parsing (Regex):**
```typescript
function parseNutritionLabel(text: string): ParsedLabel {
  const patterns = {
    calories: /calories:?\s*(\d+)/i,
    protein: /protein:?\s*(\d+\.?\d*)\s*g/i,
    carbs: /total carbohydrate:?\s*(\d+\.?\d*)\s*g/i,
    fat: /total fat:?\s*(\d+\.?\d*)\s*g/i,
    fiber: /dietary fiber:?\s*(\d+\.?\d*)\s*g/i,
    sodium: /sodium:?\s*(\d+)\s*mg/i,
    sugar: /sugars:?\s*(\d+\.?\d*)\s*g/i,
  };
  
  const values = {};
  let matchCount = 0;
  
  for (const [nutrient, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) {
      values[nutrient] = parseFloat(match[1]);
      matchCount++;
    }
  }
  
  return {
    values,
    confidence: matchCount / Object.keys(patterns).length,
  };
}
```

---

## 6. 📱 COMPLETE SCREEN SPECIFICATIONS

### SCREEN 1: "The Dragon's Feeding Log" (Meal Diary)

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ 🐉 Dragon Keeper    [Settings ⚙️]   │ ← Header with mascot icon
├─────────────────────────────────────┤
│ ◀ [M][T][*W*][T][F][S][S] ▶        │ ← Calendar ribbon (horizontal scroll)
│                                     │   Active day gets dragon scale border
├─────────────────────────────────────┤
│ ┌─ Meal Type Selector ─────────────┐│
│ │ [🍳 Breakfast] [🌮 Lunch]        ││
│ │ [🍝 Dinner] [🍪 Snack]           ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─ Input Section ──────────────────┐│
│ │ What did your dragon eat? 🔥     ││
│ │ ┌───────────────────────────┐   ││
│ │ │ [Text input field.......]  │   ││
│ │ │ [🎤 Voice] [📸] [🖼️]       │   ││
│ │ └───────────────────────────┘   ││
│ │      [Log It! 🎉]                ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─ Hydration ("Dragon's Water Cave")┤
│ │ 💧 [Progress bar: 1500/2000ml]   ││
│ │ Quick add: [+250ml][+500ml][+Chalice]│
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ TODAY'S FEAST                        │
│                                     │
│ ┌─ 🍳 Breakfast ──────────────────┐│
│ │ Oatmeal & Dragon Berries         ││
│ │ • Oats (50g)                     ││
│ │ • Blueberries (30g)              ││
│ │ • Honey (1 tbsp)                 ││
│ │ ─────────────────────────        ││
│ │ 🔥 250 cal  🧬 20mg purines      ││
│ │                                  ││
│ │ [📸 thumbnail]                   ││
│ │ [✏️ Edit][🗑️ Delete][📚 Stash]   ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─ 🌮 Lunch ─────────────────────┐│
│ │ ...                              ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ 📊 DRAGON'S DAILY STATUS (Sticky)   │
│ ┌───────────────────────────────┐  │
│ │ 🔥 Calories: 850/2000           │  │
│ │ [████████░░░░░░] 42% 🟢        │  │
│ │                                 │  │
│ │ 🧬 Purines: 180/300mg           │  │
│ │ [████████████░░] 60% 🟡        │  │
│ │                                 │  │
│ │ [Tap to see all nutrients ▼]   │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
│ [🍽️ Diary][📊 Scroll][🔮 Oracle][⚙️] │ ← Bottom nav
└─────────────────────────────────────┘
```

**Critical Behaviors:**

**1. Calendar Date Selection:**
- Default: Today (highlighted with dragon scale border)
- Swipe left/right or tap dates to navigate
- Days with logged meals show small dragon paw print indicator
- Query: `meals where date = selected_date order by timestamp`
- If no meals: Show Ember (dragon) in "Curious" state with empty state message

**2. Meal Type Selection:**
- Persist selection until user changes it
- Next entry defaults to last selected type
- Visual feedback: Selected pill has dragon scale texture

**3. Input Methods:**

**Text Input:**
```
User types: "grilled chicken breast 150g with steamed broccoli"
   ↓
Tap "Log It!"
   ↓
Loading: Ember breathes fire with "Analyzing feast..."
   ↓
Cloud Function: analyzeAndLogMeal()
   - Parse with Gemini
   - Check ingredient library for each item
   - Calculate nutrients
   - Store meal document
   ↓
Meal card slides in from bottom (300ms animation)
Daily totals update with smooth bar animation (500ms)
Ember reacts based on status (Happy if good, Stuffed if near limit)
```

**Voice Input:**
```
User taps microphone
   ↓
Speech-to-text captures: "two scrambled eggs with toast"
   ↓
Text appears in input field
User can edit before submitting
   ↓
Same flow as text input
```

**Photo Upload:**
```
User taps camera or gallery
   ↓
Image uploaded to Firebase Storage
   ↓
Loading: "Dragon is sniffing your meal..."
   ↓
Cloud Function:
   - Detect if nutrition label or food photo
   - Apply appropriate analysis
   - Return ingredient list
   ↓
Show confirmation dialog with parsed ingredients
User can adjust before saving
```

**4. Meal Card Display:**

**CRITICAL: Meal Ordering Logic**
Regardless of timestamp, meals MUST display in this fixed order:
1. Breakfast
2. Lunch  
3. Dinner
4. Snack

```typescript
function sortMeals(meals: Meal[]): Meal[] {
  const order = ['breakfast', 'lunch', 'dinner', 'snack'];
  return meals.sort((a, b) => 
    order.indexOf(a.meal_type) - order.indexOf(b.meal_type)
  );
}
```

**Expandable Nutrient View:**
- Default: Show calories & purines only
- Tap card or "Show details ▼" to expand
- Expanded view shows all 8 nutrients with color-coded values
- Smooth accordion animation

**5. Edit Meal Flow:**
```
User taps ✏️ Edit
   ↓
Modal opens (slide up from bottom)
   ┌─────────────────────────────┐
   │ 🐉 Edit Dragon's Meal        │
   ├─────────────────────────────┤
   │ Meal Name: [Oatmeal Bowl]   │
   │                             │
   │ Ingredients:                │
   │ ┌─────────────────────────┐ │
   │ │ Oats                    │ │
   │ │ [50] [g ▼]              │ │
   │ │             [- Remove]  │ │
   │ └─────────────────────────┘ │
   │ ┌─────────────────────────┐ │
   │ │ Blueberries             │ │
   │ │ [30] [g ▼]              │ │
   │ │             [- Remove]  │ │
   │ └─────────────────────────┘ │
   │                             │
   │ [+ Add Ingredient]          │
   │                             │
   │ Images: [📷][📷]            │
   │ [+ Add Photo]               │
   │                             │
   │ [Cancel]  [Save Changes 💾] │
   └─────────────────────────────┘

User changes quantity: 50g → 100g
   ↓
LOCAL CALCULATION (no AI):
   - Take stored nutrients_per_unit from original ingredient
   - Multiply by (100/50) = 2
   - Recalculate meal.total_nutrients
   - Update Firestore
   ↓
Modal closes with success animation
Meal card updates smoothly
Daily totals recalculate
```

**6. Delete Meal:**
```
User taps 🗑️
   ↓
Confirmation dialog:
"Remove this meal from your dragon's log?"
[Cancel] [Yes, Remove]
   ↓
If confirmed:
   - Delete from Firestore
   - Meal card fades out (300ms)
   - Daily totals update
   - Ember shows satisfied expression
```

**7. Save to Stash (Custom Items):**
```
User taps 📚 Stash
   ↓
Modal appears:
   ┌─────────────────────────────┐
   │ 🐉 Add to Dragon's Hoard     │
   ├─────────────────────────────┤
   │ Save this meal for quick     │
   │ logging later?               │
   │                             │
   │ Name: [Oatmeal Bowl]        │
   │                             │
   │ ● Save as-is (recommended)  │
   │ ○ Edit ingredients first    │
   │                             │
   │ [Cancel]  [Stash It! 🎉]    │
   └─────────────────────────────┘

If "Save as-is":
   - Copy meal data to /customItems/
   - NO AI CALL
   - Animation: Book slams shut, sparkles
   - Confetti burst
   - Toast: "Added to your dragon's hoard!"
   - Ember does hoarding animation

If "Edit first":
   - Open ingredient editor
   - Save after user makes changes
```

**8. Hydration Tracking:**

**The "Dragon's Water Cave"** - Visual water meter
```
┌─────────────────────────────┐
│ 💧 Dragon's Hydration        │
│ ┌─────────────────────────┐ │
│ │░░░░░░░░░░░░░░░░░░░░░░░░░│ │ ← Empty state
│ │████████████░░░░░░░░░░░░░│ │ ← Filled to 50%
│ │████████████████████████│ │ ← Full (green glow)
│ └─────────────────────────┘ │
│ 1500ml / 2000ml (75%)       │
│                             │
│ Quick Add:                  │
│ [+250ml] [+500ml] [+Chalice]│
└─────────────────────────────┘

```
Tap +250ml
   ↓
Instant visual update:
   - Water fills up with wave animation
   - Number updates: 1500ml → 1750ml
   - If goal reached: Ember celebrates, water glows
   ↓
Store update:
   - Create meal entry with type='hydration', hydrationMl=250
   - OR append to most recent meal's hydrationMl field
   ↓
Badge check: If 7-day hydration streak → unlock "Hydra Slayer"
```

**Custom Container Logic:**
```
User previously created "Chalice" (750ml) in settings
   ↓
Tap "+Chalice" button
   ↓
Query customItems where type='container' and name='Chalice'
Retrieve capacityMl=750
   ↓
Add 750ml instantly (no AI)
Animation: Chalice pours into meter
```

**9. Daily Totals Panel (Sticky Footer):**

**Default Collapsed View:**
```
┌─────────────────────────────┐
│ 📊 DRAGON'S DAILY STATUS     │
├─────────────────────────────┤
│ 🔥 Calories: 850/2000        │
│ [████████░░░░░░] 42% 🟢     │
│                             │
│ 🧬 Purines: 180/300mg       │
│ [████████████░░] 60% 🟡     │
│                             │
│ [Tap to see all ▼]          │
└─────────────────────────────┘
```

**Expanded View (Tap to toggle):**
```
┌─────────────────────────────┐
│ 📊 DRAGON'S DAILY STATUS     │
├─────────────────────────────┤
│ 🔥 850/2000 cal    [██░] 🟢 │
│ 🧬 180/300mg       [████] 🟡│
│ 💪 65/75g protein  [███] 🟢 │
│ 🍞 210/250g carbs  [███] 🟢 │
│ 🥑 30/65g fat      [█░] 🟢  │
│ 🌾 18/25g fiber    [██░] 🟡 │
│ 🧂 1200/2300mg Na  [██░] 🟢 │
│ 🍯 25/50g sugar    [█░] 🟢  │
│ 💧 1750/2000ml     [███] 🟢 │
│                             │
│ [Tap to collapse ▲]         │
└─────────────────────────────┘
```

**Real-time Calculation:**
```typescript
function calculateDailyTotals(meals: Meal[]): DailyTotals {
  const totals = {
    calories: 0,
    purines: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sodium: 0,
    sugar: 0,
    hydration: 0,
  };
  
  for (const meal of meals) {
    for (const [key, value] of Object.entries(meal.total_nutrients)) {
      totals[key] += value;
    }
    totals.hydration += meal.hydration_ml || 0;
  }
  
  return totals;
}
```

**Ember Reactions Based on Status:**
```typescript
function getEmberState(totals: DailyTotals, thresholds: Thresholds): EmberState {
  const caloriePercent = totals.calories / thresholds.calories_max;
  const purinePercent = totals.purines / thresholds.purines_max;
  
  if (purinePercent > 1.0) return 'sick'; // Red zone
  if (caloriePercent > 1.0) return 'stuffed'; // Red zone
  if (purinePercent > 0.8 || caloriePercent > 0.8) return 'satisfied'; // Yellow zone
  return 'happy'; // Green zone
}
```

---

### SCREEN 2: "The Scroll of Dragon's History" (Chart Gallery)

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ 📊 Dragon's Scroll    [🏠] [⚙️]     │
├─────────────────────────────────────┤
│ ┌─ Date Range ─────────────────────┐│
│ │ [This Week] [This Month] [Custom]││
│ └─────────────────────────────────┘│
│                                     │
│ Custom Range: (if selected)         │
│ From: [Nov 15 ▼]  To: [Nov 22 ▼]  │
├─────────────────────────────────────┤
│ ┌─ Group By ───────────────────────┐│
│ │ [●Daily] [○Weekly] [○Monthly]    ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─ Dragon's Limits ────────────────┐│
│ │ Target: 2000 cal/day  🔴─────    ││
│ │ Limit: 300mg purines  🔴─────    ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─ Nutrient Filter (Horizontal) ───┐│
│ │ [✓Calories][✓Purines][○Protein]  ││
│ │ [○Carbs][○Fat][○Fiber][○Sugar]   ││
│ │ [○Sodium][○Hydration]             ││
│ │ << swipe for more >>              ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│                                     │
│    [Multi-line Chart Area]          │
│    ^                                │
│ 400│                   🔴 max line  │
│ 300│     ●──●──●                    │
│ 200│  ●──         ●──●   🟡 min    │
│ 100│                  ●             │
│    └────────────────────> Days     │
│   Mon Tue Wed Thu Fri Sat Sun      │
│                                     │
│ 💡 Tap any point for details        │
├─────────────────────────────────────┤
│ ┌─ Legend ─────────────────────────┐│
│ │ 🔵 Calories  🔴 Purines          ││
│ │ 🟢 Protein   🟡 Carbs            ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ [Export Scroll 📤]                  │
└─────────────────────────────────────┘
```

**Critical Behaviors:**

**1. Date Range Selection:**

**"This Week" Logic:**
```typescript
function getThisWeek(): DateRange {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, etc.
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek + 1); // Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  
  return { start: startOfWeek, end: endOfWeek };
}
```

**"This Month" Logic:**
```typescript
function getThisMonth(): DateRange {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return { start: startOfMonth, end: endOfMonth };
}
```

**Custom Range:**
```
User taps "Custom"
   ↓
Date picker modal appears
┌─────────────────────────────┐
│ 🐉 Choose Date Range         │
├─────────────────────────────┤
│ From: [📅 Nov 1, 2024]      │
│                             │
│ To:   [📅 Nov 22, 2024]     │
│                             │
│ Quick picks:                │
│ [Last 7 Days] [Last 30 Days]│
│ [Last 3 Months]             │
│                             │
│ [Cancel]  [Apply Range]     │
└─────────────────────────────┘
```

**2. Grouping Logic:**

**Daily (Default):**
```typescript
// Query all meals in range
const meals = await queryMeals(userId, startDate, endDate);

// Group by date
const dailyData = meals.reduce((acc, meal) => {
  if (!acc[meal.date]) {
    acc[meal.date] = initializeNutrientObject();
  }
  addNutrients(acc[meal.date], meal.total_nutrients);
  return acc;
}, {});

// Each data point = one day
```

**Weekly:**
```typescript
function groupByWeek(meals: Meal[]): WeeklyData[] {
  const weeks = {};
  
  meals.forEach(meal => {
    const weekKey = getWeekKey(meal.date); // "2024-W47"
    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        startDate: getWeekStart(weekKey),
        totals: initializeNutrientObject(),
        mealCount: 0,
      };
    }
    addNutrients(weeks[weekKey].totals, meal.total_nutrients);
    weeks[weekKey].mealCount++;
  });
  
  // Calculate averages
  return Object.values(weeks).map(week => ({
    ...week,
    averages: divideNutrients(week.totals, 7), // Per day in week
  }));
}
```

**Monthly:**
```typescript
function groupByMonth(meals: Meal[]): MonthlyData[] {
  const months = {};
  
  meals.forEach(meal => {
    const monthKey = meal.date.substring(0, 7); // "2024-11"
    if (!months[monthKey]) {
      months[monthKey] = {
        totals: initializeNutrientObject(),
        daysWithData: new Set(),
      };
    }
    addNutrients(months[monthKey].totals, meal.total_nutrients);
    months[monthKey].daysWithData.add(meal.date);
  });
  
  // Calculate daily averages within month
  return Object.entries(months).map(([key, data]) => ({
    month: key,
    averages: divideNutrients(data.totals, data.daysWithData.size),
  }));
}
```

**3. Nutrient Filtering:**

**Filter State Management:**
```typescript
interface FilterState {
  calories: boolean;
  purines: boolean;
  protein: boolean;
  carbs: boolean;
  fat: boolean;
  fiber: boolean;
  sodium: boolean;
  sugar: boolean;
  hydration: boolean;
}

// Default: Only calories and purines visible
const defaultFilters: FilterState = {
  calories: true,
  purines: true,
  protein: false,
  carbs: false,
  fat: false,
  fiber: false,
  sodium: false,
  sugar: false,
  hydration: false,
};
```

**Filter Interaction:**
```
User taps "Protein" chip
   ↓
Toggle state: false → true
Chip visual changes: gray → theme.primary
   ↓
Chart updates (300ms animation):
   - New line appears for protein data
   - Y-axis rescales if needed
   - Legend updates
   ↓
Ember flies along the new line briefly (whimsical touch)
```

**4. Chart Visualization (fl_chart Implementation):**

```dart
LineChartData buildChartData(
  List<DailyData> data,
  FilterState filters,
  Thresholds thresholds,
) {
  final lines = <LineChartBarData>[];
  
  if (filters.calories) {
    lines.add(LineChartBarData(
      spots: data.map((d) => FlSpot(d.x, d.calories)).toList(),
      color: theme.primary,
      barWidth: 3,
      dotData: FlDotData(show: true),
      belowBarData: BarAreaData(
        show: true,
        color: theme.primary.withOpacity(0.1),
      ),
    ));
  }
  
  if (filters.purines) {
    lines.add(LineChartBarData(
      spots: data.map((d) => FlSpot(d.x, d.purines)).toList(),
      color: theme.danger,
      barWidth: 3,
      dotData: FlDotData(show: true),
    ));
  }
  
  // ... repeat for other nutrients
  
  return LineChartData(
    lineBarsData: lines,
    extraLinesData: ExtraLinesData(
      horizontalLines: [
        HorizontalLine(
          y: thresholds.purines_max,
          color: theme.danger,
          strokeWidth: 2,
          dashArray: [5, 5],
          label: HorizontalLineLabel(
            show: true,
            labelResolver: (_) => 'Max: ${thresholds.purines_max}mg',
          ),
        ),
        // Add min line if applicable
      ],
    ),
    lineTouchData: LineTouchData(
      touchTooltipData: LineTouchTooltipData(
        tooltipBgColor: theme.surface,
        getTooltipItems: (touchedSpots) {
          return touchedSpots.map((spot) {
            return LineTooltipItem(
              '${spot.y.toStringAsFixed(0)}\n${getDateLabel(spot.x)}',
              TextStyle(color: theme.text),
            );
          }).toList();
        },
      ),
    ),
  );
}
```

**5. Threshold Lines:**

**Visual Rules:**
- Max threshold: Red dashed line (`🔴─────`)
- Min threshold (if applicable): Yellow dashed line (`🟡─────`)
- Lines persist regardless of filter state
- Label shows on hover: "Max: 300mg purines"

**6. Interactive Tooltips:**
```
User taps data point
   ↓
Tooltip appears above point:
┌─────────────────┐
│ Wednesday       │
│ 🔥 1850 cal     │
│ 🧬 220mg purines│
│ 💪 70g protein  │
│ (filtered items)│
└─────────────────┘

Tooltip persists for 3 seconds or until user taps elsewhere
```

**7. Export Functionality:**
```
User taps "Export Scroll 📤"
   ↓
Modal with options:
┌─────────────────────────────┐
│ 🐉 Export Dragon's Data      │
├─────────────────────────────┤
│ ● Chart Image (PNG)          │
│ ○ Data Table (CSV)           │
│ ○ Full Report (PDF)          │
│                             │
│ Include:                    │
│ ☑ Chart visualization       │
│ ☑ Daily totals table        │
│ ☑ Nutrient summary          │
│                             │
│ [Cancel]  [Export 📧]       │
└─────────────────────────────┘

Generate file → Share sheet
```

**8. Empty State:**
```
If no data in selected range:
┌─────────────────────────────┐
│                             │
│      [Ember sleeping]       │
│                             │
│ Your dragon's scroll is     │
│ empty for this period.      │
│                             │
│ [Go Feed Your Dragon 🍽️]   │
└─────────────────────────────┘
```

**9. Performance Optimization:**

**Data Caching:**
```typescript
// Cache processed chart data for 5 minutes
const chartCache = new Map<string, {data: any, timestamp: number}>();

function getCachedChartData(
  userId: string,
  range: DateRange,
  grouping: string,
): ChartData | null {
  const key = `${userId}_${range.start}_${range.end}_${grouping}`;
  const cached = chartCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data; // 5 min cache
  }
  return null;
}
```

**Lazy Loading:**
```
Show skeleton chart immediately
Query data in background
Animate in real data when ready (500ms fade)
```

---

### SCREEN 3: "The Dragon Oracle" (What to Devour?)

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ 🔮 Dragon Oracle      [🏠] [⚙️]     │
├─────────────────────────────────────┤
│ Let the oracle guide your dragon's  │
│ next meal...                        │
├─────────────────────────────────────┤
│ ┌─ Context ────────────────────────┐│
│ │ Consider:                        ││
│ │ ● Today's meals only             ││
│ │ ○ Last 6 days of feasting        ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─ Meal Type ──────────────────────┐│
│ │ What meal needs wisdom?          ││
│ │ [Breakfast ▼]                    ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│                                     │
│     [Let's Cook! 👨‍🍳]              │
│     (disabled until selections made)│
│                                     │
├─────────────────────────────────────┤
│ ┌─ Remaining Budget ───────────────┐│
│ │ Your dragon can still enjoy:     ││
│ │ 🔥 850 cal  🧬 120mg purines     ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ORACLE'S VISIONS                    │
│                                     │
│ ┌─ 🏺 The Familiar Feast ──────────┐│
│ │ Grilled Dragon-Scale Chicken     ││
│ │                                  ││
│ │ Your dragon craves this classic! ││
│ │ Tender grilled chicken with herb ││
│ │ magic and roasted vegetables.    ││
│ │ A safe, satisfying feast.        ││
│ │                                  ││
│ │ Ingredients (tap to expand):     ││
│ │ ▶ Chicken breast (150g)          ││
│ │   Broccoli (100g)                ││
│ │   Olive oil (1 tbsp)             ││
│ │                                  ││
│ │ 📊 380 cal | 65mg purines        ││
│ │ Budget: ✓ 470 cal ✓ 55mg left   ││
│ │                                  ││
│ │ [I Made This! 🍽️] [Tweak It ✏️] ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─ 🌟 The Twisted Tale ────────────┐│
│ │ Mediterranean Dragon Bowl        ││
│ │ ... (similar structure)          ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─ 🎲 The Wild Adventure ──────────┐│
│ │ Thai Curry Surprise              ││
│ │ ... (similar structure)          ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Critical Behaviors:**

**1. Input Validation:**
```
Initial state:
- Both options unselected
- "Let's Cook!" button disabled and grayed out
   ↓
User selects "Today"
- Button still disabled
   ↓
User selects "Dinner"
- Button becomes enabled with bouncing animation
- Button glows with theme.primary color
```

**2. Budget Calculation:**

**For "Today" Context:**
```typescript
async function calculateBudget(
  userId: string,
  context: 'today' | 'last6days',
  mealType: string,
): Promise<Budget> {
  const user = await getUser(userId);
  const today = formatDate(new Date());
  
  if (context === 'today') {
    // Query today's meals
    const meals = await queryMeals(userId, today, today);
    const consumed = sumNutrients(meals);
    
    return {
      remaining_calories: user.thresholds.calories_max - consumed.calories,
      remaining_purines: user.thresholds.purines_max - consumed.purines,
      context_days: 1,
    };
  } else {
    // Query last 6 days + today (7 days total)
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    
    const meals = await queryMeals(
      userId,
      formatDate(sixDaysAgo),
      today
    );
    const consumed = sumNutrients(meals);
    
    // Calculate average daily budget across 7 days
    const totalBudget = user.thresholds.calories_max * 7;
    const remainingTotal = totalBudget - consumed.calories;
    const dailyRemaining = remainingTotal / 7;
    
    return {
      remaining_calories: dailyRemaining,
      remaining_purines: (user.thresholds.purines_max * 7 - consumed.purines) / 7,
      context_days: 7,
    };
  }
}
```

**3. Recommendation Generation (Cloud Function):**

```typescript
export const generateRecommendations = functions.https.onCall(
  async (data, context) => {
    const { userId, dateContext, mealType } = data;
    
    // Step 1: Calculate budget
    const budget = await calculateBudget(userId, dateContext, mealType);
    
    // Step 2: Analyze user history
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const historicalMeals = await db
      .collection(`users/${userId}/meals`)
      .where('meal_type', '==', mealType)
      .where('date', '>=', formatDate(thirtyDaysAgo))
      .get();
    
    // Step 3: Extract patterns
    const ingredientFrequency = new Map<string, number>();
    const mealNames = [];
    
    historicalMeals.forEach(doc => {
      const meal = doc.data();
      mealNames.push(meal.meal_name);
      
      meal.ingredients.forEach(ing => {
        const count = ingredientFrequency.get(ing.normalized_name) || 0;
        ingredientFrequency.set(ing.normalized_name, count + 1);
      });
    });
    
    // Get top 10 ingredients
    const topIngredients = Array.from(ingredientFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
    
    // Step 4: Get user profile
    const user = await db.collection('users').doc(userId).get();
    const profile = user.data();
    
    // Step 5: Call Gemini
    const prompt = `Generate 3 ${mealType} meal recommendations for a dragon keeper.

User Profile:
- Dietary conditions: ${profile.profile.dietary_conditions.join(', ') || 'none'}
- Typical ${mealType} meals: ${mealNames.slice(0, 5).join(', ')}
- Favorite ingredients: ${topIngredients.join(', ')}

Remaining Budget (for this meal):
- Calories: ${budget.remaining_calories} kcal
- Purines: ${budget.remaining_purines} mg

Return ONLY valid JSON array with no markdown:
[
  {
    "type": "familiar",
    "name": "meal name with dragon theme",
    "description": "2-3 sentences, whimsical tone with dragon puns, explain why dragon will love it",
    "ingredients": [
      {"name": "ingredient", "quantity": number, "unit": "g"|"ml"|"cup"|etc}
    ],
    "estimated_nutrients": {
      "calories": number,
      "purines": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  },
  {
    "type": "twist",
    "name": "...",
    ...
  },
  {
    "type": "wild",
    "name": "...",
    ...
  }
]

Requirements:
- "familiar": Use user's top ingredients, similar to their usual meals
- "twist": Different cuisine/prep but uses some familiar ingredients
- "wild": Creative, different ingredients, unexpected flavors
- ALL recommendations MUST stay within the remaining budget
- Include fun dragon-themed names and descriptions
- Ensure nutritional estimates are realistic`;

    const response = await callGeminiAPI(prompt);
    const recommendations = JSON.parse(response);
    
    // Step 6: Validate recommendations
    recommendations.forEach(rec => {
      if (rec.estimated_nutrients.calories > budget.remaining_calories * 1.1) {
        throw new Error(`Recommendation exceeds calorie budget: ${rec.name}`);
      }
      if (rec.estimated_nutrients.purines > budget.remaining_purines * 1.1) {
        throw new Error(`Recommendation exceeds purine budget: ${rec.name}`);
      }
    });
    
    return {
      recommendations,
      budget,
      context: dateContext,
    };
  }
);
```

**4. Loading State:**
```
User taps "Let's Cook!"
   ↓
Button disabled, shows spinner
Screen overlay with semi-transparent background
   ↓
Center of screen:
┌─────────────────────────────┐
│                             │
│   [Ember breathing fire]    │
│                             │
│  The Dragon Oracle sees...  │
│        ✨  ✨  ✨          │
│                             │
└─────────────────────────────┘

Typical duration: 5-10 seconds
   ↓
Recommendations fade in (500ms stagger between cards)
```

**5. Recommendation Card Interactions:**

**Expand Ingredients:**
```
Initial state: Ingredients collapsed, shows ▶ icon
   ↓
User taps "Ingredients" or ▶ icon
   ↓
Smooth accordion animation (300ms)
Full ingredient list appears with quantities
Icon changes to ▼
```

**"I Made This!" Button:**
```
User taps "I Made This! 🍽️"
   ↓
Confirmation dialog:
┌─────────────────────────────┐
│ 🐉 Log this feast?           │
├─────────────────────────────┤
│ Add "Grilled Dragon-Scale   │
│ Chicken" to today's meals?  │
│                             │
│ This will use the oracle's  │
│ estimated nutrients.        │
│                             │
│ [Cancel]  [Yes, Feed! 🍽️]   │
└─────────────────────────────┘
   ↓
If confirmed:
   - Create meal document with:
     * meal_name from recommendation
     * ingredients from recommendation  
     * estimated_nutrients as total_nutrients
     * analysis_method = 'recommendation'
   - NO AI CALL (use Gemini's estimates directly)
   - Navigate to Meal Diary
   - Show new meal card with success animation
   - Ember celebrates
   - Toast: "Dragon feast logged!"
```

**"Tweak It" Button:**
```
User taps "Tweak It ✏️"
   ↓
Navigate to Meal Diary
Pre-fill input section with recommendation data
   ↓
Meal Diary shows:
┌─────────────────────────────┐
│ 📝 Editing Oracle's Vision   │
├─────────────────────────────┤
│ Meal: [Grilled Dragon-Scale │
│        Chicken]              │
│                             │
│ Ingredients:                │
│ • Chicken breast (150g)     │
│ • Broccoli (100g)           │
│ • Olive oil (1 tbsp)        │
│                             │
│ [Edit quantities or add more]│
│                             │
│ [Log Adjusted Meal 🍽️]      │
└─────────────────────────────┘

User can modify before logging
When logged, uses recommendation as base (no AI call for initial parse)
```

**6. Budget Display Updates:**
```
As user views recommendations:
- Budget panel stays visible at top
- Shows what's left after EACH recommendation
- Color-coded:
  * Green: Plenty of budget remaining
  * Yellow: Getting close to limit
  * Red: Would exceed limit (shouldn't happen if validation works)
```

**7. Empty State (No History):**
```
If user has logged fewer than 5 meals total:
┌─────────────────────────────┐
│                             │
│   [Ember looking curious]   │
│                             │
│ Your dragon is still young! │
│                             │
│ The Oracle needs more feast │
│ history to provide wisdom.  │
│                             │
│ Log at least 5 meals to     │
│ unlock personalized         │
│ recommendations.            │
│                             │
│ [Go Feed Your Dragon 🍽️]   │
└─────────────────────────────┘
```

---

### SCREEN 4: "The Dragon's Lair" (Settings)

**Layout Structure (Scrollable):**
```
┌─────────────────────────────────────┐
│ ⚙️ Dragon's Lair      [🏠]          │
├─────────────────────────────────────┤
│ ┌─ KEEPER'S PROFILE ───────────────┐│
│ │ Name: [Dragon Keeper]            ││
│ │                                  ││
│ │ Sex: [Male ▼]                    ││
│ │ Age: [30] years                  ││
│ │ Weight: [75] [kg ▼]              ││
│ │ Height: [175] cm                 ││
│ │ Activity: [Moderate ▼]           ││
│ │                                  ││
│ │ Dietary Conditions:              ││
│ │ [x] Gout  [ ] Diabetes           ││
│ │ [ ] Vegetarian  [ ] Vegan        ││
│ │ [+ Add Custom]                   ││
│ │                                  ││
│ │ [Calculate Dragon's Needs 🔮]    ││
│ │ (Auto-fills thresholds below)    ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─ NUTRITION THRESHOLDS ───────────┐│
│ │ 🔥 Calories                      ││
│ │   Min: [1800] kcal ⚠️           ││
│ │   Max: [2200] kcal 🔴           ││
│ │   ├────●────────┤                ││
│ │                                  ││
│ │ 🧬 Purines                       ││
│ │   Min: [150] mg ⚠️              ││
│ │   Max: [300] mg 🔴              ││
│ │   ├──●──────────┤                ││
│ │                                  ││
│ │ 💪 Protein Target: [75] g        ││
│ │ 🍞 Carbs Target: [250] g         ││
│ │ 🥑 Fat Target: [65] g            ││
│ │ 🌾 Fiber Target: [25] g          ││
│ │ 🧂 Sodium Max: [2300] mg         ││
│ │ 🍯 Sugar Max: [50] g             ││
│ │ 💧 Hydration Target: [2000] ml   ││
│ │                                  ││
│ │ [Reset to Defaults]              ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─ DRAGON'S HOARD (Custom Items) ──┐│
│ │ Your saved meals & containers    ││
│ │                                  ││
│ │ [+ New Meal] [+ New Container]   ││
│ │                                  ││
│ │ 🍔 My Morning Dragon Bowl        ││
│ │    3 ingredients • 320 cal       ││
│ │    [✏️ Edit] [🗑️ Delete]         ││
│ │                                  ││
│ │ 🥤 Dragon Chalice (750ml)        ││
│ │    [✏️ Edit] [🗑️ Delete]         ││
│ │                                  ││
│ │ 🍕 Quick Pizza Snack             ││
│ │    5 ingredients • 480 cal       ││
│ │    [✏️ Edit] [🗑️ Delete]         ││
│ │                                  ││
│ │ (swipe to see more)              ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─ DRAGON SCALE THEME ─────────────┐│
│ │ Choose your dragon's colors:     ││
│ │                                  ││
│ │ Presets:                         ││
│ │ ┌──────┐ ┌──────┐ ┌──────┐      ││
│ │ │ 🟢   │ │ 🟣   │ │ 🔵   │      ││
│ │ │Emerald│ │Midnight│ │Crystal│    ││
│ │ │Dragon│ │Dragon│ │Dragon│      ││
│ │ └──────┘ └──────┘ └──────┘      ││
│ │   [●]      [ ]      [ ]         ││
│ │                                  ││
│ │ Custom Scale Color:              ││
│ │ [🎨 Pick Your Dragon's Hue]      ││
│ │                                  ││
│ │ Preview:                         ││
│ │ ┌─────────────────────────────┐ ││
│ │ │ [Sample card with theme]    │ ││
│ │ │ 🔥 Progress bar example     │ ││
│ │ │ [Sample button]             │ ││
│ │ └─────────────────────────────┘ ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─ TROPHY ROOM (Badges) ───────────┐│
│ │ Your dragon's achievements:      ││
│ │                                  ││
│ │ ┌─────┐ ┌─────┐ ┌─────┐         ││
│ │ │ 🏆  │ │ 💧  │ │ 🔒  │         ││
│ │ │Week │ │Hydra│ │???? │         ││
│ │ │Streak│ │Slayer│ │Locked│        ││
│ │ └─────┘ └─────┘ └─────┘         ││
│ │ Earned  Earned  Not Yet         ││
│ │                                  ││
│ │ Progress to next badge:          ││
│ │ 🎯 Purine Master (12/14 days)    ││
│ │ [████████████░░] 86%            ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─ DRAGON STATISTICS ──────────────┐│
│ │ Total meals logged: 127          ││
│ │ Current streak: 7 days 🔥        ││
│ │ Longest streak: 21 days 🏆       ││
│ │ Meals in hoard: 5                ││
│ │ Days tracking: 42                ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌─ ACCOUNT ────────────────────────┐│
│ │ [Export Dragon's Data 📤]        ││
│ │ [Sign Out 🚪]                    ││
│ │ [Delete Account ⚠️]              ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Critical Behaviors:**

**1. Auto-Calculate Thresholds:**

```
User fills profile fields
   ↓
Taps "Calculate Dragon's Needs 🔮"
   ↓
Loading spinner (1-2 seconds for effect)
   ↓
Cloud Function or client-side calculation:

function calculateThresholds(profile: Profile): Thresholds {
  // Mifflin-St Jeor for BMR
  let bmr: number;
  
  if (profile.sex === 'male') {
    bmr = (10 * profile.weight_kg) 
        + (6.25 * profile.height_cm) 
        - (5 * profile.age) 
        + 5;
  } else {
    bmr = (10 * profile.weight_kg) 
        + (6.25 * profile.height_cm) 
        - (5 * profile.age) 
        - 161;
  }
  
  // Activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  const tdee = bmr * activityMultipliers[profile.activity_level];
  
  // Purine limits based on conditions
  let purineMax = 400; // Default
  if (profile.dietary_conditions.includes('gout')) {
    purineMax = 200; // Therapeutic limit
  }
  if (profile.dietary_conditions.includes('kidney_disease')) {
    purineMax = 150; // More restrictive
  }
  
  // Macros (based on balanced diet percentages)
  const proteinCal = tdee * 0.175; // 17.5% of calories
  const carbsCal = tdee * 0.50;    // 50% of calories
  const fatCal = tdee * 0.275;     // 27.5% of calories
  
  return {
    calories_min: Math.round(tdee * 0.85),
    calories_max: Math.round(tdee * 1.15),
    purines_min: Math.round(purineMax * 0.5),
    purines_max: purineMax,
    protein_target: Math.round(proteinCal / 4), // 4 cal per g
    carbs_target: Math.round(carbsCal / 4),
    fat_target: Math.round(fatCal / 9), // 9 cal per g
    fiber_target: 25,
    sodium_max: 2300,
    sugar_max: 50,
    hydration_target: Math.round(profile.weight_kg * 30),
  };
}
   ↓
Thresholds animate into sliders with "magic" effect
Ember breathes satisfied fire
Toast: "Your dragon's needs calculated! 🔮"
```

**2. Manual Threshold Adjustment:**

```
User drags slider for Purine Max
   ↓
Real-time preview of new value
   ↓
On release:
   - Update Firestore
   - Recalculate any affected daily status colors
   - Show subtle confirmation (checkmark appears briefly)
   
Note: No need to recalculate historical data,
      just affects future status color calculations
```

**3. Custom Item Creation - Meal:**

```
User taps "+ New Meal"
   ↓
Modal slides up:
┌─────────────────────────────────────┐
│ 🐉 Create Dragon's Favorite Meal    │
├─────────────────────────────────────┤
│ Meal Name:                          │
│ [Dragon's Breakfast Bowl]           │
│                                     │
│ ┌─ INGREDIENTS ────────────────────┐│
│ │                                  ││
│ │ Ingredient 1:                    ││
│ │ Name: [Oatmeal]                  ││
│ │ Qty: [50] [g ▼]                  ││
│ │                       [- Remove] ││
│ │                                  ││
│ │ Ingredient 2:                    ││
│ │ Name: [Banana]                   ││
│ │ Qty: [100] [g ▼]                 ││
│ │                       [- Remove] ││
│ │                                  ││
│ │ [+ Add Ingredient]               ││
│ └─────────────────────────────────┘│
│                                     │
│ How to get nutrition data:          │
│ ● Let AI analyze (uses tokens)      │
│ ○ Enter manually (you know values)  │
│                                     │
│ [Cancel]  [Create & Stash 📚]       │
└─────────────────────────────────────┘

If "Let AI analyze":
   ↓
Call Cloud Function:
   - For each ingredient:
     * Check ingredientLibrary
     * If not cached, call Gemini
     * Calculate nutrients_per_unit
   - Sum totals
   - Store in customItems
   ↓
Success animation: Dragon hoards the meal
Toast: "Meal added to hoard! Quick-log it anytime."

If "Enter manually":
   ↓
Show form with all 8 nutrient fields
User enters known values
   ↓
Store directly (zero AI cost)
```

**4. Custom Item Creation - Container:**

```
User taps "+ New Container"
   ↓
Simple modal:
┌─────────────────────────────────────┐
│ 🐉 Create Dragon's Drinking Vessel   │
├─────────────────────────────────────┤
│ Container Name:                     │
│ [Dragon Chalice]                    │
│                                     │
│ Capacity:                           │
│ [750] [ml ▼]                        │
│                                     │
│ [Cancel]  [Create 🍶]               │
└─────────────────────────────────────┘
   ↓
Store in customItems with type='container'
   ↓
Container immediately appears in:
   - Hydration quick-add buttons (Meal Diary)
   - Custom Items list (Settings)
```

**5. Edit Custom Item:**

```
User taps ✏️ on custom meal
   ↓
Reopen creation modal with pre-filled data
Allow modifications
   ↓
On save:
   - Update customItems document
   - If nutrients changed, update any future logs that reference it
   - Past meal logs are NOT affected (they store frozen nutrients)
```

**6. Delete Custom Item:**

```
User taps 🗑️
   ↓
Confirmation dialog:
┌─────────────────────────────────────┐
│ 🗑️ Remove from Hoard?                │
├─────────────────────────────────────┤
│ Delete "Dragon's Breakfast Bowl"?   │
│                                     │
│ Note: Past meal logs won't be       │
│ affected, but you can't quick-log   │
│ this meal anymore.                  │
│                                     │
│ [Cancel]  [Yes, Remove]             │
└─────────────────────────────────────┘
   ↓
If confirmed:
   - Delete from customItems
   - Remove from UI list with fade animation
   - Remove from autocomplete suggestions
```

**7. Theme Selection:**

**Preset Selection:**
```
User taps "Midnight Dragon" preset card
   ↓
Immediate visual transition (500ms):
   - All UI elements morph to new colors
   - Background darkens
   - Text lightens
   - Progress bars change to new palette
   - Ember's appearance subtly shifts hue
   ↓
Store in Firestore:
{
  theme: {
    preset: 'midnight',
    seed_color_hex: null,
  }
}
   ↓
Persist across all devices via sync
```

**Custom Color Picker:**
```
User taps "🎨 Pick Your Dragon's Hue"
   ↓
Color picker modal:
┌─────────────────────────────────────┐
│ 🎨 Dragon Scale Color                │
├─────────────────────────────────────┤
│                                     │
│      [Color wheel picker]           │
│                                     │
│ Or choose from swatches:            │
│ [🟢][🔵][🟣][🟡][🔴][🟠]            │
│                                     │
│ Selected: #4A90E2                   │
│                                     │
│ ┌─ LIVE PREVIEW ───────────────────┐│
│ │ Sample meal card:                ││
│ │ ┌───────────────────────────┐   ││
│ │ │ 🍳 Breakfast              │   ││
│ │ │ Dragon Eggs & Toast       │   ││
│ │ │ 🔥 350 cal | 45mg purines │   ││
│ │ │ [Sample Button]           │   ││
│ │ └───────────────────────────┘   ││
│ │                                  ││
│ │ Progress bar:                    ││
│ │ [████████░░░░]                   ││
│ └─────────────────────────────────┘│
│                                     │
│ [Cancel]  [Apply Theme 🎨]          │
└─────────────────────────────────────┘
   ↓
On Apply:
   - Run HSL generation algorithm
   - Apply palette app-wide
   - Store: { preset: 'custom', seed_color_hex: '#4A90E2' }
   - Smooth transition animation
```

**8. Badge System Display:**

**Badge Types & Unlock Conditions:**
```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: (user: User) => boolean;
}

const BADGES: Badge[] = [
  {
    id: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Log meals for 7 days straight',
    icon: '🔥',
    unlockCondition: (user) => user.stats.current_streak_days >= 7,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Log meals for 30 days straight',
    icon: '🏆',
    unlockCondition: (user) => user.stats.current_streak_days >= 30,
  },
  {
    id: 'hydration_hero',
    name: 'Hydra Slayer',
    description: 'Meet hydration goal 7 days in a row',
    icon: '💧',
    unlockCondition: async (user) => {
      const last7Days = await getHydrationFor7Days(user.id);
      return last7Days.every(day => 
        day.hydration >= user.thresholds.hydration_target
      );
    },
  },
  {
    id: 'purine_master',
    name: 'Purine Tamer',
    description: 'Stay under purine limit for 14 days',
    icon: '🧬',
    unlockCondition: async (user) => {
      const last14Days = await getPurinesFor14Days(user.id);
      return last14Days.every(day => 
        day.purines <= user.thresholds.purines_max
      );
    },
  },
  {
    id: 'hoarder',
    name: 'Dragon Hoarder',
    description: 'Save 5 meals to your stash',
    icon: '📚',
    unlockCondition: (user) => user.stats.meals_saved_to_stash >= 5,
  },
  {
    id: 'photographer',
    name: 'Food Chronicler',
    description: 'Log 10 meals with photos',
    icon: '📸',
    unlockCondition: async (user) => {
      const mealsWithPhotos = await countMealsWithImages(user.id);
      return mealsWithPhotos >= 10;
    },
  },
  {
    id: 'centurion',
    name: 'Centurion Feeder',
    description: 'Log 100 total meals',
    icon: '💯',
    unlockCondition: (user) => user.stats.total_meals_logged >= 100,
  },
];
```

**Badge Check Function (Called After Each Meal Log):**
```typescript
export const checkBadges = functions.firestore
  .document('users/{userId}/meals/{mealId}')
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const user = await db.collection('users').doc(userId).get();
    const userData = user.data();
    
    const newBadges: string[] = [];
    
    for (const badge of BADGES) {
      // Skip if already earned
      if (userData.badges.includes(badge.id)) continue;
      
      // Check condition
      if (await badge.unlockCondition(userData)) {
        newBadges.push(badge.id);
      }
    }
    
    if (newBadges.length > 0) {
      // Update user document
      await user.ref.update({
        badges: admin.firestore.FieldValue.arrayUnion(...newBadges),
      });
      
      // Trigger client notification
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .add({
          type: 'badge_earned',
          badge_ids: newBadges,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
  });
```

**Badge Unlock Celebration:**
```
Cloud Function triggers notification
   ↓
Client receives real-time update
   ↓
Current screen pauses
Full-screen overlay appears:
┌─────────────────────────────────────┐
│                                     │
│                                     │
│     [Ember flying in celebration]   │
│                                     │
│        ✨ ACHIEVEMENT! ✨           │
│                                     │
│          [Badge Icon 🔥]            │
│                                     │
│        Weekly Warrior               │
│                                     │
│   You logged meals for 7 days!     │
│                                     │
│    [Confetti animation]             │
│                                     │
│         [Awesome! 🎉]               │
│                                     │
└─────────────────────────────────────┘
   ↓
Tap anywhere to dismiss
Badge permanently appears in Trophy Room
```

**9. Statistics Display:**

```typescript
function updateStatistics(userId: string): void {
  // Triggered periodically or on app load
  
  const meals = await getAllMeals(userId);
  
  const stats = {
    total_meals_logged: meals.length,
    current_streak_days: calculateCurrentStreak(meals),
    longest_streak_days: calculateLongestStreak(meals),
    meals_saved_to_stash: await countCustomMeals(userId),
    days_tracking: calculateDaysTracking(meals),
  };
  
  await db.collection('users').doc(userId).update({ stats });
}

function calculateCurrentStreak(meals: Meal[]): number {
  const today = formatDate(new Date());
  let streak = 0;
  let checkDate = new Date();
  
  while (true) {
    const dateStr = formatDate(checkDate);
    const hasMeal = meals.some(m => m.date === dateStr);
    
    if (!hasMeal) break;
    
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return streak;
}
```

**10. Export Data:**

```
User taps "Export Dragon's Data 📤"
   ↓
Modal with options:
┌─────────────────────────────────────┐
│ 📤 Export Dragon's History           │
├─────────────────────────────────────┤
│ Choose format:                      │
│ ● Complete JSON (all data)          │
│ ○ CSV (meal log only)               │
│ ○ PDF Report (visual summary)       │
│                                     │
│ Date range:                         │
│ [All Time ▼]                        │
│                                     │
│ [Cancel]  [Export 📧]               │
└─────────────────────────────────────┘
   ↓
Cloud Function generates file
   ↓
Download link or share sheet appears
```

**11. Delete Account:**

```
User taps "Delete Account ⚠️"
   ↓
SERIOUS warning dialog:
┌─────────────────────────────────────┐
│ ⚠️ DELETE DRAGON'S HISTORY?          │
├─────────────────────────────────────┤
│ This will permanently delete:       │
│ • All meal logs                     │
│ • All custom items                  │
│ • All images                        │
│ • Your profile & settings           │
│ • All achievements                  │
│                                     │
│ This CANNOT be undone.              │
│                                     │
│ Type "DELETE" to confirm:           │
│ [________________]                  │
│                                     │
│ [Cancel]  [Delete Forever 🗑️]       │
└─────────────────────────────────────┘
   ↓
If confirmed:
   - Delete all user data from Firestore
   - Delete all images from Storage
   - Delete Auth account
   - Sign out
   - Navigate to landing/login screen
```

---

## 7. 🎮 GAMIFICATION SYSTEM (Badge Implementation)

### Badge Service (Cloud Functions)

```typescript
// Scheduled function to check badges daily
export const dailyBadgeCheck = functions.pubsub
  .schedule('0 2 * * *') // 2 AM daily
  .onRun(async (context) => {
    const users = await db.collection('users').get();
    
    for (const userDoc of users.docs) {
      await checkAllBadges(userDoc.id);
    }
  });

async function checkAllBadges(userId: string): Promise<void> {
  const user = await db.collection('users').doc(userId).get();
  const userData = user.data();
  
  const earnedBadges = userData.badges || [];
  const newBadges: string[] = [];
  
  for (const badge of BADGES) {
    if (earnedBadges.includes(badge.id)) continue;
    
    const earned = await badge.unlockCondition(userData);
    if (earned) {
      newBadges.push(badge.id);
    }
  }
  
  if (newBadges.length > 0) {
    await user.ref.update({
      badges: admin.firestore.FieldValue.arrayUnion(...newBadges),
    });
    
    // Create notification
    await db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .add({
        type: 'badges_earned',
        badge_ids: newBadges,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
  }
}
```

### Client-Side Badge Monitoring

```dart
class BadgeService {
  final FirebaseFirestore _db;
  final String userId;
  
  Stream<List<BadgeNotification>> watchForNewBadges() {
    return _db
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .where('type', isEqualTo: 'badges_earned')
        .where('read', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) {
            return BadgeNotification.fromFirestore(doc);
          }).toList();
        });
  }
  
  Future<void> showBadgeCelebration(List<String> badgeIds) async {
    for (final badgeId in badgeIds) {
      final badge = BADGES.firstWhere((b) => b.id == badgeId);
      
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => BadgeCelebrationDialog(
          badge: badge,
        ),
      );
      
      // Mark as read
      await markBadgeNotificationRead(badgeId);
    }
  }
}
```

---

## 8. 🔧 FIREBASE CLOUD FUNCTIONS (Complete Implementations)

### Function 1: analyzeAndLogMeal

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import vision from '@google-cloud/vision';

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

const genAI = new GoogleGenerativeAI(functions.config().gemini.key);
const visionClient = new vision.ImageAnnotatorClient();

export const analyzeAndLogMeal = functions.https.onCall(
  async (data, context) => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }
    
    const userId = context.auth.uid;
    const { date, mealType, textInput, imageUrls } = data;
    
    let ingredients: Ingredient[] = [];
    let mealName = '';
    
    try {
      // Step 1: Parse input based on type
      if (imageUrls && imageUrls.length > 0) {
        // Image analysis
        const analysisResult = await analyzeImages(imageUrls);
        ingredients = analysisResult.ingredients;
        mealName = analysisResult.mealName;
      } else if (textInput) {
        // Text parsing
        const parsedMeal = await parseTextMeal(textInput);
        ingredients = parsedMeal.ingredients;
        mealName = parsedMeal.mealName;
      } else {
        throw new Error('No input provided');
      }
      
      // Step 2: Process each ingredient through consistency engine
      const processedIngredients = await Promise.all(
        ingredients.map(ing => processIngredient(ing))
      );
      
      // Step 3: Calculate totals
      const totalNutrients = calculateTotalNutrients(processedIngredients);
      
      // Step 4: Store meal
      const mealRef = db
        .collection('users')
        .doc(userId)
        .collection('meals')
        .doc();
      
      const mealData = {
        date,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        meal_type: mealType,
        meal_name: mealName,
        ingredients: processedIngredients,
        total_nutrients: totalNutrients,
        image_urls: imageUrls || [],
        hydration_ml: 0,
        analysis_method: imageUrls ? 'image' : 'text',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      await mealRef.set(mealData);
      
      // Step 5: Update user stats
      await db.collection('users').doc(userId).update({
        'stats.total_meals_logged': admin.firestore.FieldValue.increment(1),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return {
        meal_id: mealRef.id,
        ...mealData,
      };
      
    } catch (error) {
      console.error('Error analyzing meal:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to analyze meal',
        error
      );
    }
  }
);

async function analyzeImages(imageUrls: string[]): Promise<ParsedMeal> {
  // Download first image
  const imageUrl = imageUrls[0];
  const [imageBuffer] = await storage
    .bucket()
    .file(imageUrl)
    .download();
  
  // Detect if nutrition label
  const [detection] = await visionClient.labelDetection({
    image: { content: imageBuffer },
  });
  
  const labels = detection.labelAnnotations || [];
  const isLabel = labels.some(label =>
    /nutrition|facts|label/i.test(label.description || '')
  );
  
  if (isLabel) {
    // Extract text with Vision OCR
    const [textDetection] = await visionClient.textDetection({
      image: { content: imageBuffer },
    });
    
    const text = textDetection.fullTextAnnotation?.text || '';
    const parsed = parseNutritionLabel(text);
    
    if (parsed.confidence > 0.7) {
      return {
        mealName: 'Packaged Food',
        ingredients: parsed.ingredients,
      };
    }
  }
  
  // Use Gemini Vision
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  const prompt = `Analyze this food image and identify all visible food items with estimated weights.

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

Provide gram estimates based on typical portion sizes.`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: 'image/jpeg',
    },
  };
  
  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();
  
  // Strip markdown if present
  const jsonText = text.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(jsonText);
  
  return {
    mealName: parsed.meal_name,
    ingredients: parsed.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
    })),
  };
}

async function parseTextMeal(textInput: string): Promise<ParsedMeal> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  const prompt = `Parse this meal description into structured ingredient data:

"${textInput}"

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
- If ambiguous, choose the most common interpretation`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  const jsonText = text.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(jsonText);
  
  return {
    mealName: parsed.meal_name,
    ingredients: parsed.ingredients,
  };
}

async function processIngredient(
  ingredient: RawIngredient
): Promise<ProcessedIngredient> {
  const normalizedName = normalizeIngredientName(ingredient.name);
  
  // Check cache
  const cachedRef = db.collection('ingredientLibrary').doc(normalizedName);
  const cached = await cachedRef.get();
  
  let nutrientsPer100g: NutrientData;
  
  if (cached.exists) {
    // CACHE HIT - Reuse existing data
    nutrientsPer100g = cached.data()!.nutrients_per_100g;
    
    // Update usage stats
    await cachedRef.update({
      use_count: admin.firestore.FieldValue.increment(1),
      last_used: admin.firestore.FieldValue.serverTimestamp(),
    });
    
  } else {
    // CACHE MISS - Call Gemini
    nutrientsPer100g = await fetchNutrientsFromAI(ingredient.name);
    
    // Store in cache
    await cachedRef.set({
      display_name: ingredient.name,
      nutrients_per_100g: nutrientsPer100g,
      use_count: 1,
      last_used: admin.firestore.FieldValue.serverTimestamp(),
      source: 'ai',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  
  // Calculate for this specific quantity
  const gramsAmount = convertToGrams(ingredient.quantity, ingredient.unit);
  const conversionFactor = gramsAmount / 100;
  
  const nutrientsPerUnit: NutrientData = {
    calories: nutrientsPer100g.calories * conversionFactor,
    purines: nutrientsPer100g.purines * conversionFactor,
    protein: nutrientsPer100g.protein * conversionFactor,
    carbs: nutrientsPer100g.carbs * conversionFactor,
    fat: nutrientsPer100g.fat * conversionFactor,
    fiber: nutrientsPer100g.fiber * conversionFactor,
    sodium: nutrientsPer100g.sodium * conversionFactor,
    sugar: nutrientsPer100g.sugar * conversionFactor,
  };
  
  return {
    name: ingredient.name,
    normalized_name: normalizedName,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    nutrients_per_unit: nutrientsPerUnit,
  };
}

async function fetchNutrientsFromAI(ingredientName: string): Promise<NutrientData> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  const prompt = `Estimate complete nutritional information per 100g for this ingredient:

"${ingredientName}"

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

Use USDA database values when available. If uncertain, provide conservative estimates.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  const jsonText = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(jsonText);
}

function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/s$/, '') // Remove plural
    .replace(/ies$/, 'y') // berries -> berry
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_'); // Spaces to underscores
}

function convertToGrams(quantity: number, unit: string): number {
  const conversions: { [key: string]: number } = {
    g: 1,
    kg: 1000,
    mg: 0.001,
    ml: 1, // Approximate for liquids
    l: 1000,
    oz: 28.35,
    lb: 453.59,
    cup: 240, // Approximate
    tbsp: 15,
    tsp: 5,
    slice: 30, // Approximate for bread
    piece: 50, // Generic estimate
  };
  
  return quantity * (conversions[unit.toLowerCase()] || 1);
}

function calculateTotalNutrients(ingredients: ProcessedIngredient[]): NutrientData {
  return ingredients.reduce(
    (totals, ing) => ({
      calories: totals.calories + ing.nutrients_per_unit.calories,
      purines: totals.purines + ing.nutrients_per_unit.purines,
      protein: totals.protein + ing.nutrients_per_unit.protein,
      carbs: totals.carbs + ing.nutrients_per_unit.carbs,
      fat: totals.fat + ing.nutrients_per_unit.fat,
      fiber: totals.fiber + ing.nutrients_per_unit.fiber,
      sodium: totals.sodium + ing.nutrients_per_unit.sodium,
      sugar: totals.sugar + ing.nutrients_per_unit.sugar,
    }),
    {
      calories: 0,
      purines: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      sugar: 0,
    }
  );
}

function parseNutritionLabel(text: string): ParsedLabel {
  const patterns = {
    calories: /calories:?\s*(\d+)/i,
    protein: /protein:?\s*(\d+\.?\d*)\s*g/i,
    carbs: /total carbohydrate:?\s*(\d+\.?\d*)\s*g/i,
    fat: /total fat:?\s*(\d+\.?\d*)\s*g/i,
    fiber: /dietary fiber:?\s*(\d+\.?\d*)\s*g/i,
    sodium: /sodium:?\s*(\d+)\s*mg/i,
    sugar: /sugars:?\s*(\d+\.?\d*)\s*g/i,
  };
  
  const values: any = {};
  let matchCount = 0;
  
  for (const [nutrient, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) {
      values[nutrient] = parseFloat(match[1]);
      matchCount++;
    }
  }
  
  // Estimate purines (not on labels, use conservative default)
  values.purines = 50; // Conservative middle estimate
  
  return {
    confidence: matchCount / Object.keys(patterns).length,
    ingredients: [
      {
        name: 'Packaged Food',
        quantity: 100,
        unit: 'g',
      },
    ],
  };
}
```

### Function 2: generateRecommendations

```typescript
export const generateRecommendations = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }
    
    const userId = context.auth.uid;
    const { dateContext, mealType } = data;
    
    try {
      // Step 1: Get user profile and thresholds
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data()!;
      
      // Step 2: Calculate remaining budget
      const budget = await calculateBudget(userId, dateContext);
      
      // Step 3: Analyze meal history
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const historicalMeals = await db
        .collection('users')
        .doc(userId)
        .collection('meals')
        .where('meal_type', '==', mealType)
        .where('date', '>=', formatDate(thirtyDaysAgo))
        .get();
      
      // Step 4: Extract patterns
      const ingredientFrequency = new Map<string, number>();
      const mealNames: string[] = [];
      
      historicalMeals.forEach(doc => {
        const meal = doc.data();
        mealNames.push(meal.meal_name);
        
        meal.ingredients.forEach((ing: any) => {
          const count = ingredientFrequency.get(ing.normalized_name) || 0;
          ingredientFrequency.set(ing.normalized_name, count + 1);
        });
      });
      
      const topIngredients = Array.from(ingredientFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name]) => name.replace(/_/g, ' '));
      
      // Step 5: Build Gemini prompt
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `Generate 3 ${mealType} meal recommendations for a dragon keeper.

User Profile:
- Dietary conditions: ${userData.profile.dietary_conditions.join(', ') || 'none'}
- Typical ${mealType} meals: ${mealNames.slice(0, 5).join(', ')}
- Favorite ingredients: ${topIngredients.join(', ')}

Remaining Budget (for this meal):
- Calories: ${Math.round(budget.remaining_calories)} kcal
- Purines: ${Math.round(budget.remaining_purines)} mg

Return ONLY valid JSON array with no markdown formatting:
[
  {
    "type": "familiar",
    "name": "meal name with dragon theme (e.g., Dragon's Grilled Feast)",
    "description": "2-3 sentences, whimsical tone with dragon puns, explain why the dragon will love it",
    "ingredients": [
      {"name": "ingredient", "quantity": number, "unit": "g"|"ml"|"cup"|etc}
    ],
    "estimated_nutrients": {
      "calories": number,
      "purines": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  },
  {
    "type": "twist",
    "name": "...",
    "description": "...",
    "ingredients": [...],
    "estimated_nutrients": {...}
  },
  {
    "type": "wild",
    "name": "...",
    "description": "...",
    "ingredients": [...],
    "estimated_nutrients": {...}
  }
]

Requirements:
- "familiar": Use user's top 3-5 ingredients, similar to their usual meals, safe comfort food
- "twist": Different cuisine/preparation but uses 1-2 familiar ingredients, healthy variation
- "wild": Creative, mostly different ingredients, unexpected flavors but still nutritious
- ALL recommendations MUST stay within the remaining budget (with 10% margin)
- Include fun dragon-themed names and descriptions with puns
- Ensure nutritional estimates are realistic and accurate`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonText = text.replace(/```json\n?|\n?```/g, '').trim();
      const recommendations = JSON.parse(jsonText);
      
      // Step 6: Validate recommendations
      recommendations.forEach((rec: any) => {
        if (rec.estimated_nutrients.calories > budget.remaining_calories * 1.1) {
          throw new Error(`Recommendation "${rec.name}" exceeds calorie budget`);
        }
        if (rec.estimated_nutrients.purines > budget.remaining_purines * 1.1) {
          throw new Error(`Recommendation "${rec.name}" exceeds purine budget`);
        }
      });
      
      return {
        recommendations,
        budget: {
          remaining_calories: Math.round(budget.remaining_calories),
          remaining_purines: Math.round(budget.remaining_purines),
        },
        context: dateContext,
      };
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate recommendations',
        error
      );
    }
  }
);

async function calculateBudget(
  userId: string,
  context: 'today' | 'last6days'
): Promise<Budget> {
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data()!;
  
  const today = formatDate(new Date());
  
  let meals;
  let daysInContext;
  
  if (context === 'today') {
    // Query only today's meals
    meals = await db
      .collection('users')
      .doc(userId)
      .collection('meals')
      .where('date', '==', today)
      .get();
    
    daysInContext = 1;
  } else {
    // Query last 6 days + today (7 total)
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    
    meals = await db
      .collection('users')
      .doc(userId)
      .collection('meals')
      .where('date', '>=', formatDate(sixDaysAgo))
      .where('date', '<=', today)
      .get();
    
    daysInContext = 7;
  }
  
  // Sum consumed nutrients
  let consumedCalories = 0;
  let consumedPurines = 0;
  
  meals.forEach(doc => {
    const meal = doc.data();
    consumedCalories += meal.total_nutrients.calories || 0;
    consumedPurines += meal.total_nutrients.purines || 0;
  });
  
  // Calculate remaining budget
  const totalCalorieBudget = userData.thresholds.calories_max * daysInContext;
  const totalPurineBudget = userData.thresholds.purines_max * daysInContext;
  
  const remainingCalories = totalCalorieBudget - consumedCalories;
  const remainingPurines = totalPurineBudget - consumedPurines;
  
  // For multi-day context, divide by days to get per-meal budget
  const perMealCalories = remainingCalories / daysInContext;
  const perMealPurines = remainingPurines / daysInContext;
  
  return {
    remaining_calories: Math.max(0, perMealCalories),
    remaining_purines: Math.max(0, perMealPurines),
    context_days: daysInContext,
  };
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}
```

### Function 3: Scheduled Cache Cleanup

```typescript
export const pruneIngredientCache = functions.pubsub
  .schedule('0 3 * * 0') // 3 AM every Sunday
  .onRun(async (context) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const oldIngredients = await db
      .collection('ingredientLibrary')
      .where('use_count', '<', 2)
      .where('last_used', '<', admin.firestore.Timestamp.fromDate(ninetyDaysAgo))
      .get();
    
    const batch = db.batch();
    let deleteCount = 0;
    
    oldIngredients.forEach(doc => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    
    await batch.commit();
    
    console.log(`Pruned ${deleteCount} rarely-used ingredients from cache`);
    return null;
  });
```

---

## 9. 🎨 FLUTTER UI IMPLEMENTATION NOTES

### Theme Provider Setup

```dart
class DragonTheme {
  final String preset;
  final String? seedColorHex;
  
  late final Color primary;
  late final Color background;
  late final Color surface;
  late final Color surfaceVariant;
  late final Color secondary;
  late final Color text;
  late final Color textSecondary;
  late final Color success;
  late final Color warning;
  late final Color danger;
  
  DragonTheme({
    required this.preset,
    this.seedColorHex,
  }) {
    if (preset == 'custom' && seedColorHex != null) {
      _generateFromSeed(seedColorHex!);
    } else {
      _applyPreset(preset);
    }
  }
  
  void _generateFromSeed(String hex) {
    final hsl = _hexToHSL(hex);
    
    primary = _hexToColor(hex);
    background = _hslToColor(hsl.h, hsl.s * 0.3, 95);
    surface = _hslToColor(hsl.h, hsl.s * 0.1, 98);
    surfaceVariant = _hslToColor(hsl.h, hsl.s * 0.2, 92);
    secondary = _hslToColor((hsl.h + 180) % 360, hsl.s, hsl.l);
    text = _hslToColor(hsl.h, hsl.s * 0.5, 15);
    textSecondary = _hslToColor(hsl.h, hsl.s * 0.3, 40);
    
    // Semantic colors remain consistent
    success = Color(0xFF66BB6A);
    warning = Color(0xFFFFA726);
    danger = Color(0xFFEF5350);
  }
  
  void _applyPreset(String preset) {
    switch (preset) {
      case 'emerald':
        primary = Color(0xFF66BB6A);
        background = Color(0xFFF1F8F4);
        surface = Color(0xFFFFFFFF);
        surfaceVariant = Color(0xFFE8F5E9);
        secondary = Color(0xFF4ECDC4);
        text = Color(0xFF1B5E20);
        textSecondary = Color(0xFF4CAF50);
        success = Color(0xFF66BB6A);
        warning = Color(0xFFFFA726);
        danger = Color(0xFFEF5350);
        break;
      
      case 'midnight':
        primary = Color(0xFFBB86FC);
        background = Color(0xFF121212);
        surface = Color(0xFF1E1E1E);
        surfaceVariant = Color(0xFF2C2C2C);
        secondary = Color(0xFF03DAC6);
        text = Color(0xFFE1E1E1);
        textSecondary = Color(0xFFB0B0B0);
        success = Color(0xFF03DAC6);
        warning = Color(0xFFFFB300);
        danger = Color(0xFFCF6679);
        break;
      
      case 'crystal':
        primary = Color(0xFF0000FF);
        background = Color(0xFFFFFFFF);
        surface = Color(0xFFFFFFFF);
        surfaceVariant = Color(0xFFF5F5F5);
        secondary = Color(0xFFFFFF00);
        text = Color(0xFF000000);
        textSecondary = Color(0xFF424242);
        success = Color(0xFF00FF00);
        warning = Color(0xFFFFA500);
        danger = Color(0xFFFF0000);
        break;
    }
  }
}
```

### Animation Examples

```dart
// Bouncy button animation
class BouncyButton extends StatefulWidget {
  final Widget child;
  final VoidCallback onTap;
  
  @override
  _BouncyButtonState createState() => _BouncyButtonState();
}

class _BouncyButtonState extends State<BouncyButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 150),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) {
        _controller.reverse();
        widget.onTap();
      },
      onTapCancel: () => _controller.reverse(),
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: widget.child,
      ),
    );
  }
}

// Confetti celebration
void showConfetti(BuildContext context) {
  ConfettiController confettiController = ConfettiController(
    duration: Duration(seconds: 3),
  );
  
  confettiController.play();
  
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => Stack(
      children: [
        // Your badge celebration dialog
        BadgeCelebrationDialog(),
        
        // Confetti overlay
        Align(
          alignment: Alignment.topCenter,
          child: ConfettiWidget(
            confettiController: confettiController,
            blastDirectionality: BlastDirectionality.explosive,
            particleDrag: 0.05,
            emissionFrequency: 0.05,
            numberOfParticles: 30,
            gravity: 0.2,
          ),
        ),
      ],
    ),
  );
}
```

---

## 10. 📋 FINAL IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Weeks 1-2)
- [ ] Firebase project setup (Auth, Firestore, Storage, Functions)
- [ ] Firestore security rules implementation
- [ ] Flutter project scaffolding
- [ ] Navigation system (bottom nav + routing)
- [ ] Theme system (3 presets + custom generator)
- [ ] Lottie animations for Ember (7 states)
- [ ] Basic authentication flow (email/password + Google)

### Phase 2: Core Meal Logging (Weeks 3-4)
- [ ] Meal Diary UI (calendar, meal types, input)
- [ ] Text input with speech-to-text
- [ ] Cloud Function: `analyzeAndLogMeal` (text parsing)
- [ ] Ingredient library cache system
- [ ] Normalization algorithm
- [ ] Daily totals calculation (client-side)
- [ ] Meal card display with correct ordering
- [ ] Edit meal (local recalculation)
- [ ] Delete meal

### Phase 3: Visual & Advanced Input (Week 5)
- [ ] Image upload to Firebase Storage
- [ ] Cloud Vision API integration (OCR)
- [ ] Gemini Vision integration (food photos)
- [ ] Image display in meal cards
- [ ] Save to Stash feature with modal
- [ ] Custom items autocomplete

### Phase 4: Hydration & Custom Items (Week 6)
- [ ] Hydration tracking UI ("Dragon's Water Cave")
- [ ] Quick-add buttons (+250ml, +500ml, +custom)
- [ ] Custom items management (meals & containers)
- [ ] Create custom meal (with AI estimate option)
- [ ] Create custom container
- [ ] Edit/delete custom items

### Phase 5: Charts & History (Week 7)
- [ ] Chart Gallery UI
- [ ] Date range selection (week/month/custom)
- [ ] Grouping logic (daily/weekly/monthly)
- [ ] fl_chart implementation with multiple lines
- [ ] Nutrient filter chips
- [ ] Threshold lines on charts
- [ ] Interactive tooltips
- [ ] Export functionality

### Phase 6: Recommendations (Week 8)
- [ ] "What to Devour?" UI
- [ ] Budget calculation logic
- [ ] Pattern analysis (ingredient frequency)
- [ ] Cloud Function: `generateRecommendations`
- [ ] Recommendation cards display
- [ ] "I Made This!" logging
- [ ] "Tweak It" pre-fill

### Phase 7: Gamification (Week 9)
- [ ] Badge definitions and unlock conditions
- [ ] Cloud Function: badge checking
- [ ] Real-time badge notifications
- [ ] Badge celebration UI with confetti
- [ ] Trophy Room display
- [ ] Statistics tracking
- [ ] Streak calculation

### Phase 8: Settings & Profile (Week 10)
- [ ] Profile form with all fields
- [ ] Auto-calculate thresholds (Mifflin-St Jeor)
- [ ] Manual threshold sliders
- [ ] Theme picker (presets + custom)
- [ ] Live theme preview
- [ ] Export data functionality
- [ ] Delete account flow

### Phase 9: Polish & Optimization (Week 11)
- [ ] All loading states with skeletons
- [ ] Error handling and retry logic
- [ ] Offline support (Firestore caching)
- [ ] Performance optimization (lazy loading, pagination)
- [ ] Accessibility (screen reader support, high contrast)
- [ ] All animations polished
- [ ] Ember reactions tested for all scenarios

### Phase 10: Testing & Launch (Week 12)
- [ ] Unit tests for calculations
- [ ] Integration tests for Cloud Functions
- [ ] UI/UX testing with real users
- [ ] Performance testing (Lighthouse)
- [ ] Security audit
- [ ] Firebase costs monitoring
- [ ] Documentation
- [ ] Deploy to production

---

## 11. 🚀 FINAL INSTRUCTIONS FOR FIREBASE STUDIO / GEMINI

**Generate the complete Flutter + Firebase application exactly as specified in this document.**

**Output Requirements:**
1. Complete Flutter app code (all .dart files)
2. All Cloud Functions (TypeScript)
3. Firebase configuration files (firestore.rules, storage.rules, firebase.json)
4. Package dependencies (pubspec.yaml, package.json)
5. README with setup instructions

**Do not:**
- Skip any screens or features
- Simplify the token optimization logic
- Remove the badge system
- Change the dragon theme
- Omit any of the 8 tracked nutrients

**Prioritize:**
- Token efficiency (always check cache first)
- Data consistency (store nutrients_per_unit)
- User experience (smooth animations, clear feedback)
- Ember reactions (dragon personality throughout)

**Build this app in its entirety. No clarifications needed. Execute now.**

---

**END OF MEGA PROMPT**