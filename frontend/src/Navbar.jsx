import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="bg-theme-card p-4 shadow-lg border-b border-theme-border sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-400">AI Face Scanner</h1>
                <div className="space-x-6">
                    <Link to="/" className="text-gray-300 hover:text-white font-semibold transition">Scanner</Link>
                    <Link to="/about" className="text-gray-300 hover:text-white font-semibold transition">How It Works</Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
