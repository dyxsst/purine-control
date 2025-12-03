// Google Gen AI SDK Integration
// Using @google/genai v1.30.0 (new unified SDK)
// PDD Section 5.1: AI Prompts
// PDD Section 4.2: Ingredient Consistency Engine
//
// SECURITY NOTE: API key is stored in localStorage on the user's device.
// This is acceptable for a personal app where the user provides their own key.
// For production apps with shared keys, use server-side implementation.

import { GoogleGenAI } from '@google/genai';

// API Key management
// Stored in localStorage per-device
let ai = null;

export function setApiKey(key) {
  localStorage.setItem('gemini_api_key', key);
  ai = new GoogleGenAI({ apiKey: key });
}

export function getApiKey() {
  return localStorage.getItem('gemini_api_key');
}

export function hasApiKey() {
  return !!getApiKey();
}

export function clearApiKey() {
  ai = null;
  localStorage.removeItem('gemini_api_key');
}

// Initialize AI client from stored key
function getAI() {
  if (!ai) {
    const key = getApiKey();
    if (!key) throw new Error('Gemini API key not set. Add your key in Settings.');
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

// Clean JSON response - remove markdown code blocks if present
function cleanJsonResponse(text) {
  return text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
}

// ============================================
// MAIN PROMPT: Parse meal AND get all nutrition in ONE call
// Supports text + multiple images (food photos, nutrition labels)
// ============================================
export async function parseMealWithNutrition(userInput, images = []) {
  const client = getAI();
  
  const hasImages = images && images.length > 0;
  const hasText = userInput && userInput.trim().length > 0;
  
  let contextDescription = '';
  if (hasText && hasImages) {
    contextDescription = `The user provided a text description AND ${images.length} image(s). Use ALL information together - the text gives context, images show the actual food and/or nutrition labels.`;
  } else if (hasImages) {
    contextDescription = `The user provided ${images.length} image(s) of their meal. These may include food photos and/or nutrition labels.`;
  } else {
    contextDescription = `The user provided a text description of their meal.`;
  }
  
  const prompt = `Analyze this meal and provide complete nutritional breakdown.

${contextDescription}

${hasText ? `Text description: "${userInput}"` : ''}

Instructions:
- If you see a NUTRITION LABEL in any image, use those EXACT values for that product
- If you see FOOD in an image, identify items and estimate portions
- Combine information from text AND images to build the complete meal
- If text mentions something not visible in images, include it anyway
- IMPORTANT: Always return ingredient names in SPANISH (e.g., "Pechuga de pollo" not "Chicken breast")

Return ONLY valid JSON with no markdown formatting:
{
  "meal_name": "short descriptive name (max 50 chars)",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "g" | "ml" | "cup" | "tbsp" | "tsp" | "oz" | "slice" | "piece",
      "grams": number,
      "nutrients": {
        "calories": number,
        "purines": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sodium": number,
        "sugar": number
      }
    }
  ],
  "total_nutrients": {
    "calories": number,
    "purines": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sodium": number,
    "sugar": number
  }
}

Rules:
- Make reasonable portion estimates if not specified (e.g., "an egg" = 50g, "a glass of juice" = 250ml)
- "grams" is the converted weight in grams for the specified quantity
- "nutrients" are the values for THAT ingredient's quantity (not per 100g)
- "total_nutrients" is the sum of all ingredients
- Use USDA database for calories, protein, carbs, fat, fiber, sodium, sugar
- Use USDA and medical literature for purine values, these need to be as precise as possible
- All values: calories=kcal, purines/sodium=mg, all others=grams

Calculate purines by: (grams / 100) × purine_per_100g`;

  try {
    // Build contents array with text prompt + images
    const contents = [{ text: prompt }];
    
    // Add images if provided
    if (hasImages) {
      for (const img of images) {
        contents.push({
          inlineData: {
            data: img.base64,
            mimeType: img.mimeType || 'image/jpeg',
          },
        });
      }
    }
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });
    
    const text = response.text;
    return JSON.parse(cleanJsonResponse(text));
  } catch (error) {
    console.error('Failed to analyze meal:', error);
    throw new Error(`Failed to analyze meal: ${error.message}`);
  }
}

// ============================================
// LEGACY PROMPT 1: Parse meal description into ingredients
// Kept for cases where we only need parsing
// ============================================
export async function parseMealDescription(userInput) {
  const client = getAI();
  
  const prompt = `Parse this meal description into structured ingredient data:

"${userInput}"

IMPORTANT: Always return ingredient names in SPANISH (e.g., "Pechuga de pollo" not "Chicken breast").

Return ONLY valid JSON with no markdown formatting:
{
  "meal_name": "short descriptive name (max 50 chars)",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "g" | "ml" | "cup" | "tbsp" | "tsp" | "oz" | "slice" | "piece",
      "grams": number
    }
  ]
}

Rules:
- Make reasonable portion estimates if not specified
- "grams" is the TOTAL weight in grams for the specified quantity
- Use realistic weights when estimating portions
- If ambiguous, choose the most common interpretation`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    return JSON.parse(cleanJsonResponse(text));
  } catch (error) {
    console.error('Failed to parse meal:', error);
    throw new Error(`Failed to parse meal: ${error.message}`);
  }
}

// ============================================
// PROMPT 2: Get nutrition for a single ingredient
// PDD Section 5.1
// ============================================
export async function getNutritionForIngredient(ingredientName) {
  const client = getAI();
  
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
- purines: mg (CRITICAL - see reference below)
- all others: grams (g) except sodium (mg)

Use USDA database for calories, protein, carbs, fat, fiber, sodium, sugar.
Use USDA and medical literature for purine values. When conflicting purine data exists, average the result.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    return JSON.parse(cleanJsonResponse(text));
  } catch (error) {
    console.error('Failed to get nutrition:', error);
    throw new Error(`Failed to get nutrition data: ${error.message}`);
  }
}

// ============================================
// PROMPT 3: Analyze food photo
// PDD Section 5.1
// ============================================
export async function analyzeFoodPhoto(imageBase64, mimeType = 'image/jpeg') {
  const client = getAI();
  
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

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: prompt },
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          },
        },
      ],
    });
    
    const text = response.text;
    return JSON.parse(cleanJsonResponse(text));
  } catch (error) {
    console.error('Failed to analyze image:', error);
    throw new Error(`Failed to analyze food photo: ${error.message}`);
  }
}

// ============================================
// PROMPT 4: Generate meal recommendations
// PDD Section 5.1
// ============================================
export async function generateRecommendations({
  mealType,
  dietaryConditions = [],
  remainingCalories,
  remainingPurines,
  frequentIngredients = [],
  todaysMeals = [],
}) {
  const client = getAI();
  
  const prompt = `Generate 3 ${mealType} meal recommendations.

User Context:
- Dietary conditions: ${dietaryConditions.join(', ') || 'none'}
- Remaining daily budget: ${remainingCalories} kcal, ${remainingPurines} mg purines
- Frequently eaten ingredients: ${frequentIngredients.join(', ') || 'none specified'}
- Today's meals so far: ${todaysMeals.map(m => m.meal_name).join(', ') || 'none yet'}

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
- ALL must stay within remaining budget`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    return JSON.parse(cleanJsonResponse(text));
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
}

// ============================================
// Helper: Process full meal - SINGLE API CALL
// Supports text + images for multimodal analysis
// Can optionally populate cache with learned ingredients
// ============================================
export async function processFullMeal(userInput, images = [], cacheAdd = null) {
  // Single API call gets everything (text + images)
  const result = await parseMealWithNutrition(userInput, images);
  
  // Normalize ingredient data structure for storage
  // IMPORTANT: Calculate nutrients_per_100g for local recalculation (PDD 4.3)
  const ingredients = result.ingredients.map((ing) => {
    const grams = ing.grams || 100; // fallback if not provided
    
    // Calculate per-100g values from the per-quantity values
    // This enables local recalculation without AI calls
    const scaleFactor = 100 / grams;
    const nutrientsPer100g = multiplyNutrients(ing.nutrients, scaleFactor);
    
    // Store in cache if provided (for future lookups)
    if (cacheAdd) {
      cacheAdd({
        name: ing.name,
        nutrients_per_100g: nutrientsPer100g,
        source: 'ai',
      });
    }
    
    return {
      name: ing.name,
      normalized_name: normalizeIngredientName(ing.name),
      quantity: ing.quantity,
      unit: ing.unit,
      grams: grams,
      nutrients_per_100g: nutrientsPer100g,  // For local recalc
      nutrients: ing.nutrients,               // Total nutrients for this ingredient
    };
  });
  
  return {
    meal_name: result.meal_name,
    ingredients: ingredients,
    total_nutrients: result.total_nutrients,
  };
}

// ============================================
// CACHE-AWARE meal processing (PDD 4.2)
// Reduces AI calls by using cached ingredient data
// 
// cacheOps = { lookup: fn, add: fn, recordUsage: fn }
// - lookup(name): returns cached ingredient or null
// - add(ingredient): stores ingredient in cache
// - recordUsage(normalizedName): increments use count
// ============================================
export async function processFullMealWithCache(userInput, images = [], cacheOps = null) {
  // If no cache provided, fall back to regular processing
  if (!cacheOps) {
    return processFullMeal(userInput, images);
  }
  
  const { lookup, add, recordUsage } = cacheOps;
  
  // Step 1: Parse the meal to get ingredient list with quantities
  // This is a lighter call that just identifies ingredients
  const parsed = await parseMealDescription(userInput);
  
  // Step 2: For each ingredient, check cache or call AI
  const ingredientsWithNutrition = [];
  const aiCallsNeeded = [];
  const cachedIngredients = [];
  
  for (const ing of parsed.ingredients) {
    const normalizedName = normalizeIngredientName(ing.name);
    const cached = lookup ? lookup(normalizedName) : null;
    
    if (cached && cached.nutrients_per_100g) {
      // CACHE HIT - use stored nutrients (zero AI cost!)
      cachedIngredients.push({ ...ing, normalizedName, cached });
      if (recordUsage) {
        recordUsage(normalizedName); // Update use count
      }
    } else {
      // CACHE MISS - need to call AI
      aiCallsNeeded.push({ ...ing, normalizedName });
    }
  }
  
  // Step 3: Batch call AI for uncached ingredients (if any)
  if (aiCallsNeeded.length > 0) {
    // Call AI for each uncached ingredient
    for (const ing of aiCallsNeeded) {
      try {
        const nutrients = await getNutritionForIngredient(ing.name);
        
        // Use AI-provided grams (food-specific), fallback to conversion only if missing
        const grams = ing.grams || convertToGrams(ing.quantity, ing.unit);
        const scaleFactor = grams / 100;
        const nutrientsForQuantity = multiplyNutrients(nutrients, scaleFactor);
        
        ingredientsWithNutrition.push({
          name: ing.name,
          normalized_name: ing.normalizedName,
          quantity: ing.quantity,
          unit: ing.unit,
          grams: grams,
          nutrients_per_100g: nutrients,
          nutrients: nutrientsForQuantity,  // Total nutrients for this ingredient
        });
        
        // Store in cache for future use
        if (add) {
          await add({
            name: ing.name,
            nutrients_per_100g: nutrients,
            source: 'ai',
          });
        }
      } catch (error) {
        console.error(`Failed to get nutrition for ${ing.name}:`, error);
        // Add with zero nutrients rather than failing the whole meal
        ingredientsWithNutrition.push({
          name: ing.name,
          normalized_name: ing.normalizedName,
          quantity: ing.quantity,
          unit: ing.unit,
          grams: ing.grams || convertToGrams(ing.quantity, ing.unit),
          nutrients_per_100g: { calories: 0, purines: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 },
          nutrients: { calories: 0, purines: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 },
        });
      }
    }
  }
  
  // Step 4: Process cached ingredients (no AI needed)
  for (const item of cachedIngredients) {
    // Use AI-provided grams (food-specific), fallback to conversion only if missing
    const grams = item.grams || convertToGrams(item.quantity, item.unit);
    const scaleFactor = grams / 100;
    const nutrientsForQuantity = multiplyNutrients(item.cached.nutrients_per_100g, scaleFactor);
    
    ingredientsWithNutrition.push({
      name: item.name,
      normalized_name: item.normalizedName,
      quantity: item.quantity,
      unit: item.unit,
      grams: grams,
      nutrients_per_100g: item.cached.nutrients_per_100g,
      nutrients: nutrientsForQuantity,  // Total nutrients for this ingredient
    });
  }
  
  // Step 5: Calculate totals
  const total_nutrients = recalculateMealTotals(ingredientsWithNutrition);
  
  return {
    meal_name: parsed.meal_name,
    ingredients: ingredientsWithNutrition,
    total_nutrients: total_nutrients,
    cache_stats: {
      hits: cachedIngredients.length,
      misses: aiCallsNeeded.length,
    },
  };
}

// ============================================
// PDD Section 4.2: Ingredient Consistency Algorithm
// ============================================
export function normalizeIngredientName(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/s$/, '')           // Remove plural 's'
    .replace(/ies$/, 'y')        // berries -> berry
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_');       // Spaces to underscores
}

// ============================================
// PDD Section 4.2: Unit conversion to grams
// ============================================
const UNIT_TO_GRAMS = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  oz: 28.35,
  ounce: 28.35,
  ounces: 28.35,
  lb: 453.6,
  pound: 453.6,
  pounds: 453.6,
  cup: 240,      // Approximate, varies by ingredient
  cups: 240,
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
  ml: 1,         // Approximate (water density)
  slice: 30,     // Approximate
  slices: 30,
  piece: 50,     // Approximate
  pieces: 50,
};

export function convertToGrams(quantity, unit) {
  const normalizedUnit = unit.toLowerCase().trim();
  const multiplier = UNIT_TO_GRAMS[normalizedUnit] || 1;
  return quantity * multiplier;
}

// ============================================
// PDD Section 4.3: Local Recalculation (NO AI CALL)
// ============================================
export function multiplyNutrients(nutrients, factor) {
  const result = {};
  Object.keys(nutrients).forEach((key) => {
    result[key] = Math.round(nutrients[key] * factor * 10) / 10; // Round to 1 decimal
  });
  return result;
}

// Recalculate when only quantity changes (same unit)
// Uses ratio for efficiency
export function recalculateIngredient(storedIngredient, newQuantity) {
  // Handle case where quantity is 0 or undefined
  const oldQuantity = storedIngredient.quantity || 1;
  const ratio = newQuantity / oldQuantity;
  const newGrams = (storedIngredient.grams || 100) * ratio;
  
  // Support both old field name (nutrients_per_unit) and new (nutrients)
  const currentNutrients = storedIngredient.nutrients || storedIngredient.nutrients_per_unit || {};
  
  return {
    ...storedIngredient,
    quantity: newQuantity,
    grams: newGrams,
    nutrients: multiplyNutrients(currentNutrients, ratio),
  };
}

// Recalculate when quantity AND/OR unit changes
// Uses nutrients_per_100g as base for accurate calculation
export function recalculateIngredientFull(storedIngredient, newQuantity, newUnit) {
  const newGrams = convertToGrams(newQuantity, newUnit);
  const scaleFactor = newGrams / 100;
  
  return {
    ...storedIngredient,
    quantity: newQuantity,
    unit: newUnit,
    grams: newGrams,
    nutrients: multiplyNutrients(
      storedIngredient.nutrients_per_100g,
      scaleFactor
    ),
  };
}

export function recalculateMealTotals(ingredients) {
  return ingredients.reduce((acc, ing) => {
    // Support both old field name (nutrients_per_unit) and new (nutrients)
    const nutrients = ing.nutrients || ing.nutrients_per_unit || {};
    Object.keys(nutrients).forEach((key) => {
      acc[key] = (acc[key] || 0) + nutrients[key];
    });
    return acc;
  }, {});
}

// ============================================
// Test connection / validate API key
// ============================================
export async function testApiKey(key) {
  try {
    const testClient = new GoogleGenAI({ apiKey: key });
    const response = await testClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say "OK" if you can read this.',
    });
    return response.text.toLowerCase().includes('ok');
  } catch (error) {
    console.error('API key test failed:', error);
    return false;
  }
}
