import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import Header from '../../components/Header/Header';
import { useMeals } from '../../hooks/useData';
import { useUser } from '../../contexts/UserContext';
import { NUTRIENTS, DEFAULT_THRESHOLDS } from '../../lib/nutrition';
import './Charts.css';

// Chart colors for each nutrient
const CHART_COLORS = {
  calories: '#FF6B6B',
  purines: '#845EF7',
  protein: '#339AF0',
  carbs: '#FCC419',
  fat: '#51CF66',
  fiber: '#20C997',
  sodium: '#FF922B',
  sugar: '#F06595',
};

// Date range presets
const DATE_RANGES = {
  week: { label: 'This Week', days: 7 },
  month: { label: 'This Month', days: 30 },
  custom: { label: 'Custom', days: null },
};

// Grouping options
const GROUPING_OPTIONS = {
  daily: { label: 'Daily', days: 1 },
  weekly: { label: 'Weekly', days: 7 },
  monthly: { label: 'Monthly', days: 30 },
};

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get date N days ago
const getDateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Helper to format date for display
const formatDisplayDate = (dateStr, grouping) => {
  const date = new Date(dateStr + 'T00:00:00');
  if (grouping === 'monthly') {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  if (grouping === 'weekly') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="chart-tooltip">
      <p className="tooltip-date">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {NUTRIENTS[entry.dataKey]?.icon} {entry.name}: {Math.round(entry.value)}{NUTRIENTS[entry.dataKey]?.unit}
        </p>
      ))}
    </div>
  );
};

export default function Charts() {
  const { user } = useUser();
  const { meals, isLoading } = useMeals(); // Get all meals
  const thresholds = user?.thresholds || DEFAULT_THRESHOLDS;
  
  // State
  const [dateRange, setDateRange] = useState('week');
  const [grouping, setGrouping] = useState('daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [enabledNutrients, setEnabledNutrients] = useState({
    calories: true,
    purines: true,
    protein: false,
    carbs: false,
    fat: false,
    fiber: false,
    sodium: false,
    sugar: false,
  });

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }
    const days = DATE_RANGES[dateRange]?.days || 7;
    return {
      startDate: formatDate(getDateDaysAgo(days - 1)),
      endDate: formatDate(new Date()),
    };
  }, [dateRange, customStartDate, customEndDate]);

  // Filter and aggregate meal data
  const chartData = useMemo(() => {
    if (!meals?.length) return [];
    
    // Filter meals by date range
    const filteredMeals = meals.filter(meal => {
      return meal.date >= startDate && meal.date <= endDate;
    });
    
    // Group meals by date
    const dailyTotals = {};
    filteredMeals.forEach(meal => {
      if (!dailyTotals[meal.date]) {
        dailyTotals[meal.date] = {
          date: meal.date,
          calories: 0,
          purines: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sodium: 0,
          sugar: 0,
        };
      }
      if (meal.total_nutrients) {
        Object.keys(dailyTotals[meal.date]).forEach(key => {
          if (key !== 'date' && meal.total_nutrients[key]) {
            dailyTotals[meal.date][key] += meal.total_nutrients[key];
          }
        });
      }
    });
    
    // Convert to array and sort by date
    let data = Object.values(dailyTotals).sort((a, b) => a.date.localeCompare(b.date));
    
    // Apply grouping if not daily
    if (grouping !== 'daily') {
      const groupedData = [];
      const groupDays = GROUPING_OPTIONS[grouping].days;
      
      for (let i = 0; i < data.length; i += groupDays) {
        const group = data.slice(i, i + groupDays);
        if (group.length > 0) {
          const avg = { date: group[0].date };
          Object.keys(CHART_COLORS).forEach(key => {
            avg[key] = group.reduce((sum, d) => sum + (d[key] || 0), 0) / group.length;
          });
          groupedData.push(avg);
        }
      }
      data = groupedData;
    }
    
    // Add display date
    return data.map(d => ({
      ...d,
      displayDate: formatDisplayDate(d.date, grouping),
    }));
  }, [meals, startDate, endDate, grouping]);

  // Toggle nutrient visibility
  const toggleNutrient = (nutrient) => {
    setEnabledNutrients(prev => ({
      ...prev,
      [nutrient]: !prev[nutrient],
    }));
  };

  // Export data as CSV
  const exportData = () => {
    if (!chartData.length) return;
    
    const headers = ['Date', ...Object.keys(CHART_COLORS).map(n => NUTRIENTS[n].label)];
    const rows = chartData.map(d => [
      d.date,
      ...Object.keys(CHART_COLORS).map(n => Math.round(d[n] || 0))
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-data-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get threshold lines for enabled nutrients
  const getThresholdValue = (nutrient) => {
    switch (nutrient) {
      case 'calories': return thresholds.calories_max;
      case 'purines': return thresholds.purines_max;
      case 'protein': return thresholds.protein_target;
      case 'carbs': return thresholds.carbs_target;
      case 'fat': return thresholds.fat_target;
      case 'fiber': return thresholds.fiber_target;
      case 'sodium': return thresholds.sodium_max;
      case 'sugar': return thresholds.sugar_max;
      default: return null;
    }
  };

  // Active nutrients for reference lines
  const activeNutrients = Object.entries(enabledNutrients)
    .filter(([, enabled]) => enabled)
    .map(([nutrient]) => nutrient);

  if (isLoading) {
    return (
      <div className="page charts-page">
        <Header title="Dragon's Scroll" subtitle="View your nutrition history" />
        <div className="loading-container">
          <p>Loading your scroll...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page charts-page">
      <Header title="Dragon's Scroll" subtitle="View your nutrition history" />
      
      {/* Date Range Selector */}
      <div className="card chart-controls">
        <div className="control-row">
          <div className="control-group">
            <label>Time Period</label>
            <div className="button-group">
              {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                <button
                  key={key}
                  className={`btn ${dateRange === key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDateRange(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Custom Date Picker */}
        {dateRange === 'custom' && (
          <div className="control-row custom-dates">
            <div className="date-input">
              <label>From</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div className="date-input">
              <label>To</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
        
        {/* Grouping Options */}
        <div className="control-row">
          <div className="control-group">
            <label>Group By</label>
            <div className="button-group">
              {Object.entries(GROUPING_OPTIONS).map(([key, { label }]) => (
                <button
                  key={key}
                  className={`btn btn-small ${grouping === key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setGrouping(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Nutrient Toggles */}
      <div className="card nutrient-toggles">
        <label>Nutrients</label>
        <div className="toggle-grid">
          {Object.entries(NUTRIENTS).filter(([key]) => key !== 'hydration').map(([key, { icon, label }]) => (
            <button
              key={key}
              className={`nutrient-toggle ${enabledNutrients[key] ? 'active' : ''}`}
              style={{ 
                borderColor: enabledNutrients[key] ? CHART_COLORS[key] : 'var(--color-border)',
                backgroundColor: enabledNutrients[key] ? `${CHART_COLORS[key]}20` : 'transparent',
              }}
              onClick={() => toggleNutrient(key)}
            >
              <span className="nutrient-icon">{icon}</span>
              <span className="nutrient-label">{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      <div className="card chart-container">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                tickLine={{ stroke: 'var(--color-border)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                tickLine={{ stroke: 'var(--color-border)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Threshold Reference Lines */}
              {activeNutrients.map(nutrient => {
                const threshold = getThresholdValue(nutrient);
                if (!threshold) return null;
                return (
                  <ReferenceLine
                    key={`ref-${nutrient}`}
                    y={threshold}
                    stroke={CHART_COLORS[nutrient]}
                    strokeDasharray="5 5"
                    strokeOpacity={0.6}
                  />
                );
              })}
              
              {/* Data Lines */}
              {Object.entries(enabledNutrients).map(([nutrient, enabled]) => {
                if (!enabled) return null;
                return (
                  <Line
                    key={nutrient}
                    type="monotone"
                    dataKey={nutrient}
                    name={NUTRIENTS[nutrient].label}
                    stroke={CHART_COLORS[nutrient]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[nutrient], strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            <p className="text-muted">No data for selected period</p>
            <p className="text-small">Log some meals to see your nutrition trends!</p>
          </div>
        )}
      </div>
      
      {/* Legend with thresholds */}
      {chartData.length > 0 && (
        <div className="card chart-legend">
          <h3>Daily Targets</h3>
          <div className="legend-grid">
            {activeNutrients.map(nutrient => {
              const threshold = getThresholdValue(nutrient);
              if (!threshold) return null;
              return (
                <div key={nutrient} className="legend-item">
                  <span 
                    className="legend-color" 
                    style={{ backgroundColor: CHART_COLORS[nutrient] }}
                  />
                  <span className="legend-label">
                    {NUTRIENTS[nutrient].icon} {NUTRIENTS[nutrient].label}
                  </span>
                  <span className="legend-value">
                    {threshold}{NUTRIENTS[nutrient].unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Export Button */}
      {chartData.length > 0 && (
        <button className="btn btn-secondary export-btn" onClick={exportData}>
          📤 Export Scroll as CSV
        </button>
      )}
    </div>
  );
}
