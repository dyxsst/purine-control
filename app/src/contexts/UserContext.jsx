import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/instantdb';
import { DEFAULT_THRESHOLDS } from '../lib/nutrition';
import { THEME_PRESETS, generateThemeFromSeed, applyTheme } from '../lib/theme';

const UserContext = createContext(null);

// Default user data for anonymous/new users
const DEFAULT_USER = {
  id: 'local-user', // Will be replaced with real ID after auth
  name: 'Dragon Keeper',
  profile: {
    sex: 'male',
    age: 30,
    weight_kg: 75,
    height_cm: 175,
    activity_level: 'moderate',
    dietary_conditions: [],
  },
  thresholds: DEFAULT_THRESHOLDS,
  theme: {
    preset: 'emerald',
    seed_color_hex: '#66BB6A',
  },
  badges: [],
  stats: {
    total_meals_logged: 0,
    current_streak_days: 0,
    longest_streak_days: 0,
    meals_saved_to_stash: 0,
  },
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Query user data from InstantDB
  const { isLoading: dbLoading, error, data } = db.useQuery({
    users: {},
  });

  // Initialize user on mount
  useEffect(() => {
    if (dbLoading) return;

    if (data?.users && data.users.length > 0) {
      // Use first user (single-user app for now)
      const dbUser = data.users[0];
      setUser({
        ...DEFAULT_USER,
        ...dbUser,
        profile: { ...DEFAULT_USER.profile, ...dbUser.profile },
        thresholds: { ...DEFAULT_USER.thresholds, ...dbUser.thresholds },
        theme: { ...DEFAULT_USER.theme, ...dbUser.theme },
      });
      setIsAuthenticated(true);
      
      // Apply saved theme
      if (dbUser.theme?.preset) {
        const preset = THEME_PRESETS[dbUser.theme.preset];
        if (preset) {
          const theme = generateThemeFromSeed(preset.seedColor, preset.isDark);
          applyTheme(theme);
        } else if (dbUser.theme.seed_color_hex) {
          const theme = generateThemeFromSeed(dbUser.theme.seed_color_hex, false);
          applyTheme(theme);
        }
      }
      
      // Migrate orphaned data from 'local-user' to the real user
      migrateOrphanedData(dbUser.id);
    } else {
      // No user in DB, use local defaults
      setUser(DEFAULT_USER);
      setIsAuthenticated(false);
      
      // Apply default theme
      const preset = THEME_PRESETS.emerald;
      const theme = generateThemeFromSeed(preset.seedColor, preset.isDark);
      applyTheme(theme);
    }
    
    setIsLoading(false);
  }, [dbLoading, data]);

  // Migrate any data still assigned to 'local-user' to the real user ID
  const migrateOrphanedData = async (realUserId) => {
    if (!realUserId || realUserId === 'local-user') return;
    
    try {
      const orphanedData = await db.queryOnce({ 
        meals: { $: { where: { user_id: 'local-user' } } },
        hydration: { $: { where: { user_id: 'local-user' } } },
        customItems: { $: { where: { user_id: 'local-user' } } },
        ingredientLibrary: { $: { where: { user_id: 'local-user' } } },
      });
      
      const transactions = [];
      
      if (orphanedData.data?.meals?.length > 0) {
        for (const meal of orphanedData.data.meals) {
          transactions.push(db.tx.meals[meal.id].update({ user_id: realUserId }));
        }
        console.log(`🐉 Migrating ${orphanedData.data.meals.length} orphaned meals`);
      }
      
      if (orphanedData.data?.hydration?.length > 0) {
        for (const record of orphanedData.data.hydration) {
          transactions.push(db.tx.hydration[record.id].update({ user_id: realUserId }));
        }
        console.log(`🐉 Migrating ${orphanedData.data.hydration.length} orphaned hydration records`);
      }
      
      if (orphanedData.data?.customItems?.length > 0) {
        for (const item of orphanedData.data.customItems) {
          transactions.push(db.tx.customItems[item.id].update({ user_id: realUserId }));
        }
        console.log(`🐉 Migrating ${orphanedData.data.customItems.length} orphaned stash items`);
      }
      
      if (orphanedData.data?.ingredientLibrary?.length > 0) {
        for (const item of orphanedData.data.ingredientLibrary) {
          transactions.push(db.tx.ingredientLibrary[item.id].update({ user_id: realUserId }));
        }
        console.log(`🐉 Migrating ${orphanedData.data.ingredientLibrary.length} orphaned cached ingredients`);
      }
      
      if (transactions.length > 0) {
        await db.transact(transactions);
        console.log(`🐉 Migration complete! Moved ${transactions.length} records to user ${realUserId}`);
      }
    } catch (err) {
      console.error('Migration failed:', err);
    }
  };

  // Update user profile
  const updateProfile = async (newProfile) => {
    const updatedUser = {
      ...user,
      profile: { ...user.profile, ...newProfile },
    };
    setUser(updatedUser);

    // Persist to InstantDB
    if (user.id && user.id !== 'local-user') {
      await db.transact([
        db.tx.users[user.id].update({ profile: updatedUser.profile }),
      ]);
    }
  };

  // Update thresholds
  const updateThresholds = async (newThresholds) => {
    const updatedUser = {
      ...user,
      thresholds: { ...user.thresholds, ...newThresholds },
    };
    setUser(updatedUser);

    if (user.id && user.id !== 'local-user') {
      await db.transact([
        db.tx.users[user.id].update({ thresholds: updatedUser.thresholds }),
      ]);
    }
  };

  // Update stats (meals logged, streaks, etc.)
  const updateStats = async (newStats) => {
    const updatedStats = { ...user.stats, ...newStats };
    const updatedUser = { ...user, stats: updatedStats };
    setUser(updatedUser);

    if (user.id && user.id !== 'local-user') {
      await db.transact([
        db.tx.users[user.id].update({ stats: updatedStats }),
      ]);
    }
  };

  // Increment a specific stat counter
  const incrementStat = async (statName, amount = 1) => {
    const currentValue = user.stats?.[statName] || 0;
    await updateStats({ [statName]: currentValue + amount });
  };

  // Update theme
  const updateTheme = async (preset, seedColor = null) => {
    const newTheme = {
      preset,
      seed_color_hex: seedColor || user.theme.seed_color_hex,
    };
    
    const updatedUser = { ...user, theme: newTheme };
    setUser(updatedUser);

    // Apply theme immediately
    if (preset === 'custom' && seedColor) {
      const theme = generateThemeFromSeed(seedColor, false);
      applyTheme(theme);
    } else {
      const themePreset = THEME_PRESETS[preset];
      if (themePreset) {
        const theme = generateThemeFromSeed(themePreset.seedColor, themePreset.isDark);
        applyTheme(theme);
      }
    }

    if (user.id && user.id !== 'local-user') {
      await db.transact([
        db.tx.users[user.id].update({ theme: newTheme }),
      ]);
    }
  };

  // Create or update user in database
  // Can pass explicit data to save (to avoid stale closure issues)
  const saveUser = async (dataToSave = null) => {
    const userData = dataToSave || user;
    
    if (user.id === 'local-user') {
      // Create new user with a real ID
      const newId = crypto.randomUUID();
      const newUser = { 
        ...userData, 
        id: newId,
      };
      
      // First, get all existing data with 'local-user' ID
      const existingData = await db.queryOnce({ 
        meals: { $: { where: { user_id: 'local-user' } } },
        hydration: { $: { where: { user_id: 'local-user' } } },
        customItems: { $: { where: { user_id: 'local-user' } } },
        ingredientLibrary: { $: { where: { user_id: 'local-user' } } },
      });
      
      // Build transaction: create user + migrate all existing data
      const transactions = [
        db.tx.users[newId].update({
          id: newId,
          name: newUser.name,
          profile: newUser.profile,
          thresholds: newUser.thresholds,
          theme: newUser.theme,
          badges: newUser.badges || [],
          stats: newUser.stats || {},
          created_at: Date.now(),
        }),
      ];
      
      // Migrate meals
      if (existingData.data?.meals) {
        for (const meal of existingData.data.meals) {
          transactions.push(db.tx.meals[meal.id].update({ user_id: newId }));
        }
        console.log(`Migrating ${existingData.data.meals.length} meals to user ${newId}`);
      }
      
      // Migrate hydration records
      if (existingData.data?.hydration) {
        for (const record of existingData.data.hydration) {
          transactions.push(db.tx.hydration[record.id].update({ user_id: newId }));
        }
        console.log(`Migrating ${existingData.data.hydration.length} hydration records to user ${newId}`);
      }
      
      // Migrate custom items (stash)
      if (existingData.data?.customItems) {
        for (const item of existingData.data.customItems) {
          transactions.push(db.tx.customItems[item.id].update({ user_id: newId }));
        }
        console.log(`Migrating ${existingData.data.customItems.length} stash items to user ${newId}`);
      }
      
      // Migrate ingredient library
      if (existingData.data?.ingredientLibrary) {
        for (const item of existingData.data.ingredientLibrary) {
          transactions.push(db.tx.ingredientLibrary[item.id].update({ user_id: newId }));
        }
        console.log(`Migrating ${existingData.data.ingredientLibrary.length} cached ingredients to user ${newId}`);
      }
      
      await db.transact(transactions);
      
      setUser(newUser);
      setIsAuthenticated(true);
      return newId;
    } else {
      // Update existing user
      await db.transact([
        db.tx.users[user.id].update({
          name: userData.name,
          profile: userData.profile,
          thresholds: userData.thresholds,
          theme: userData.theme,
          updated_at: Date.now(),
        }),
      ]);
      return user.id;
    }
  };

  const value = {
    user,
    isLoading: isLoading || dbLoading,
    isAuthenticated,
    error,
    updateProfile,
    updateThresholds,
    updateStats,
    incrementStat,
    updateTheme,
    saveUser,
    setUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
