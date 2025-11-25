// InstantDB Configuration
import { init } from '@instantdb/react';

// App ID from database.md
const APP_ID = 'fb13a3d0-35ab-493b-9aa6-64a77363fe93';

// Initialize InstantDB
export const db = init({ appId: APP_ID });

// Schema definition for reference (InstantDB is schemaless but we document structure)
export const schema = {
  users: {
    id: 'string',
    name: 'string',
    email: 'string',
    profile: {
      sex: 'male | female | other',
      age: 'number',
      weight_kg: 'number',
      height_cm: 'number',
      activity_level: 'sedentary | light | moderate | active | very_active',
      dietary_conditions: 'string[]',
    },
    thresholds: {
      calories_min: 'number',
      calories_max: 'number',
      purines_min: 'number',
      purines_max: 'number',
      protein_target: 'number',
      carbs_target: 'number',
      fat_target: 'number',
      fiber_target: 'number',
      sodium_max: 'number',
      sugar_max: 'number',
      hydration_target: 'number',
    },
    theme: {
      preset: 'emerald | midnight | crystal | custom',
      seed_color_hex: 'string',
    },
    badges: 'string[]',
    stats: {
      total_meals_logged: 'number',
      current_streak_days: 'number',
      longest_streak_days: 'number',
      meals_saved_to_stash: 'number',
    },
  },
  meals: {
    id: 'string',
    user_id: 'string',
    date: 'string', // YYYY-MM-DD
    timestamp: 'number',
    meal_type: 'breakfast | lunch | dinner | snack | hydration',
    meal_name: 'string',
    ingredients: 'array',
    total_nutrients: 'object',
    hydration_ml: 'number',
    image_urls: 'string[]',
    analysis_method: 'string',
  },
  customItems: {
    id: 'string',
    user_id: 'string',
    type: 'meal | container',
    name: 'string',
    ingredients: 'array',
    total_nutrients: 'object',
    capacity_ml: 'number',
  },
  ingredientLibrary: {
    normalized_name: 'string',
    display_name: 'string',
    nutrients_per_100g: 'object',
    use_count: 'number',
    last_used: 'number',
    source: 'ai | manual | usda',
  },
};
