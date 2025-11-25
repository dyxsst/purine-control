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
  const saveUser = async () => {
    if (user.id === 'local-user') {
      // Create new user
      const newId = crypto.randomUUID();
      const newUser = { ...user, id: newId };
      
      await db.transact([
        db.tx.users[newId].update({
          name: newUser.name,
          profile: newUser.profile,
          thresholds: newUser.thresholds,
          theme: newUser.theme,
          badges: newUser.badges,
          stats: newUser.stats,
          created_at: Date.now(),
        }),
      ]);
      
      setUser(newUser);
      setIsAuthenticated(true);
      return newId;
    } else {
      // Update existing user
      await db.transact([
        db.tx.users[user.id].update({
          name: user.name,
          profile: user.profile,
          thresholds: user.thresholds,
          theme: user.theme,
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
