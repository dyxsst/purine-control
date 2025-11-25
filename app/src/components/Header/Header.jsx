import './Header.css';

export default function Header({ title, subtitle, action, showBack, onBack }) {
  return (
    <header className="header">
      <div className="header-content">
        {showBack && (
          <button className="header-back" onClick={onBack} aria-label="Go back">
            ←
          </button>
        )}
        <div className="header-title-group">
          <h1 className="header-title">
            <span className="header-dragon">🐉</span> {title}
          </h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
        {action && <div className="header-action">{action}</div>}
      </div>
    </header>
  );
}
