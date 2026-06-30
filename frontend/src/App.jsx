import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  return (
    // <div className="min-h-screen bg-gray-900 text-white font-sans">
    <div className="min-h-screen bg-theme-bg text-white font-sans">

      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
