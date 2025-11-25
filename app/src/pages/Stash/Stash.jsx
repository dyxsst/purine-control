import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Stash.css';

// Demo saved meals
const DEMO_SAVED_MEALS = [
  {
    id: '1',
    name: 'Dragon Berry Oatmeal',
    category: 'breakfast',
    ingredients: ['Oats', 'Blueberries', 'Honey'],
    total_nutrients: { calories: 285, purines: 25, protein: 8 },
    use_count: 5,
  },
  {
    id: '2',
    name: 'Fire-Grilled Chicken Bowl',
    category: 'lunch',
    ingredients: ['Chicken breast', 'Brown rice', 'Broccoli'],
    total_nutrients: { calories: 420, purines: 145, protein: 42 },
    use_count: 3,
  },
];

// Demo custom ingredients
const DEMO_INGREDIENTS = [
  {
    id: '1',
    name: 'Grandma\'s Special Sauce',
    serving_size: 30,
    serving_unit: 'g',
    nutrients: { calories: 45, purines: 5, protein: 1, carbs: 8, fat: 1 },
  },
];

// Demo hydration bottles
const DEMO_BOTTLES = [
  { id: '1', name: 'Water Glass', amount_ml: 250, icon: '🥛' },
  { id: '2', name: 'Water Bottle', amount_ml: 500, icon: '🍶' },
  { id: '3', name: 'Dragon Chalice', amount_ml: 750, icon: '🏆' },
];

const TABS = [
  { key: 'meals', label: '📖 Meals', icon: '📖' },
  { key: 'ingredients', label: '🧪 Ingredients', icon: '🧪' },
  { key: 'bottles', label: '🍶 Bottles', icon: '🍶' },
];

export default function Stash() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'meals';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [savedMeals] = useState(DEMO_SAVED_MEALS);
  const [customIngredients] = useState(DEMO_INGREDIENTS);
  const [bottles] = useState(DEMO_BOTTLES);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  
  const filteredMeals = savedMeals.filter(meal => 
    meal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredIngredients = customIngredients.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredBottles = bottles.filter(bottle => 
    bottle.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="page stash-page">
      <Header 
        title="Dragon's Hoard" 
        subtitle="Your saved meals and custom ingredients"
        showBack
        onBack={() => navigate('/settings')}
      />
      
      {/* Tab Selector */}
      <div className="stash-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`stash-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Search */}
      <div className="stash-search">
        <input
          type="text"
          placeholder={`Search ${activeTab === 'meals' ? 'meals' : 'ingredients'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Content */}
      {activeTab === 'meals' && (
        <section className="stash-content">
          {filteredMeals.length === 0 ? (
            <div className="empty-state card">
              <p>🐉 No saved meals yet!</p>
              <p className="text-muted">Save meals from your diary to reuse them.</p>
            </div>
          ) : (
            <div className="stash-list">
              {filteredMeals.map(meal => (
                <div key={meal.id} className="stash-item card">
                  <div className="stash-item-header">
                    <h3>{meal.name}</h3>
                    <span className="use-count">Used {meal.use_count}x</span>
                  </div>
                  <p className="stash-item-ingredients">
                    {meal.ingredients.join(', ')}
                  </p>
                  <div className="stash-item-nutrients">
                    <span>🔥 {meal.total_nutrients.calories} cal</span>
                    <span>🧬 {meal.total_nutrients.purines}mg</span>
                    <span>💪 {meal.total_nutrients.protein}g</span>
                  </div>
                  <div className="stash-item-actions">
                    <button className="btn btn-primary btn-sm">📝 Use</button>
                    <button className="btn btn-secondary btn-sm">✏️ Edit</button>
                    <button className="btn btn-secondary btn-sm">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button className="btn btn-secondary w-full mt-md">
            ➕ Create New Meal
          </button>
        </section>
      )}
      
      {activeTab === 'ingredients' && (
        <section className="stash-content">
          {filteredIngredients.length === 0 ? (
            <div className="empty-state card">
              <p>🧪 No custom ingredients yet!</p>
              <p className="text-muted">Add ingredients that aren't in our database.</p>
            </div>
          ) : (
            <div className="stash-list">
              {filteredIngredients.map(ing => (
                <div key={ing.id} className="stash-item card">
                  <div className="stash-item-header">
                    <h3>{ing.name}</h3>
                    <span className="serving-info">{ing.serving_size}{ing.serving_unit}</span>
                  </div>
                  <div className="stash-item-nutrients">
                    <span>🔥 {ing.nutrients.calories} cal</span>
                    <span>🧬 {ing.nutrients.purines}mg</span>
                    <span>💪 {ing.nutrients.protein}g</span>
                    <span>🍞 {ing.nutrients.carbs}g</span>
                    <span>🧈 {ing.nutrients.fat}g</span>
                  </div>
                  <div className="stash-item-actions">
                    <button className="btn btn-secondary btn-sm">✏️ Edit</button>
                    <button className="btn btn-secondary btn-sm">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button className="btn btn-secondary w-full mt-md">
            ➕ Add Custom Ingredient
          </button>
        </section>
      )}
      
      {activeTab === 'bottles' && (
        <section className="stash-content">
          <p className="text-muted">Custom hydration containers for quick logging.</p>
          
          {filteredBottles.length === 0 ? (
            <div className="empty-state card">
              <p>🍶 No custom bottles yet!</p>
              <p className="text-muted">Add your favorite containers.</p>
            </div>
          ) : (
            <div className="stash-list">
              {filteredBottles.map(bottle => (
                <div key={bottle.id} className="stash-item card bottle-item">
                  <div className="bottle-info">
                    <span className="bottle-icon">{bottle.icon}</span>
                    <div className="bottle-details">
                      <h3>{bottle.name}</h3>
                      <span className="bottle-amount">{bottle.amount_ml} ml</span>
                    </div>
                  </div>
                  <div className="stash-item-actions">
                    <button className="btn btn-primary btn-sm">💧 Use</button>
                    <button className="btn btn-secondary btn-sm">✏️</button>
                    <button className="btn btn-secondary btn-sm">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button className="btn btn-secondary w-full mt-md">
            ➕ Add Custom Bottle
          </button>
        </section>
      )}
    </div>
  );
}
