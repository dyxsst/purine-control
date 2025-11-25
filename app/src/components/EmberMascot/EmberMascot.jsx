import './EmberMascot.css';

const EMBER_STATES = {
  curious: {
    emoji: '🐉',
    animation: 'sniff',
    message: 'Your dragon is looking for food...',
  },
  happy: {
    emoji: '🐉',
    animation: 'bounce',
    message: 'Your dragon is happy!',
  },
  satisfied: {
    emoji: '🐉',
    animation: 'pulse',
    message: 'Your dragon is satisfied and content.',
  },
  stuffed: {
    emoji: '🐉',
    animation: 'wobble',
    message: 'Your dragon ate too much!',
  },
  sick: {
    emoji: '🤢',
    animation: 'shake',
    message: 'Your dragon isn\'t feeling well...',
  },
  celebrating: {
    emoji: '🐉',
    animation: 'celebrate',
    message: 'Your dragon is celebrating! 🎉',
  },
  hoarding: {
    emoji: '🐉',
    animation: 'hoard',
    message: 'Saved to your dragon\'s hoard!',
  },
};

export default function EmberMascot({ state = 'happy', showMessage = true, size = 'medium' }) {
  const emberState = EMBER_STATES[state] || EMBER_STATES.happy;
  
  return (
    <div className={`ember-mascot ${size}`}>
      <div className={`ember-emoji ${emberState.animation}`}>
        {emberState.emoji}
        {state === 'sick' && <span className="ember-effect">💨</span>}
        {state === 'celebrating' && <span className="ember-effect">✨</span>}
        {state === 'happy' && <span className="ember-effect">🔥</span>}
      </div>
      {showMessage && (
        <p className="ember-message">{emberState.message}</p>
      )}
    </div>
  );
}

// Helper to determine Ember's state based on nutrition status
export function getEmberState(totals, thresholds) {
  if (!totals || !thresholds) return 'curious';
  
  const caloriePercent = totals.calories / thresholds.calories_max;
  const purinePercent = totals.purines / thresholds.purines_max;
  
  if (purinePercent > 1.0) return 'sick';
  if (caloriePercent > 1.0) return 'stuffed';
  if (purinePercent > 0.8 || caloriePercent > 0.8) return 'satisfied';
  if (totals.calories === 0) return 'curious';
  return 'happy';
}
