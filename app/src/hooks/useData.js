import { useMemo } from 'react';
import { db } from '../lib/instantdb';
import { useUser } from '../contexts/UserContext';

// Helper to get today's date in YYYY-MM-DD format (local timezone)
export const getToday = () => {
  const now = new Date();
  // Use local date components to avoid timezone issues
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Hook for meals data
export function useMeals(date = null) {
  const { user } = useUser();
  const userId = user?.id;
  
  // Query meals for the user, optionally filtered by date
  const query = date
    ? { meals: { $: { where: { user_id: userId, date } } } }
    : { meals: { $: { where: { user_id: userId } } } };
  
  const { isLoading, error, data } = db.useQuery(userId ? query : null);
  
  const meals = data?.meals || [];
  
  // Sort meals by meal_type order: breakfast → lunch → dinner → snack
  // Using useMemo to ensure consistent sorting
  const MEAL_ORDER = { breakfast: 1, lunch: 2, dinner: 3, snack: 4, hydration: 5 };
  const sortedMeals = useMemo(() => {
    return [...meals].sort((a, b) => {
      const orderA = MEAL_ORDER[a.meal_type] || 99;
      const orderB = MEAL_ORDER[b.meal_type] || 99;
      return orderA - orderB;
    });
  }, [meals]);

  // Add a new meal
  const addMeal = async (mealData) => {
    if (!userId) return null;
    
    const mealId = crypto.randomUUID();
    const meal = {
      id: mealId,
      user_id: userId,
      date: mealData.date || getToday(),
      timestamp: Date.now(),
      meal_type: mealData.meal_type || 'snack',
      meal_name: mealData.meal_name || 'Unnamed Meal',
      ingredients: mealData.ingredients || [],
      total_nutrients: mealData.total_nutrients || {},
      hydration_ml: mealData.hydration_ml || 0,
      image_urls: mealData.image_urls || [],
      analysis_method: mealData.analysis_method || 'manual',
    };
    
    await db.transact([
      db.tx.meals[mealId].update(meal),
    ]);
    
    return mealId;
  };

  // Update a meal
  const updateMeal = async (mealId, updates) => {
    await db.transact([
      db.tx.meals[mealId].update({
        ...updates,
        updated_at: Date.now(),
      }),
    ]);
  };

  // Delete a meal
  const deleteMeal = async (mealId) => {
    await db.transact([
      db.tx.meals[mealId].delete(),
    ]);
  };

  // Calculate daily totals
  const getDailyTotals = (targetDate = date || getToday()) => {
    const dayMeals = meals.filter(m => m.date === targetDate);
    
    const totals = dayMeals.reduce((acc, meal) => {
      if (meal.total_nutrients) {
        Object.keys(meal.total_nutrients).forEach(key => {
          acc[key] = (acc[key] || 0) + (meal.total_nutrients[key] || 0);
        });
      }
      acc.hydration = (acc.hydration || 0) + (meal.hydration_ml || 0);
      return acc;
    }, {});
    
    return totals;
  };

  return {
    meals: sortedMeals,
    isLoading,
    error,
    addMeal,
    updateMeal,
    deleteMeal,
    getDailyTotals,
  };
}

// Hook for hydration tracking
// Uses a single record per day instead of multiple entries
export function useHydration(date = getToday()) {
  const { user } = useUser();
  const userId = user?.id;
  
  // Query the single hydration record for this date
  const { isLoading, data } = db.useQuery(
    userId ? { 
      hydration: { 
        $: { where: { user_id: userId, date } } 
      } 
    } : null
  );
  
  const hydrationRecords = data?.hydration || [];
  const hydrationRecord = hydrationRecords[0]; // Should only be one per day
  const totalHydration = hydrationRecord?.amount_ml || 0;

  // Set hydration to a specific value
  const setHydration = async (amount_ml) => {
    if (!userId) return;
    
    if (hydrationRecord) {
      // Update existing record
      await db.transact([
        db.tx.hydration[hydrationRecord.id].update({
          amount_ml: Math.max(0, amount_ml),
          updated_at: Date.now(),
        }),
      ]);
    } else {
      // Create new record for this day
      const recordId = crypto.randomUUID();
      await db.transact([
        db.tx.hydration[recordId].update({
          id: recordId,
          user_id: userId,
          date,
          amount_ml: Math.max(0, amount_ml),
          created_at: Date.now(),
          updated_at: Date.now(),
        }),
      ]);
    }
  };

  // Adjust hydration by delta (can be negative)
  const adjustHydration = async (delta_ml) => {
    if (!userId) return;
    const newAmount = Math.max(0, totalHydration + delta_ml);
    await setHydration(newAmount);
  };

  return {
    totalHydration,
    isLoading,
    setHydration,
    adjustHydration,
  };
}

// Hook for stash items (saved meals, ingredients, bottles)
export function useStash() {
  const { user } = useUser();
  const userId = user?.id;
  
  const { isLoading, error, data } = db.useQuery(
    userId ? { customItems: { $: { where: { user_id: userId } } } } : null
  );
  
  const items = data?.customItems || [];
  
  const savedMeals = items.filter(i => i.type === 'meal');
  const customIngredients = items.filter(i => i.type === 'ingredient');
  const bottles = items.filter(i => i.type === 'container');

  // Add item to stash
  const addToStash = async (item) => {
    if (!userId) return null;
    
    const itemId = crypto.randomUUID();
    await db.transact([
      db.tx.customItems[itemId].update({
        id: itemId,
        user_id: userId,
        type: item.type,
        name: item.name,
        icon: item.icon || null,
        ingredients: item.ingredients || [],
        total_nutrients: item.total_nutrients || {},
        capacity_ml: item.capacity_ml || 0,
        use_count: item.use_count || 0,
        created_at: Date.now(),
      }),
    ]);
    
    return itemId;
  };

  // Remove from stash
  const removeFromStash = async (itemId) => {
    await db.transact([
      db.tx.customItems[itemId].delete(),
    ]);
  };

  // Update stash item
  const updateStashItem = async (itemId, updates) => {
    await db.transact([
      db.tx.customItems[itemId].update({
        ...updates,
        updated_at: Date.now(),
      }),
    ]);
  };

  return {
    savedMeals,
    customIngredients,
    bottles,
    items,
    isLoading,
    error,
    addToStash,
    removeFromStash,
    updateStashItem,
  };
}

// Hook for ingredient library (global cache)
export function useIngredientLibrary() {
  const { isLoading, data } = db.useQuery({ ingredientLibrary: {} });
  
  const ingredients = data?.ingredientLibrary || [];

  // Lookup ingredient by normalized name
  const lookupIngredient = (name) => {
    const normalized = normalizeIngredientName(name);
    return ingredients.find(i => i.normalized_name === normalized);
  };

  // Add ingredient to library
  const addIngredient = async (ingredient) => {
    const normalized = normalizeIngredientName(ingredient.name);
    
    await db.transact([
      db.tx.ingredientLibrary[normalized].update({
        normalized_name: normalized,
        display_name: ingredient.name,
        nutrients_per_100g: ingredient.nutrients_per_100g,
        use_count: 1,
        last_used: Date.now(),
        source: ingredient.source || 'manual',
      }),
    ]);
    
    return normalized;
  };

  // Increment use count
  const recordUsage = async (normalizedName) => {
    const existing = ingredients.find(i => i.normalized_name === normalizedName);
    if (existing) {
      await db.transact([
        db.tx.ingredientLibrary[normalizedName].update({
          use_count: (existing.use_count || 0) + 1,
          last_used: Date.now(),
        }),
      ]);
    }
  };

  return {
    ingredients,
    isLoading,
    lookupIngredient,
    addIngredient,
    recordUsage,
  };
}

// Helper function for ingredient name normalization
function normalizeIngredientName(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/s$/, '')           // Remove plural 's'
    .replace(/ies$/, 'y')        // berries -> berry
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_');       // Spaces to underscores
}
