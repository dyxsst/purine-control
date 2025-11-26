// Nutrition calculation utilities

/**
 * Default nutrition thresholds
 */
export const DEFAULT_THRESHOLDS = {
  calories_min: 1600,
  calories_max: 2000,
  purines_min: 0,
  purines_max: 400,
  protein_target: 50,
  carbs_target: 250,
  fat_target: 65,
  fiber_target: 25,
  sodium_max: 2300,
  sugar_max: 50,
  hydration_target: 2000,
};

/**
 * Nutrient definitions with icons and units
 */
export const NUTRIENTS = {
  calories: { icon: '🔥', unit: 'kcal', label: 'Calories' },
  purines: { icon: '🧬', unit: 'mg', label: 'Purines' },
  protein: { icon: '💪', unit: 'g', label: 'Protein' },
  carbs: { icon: '🍞', unit: 'g', label: 'Carbs' },
  fat: { icon: '🥑', unit: 'g', label: 'Fat' },
  fiber: { icon: '🌾', unit: 'g', label: 'Fiber' },
  sodium: { icon: '🧂', unit: 'mg', label: 'Sodium' },
  sugar: { icon: '🍯', unit: 'g', label: 'Sugar' },
  hydration: { icon: '💧', unit: 'ml', label: 'Water' },
};

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
export function calculateBMR(weight_kg, height_cm, age, sex) {
  const base = (10 * weight_kg) + (6.25 * height_cm) - (5 * age);
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Activity multipliers
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Calculate daily calorie needs
 */
export function calculateDailyCalories(weight_kg, height_cm, age, sex, activity_level) {
  const bmr = calculateBMR(weight_kg, height_cm, age, sex);
  const multiplier = ACTIVITY_MULTIPLIERS[activity_level] || 1.55;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate purine limit based on conditions
 */
export function calculatePurineLimit(dietary_conditions = []) {
  if (dietary_conditions.includes('kidney_disease')) return 150;
  if (dietary_conditions.includes('gout')) return 200;
  return 400;
}

/**
 * Calculate hydration target
 */
export function calculateHydrationTarget(weight_kg, activity_level) {
  const base = weight_kg * 30; // 30ml per kg
  const activityBonus = {
    sedentary: 0,
    light: 200,
    moderate: 400,
    active: 600,
    very_active: 800,
  };
  return Math.round(base + (activityBonus[activity_level] || 0));
}

/**
 * Auto-calculate all thresholds from profile
 */
export function calculateAllThresholds(profile) {
  const { weight_kg, height_cm, age, sex, activity_level, dietary_conditions = [] } = profile;
  
  const dailyCalories = calculateDailyCalories(weight_kg, height_cm, age, sex, activity_level);
  const purineMax = calculatePurineLimit(dietary_conditions);
  const hydrationTarget = calculateHydrationTarget(weight_kg, activity_level);
  
  // Protein: 0.8-1g per kg body weight, higher for active people
  const proteinMultiplier = {
    sedentary: 0.8,
    light: 0.9,
    moderate: 1.0,
    active: 1.2,
    very_active: 1.4,
  };
  const proteinTarget = Math.round(weight_kg * (proteinMultiplier[activity_level] || 1.0));
  
  // Carbs: 45-65% of calories (4 cal/g), lower for diabetes
  let carbPercent = 0.50;
  if (dietary_conditions.includes('diabetes')) {
    carbPercent = 0.40; // Lower carbs for diabetes
  }
  const carbsTarget = Math.round((dailyCalories * carbPercent) / 4);
  
  // Fat: 20-35% of calories (9 cal/g)
  const fatTarget = Math.round((dailyCalories * 0.275) / 9);
  
  // Fiber: 25g women, 38g men, adjusted by age
  let fiberTarget = sex === 'female' ? 25 : 38;
  if (age > 50) {
    fiberTarget = sex === 'female' ? 21 : 30;
  }
  
  // Sodium: 2300mg general, lower for kidney disease or hypertension risk
  let sodiumMax = 2300;
  if (dietary_conditions.includes('kidney_disease')) {
    sodiumMax = 1500;
  }
  
  // Sugar: 25g women, 36g men (AHA recommendations)
  // Lower for diabetes or gout
  let sugarMax = sex === 'female' ? 25 : 36;
  if (dietary_conditions.includes('diabetes') || dietary_conditions.includes('gout')) {
    sugarMax = Math.round(sugarMax * 0.6); // 40% reduction
  }
  
  return {
    calories_min: Math.round(dailyCalories * 0.85),
    calories_max: dailyCalories,
    purines_min: 0,
    purines_max: purineMax,
    protein_target: proteinTarget,
    carbs_target: carbsTarget,
    fat_target: fatTarget,
    fiber_target: fiberTarget,
    sodium_max: sodiumMax,
    sugar_max: sugarMax,
    hydration_target: hydrationTarget,
  };
}

/**
 * Sum nutrients from multiple meals
 */
export function sumNutrients(meals) {
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
  
  meals.forEach(meal => {
    if (meal.total_nutrients) {
      Object.keys(totals).forEach(key => {
        if (key !== 'hydration') {
          totals[key] += meal.total_nutrients[key] || 0;
        }
      });
    }
    totals.hydration += meal.hydration_ml || 0;
  });
  
  return totals;
}

/**
 * Multiply nutrients by a factor (for quantity changes)
 */
export function multiplyNutrients(nutrients, factor) {
  const result = {};
  Object.keys(nutrients).forEach(key => {
    result[key] = Math.round(nutrients[key] * factor * 10) / 10;
  });
  return result;
}

/**
 * Normalize ingredient name for consistency
 */
export function normalizeIngredientName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/s$/, '')           // Remove plural 's'
    .replace(/ies$/, 'y')        // berries -> berry
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_');       // Spaces to underscores
}

/**
 * Format date as YYYY-MM-DD (local timezone)
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date string (local timezone)
 */
export function getToday() {
  return formatDate(new Date());
}
