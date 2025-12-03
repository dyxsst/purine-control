import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useUser } from '../../contexts/UserContext';
import { useStash, useAllMeals, useIngredientLibrary } from '../../hooks/useData';
import { THEME_PRESETS, generateThemeFromSeed, applyTheme } from '../../lib/theme';
import { DEFAULT_THRESHOLDS, calculateAllThresholds } from '../../lib/nutrition';
import { hasApiKey, getApiKey, setApiKey, clearApiKey } from '../../lib/gemini';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const { user, isLoading, updateProfile, updateThresholds, updateTheme, saveUser } = useUser();
  const { savedMeals, bottles } = useStash();
  const { totalMeals, calculateStreak } = useAllMeals();  // Live stats from DB
  const { 
    ingredients,
    allMeals,
    updateIngredient, 
    deleteIngredient, 
    findMealsWithIngredient,
    propagateToMeals,
    getIngredientUsageCount,
    backfillFromMeals,
  } = useIngredientLibrary();
  
  // Local state for editing (synced from user context)
  const [profile, setProfile] = useState({
    name: 'Dragon Keeper',
    sex: 'male',
    age: 30,
    weight_kg: 75,
    height_cm: 175,
    activity_level: 'moderate',
    dietary_conditions: [],
  });
  
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [selectedTheme, setSelectedTheme] = useState('emerald');
  const [customColor, setCustomColor] = useState('#66BB6A');
  const [showThresholdEditor, setShowThresholdEditor] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // AI API key state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState(hasApiKey() ? 'saved' : 'none');
  
  // Ingredient Manager state
  const [showIngredientManager, setShowIngredientManager] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [propagateScope, setPropagateScope] = useState('none'); // 'none', 'week', 'month', 'all'
  const [isPropagating, setIsPropagating] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillDone, setBackfillDone] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSelection, setMergeSelection] = useState([]); // normalized_names to merge
  
  // Auto-backfill ingredient cache when opening manager with empty cache but existing meals
  useEffect(() => {
    const shouldBackfill = showIngredientManager && 
                          !backfillDone && 
                          !isBackfilling && 
                          ingredients.length === 0 && 
                          allMeals.length > 0;
    
    if (shouldBackfill) {
      setIsBackfilling(true);
      backfillFromMeals()
        .then(result => {
          console.log('🐉 Backfill complete:', result);
          setBackfillDone(true);
        })
        .catch(err => console.error('Backfill failed:', err))
        .finally(() => setIsBackfilling(false));
    }
  }, [showIngredientManager, backfillDone, isBackfilling, ingredients.length, allMeals.length, backfillFromMeals]);
  
  // Sync local state from user context
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || 'Dragon Keeper',
        ...user.profile,
      });
      setThresholds(user.thresholds || DEFAULT_THRESHOLDS);
      setSelectedTheme(user.theme?.preset || 'emerald');
      setCustomColor(user.theme?.seed_color_hex || '#66BB6A');
    }
  }, [user]);
  
  const handleCalculateNeeds = () => {
    const calculated = calculateAllThresholds(profile);
    setThresholds(calculated);
    setHasChanges(true);
  };
  
  const updateThreshold = (key, value) => {
    setThresholds(prev => ({ ...prev, [key]: Number(value) }));
    setHasChanges(true);
  };
  
  const handleProfileChange = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };
  
  const handleThemeChange = async (presetKey) => {
    setSelectedTheme(presetKey);
    const preset = THEME_PRESETS[presetKey];
    const theme = generateThemeFromSeed(preset.seedColor, preset.isDark);
    applyTheme(theme);
    await updateTheme(presetKey, preset.seedColor);
  };
  
  const handleCustomColor = async (color) => {
    setCustomColor(color);
    setSelectedTheme('custom');
    const theme = generateThemeFromSeed(color, false);
    applyTheme(theme);
    await updateTheme('custom', color);
  };
  
  // AI API Key handlers
  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) return;
    setApiKey(apiKeyInput.trim());
    setApiKeyStatus('saved');
    setApiKeyInput('');
    setShowApiKey(false);
    alert("AI API key saved! Your dragon can now analyze meals. 🤖🔥");
  };
  
  const handleClearApiKey = () => {
    if (confirm("Remove your AI API key? Your dragon won't be able to analyze meals.")) {
      clearApiKey();
      setApiKeyStatus('none');
      setApiKeyInput('');
    }
  };
  
  const handleSaveChanges = async () => {
    // Build the complete user data to save
    const userData = {
      ...user,
      name: profile.name,
      profile: {
        sex: profile.sex,
        age: profile.age,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        activity_level: profile.activity_level,
        dietary_conditions: profile.dietary_conditions,
      },
      thresholds: thresholds,
    };
    
    // Update local state in context
    await updateProfile(userData.profile);
    await updateThresholds(thresholds);
    
    // Save to database with explicit data (avoids stale closure)
    await saveUser(userData);
    
    setHasChanges(false);
    alert("Dragon's settings saved! 🐉✨");
  };
  
  // Ingredient Manager handlers
  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setEditValues({
      calories: ingredient.nutrients_per_100g?.calories || 0,
      purines: ingredient.nutrients_per_100g?.purines || 0,
      protein: ingredient.nutrients_per_100g?.protein || 0,
      carbs: ingredient.nutrients_per_100g?.carbs || 0,
      fat: ingredient.nutrients_per_100g?.fat || 0,
      fiber: ingredient.nutrients_per_100g?.fiber || 0,
      sodium: ingredient.nutrients_per_100g?.sodium || 0,
      sugar: ingredient.nutrients_per_100g?.sugar || 0,
    });
    setPropagateScope('none');
  };
  
  const handleSaveIngredient = async () => {
    if (!editingIngredient) return;
    
    const newNutrients = {
      calories: parseFloat(editValues.calories) || 0,
      purines: parseFloat(editValues.purines) || 0,
      protein: parseFloat(editValues.protein) || 0,
      carbs: parseFloat(editValues.carbs) || 0,
      fat: parseFloat(editValues.fat) || 0,
      fiber: parseFloat(editValues.fiber) || 0,
      sodium: parseFloat(editValues.sodium) || 0,
      sugar: parseFloat(editValues.sugar) || 0,
    };
    
    // Update the ingredient in the library
    await updateIngredient(editingIngredient.normalized_name, {
      nutrients_per_100g: newNutrients,
    });
    
    // Propagate to meals if requested
    if (propagateScope !== 'none') {
      setIsPropagating(true);
      const dateFilter = propagateScope === 'all' ? null : propagateScope;
      const result = await propagateToMeals(
        editingIngredient.normalized_name, 
        newNutrients, 
        dateFilter
      );
      setIsPropagating(false);
      alert(`Updated ${result.updated} meals with new values! 🐉`);
    } else {
      alert('Ingredient updated! Future meals will use the new values. 🐉');
    }
    
    setEditingIngredient(null);
  };
  
  const handleDeleteIngredient = async (ingredient) => {
    const usageCount = getIngredientUsageCount(ingredient.normalized_name);
    const message = usageCount > 0 
      ? `Delete "${ingredient.display_name}"? It's used in ${usageCount} meals. The AI will re-analyze it next time.`
      : `Delete "${ingredient.display_name}" from the cache?`;
    
    if (confirm(message)) {
      await deleteIngredient(ingredient.normalized_name);
    }
  };
  
  // Merge handlers
  const toggleMergeSelection = (normalizedName) => {
    setMergeSelection(prev => 
      prev.includes(normalizedName) 
        ? prev.filter(n => n !== normalizedName)
        : [...prev, normalizedName]
    );
  };
  
  const handleMergeIngredients = async () => {
    if (mergeSelection.length < 2) {
      alert('Select at least 2 ingredients to merge');
      return;
    }
    
    // Find the selected ingredients
    const selectedIngredients = ingredients.filter(i => 
      mergeSelection.includes(i.normalized_name)
    );
    
    // Use the first one as the target (user can rename after)
    const targetName = prompt(
      `Merge ${selectedIngredients.length} ingredients into one.\n\n` +
      `Enter the Spanish name for the merged ingredient:`,
      selectedIngredients[0].display_name
    );
    
    if (!targetName) return;
    
    // Average the nutritional values
    const avgNutrients = {};
    const nutrientKeys = ['calories', 'purines', 'protein', 'carbs', 'fat', 'fiber', 'sodium', 'sugar'];
    for (const key of nutrientKeys) {
      const sum = selectedIngredients.reduce((acc, ing) => 
        acc + (ing.nutrients_per_100g?.[key] || 0), 0
      );
      avgNutrients[key] = Math.round((sum / selectedIngredients.length) * 10) / 10;
    }
    
    // Update all meals that use any of the merged ingredients
    setIsPropagating(true);
    let totalUpdated = 0;
    
    for (const normalizedName of mergeSelection) {
      const result = await propagateToMeals(normalizedName, avgNutrients, null);
      totalUpdated += result.updated;
    }
    
    // Delete all selected ingredients (they'll be replaced by the merged one)
    for (const normalizedName of mergeSelection) {
      await deleteIngredient(normalizedName);
    }
    
    // Add the merged ingredient with the new name
    // We need to import the hook's addIngredient for this
    // For now, the next meal with this ingredient will re-cache it
    
    setIsPropagating(false);
    setMergeSelection([]);
    setMergeMode(false);
    
    alert(`Merged ${selectedIngredients.length} ingredients! Updated ${totalUpdated} meals.\n\nThe new ingredient "${targetName}" will be cached automatically when used next. 🐉`);
  };
  
  const cancelMerge = () => {
    setMergeMode(false);
    setMergeSelection([]);
  };
  
  // Filter ingredients by search
  const filteredIngredients = ingredients
    .filter(i => 
      !ingredientSearch || 
      i.display_name?.toLowerCase().includes(ingredientSearch.toLowerCase()) ||
      i.normalized_name?.toLowerCase().includes(ingredientSearch.toLowerCase())
    )
    .sort((a, b) => (b.use_count || 0) - (a.use_count || 0));
  
  if (isLoading) {
    return (
      <div className="page settings-page">
        <Header title="Dragon's Lair" subtitle="Loading..." />
        <div className="loading-state card">
          <div className="spinner"></div>
          <p>Opening the lair...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page settings-page">
      <Header 
        title="Dragon's Lair" 
        subtitle="Configure your dragon's needs"
      />
      
      {/* Profile Section */}
      <section className="settings-section card">
        <h2 className="section-title">🧑 Keeper's Profile</h2>
        
        <div className="form-group">
          <label>Name</label>
          <input 
            type="text" 
            value={profile.name}
            onChange={(e) => handleProfileChange({ name: e.target.value })}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Sex</label>
            <select 
              value={profile.sex}
              onChange={(e) => handleProfileChange({ sex: e.target.value })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Age</label>
            <input 
              type="number" 
              value={profile.age}
              onChange={(e) => handleProfileChange({ age: parseInt(e.target.value) })}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Weight (kg)</label>
            <input 
              type="number" 
              value={profile.weight_kg}
              onChange={(e) => handleProfileChange({ weight_kg: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="form-group">
            <label>Height (cm)</label>
            <input 
              type="number" 
              value={profile.height_cm}
              onChange={(e) => handleProfileChange({ height_cm: parseInt(e.target.value) })}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Activity Level</label>
          <select 
            value={profile.activity_level}
            onChange={(e) => handleProfileChange({ activity_level: e.target.value })}
          >
            <option value="sedentary">Sedentary (little exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="very_active">Very Active (intense daily)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Dietary Conditions</label>
          <div className="checkbox-group">
            {['gout', 'diabetes', 'kidney_disease', 'vegetarian', 'vegan'].map(condition => (
              <label key={condition} className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={profile.dietary_conditions?.includes(condition) || false}
                  onChange={(e) => {
                    const conditions = e.target.checked
                      ? [...(profile.dietary_conditions || []), condition]
                      : (profile.dietary_conditions || []).filter(c => c !== condition);
                    handleProfileChange({ dietary_conditions: conditions });
                  }}
                />
                <span>{condition.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button className="btn btn-primary w-full" onClick={handleCalculateNeeds}>
          Calculate Dragon's Needs 🔮
        </button>
        
        {hasChanges && (
          <button className="btn btn-primary w-full mt-sm" onClick={handleSaveChanges}>
            💾 Save All Changes
          </button>
        )}
      </section>
      
      {/* Stash Management */}
      <section className="settings-section card">
        <h2 className="section-title">📚 Dragon's Hoard</h2>
        <p className="text-muted">Manage your saved meals and custom bottles.</p>
        <div className="stash-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/stash')}>
            📖 Saved Meals ({savedMeals?.length || 0})
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/stash?tab=bottles')}>
            🍶 Custom Bottles ({bottles?.length || 0})
          </button>
        </div>
      </section>
      
      {/* Thresholds Section */}
      <section className="settings-section card">
        <div className="section-header-row">
          <h2 className="section-title">📊 Nutrition Thresholds</h2>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowThresholdEditor(!showThresholdEditor)}
          >
            {showThresholdEditor ? 'Done' : 'Edit'}
          </button>
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">🔥 Calories</span>
          {showThresholdEditor ? (
            <div className="threshold-inputs">
              <input type="number" value={thresholds.calories_min} onChange={(e) => updateThreshold('calories_min', e.target.value)} className="threshold-input" />
              <span>-</span>
              <input type="number" value={thresholds.calories_max} onChange={(e) => updateThreshold('calories_max', e.target.value)} className="threshold-input" />
              <span>kcal</span>
            </div>
          ) : (
            <span className="threshold-value">{thresholds.calories_min} - {thresholds.calories_max} kcal</span>
          )}
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">🧬 Purines</span>
          {showThresholdEditor ? (
            <div className="threshold-inputs">
              <input type="number" value={thresholds.purines_max} onChange={(e) => updateThreshold('purines_max', e.target.value)} className="threshold-input" />
              <span>mg max</span>
            </div>
          ) : (
            <span className="threshold-value">{thresholds.purines_max} mg max</span>
          )}
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">💪 Protein</span>
          {showThresholdEditor ? (
            <div className="threshold-inputs">
              <input type="number" value={thresholds.protein_target} onChange={(e) => updateThreshold('protein_target', e.target.value)} className="threshold-input" />
              <span>g target</span>
            </div>
          ) : (
            <span className="threshold-value">{thresholds.protein_target} g target</span>
          )}
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">🍞 Carbs</span>
          {showThresholdEditor ? (
            <div className="threshold-inputs">
              <input type="number" value={thresholds.carbs_target} onChange={(e) => updateThreshold('carbs_target', e.target.value)} className="threshold-input" />
              <span>g target</span>
            </div>
          ) : (
            <span className="threshold-value">{thresholds.carbs_target} g target</span>
          )}
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">🥑 Fat</span>
          {showThresholdEditor ? (
            <div className="threshold-inputs">
              <input type="number" value={thresholds.fat_target} onChange={(e) => updateThreshold('fat_target', e.target.value)} className="threshold-input" />
              <span>g target</span>
            </div>
          ) : (
            <span className="threshold-value">{thresholds.fat_target} g target</span>
          )}
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">🌾 Fiber</span>
          {showThresholdEditor ? (
            <div className="threshold-inputs">
              <input type="number" value={thresholds.fiber_target} onChange={(e) => updateThreshold('fiber_target', e.target.value)} className="threshold-input" />
              <span>g target</span>
            </div>
          ) : (
            <span className="threshold-value">{thresholds.fiber_target} g target</span>
          )}
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">🧂 Sodium</span>
          {showThresholdEditor ? (
            <div className="threshold-inputs">
              <input type="number" value={thresholds.sodium_max} onChange={(e) => updateThreshold('sodium_max', e.target.value)} className="threshold-input" />
              <span>mg max</span>
            </div>
          ) : (
            <span className="threshold-value">{thresholds.sodium_max} mg max</span>
          )}
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">🍯 Sugar</span>
          {showThresholdEditor ? (
            <div className="threshold-inputs">
              <input type="number" value={thresholds.sugar_max} onChange={(e) => updateThreshold('sugar_max', e.target.value)} className="threshold-input" />
              <span>g max</span>
            </div>
          ) : (
            <span className="threshold-value">{thresholds.sugar_max} g max</span>
          )}
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">💧 Hydration</span>
          {showThresholdEditor ? (
            <div className="threshold-inputs">
              <input type="number" value={thresholds.hydration_target} onChange={(e) => updateThreshold('hydration_target', e.target.value)} className="threshold-input" />
              <span>ml target</span>
            </div>
          ) : (
            <span className="threshold-value">{thresholds.hydration_target} ml target</span>
          )}
        </div>
        
        {showThresholdEditor && (
          <p className="text-muted text-center mt-sm">
            Tip: Use "Calculate Dragon's Needs" to auto-fill based on your profile.
          </p>
        )}
      </section>
      
      {/* Theme Section */}
      <section className="settings-section card">
        <h2 className="section-title">🎨 Dragon Scale Theme</h2>
        
        <div className="theme-presets">
          {Object.entries(THEME_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`theme-preset ${selectedTheme === key ? 'active' : ''}`}
              onClick={() => handleThemeChange(key)}
              style={{ '--preset-color': preset.seedColor }}
            >
              <span className="preset-swatch" style={{ background: preset.seedColor }} />
              <span className="preset-name">{preset.name}</span>
              <span className="preset-desc">{preset.description}</span>
            </button>
          ))}
        </div>
        
        <div className="custom-color-section">
          <label>Custom Dragon Scale Color</label>
          <div className="color-picker-row">
            <input 
              type="color" 
              value={customColor}
              onChange={(e) => handleCustomColor(e.target.value)}
              className="color-picker"
            />
            <input 
              type="text" 
              value={customColor}
              onChange={(e) => handleCustomColor(e.target.value)}
              className="color-input"
              placeholder="#66BB6A"
            />
          </div>
        </div>
        
        <div className="theme-preview card">
          <p className="preview-label">Preview</p>
          <div className="preview-content">
            <div className="preview-text">Sample text</div>
            <button className="btn btn-primary">Button</button>
            <div className="progress-bar">
              <div className="progress-bar-fill success" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="settings-section card">
        <h2 className="section-title">📈 Dragon Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{totalMeals}</span>
            <span className="stat-label">Meals logged</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{calculateStreak()}</span>
            <span className="stat-label">Day streak 🔥</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{(savedMeals?.length || 0) + (bottles?.length || 0)}</span>
            <span className="stat-label">In hoard</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user?.badges?.length || 0}</span>
            <span className="stat-label">Badges</span>
          </div>
        </div>
      </section>
      
      {/* Ingredient Library Section */}
      <section className="settings-section card">
        <h2 className="section-title">📚 Ingredient Library</h2>
        <p className="text-muted mb-md">
          Manage cached ingredient data. Edit values to fix AI mistakes and optionally update past meals.
        </p>
        <div className="stats-grid mb-md">
          <div className="stat-item">
            <span className="stat-value">{ingredients.length}</span>
            <span className="stat-label">Cached ingredients</span>
          </div>
        </div>
        <button 
          className="btn btn-secondary w-full"
          onClick={() => setShowIngredientManager(true)}
        >
          📚 Manage Ingredients
        </button>
      </section>
      
      {/* Ingredient Manager Modal */}
      {showIngredientManager && (
        <div className="modal-overlay" onClick={() => !editingIngredient && setShowIngredientManager(false)}>
          <div className="modal ingredient-manager-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingIngredient ? `Edit: ${editingIngredient.display_name}` : '📚 Ingredient Library'}</h2>
              <button className="modal-close" onClick={() => {
                setEditingIngredient(null);
                setShowIngredientManager(false);
              }}>×</button>
            </div>
            
            {editingIngredient ? (
              <div className="modal-body">
                <p className="text-muted mb-md">
                  Edit nutritional values per 100g. Used in {getIngredientUsageCount(editingIngredient.normalized_name)} meals.
                </p>
                
                <div className="nutrient-edit-grid">
                  <div className="form-group">
                    <label>🔥 Calories</label>
                    <input 
                      type="number" 
                      value={editValues.calories}
                      onChange={e => setEditValues({...editValues, calories: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>🧬 Purines (mg)</label>
                    <input 
                      type="number" 
                      value={editValues.purines}
                      onChange={e => setEditValues({...editValues, purines: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>💪 Protein (g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editValues.protein}
                      onChange={e => setEditValues({...editValues, protein: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>🍞 Carbs (g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editValues.carbs}
                      onChange={e => setEditValues({...editValues, carbs: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>🧈 Fat (g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editValues.fat}
                      onChange={e => setEditValues({...editValues, fat: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>🌾 Fiber (g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editValues.fiber}
                      onChange={e => setEditValues({...editValues, fiber: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-group mt-md">
                  <label>Apply changes to past meals?</label>
                  <select 
                    value={propagateScope} 
                    onChange={e => setPropagateScope(e.target.value)}
                    className="w-full"
                  >
                    <option value="none">Don't update past meals</option>
                    <option value="week">Update meals from this week</option>
                    <option value="month">Update meals from this month</option>
                    <option value="all">Update ALL meals with this ingredient</option>
                  </select>
                  {propagateScope !== 'none' && (
                    <p className="text-warning text-sm mt-sm">
                      ⚠️ This will recalculate totals for {findMealsWithIngredient(editingIngredient.normalized_name, propagateScope === 'all' ? null : propagateScope).length} meals
                    </p>
                  )}
                </div>
                
                <div className="modal-actions mt-md">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setEditingIngredient(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveIngredient}
                    disabled={isPropagating}
                  >
                    {isPropagating ? 'Updating...' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-body">
                <div className="ingredient-toolbar mb-md">
                  <input 
                    type="text"
                    placeholder="🔍 Search ingredients..."
                    value={ingredientSearch}
                    onChange={e => setIngredientSearch(e.target.value)}
                    className="search-input flex-1"
                  />
                  {!mergeMode ? (
                    <button 
                      className="btn btn-secondary btn-sm ml-sm"
                      onClick={() => setMergeMode(true)}
                      disabled={filteredIngredients.length < 2}
                    >
                      🔗 Merge
                    </button>
                  ) : (
                    <>
                      <button 
                        className="btn btn-primary btn-sm ml-sm"
                        onClick={handleMergeIngredients}
                        disabled={mergeSelection.length < 2 || isPropagating}
                      >
                        {isPropagating ? '...' : `✓ Merge ${mergeSelection.length}`}
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm ml-sm"
                        onClick={cancelMerge}
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
                
                {mergeMode && (
                  <p className="text-muted text-sm mb-sm">
                    Select 2+ ingredients to merge (duplicates in different languages, etc.)
                  </p>
                )}
                
                {isBackfilling ? (
                  <div className="empty-state">
                    <p>🐉 Scanning meals for ingredients...</p>
                    <p className="text-muted">Building your ingredient library from {allMeals.length} logged meals.</p>
                  </div>
                ) : filteredIngredients.length === 0 ? (
                  <div className="empty-state">
                    <p>No ingredients cached yet.</p>
                    <p className="text-muted">Log some meals and the AI will cache ingredients automatically.</p>
                  </div>
                ) : (
                  <div className="ingredient-list">
                    {filteredIngredients.map(ingredient => (
                      <div 
                        key={ingredient.normalized_name} 
                        className={`ingredient-item ${mergeMode && mergeSelection.includes(ingredient.normalized_name) ? 'selected' : ''}`}
                        onClick={mergeMode ? () => toggleMergeSelection(ingredient.normalized_name) : undefined}
                        style={mergeMode ? { cursor: 'pointer' } : undefined}
                      >
                        {mergeMode && (
                          <span className="merge-checkbox">
                            {mergeSelection.includes(ingredient.normalized_name) ? '☑️' : '⬜'}
                          </span>
                        )}
                        <div className="ingredient-info">
                          <span className="ingredient-name">{ingredient.display_name}</span>
                          <span className="ingredient-stats text-muted">
                            {ingredient.nutrients_per_100g?.purines || 0}mg purines/100g • 
                            Used in {getIngredientUsageCount(ingredient.normalized_name)} meals
                          </span>
                        </div>
                        {!mergeMode && (
                          <div className="ingredient-actions">
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleEditIngredient(ingredient)}
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleDeleteIngredient(ingredient)}
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* AI Integration Section */}
      <section className="settings-section card">
        <h2 className="section-title">🤖 Dragon's Intelligence</h2>
        <p className="text-muted mb-md">
          Connect your dragon to Google's AI to automatically analyze meals from text descriptions or photos.
        </p>
        
        {apiKeyStatus === 'saved' ? (
          <div className="api-key-status">
            <div className="status-badge success">
              <span>✅ AI Connected</span>
            </div>
            <p className="text-muted text-sm mt-sm">
              Your dragon can analyze meals. Key stored locally on this device.
            </p>
            <button className="btn btn-secondary btn-danger-outline mt-sm" onClick={handleClearApiKey}>
              🗑️ Remove API Key
            </button>
          </div>
        ) : (
          <div className="api-key-form">
            <div className="form-group">
              <label>Google AI Studio API Key</label>
              <div className="input-with-toggle">
                <input 
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIza..."
                  className="api-key-input"
                />
                <button 
                  type="button" 
                  className="toggle-visibility"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="input-help">
                Get your free key at{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                  Google AI Studio ↗
                </a>
              </p>
            </div>
            <button 
              className="btn btn-primary w-full"
              onClick={handleSaveApiKey}
              disabled={!apiKeyInput.trim()}
            >
              🔐 Save API Key
            </button>
          </div>
        )}
      </section>
      
      {/* App Info */}
      <section className="settings-section card">
        <h2 className="section-title">ℹ️ About</h2>
        <p className="text-center text-muted">
          Purine Control v1.0.0<br />
          "The Dragon Keeper's Nutrition Tracker"
        </p>
        <p className="text-center text-muted mt-md">
          Made with 🔥 for your dragon
        </p>
      </section>
    </div>
  );
}
