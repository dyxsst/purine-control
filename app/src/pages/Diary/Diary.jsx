import { useState } from 'react';
import Header from '../../components/Header/Header';
import NutrientProgress from '../../components/ProgressBar/ProgressBar';
import EmberMascot, { getEmberState } from '../../components/EmberMascot/EmberMascot';
import { useUser } from '../../contexts/UserContext';
import { useMeals, useHydration, useStash } from '../../hooks/useData';
import { getToday } from '../../lib/nutrition';
import { hasApiKey, processFullMeal } from '../../lib/gemini';
import './Diary.css';

const MEAL_TYPES = [
  { key: 'breakfast', icon: '🍳', label: 'Brekkie' },
  { key: 'lunch', icon: '🌮', label: 'Lunch' },
  { key: 'dinner', icon: '🍝', label: 'Dinner' },
  { key: 'snack', icon: '🍪', label: 'Snack' },
];

// Helper to get a date string in YYYY-MM-DD format
const formatDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Helper to create date objects for the calendar ribbon
const getCalendarDays = (centerDate) => {
  const days = [];
  for (let offset = -3; offset <= 3; offset++) {
    const date = new Date(centerDate);
    date.setDate(date.getDate() + offset);
    days.push({
      date,
      dateKey: formatDateKey(date),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      dayNum: date.getDate(),
      isToday: formatDateKey(date) === formatDateKey(new Date()),
    });
  }
  return days;
};

export default function Diary() {
  const { user, isLoading: userLoading } = useUser();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [calendarCenter, setCalendarCenter] = useState(new Date());
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [mealInput, setMealInput] = useState('');
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiError, setAiError] = useState(null);
  
  // Edit modal state
  const [editingMeal, setEditingMeal] = useState(null);
  const [editMealName, setEditMealName] = useState('');
  const [editMealType, setEditMealType] = useState('snack');
  
  // Use real data hooks
  const { meals, isLoading: mealsLoading, addMeal, updateMeal, deleteMeal, getDailyTotals } = useMeals(selectedDate);
  const { totalHydration, adjustHydration, isLoading: hydrationLoading } = useHydration(selectedDate);
  const { addToStash, bottles: userBottles } = useStash();
  
  // Default bottles + user bottles for hydration quick-log
  const defaultBottles = [
    { id: 'quick-250', name: '+250ml', capacity_ml: 250, icon: null },
    { id: 'quick-500', name: '+500ml', capacity_ml: 500, icon: null },
  ];
  const hydrationBottles = [...defaultBottles, ...userBottles];
  
  const calendarDays = getCalendarDays(calendarCenter);
  const thresholds = user?.thresholds || {};
  
  // Filter out hydration entries from meals display
  const displayMeals = meals.filter(m => m.meal_type !== 'hydration');
  
  // Calculate daily totals including hydration
  const mealTotals = getDailyTotals(selectedDate);
  const totals = { ...mealTotals, hydration: totalHydration };
  
  const emberState = getEmberState(totals, thresholds);
  
  const isLoading = userLoading || mealsLoading || hydrationLoading;
  
  const handleAdjustHydration = async (amount) => {
    await adjustHydration(amount);
  };
  
  const handleDayClick = (dateKey) => {
    setSelectedDate(dateKey);
  };
  
  const navigateCalendar = (direction) => {
    const newCenter = new Date(calendarCenter);
    newCenter.setDate(newCenter.getDate() + (direction === 'next' ? 7 : -7));
    setCalendarCenter(newCenter);
  };
  
  const handleLogMeal = async (e) => {
    e.preventDefault();
    if (!mealInput.trim()) return;
    
    setAiError(null);
    
    // Check if AI is available
    if (!hasApiKey()) {
      // Fallback: Create simple meal entry without AI
      const newMeal = {
        date: selectedDate,
        meal_type: selectedMealType,
        meal_name: mealInput,
        ingredients: [],
        total_nutrients: { calories: 0, purines: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 },
        hydration_ml: 0,
        analysis_method: 'manual',
      };
      await addMeal(newMeal);
      setMealInput('');
      return;
    }
    
    // Use AI to parse and analyze the meal
    setIsProcessing(true);
    try {
      const { ingredients, total_nutrients } = await processFullMeal(mealInput);
      
      const newMeal = {
        date: selectedDate,
        meal_type: selectedMealType,
        meal_name: mealInput,
        ingredients: ingredients,
        total_nutrients: total_nutrients,
        hydration_ml: 0,
        analysis_method: 'ai',
      };
      
      await addMeal(newMeal);
      setMealInput('');
    } catch (error) {
      console.error('AI parsing failed:', error);
      setAiError(error.message || 'Failed to analyze meal. Try again or check your API key.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteMeal = async (mealId) => {
    if (confirm('Delete this meal?')) {
      await deleteMeal(mealId);
    }
  };
  
  // Open edit modal
  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setEditMealName(meal.meal_name);
    setEditMealType(meal.meal_type);
  };
  
  // Save edited meal
  const handleSaveEdit = async () => {
    if (!editingMeal) return;
    
    await updateMeal(editingMeal.id, {
      meal_name: editMealName,
      meal_type: editMealType,
    });
    
    setEditingMeal(null);
  };
  
  // Cancel edit
  const handleCancelEdit = () => {
    setEditingMeal(null);
    setEditMealName('');
    setEditMealType('snack');
  };
  
  // Save meal to stash
  const handleSaveToStash = async (meal) => {
    await addToStash({
      type: 'meal',
      name: meal.meal_name,
      ingredients: meal.ingredients || [],
      total_nutrients: meal.total_nutrients || {},
      use_count: 0,
    });
    alert(`"${meal.meal_name}" saved to your Dragon's Hoard! 📚`);
  };
  
  // Parse YYYY-MM-DD string to local date for display
  const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  const displayDate = parseLocalDate(selectedDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
  
  if (isLoading) {
    return (
      <div className="page diary-page">
        <Header title="Dragon Keeper" subtitle="Loading..." />
        <div className="loading-state card">
          <div className="spinner"></div>
          <p>Waking up the dragon...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page diary-page">
      <Header 
        title="Dragon Keeper" 
        subtitle={`Feeding log for ${displayDate}`}
      />
      
      {/* Calendar Ribbon */}
      <div className="calendar-ribbon card">
        <button className="cal-nav" onClick={() => navigateCalendar('prev')} aria-label="Previous week">◀</button>
        <div className="cal-days">
          {calendarDays.map(day => {
            const isSelected = day.dateKey === selectedDate;
            return (
              <button 
                key={day.dateKey}
                className={`cal-day ${isSelected ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
                onClick={() => handleDayClick(day.dateKey)}
              >
                <span className="cal-day-name">{day.dayName}</span>
                <span className="cal-day-num">{day.dayNum}</span>
                {day.isToday && <span className="cal-day-indicator">🐾</span>}
              </button>
            );
          })}
        </div>
        <button className="cal-nav" onClick={() => navigateCalendar('next')} aria-label="Next week">▶</button>
      </div>
      
      {/* Meal Type Selector */}
      <div className="meal-type-selector">
        {MEAL_TYPES.map(type => (
          <button
            key={type.key}
            className={`meal-type-btn ${selectedMealType === type.key ? 'active' : ''}`}
            onClick={() => setSelectedMealType(type.key)}
          >
            <span className="meal-icon">{type.icon}</span>
            <span className="meal-label">{type.label}</span>
          </button>
        ))}
      </div>
      
      {/* Input Section */}
      <form className="meal-input-section card" onSubmit={handleLogMeal}>
        <label className="input-label">What did your dragon eat? 🔥</label>
        <div className="input-row">
          <input
            type="text"
            placeholder="e.g., grilled chicken with rice..."
            value={mealInput}
            onChange={(e) => setMealInput(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        {aiError && (
          <div className="ai-error">
            <span>⚠️ {aiError}</span>
          </div>
        )}
        <div className="input-actions">
          <button type="button" className="btn btn-secondary" disabled={isProcessing}>🎤</button>
          <button type="button" className="btn btn-secondary" disabled={isProcessing}>📸</button>
          <button type="button" className="btn btn-secondary" disabled={isProcessing}>🖼️</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={isProcessing || !mealInput.trim()}>
            {isProcessing ? (
              <>🔮 Analyzing...</>
            ) : (
              <>Log It! 🎉</>
            )}
          </button>
        </div>
        {!hasApiKey() && (
          <p className="no-api-hint text-muted text-sm">
            💡 Set up AI in Settings → Dragon's Intelligence to auto-analyze meals!
          </p>
        )}
      </form>
      
      {/* Hydration Section */}
      <div className="hydration-section card">
        <div className="hydration-header">
          <span className="hydration-title">💧 Dragon's Hydration</span>
          <span className="hydration-value">{totalHydration}/{thresholds.hydration_target || 2000}ml</span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-bar-fill ${totalHydration >= (thresholds.hydration_target || 2000) ? 'success' : 'warning'}`}
            style={{ width: `${Math.min((totalHydration / (thresholds.hydration_target || 2000)) * 100, 100)}%` }}
          />
        </div>
        <div className="hydration-buttons">
          <button className="btn btn-secondary btn-danger-outline" onClick={() => handleAdjustHydration(-250)}>−250</button>
          {hydrationBottles.map(bottle => (
            <button 
              key={bottle.id} 
              className="btn btn-secondary"
              onClick={() => handleAdjustHydration(bottle.capacity_ml)}
            >
              {bottle.icon || ''}{bottle.icon ? ' ' : ''}{bottle.name || `+${bottle.capacity_ml}ml`}
            </button>
          ))}
        </div>
      </div>
      
      {/* Today's Meals */}
      <section className="meals-section">
        <h2 className="section-title">Today's Feast</h2>
        
        {displayMeals.length === 0 ? (
          <div className="empty-state card">
            <EmberMascot state="curious" />
            <p>No meals logged yet today!</p>
            <p className="text-muted">Feed your dragon to get started.</p>
          </div>
        ) : (
          <div className="meals-list">
            {displayMeals.map(meal => (
              <div key={meal.id} className="meal-card card">
                <div className="meal-header">
                  <span className="meal-type-badge">
                    {MEAL_TYPES.find(t => t.key === meal.meal_type)?.icon || '🍽️'}
                  </span>
                  <h3 className="meal-name">{meal.meal_name}</h3>
                </div>
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <ul className="meal-ingredients">
                    {meal.ingredients.map((ing, i) => (
                      <li key={i}>• {ing.name} ({ing.quantity}{ing.unit})</li>
                    ))}
                  </ul>
                )}
                <div className="meal-nutrients">
                  <span>🔥 {meal.total_nutrients?.calories || 0} cal</span>
                  <span>🧬 {meal.total_nutrients?.purines || 0}mg purines</span>
                </div>
                <div className="meal-actions">
                  <button className="btn btn-secondary" onClick={() => handleEditMeal(meal)}>✏️ Edit</button>
                  <button className="btn btn-secondary" onClick={() => handleDeleteMeal(meal.id)}>🗑️</button>
                  <button className="btn btn-secondary" onClick={() => handleSaveToStash(meal)}>📚 Stash</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Daily Status Panel */}
      <section className="daily-status card">
        <div className="status-header" onClick={() => setShowAllNutrients(!showAllNutrients)}>
          <h3>📊 Dragon's Daily Status</h3>
          <EmberMascot state={emberState} showMessage={false} size="small" />
          <span className="toggle-hint">{showAllNutrients ? '▲' : '▼'}</span>
        </div>
        
        <NutrientProgress 
          nutrient="calories" 
          value={totals.calories || 0} 
          target={thresholds.calories_max || 2000}
          min={thresholds.calories_min || 1500}
          max={thresholds.calories_max || 2000}
        />
        
        <NutrientProgress 
          nutrient="purines" 
          value={totals.purines || 0} 
          target={thresholds.purines_max || 400}
          max={thresholds.purines_max || 400}
        />
        
        {showAllNutrients && (
          <div className="all-nutrients animate-fade-in">
            <NutrientProgress nutrient="protein" value={totals.protein || 0} target={thresholds.protein_target || 60} compact />
            <NutrientProgress nutrient="carbs" value={totals.carbs || 0} target={thresholds.carbs_target || 250} compact />
            <NutrientProgress nutrient="fat" value={totals.fat || 0} target={thresholds.fat_target || 65} compact />
            <NutrientProgress nutrient="fiber" value={totals.fiber || 0} target={thresholds.fiber_target || 30} compact />
            <NutrientProgress nutrient="sodium" value={totals.sodium || 0} target={thresholds.sodium_max || 2300} max={thresholds.sodium_max || 2300} compact />
            <NutrientProgress nutrient="sugar" value={totals.sugar || 0} target={thresholds.sugar_max || 50} max={thresholds.sugar_max || 50} compact />
            <NutrientProgress nutrient="hydration" value={totalHydration} target={thresholds.hydration_target || 2000} compact />
          </div>
        )}
      </section>
      
      {/* Edit Meal Modal */}
      {editingMeal && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <h2>✏️ Edit Meal</h2>
            <div className="form-group">
              <label>Meal Name</label>
              <input
                type="text"
                value={editMealName}
                onChange={(e) => setEditMealName(e.target.value)}
                placeholder="e.g., Grilled Chicken"
              />
            </div>
            <div className="form-group">
              <label>Meal Type</label>
              <select value={editMealType} onChange={(e) => setEditMealType(e.target.value)}>
                {MEAL_TYPES.map(type => (
                  <option key={type.key} value={type.key}>{type.icon} {type.label}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>💾 Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
