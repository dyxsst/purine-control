import { NUTRIENTS } from '../../lib/nutrition';
import { getStatusLevel } from '../../lib/theme';
import './ProgressBar.css';

export default function NutrientProgress({ 
  nutrient, 
  value, 
  target, 
  min = 0,
  max,
  showLabel = true,
  compact = false 
}) {
  const info = NUTRIENTS[nutrient] || { icon: '📊', unit: '', label: nutrient };
  const maxValue = max || target;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const status = getStatusLevel(value, min, maxValue);
  
  return (
    <div className={`nutrient-progress ${compact ? 'compact' : ''}`}>
      {showLabel && (
        <div className="nutrient-header">
          <span className="nutrient-label">
            <span className="nutrient-icon">{info.icon}</span>
            <span className="nutrient-name">{info.label}</span>
          </span>
          <span className="nutrient-value">
            <span className="current">{Math.round(value)}</span>
            <span className="separator">/</span>
            <span className="target">{Math.round(maxValue)}</span>
            <span className="unit">{info.unit}</span>
          </span>
        </div>
      )}
      <div className="progress-bar">
        <div 
          className={`progress-bar-fill ${status}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!compact && (
        <div className="nutrient-footer">
          <span className={`status-indicator ${status}`}>
            {status === 'success' && '✓'}
            {status === 'warning' && '⚠️'}
            {status === 'danger' && '🔴'}
          </span>
          <span className="percentage">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}
