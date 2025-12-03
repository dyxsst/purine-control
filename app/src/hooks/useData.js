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

// Meal type ordering: breakfast → lunch → dinner → snack → hydration
const MEAL_ORDER = { breakfast: 1, lunch: 2, dinner: 3, snack: 4, hydration: 5 };

// Hook for meals data
export function useMeals(date = null) {
  const { user } = useUser();
  const userId = user?.id;
  
  // Query ALL meals and filter client-side for reliability
  const { isLoading, error, data } = db.useQuery(userId ? { meals: {} } : null);
  
  const allMeals = data?.meals || [];
  
  // Filter by user_id and optionally by date
  const filteredMeals = allMeals.filter(m => {
    if (m.user_id !== userId) return false;
    if (date && m.date !== date) return false;
    return true;
  });
  
  // Sort meals by meal_type order using useMemo for stable reference
  const sortedMeals = useMemo(() => {
    return [...filteredMeals].sort((a, b) => {
      const orderA = MEAL_ORDER[a.meal_type] || 99;
      const orderB = MEAL_ORDER[b.meal_type] || 99;
      return orderA - orderB;
    });
  }, [filteredMeals]);

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
    const dayMeals = filteredMeals.filter(m => m.date === targetDate);
    
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

  // Get count of all meals for this user (for stats)
  const getMealCount = () => filteredMeals.length;

  // Get unique dates with meals (for streak calculation)
  const getUniqueDates = () => {
    const dates = new Set(filteredMeals.map(m => m.date));
    return Array.from(dates).sort();
  };

  return {
    meals: sortedMeals,
    isLoading,
    error,
    addMeal,
    updateMeal,
    deleteMeal,
    getDailyTotals,
    getMealCount,
    getUniqueDates,
  };
}

// Hook for ALL meals (not filtered by date) - used for stats
export function useAllMeals() {
  const { user } = useUser();
  const userId = user?.id;
  
  // Query ALL meals from DB (no filter initially to debug)
  const { isLoading, data } = db.useQuery({ meals: {} });
  
  // Then filter client-side by user_id
  const allMeals = data?.meals || [];
  const meals = allMeals.filter(m => m.user_id === userId);
  
  // Calculate current streak
  const calculateStreak = () => {
    if (meals.length === 0) return 0;
    
    // Get unique dates sorted descending
    const dates = [...new Set(meals.map(m => m.date))].sort().reverse();
    if (dates.length === 0) return 0;
    
    const today = getToday();
    const yesterday = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();
    
    // Streak must start from today or yesterday
    if (dates[0] !== today && dates[0] !== yesterday) {
      return 0;
    }
    
    // Count consecutive days
    let streak = 0;
    let expectedDate = new Date(dates[0] + 'T00:00:00');
    
    for (const dateStr of dates) {
      const date = new Date(dateStr + 'T00:00:00');
      const diffDays = Math.round((expectedDate - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  return {
    meals,
    isLoading,
    totalMeals: meals.length,
    calculateStreak,
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
