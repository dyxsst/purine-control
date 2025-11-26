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
// PROMPT 1: Parse meal description into ingredients
// PDD Section 5.1
// ============================================
export async function parseMealDescription(userInput) {
  const client = getAI();
  
  const prompt = `Parse this meal description into structured ingredient data:

"${userInput}"

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
- purines: mg
- all others: grams (g) except sodium (mg)

Use USDA database values when available. If uncertain, provide conservative estimates.`;

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
// Helper: Process full meal (parse + get nutrition for each ingredient)
// Combines Prompt 1 + Prompt 2 with caching
// ============================================
export async function processFullMeal(userInput, ingredientCache = {}) {
  // Step 1: Parse the meal description
  const parsed = await parseMealDescription(userInput);
  
  // Step 2: Get nutrition for each ingredient (with cache check)
  const ingredientsWithNutrition = await Promise.all(
    parsed.ingredients.map(async (ingredient) => {
      const normalizedName = normalizeIngredientName(ingredient.name);
      
      // Check cache first
      let nutrientsPer100g;
      if (ingredientCache[normalizedName]) {
        nutrientsPer100g = ingredientCache[normalizedName];
      } else {
        // Cache miss - call AI
        nutrientsPer100g = await getNutritionForIngredient(ingredient.name);
      }
      
      // Calculate for specific quantity
      const gramsAmount = convertToGrams(ingredient.quantity, ingredient.unit);
      const conversionFactor = gramsAmount / 100;
      const nutrientsPerUnit = multiplyNutrients(nutrientsPer100g, conversionFactor);
      
      return {
        name: ingredient.name,
        normalized_name: normalizedName,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        nutrients_per_100g: nutrientsPer100g,
        nutrients_per_unit: nutrientsPerUnit,
      };
    })
  );
  
  // Step 3: Calculate total nutrients
  const totalNutrients = ingredientsWithNutrition.reduce((acc, ing) => {
    Object.keys(ing.nutrients_per_unit).forEach((key) => {
      acc[key] = (acc[key] || 0) + ing.nutrients_per_unit[key];
    });
    return acc;
  }, {});
  
  return {
    meal_name: parsed.meal_name,
    ingredients: ingredientsWithNutrition,
    total_nutrients: totalNutrients,
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

export function recalculateIngredient(storedIngredient, newQuantity) {
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

export function recalculateMealTotals(ingredients) {
  return ingredients.reduce((acc, ing) => {
    Object.keys(ing.nutrients_per_unit).forEach((key) => {
      acc[key] = (acc[key] || 0) + ing.nutrients_per_unit[key];
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
