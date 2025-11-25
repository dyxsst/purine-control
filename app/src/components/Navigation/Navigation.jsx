import { NavLink } from 'react-router-dom';
import './Navigation.css';

const NAV_ITEMS = [
  { path: '/', icon: '🍽️', label: 'Diary' },
  { path: '/charts', icon: '📊', label: 'Scroll' },
  { path: '/oracle', icon: '🔮', label: 'Oracle' },
  { path: '/settings', icon: '⚙️', label: 'Lair' },
];

export default function Navigation() {
  return (
    <nav className="nav-bar">
      {NAV_ITEMS.map(item => (
        <NavLink 
          key={item.path}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
