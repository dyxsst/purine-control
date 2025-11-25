import Header from '../../components/Header/Header';
import EmberMascot from '../../components/EmberMascot/EmberMascot';
import './Oracle.css';

export default function Oracle() {
  return (
    <div className="page oracle-page">
      <Header 
        title="Dragon Oracle" 
        subtitle="Get meal recommendations"
      />
      
      <div className="coming-soon card">
        <EmberMascot state="curious" />
        <h2>Coming Soon!</h2>
        <p className="text-muted">
          The Dragon Oracle will suggest meals based on your remaining nutrition budget.
        </p>
        <ul className="feature-list">
          <li>🏺 Familiar meals you love</li>
          <li>🌟 Twisted versions of favorites</li>
          <li>🎲 Wild new adventures</li>
          <li>🔮 AI-powered recommendations</li>
        </ul>
      </div>
    </div>
  );
}
