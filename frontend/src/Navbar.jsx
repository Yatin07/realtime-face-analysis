import { Link } from 'react-router-dom';
import { Aperture, MoreHorizontal } from 'lucide-react';

function Navbar() {
    return (
        <nav className="bg-[#0A0B09] p-4 border-b border-[#2A2B27] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-2 text-white font-mono font-bold tracking-widest text-sm">
                    <Aperture className="text-theme-lime" size={20} />
                    <span>FACE.ANALYZER</span>
                </div>
                <div className="flex items-center space-x-6">
                    <Link to="/" className="text-gray-400 hover:text-white font-medium text-sm transition">Scanner</Link>
                    <Link to="/about" className="text-gray-400 hover:text-white font-medium text-sm transition">How it works</Link>
                    <button className="bg-white text-black p-1 rounded hover:bg-gray-200 transition">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
