// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import SnakeGame from './pages/SnakeGame';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/snake-game" element={<SnakeGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;