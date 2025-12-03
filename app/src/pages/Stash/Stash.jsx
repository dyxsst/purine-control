import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useStash, useHydration, useMeals, useAllMeals } from '../../hooks/useData';
import './Stash.css';

// Default bottles if none saved
const DEFAULT_BOTTLES = [
  { id: 'default-1', name: 'Water Glass', capacity_ml: 250, icon: '🥛', type: 'container' },
  { id: 'default-2', name: 'Water Bottle', capacity_ml: 500, icon: '🍶', type: 'container' },
  { id: 'default-3', name: 'Dragon Chalice', capacity_ml: 750, icon: '🏆', type: 'container' },
];

const TABS = [
  { key: 'meals', label: '📖 Saved Meals', icon: '📖' },
  { key: 'bottles', label: '🍶 Bottles', icon: '🍶' },
];

const BOTTLE_ICONS = ['🥛', '🍶', '🏆', '🧃', '☕', '🫖', '🍵', '🥤'];

export default function Stash() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'meals';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('🥛');
  const [formCapacity, setFormCapacity] = useState(250);
  const [formNutrients, setFormNutrients] = useState({ calories: 0, purines: 0, protein: 0, carbs: 0, fat: 0 });
  
  // Use real data hooks
  const { savedMeals, bottles: userBottles, isLoading, addToStash, removeFromStash, updateStashItem } = useStash();
  const { adjustHydration } = useHydration();
  const { addMeal } = useMeals();
  const { meals: allMeals } = useAllMeals();  // For counting actual usage
  
  // Calculate actual usage count for each stash meal from diary entries
  const getMealUsageCount = useMemo(() => {
    return (stashMealName) => {
      return allMeals.filter(m => m.meal_name === stashMealName).length;
    };
  }, [allMeals]);
  
  // Always show default bottles + user's custom bottles
  const allBottles = [...DEFAULT_BOTTLES, ...userBottles];
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  
  const handleUseBottle = async (bottle) => {
    const amount = bottle.capacity_ml || bottle.amount_ml;
    await adjustHydration(amount);
    alert(`Added ${amount}ml to hydration! 💧`);
  };
  
  // Use a saved meal - logs it to today's diary
  const handleUseMeal = async (meal) => {
    await addMeal({
      meal_type: 'snack', // Default to snack, user can edit in diary
      meal_name: meal.name,
      ingredients: meal.ingredients || [],
      total_nutrients: meal.total_nutrients || {},
    });
    
    alert(`${meal.name} added to diary! 🐉`);
    navigate('/');
  };
  
  const handleDeleteItem = async (itemId) => {
    if (confirm('Remove this item from your hoard?')) {
      await removeFromStash(itemId);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormIcon('🥛');
    setFormCapacity(250);
    setFormNutrients({ calories: 0, purines: 0, protein: 0, carbs: 0, fat: 0 });
    setEditingItem(null);
    setShowCreateModal(false);
  };
  
  // Open create modal
  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };
  
  // Open edit modal
  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormName(item.name || '');
    setFormIcon(item.icon || '🥛');
    setFormCapacity(item.capacity_ml || item.amount_ml || 250);
    setFormNutrients(item.nutrients || item.total_nutrients || { calories: 0, purines: 0, protein: 0, carbs: 0, fat: 0 });
    setShowCreateModal(true);
  };
  
  // Save item (create or update)
  const handleSaveItem = async () => {
    if (!formName.trim()) {
      alert('Please enter a name');
      return;
    }
    
    // Check if editing a default bottle (id starts with 'default-')
    const isDefaultItem = editingItem?.id?.startsWith('default-');
    
    if (editingItem && !isDefaultItem) {
      // Update existing user-created item
      // Only include fields relevant to the item type
      const updates = { name: formName };
      
      if (activeTab === 'bottles') {
        updates.icon = formIcon;
        updates.capacity_ml = formCapacity;
      } else if (activeTab === 'meals') {
        // Keep existing nutrients, just update name
        // (ingredients editing would require a more complex form)
      }
      
      await updateStashItem(editingItem.id, updates);
      alert('Item updated! ✨');
    } else {
      // Create new item (or create based on default)
      const itemType = activeTab === 'meals' ? 'meal' : 'container';
      const newItem = {
        type: itemType,
        name: formName,
        icon: formIcon,
        capacity_ml: itemType === 'container' ? formCapacity : undefined,
        ingredients: itemType === 'meal' ? (editingItem?.ingredients || []) : undefined,
        total_nutrients: itemType === 'meal' ? formNutrients : undefined,
        use_count: 0,
      };
      await addToStash(newItem);
      alert(isDefaultItem ? 'Custom bottle created! 🐉' : 'Added to your hoard! 🐉');
    }
    
    resetForm();
  };
  
  const filteredMeals = savedMeals.filter(meal => 
    meal.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredBottles = allBottles.filter(bottle => 
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
                    <span className="use-count">Used {getMealUsageCount(meal.name)}x</span>
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
                    <button className="btn btn-primary btn-sm" onClick={() => handleUseMeal(meal)}>📝 Use</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEditItem(meal)}>✏️ Edit</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteItem(meal.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button className="btn btn-secondary w-full mt-md" onClick={handleOpenCreate}>
            ➕ Create New Meal
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
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEditItem(bottle)}>✏️</button>
                    {!bottle.id.startsWith('default-') && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteItem(bottle.id)}>🗑️</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button className="btn btn-secondary w-full mt-md" onClick={handleOpenCreate}>
            ➕ Add Custom Bottle
          </button>
        </section>
      )}
      
      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <h2>
              {editingItem ? '✏️ Edit' : '➕ Create'} {activeTab === 'meals' ? 'Meal' : activeTab === 'ingredients' ? 'Ingredient' : 'Bottle'}
            </h2>
            
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={`e.g., ${activeTab === 'meals' ? 'Chicken Salad' : activeTab === 'ingredients' ? 'Olive Oil' : 'Sports Bottle'}`}
              />
            </div>
            
            {activeTab === 'bottles' && (
              <>
                <div className="form-group">
                  <label>Icon</label>
                  <div className="icon-picker">
                    {BOTTLE_ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-btn ${formIcon === icon ? 'active' : ''}`}
                        onClick={() => setFormIcon(icon)}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Capacity (ml)</label>
                  <input
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(parseInt(e.target.value) || 0)}
                    min="0"
                    step="50"
                  />
                </div>
              </>
            )}
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveItem}>
                💾 {editingItem ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
