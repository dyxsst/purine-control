import Header from '../../components/Header/Header';
import EmberMascot from '../../components/EmberMascot/EmberMascot';
import './Charts.css';

export default function Charts() {
  return (
    <div className="page charts-page">
      <Header 
        title="Dragon's Scroll" 
        subtitle="View your nutrition history"
      />
      
      <div className="coming-soon card">
        <EmberMascot state="curious" />
        <h2>Coming Soon!</h2>
        <p className="text-muted">
          The Dragon's Scroll will show beautiful charts of your nutrition history.
        </p>
        <ul className="feature-list">
          <li>📅 View by week, month, or custom range</li>
          <li>📊 Daily, weekly, or monthly grouping</li>
          <li>🔍 Filter by nutrient type</li>
          <li>📤 Export your data</li>
        </ul>
      </div>
    </div>
  );
}
