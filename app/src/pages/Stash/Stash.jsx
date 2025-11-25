import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useStash } from '../../hooks/useData';
import { useHydration } from '../../hooks/useData';
import './Stash.css';

// Default bottles if none saved
const DEFAULT_BOTTLES = [
  { id: 'default-1', name: 'Water Glass', capacity_ml: 250, icon: '🥛', type: 'container' },
  { id: 'default-2', name: 'Water Bottle', capacity_ml: 500, icon: '🍶', type: 'container' },
  { id: 'default-3', name: 'Dragon Chalice', capacity_ml: 750, icon: '🏆', type: 'container' },
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use real data hooks
  const { savedMeals, customIngredients, bottles: userBottles, isLoading, addToStash, removeFromStash } = useStash();
  const { adjustHydration } = useHydration();
  
  // Combine default bottles with user bottles
  const bottles = userBottles.length > 0 ? userBottles : DEFAULT_BOTTLES;
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  
  const handleUseBottle = async (bottle) => {
    const amount = bottle.capacity_ml || bottle.amount_ml;
    await adjustHydration(amount);
    alert(`Added ${amount}ml to hydration! 💧`);
  };
  
  const handleDeleteItem = async (itemId) => {
    if (confirm('Remove this item from your hoard?')) {
      await removeFromStash(itemId);
    }
  };
  
  const filteredMeals = savedMeals.filter(meal => 
    meal.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredIngredients = customIngredients.filter(ing => 
    ing.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredBottles = bottles.filter(bottle => 
    bottle.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="page stash-page">
        <Header title="Dragon's Hoard" subtitle="Loading..." showBack onBack={() => navigate('/settings')} />
        <div className="loading-state card">
          <div className="spinner"></div>
          <p>Opening the hoard...</p>
        </div>
      </div>
    );
  }
  
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
                    <span className="use-count">Used {meal.use_count || 0}x</span>
                  </div>
                  <p className="stash-item-ingredients">
                    {Array.isArray(meal.ingredients) 
                      ? meal.ingredients.map(i => typeof i === 'string' ? i : i.name).join(', ')
                      : 'No ingredients'}
                  </p>
                  <div className="stash-item-nutrients">
                    <span>🔥 {meal.total_nutrients?.calories || 0} cal</span>
                    <span>🧬 {meal.total_nutrients?.purines || 0}mg</span>
                    <span>💪 {meal.total_nutrients?.protein || 0}g</span>
                  </div>
                  <div className="stash-item-actions">
                    <button className="btn btn-primary btn-sm">📝 Use</button>
                    <button className="btn btn-secondary btn-sm">✏️ Edit</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteItem(meal.id)}>🗑️</button>
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
                    <span className="serving-info">{ing.serving_size || 100}{ing.serving_unit || 'g'}</span>
                  </div>
                  <div className="stash-item-nutrients">
                    <span>🔥 {ing.nutrients?.calories || ing.total_nutrients?.calories || 0} cal</span>
                    <span>🧬 {ing.nutrients?.purines || ing.total_nutrients?.purines || 0}mg</span>
                    <span>💪 {ing.nutrients?.protein || ing.total_nutrients?.protein || 0}g</span>
                    <span>🍞 {ing.nutrients?.carbs || ing.total_nutrients?.carbs || 0}g</span>
                    <span>🧈 {ing.nutrients?.fat || ing.total_nutrients?.fat || 0}g</span>
                  </div>
                  <div className="stash-item-actions">
                    <button className="btn btn-secondary btn-sm">✏️ Edit</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteItem(ing.id)}>🗑️</button>
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
                    <span className="bottle-icon">{bottle.icon || '🍶'}</span>
                    <div className="bottle-details">
                      <h3>{bottle.name}</h3>
                      <span className="bottle-amount">{bottle.capacity_ml || bottle.amount_ml} ml</span>
                    </div>
                  </div>
                  <div className="stash-item-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleUseBottle(bottle)}>💧 Use</button>
                    <button className="btn btn-secondary btn-sm">✏️</button>
                    {!bottle.id.startsWith('default-') && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteItem(bottle.id)}>🗑️</button>
                    )}
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
