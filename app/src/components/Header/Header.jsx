import './Header.css';

export default function Header({ title, subtitle, action }) {
  return (
    <header className="header">
      <div className="header-content">
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
