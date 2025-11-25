import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Diary from './pages/Diary/Diary';
import Charts from './pages/Charts/Charts';
import Oracle from './pages/Oracle/Oracle';
import Settings from './pages/Settings/Settings';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter basename="/purine-control">
      <div className="app">
        <Routes>
          <Route path="/" element={<Diary />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/oracle" element={<Oracle />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;