import { useState } from 'react';
import Header from '../../components/Header/Header';
import { THEME_PRESETS, generateThemeFromSeed, applyTheme } from '../../lib/theme';
import { DEFAULT_THRESHOLDS } from '../../lib/nutrition';
import './Settings.css';

export default function Settings() {
  const [profile, setProfile] = useState({
    name: 'Dragon Keeper',
    sex: 'male',
    age: 30,
    weight_kg: 75,
    height_cm: 175,
    activity_level: 'moderate',
    dietary_conditions: [],
  });
  
  const [thresholds] = useState(DEFAULT_THRESHOLDS);
  const [selectedTheme, setSelectedTheme] = useState('emerald');
  const [customColor, setCustomColor] = useState('#66BB6A');
  
  const handleThemeChange = (presetKey) => {
    setSelectedTheme(presetKey);
    const preset = THEME_PRESETS[presetKey];
    const theme = generateThemeFromSeed(preset.seedColor, preset.isDark);
    applyTheme(theme);
  };
  
  const handleCustomColor = (color) => {
    setCustomColor(color);
    setSelectedTheme('custom');
    const theme = generateThemeFromSeed(color, false);
    applyTheme(theme);
  };
  
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
            onChange={(e) => setProfile({...profile, name: e.target.value})}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Sex</label>
            <select 
              value={profile.sex}
              onChange={(e) => setProfile({...profile, sex: e.target.value})}
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
              onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Weight (kg)</label>
            <input 
              type="number" 
              value={profile.weight_kg}
              onChange={(e) => setProfile({...profile, weight_kg: parseInt(e.target.value)})}
            />
          </div>
          
          <div className="form-group">
            <label>Height (cm)</label>
            <input 
              type="number" 
              value={profile.height_cm}
              onChange={(e) => setProfile({...profile, height_cm: parseInt(e.target.value)})}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Activity Level</label>
          <select 
            value={profile.activity_level}
            onChange={(e) => setProfile({...profile, activity_level: e.target.value})}
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
                  checked={profile.dietary_conditions.includes(condition)}
                  onChange={(e) => {
                    const conditions = e.target.checked
                      ? [...profile.dietary_conditions, condition]
                      : profile.dietary_conditions.filter(c => c !== condition);
                    setProfile({...profile, dietary_conditions: conditions});
                  }}
                />
                <span>{condition.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button className="btn btn-primary w-full">
          Calculate Dragon's Needs 🔮
        </button>
      </section>
      
      {/* Thresholds Section */}
      <section className="settings-section card">
        <h2 className="section-title">📊 Nutrition Thresholds</h2>
        
        <div className="threshold-row">
          <span className="threshold-label">🔥 Calories</span>
          <span className="threshold-value">{thresholds.calories_min} - {thresholds.calories_max} kcal</span>
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">🧬 Purines</span>
          <span className="threshold-value">{thresholds.purines_max} mg max</span>
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">💪 Protein</span>
          <span className="threshold-value">{thresholds.protein_target} g target</span>
        </div>
        
        <div className="threshold-row">
          <span className="threshold-label">💧 Hydration</span>
          <span className="threshold-value">{thresholds.hydration_target} ml target</span>
        </div>
        
        <p className="text-muted text-center mt-md">
          Use "Calculate Dragon's Needs" to auto-fill based on your profile.
        </p>
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
            <span className="stat-value">0</span>
            <span className="stat-label">Meals logged</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Day streak 🔥</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">In hoard</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Badges</span>
          </div>
        </div>
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
