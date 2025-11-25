import { useState } from 'react';
import Header from '../../components/Header/Header';
import NutrientProgress from '../../components/ProgressBar/ProgressBar';
import EmberMascot, { getEmberState } from '../../components/EmberMascot/EmberMascot';
import { DEFAULT_THRESHOLDS, getToday } from '../../lib/nutrition';
import './Diary.css';

// Demo data for initial display
const DEMO_MEALS = [
  {
    id: '1',
    meal_type: 'breakfast',
    meal_name: 'Dragon Berry Oatmeal',
    ingredients: [
      { name: 'Oats', quantity: 50, unit: 'g' },
      { name: 'Blueberries', quantity: 30, unit: 'g' },
      { name: 'Honey', quantity: 15, unit: 'g' },
    ],
    total_nutrients: { calories: 285, purines: 25, protein: 8, carbs: 52, fat: 5, fiber: 6, sodium: 5, sugar: 18 },
    hydration_ml: 0,
  },
  {
    id: '2',
    meal_type: 'lunch',
    meal_name: 'Fire-Grilled Chicken Bowl',
    ingredients: [
      { name: 'Chicken breast', quantity: 150, unit: 'g' },
      { name: 'Brown rice', quantity: 100, unit: 'g' },
      { name: 'Broccoli', quantity: 80, unit: 'g' },
    ],
    total_nutrients: { calories: 420, purines: 145, protein: 42, carbs: 38, fat: 8, fiber: 5, sodium: 95, sugar: 3 },
    hydration_ml: 0,
  },
];

const MEAL_TYPES = [
  { key: 'breakfast', label: '🍳 Brekkie', longLabel: 'Breakfast' },
  { key: 'lunch', label: '🌮 Lunch', longLabel: 'Lunch' },
  { key: 'dinner', label: '🍝 Dinner', longLabel: 'Dinner' },
  { key: 'snack', label: '🍪 Snack', longLabel: 'Snack' },
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
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [calendarCenter, setCalendarCenter] = useState(new Date());
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [mealInput, setMealInput] = useState('');
  const [meals] = useState(DEMO_MEALS);
  const [hydration, setHydration] = useState(1250);
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  
  const calendarDays = getCalendarDays(calendarCenter);
  
  const thresholds = DEFAULT_THRESHOLDS;
  
  // Calculate daily totals
  const totals = meals.reduce((acc, meal) => {
    Object.keys(meal.total_nutrients).forEach(key => {
      acc[key] = (acc[key] || 0) + meal.total_nutrients[key];
    });
    return acc;
  }, { hydration });
  
  const emberState = getEmberState(totals, thresholds);
  
  const adjustHydration = (amount) => {
    setHydration(prev => Math.max(0, prev + amount));
  };
  
  const handleDayClick = (dateKey) => {
    setSelectedDate(dateKey);
  };
  
  const navigateCalendar = (direction) => {
    const newCenter = new Date(calendarCenter);
    newCenter.setDate(newCenter.getDate() + (direction === 'next' ? 7 : -7));
    setCalendarCenter(newCenter);
  };
  
  const handleLogMeal = (e) => {
    e.preventDefault();
    if (!mealInput.trim()) return;
    
    // TODO: Integrate with AI for parsing
    alert(`Would analyze: "${mealInput}" for ${selectedMealType}`);
    setMealInput('');
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
            {type.label}
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
          />
        </div>
        <div className="input-actions">
          <button type="button" className="btn btn-secondary">🎤</button>
          <button type="button" className="btn btn-secondary">📸</button>
          <button type="button" className="btn btn-secondary">🖼️</button>
          <button type="submit" className="btn btn-primary btn-lg">Log It! 🎉</button>
        </div>
      </form>
      
      {/* Hydration Section */}
      <div className="hydration-section card">
        <div className="hydration-header">
          <span className="hydration-title">💧 Dragon's Hydration</span>
          <span className="hydration-value">{hydration}/{thresholds.hydration_target}ml</span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-bar-fill ${hydration >= thresholds.hydration_target ? 'success' : 'warning'}`}
            style={{ width: `${Math.min((hydration / thresholds.hydration_target) * 100, 100)}%` }}
          />
        </div>
        <div className="hydration-buttons">
          <button className="btn btn-secondary btn-danger-outline" onClick={() => adjustHydration(-250)}>−250</button>
          <button className="btn btn-secondary" onClick={() => adjustHydration(250)}>+250</button>
          <button className="btn btn-secondary" onClick={() => adjustHydration(500)}>+500</button>
          <button className="btn btn-secondary" onClick={() => adjustHydration(750)}>🏆+750</button>
        </div>
      </div>
      
      {/* Today's Meals */}
      <section className="meals-section">
        <h2 className="section-title">Today's Feast</h2>
        
        {meals.length === 0 ? (
          <div className="empty-state card">
            <EmberMascot state="curious" />
            <p>No meals logged yet today!</p>
            <p className="text-muted">Feed your dragon to get started.</p>
          </div>
        ) : (
          <div className="meals-list">
            {meals.map(meal => (
              <div key={meal.id} className="meal-card card">
                <div className="meal-header">
                  <span className="meal-type-badge">
                    {MEAL_TYPES.find(t => t.key === meal.meal_type)?.label || '🍽️'}
                  </span>
                  <h3 className="meal-name">{meal.meal_name}</h3>
                </div>
                <ul className="meal-ingredients">
                  {meal.ingredients.map((ing, i) => (
                    <li key={i}>• {ing.name} ({ing.quantity}{ing.unit})</li>
                  ))}
                </ul>
                <div className="meal-nutrients">
                  <span>🔥 {meal.total_nutrients.calories} cal</span>
                  <span>🧬 {meal.total_nutrients.purines}mg purines</span>
                </div>
                <div className="meal-actions">
                  <button className="btn btn-secondary">✏️ Edit</button>
                  <button className="btn btn-secondary">🗑️</button>
                  <button className="btn btn-secondary">📚 Stash</button>
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
          target={thresholds.calories_max}
          min={thresholds.calories_min}
          max={thresholds.calories_max}
        />
        
        <NutrientProgress 
          nutrient="purines" 
          value={totals.purines || 0} 
          target={thresholds.purines_max}
          max={thresholds.purines_max}
        />
        
        {showAllNutrients && (
          <div className="all-nutrients animate-fade-in">
            <NutrientProgress nutrient="protein" value={totals.protein || 0} target={thresholds.protein_target} compact />
            <NutrientProgress nutrient="carbs" value={totals.carbs || 0} target={thresholds.carbs_target} compact />
            <NutrientProgress nutrient="fat" value={totals.fat || 0} target={thresholds.fat_target} compact />
            <NutrientProgress nutrient="fiber" value={totals.fiber || 0} target={thresholds.fiber_target} compact />
            <NutrientProgress nutrient="sodium" value={totals.sodium || 0} target={thresholds.sodium_max} max={thresholds.sodium_max} compact />
            <NutrientProgress nutrient="sugar" value={totals.sugar || 0} target={thresholds.sugar_max} max={thresholds.sugar_max} compact />
            <NutrientProgress nutrient="hydration" value={hydration} target={thresholds.hydration_target} compact />
          </div>
        )}
      </section>
    </div>
  );
}
