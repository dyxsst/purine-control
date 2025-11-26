import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useUser } from '../../contexts/UserContext';
import { useStash } from '../../hooks/useData';
import { THEME_PRESETS, generateThemeFromSeed, applyTheme } from '../../lib/theme';
import { DEFAULT_THRESHOLDS, calculateAllThresholds } from '../../lib/nutrition';
import { hasApiKey, getApiKey, setApiKey, clearApiKey } from '../../lib/gemini';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const { user, isLoading, updateProfile, updateThresholds, updateTheme, saveUser } = useUser();
  const { savedMeals, bottles } = useStash();
  
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
            <span className="stat-value">{user?.stats?.total_meals_logged || 0}</span>
            <span className="stat-label">Meals logged</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user?.stats?.current_streak_days || 0}</span>
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
