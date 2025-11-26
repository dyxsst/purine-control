// Google Gemini AI Integration
// PDD Section 5.1: AI Prompts
// PDD Section 4.2: Ingredient Consistency Engine

import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key management
// In production, use environment variables or user-provided key
let apiKey = null;
let genAI = null;

export function setApiKey(key) {
  apiKey = key;
  genAI = new GoogleGenerativeAI(key);
  // Persist to localStorage for convenience (user can clear)
  localStorage.setItem('gemini_api_key', key);
}

export function getApiKey() {
  if (!apiKey) {
    apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey) {
      genAI = new GoogleGenerativeAI(apiKey);
    }
  }
  return apiKey;
}

export function hasApiKey() {
  return !!getApiKey();
}

export function clearApiKey() {
  apiKey = null;
  genAI = null;
  localStorage.removeItem('gemini_api_key');
}

// Get model instance
function getModel(modelName = 'gemini-1.5-flash') {
  if (!genAI) {
    const key = getApiKey();
    if (!key) throw new Error('Gemini API key not set');
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI.getGenerativeModel({ model: modelName });
}

// ============================================
// PROMPT 1: Parse meal description into ingredients
// PDD Section 5.1
// ============================================
export async function parseMealDescription(userInput) {
  const model = getModel('gemini-1.5-flash');
  
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
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean response - remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse meal:', error);
    throw new Error('Failed to parse meal description');
  }
}

// ============================================
// PROMPT 2: Get nutrition for a single ingredient
// PDD Section 5.1
// ============================================
export async function getNutritionForIngredient(ingredientName) {
  const model = getModel('gemini-1.5-flash');
  
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
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to get nutrition:', error);
    throw new Error('Failed to get nutrition data');
  }
}

// ============================================
// PROMPT 3: Analyze food photo
// PDD Section 5.1
// ============================================
export async function analyzeFoodPhoto(imageBase64, mimeType = 'image/jpeg') {
  const model = getModel('gemini-1.5-pro'); // Use pro for vision
  
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
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);
    
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to analyze image:', error);
    throw new Error('Failed to analyze food photo');
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
  const model = getModel('gemini-1.5-flash');
  
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
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    throw new Error('Failed to generate recommendations');
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
