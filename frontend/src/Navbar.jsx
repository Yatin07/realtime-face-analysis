import { Link, useLocation } from 'react-router-dom';
import { Aperture } from 'lucide-react';

function Navbar() {
    const location = useLocation();

    return (
        <nav className="bg-[#0A0B09] p-4 border-b border-[#2A2B27] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-2 text-white font-mono font-bold tracking-widest text-sm">
                    <Aperture className="text-theme-lime" size={20} />
                    <span>FACE.ANALYZER</span>
                </div>
                <div className="flex items-center space-x-6">
                    <Link 
                        to="/" 
                        className={`font-medium text-sm transition pb-1 border-b-2 ${location.pathname === '/' ? 'text-theme-lime border-theme-lime' : 'text-gray-400 border-transparent hover:text-white'}`}
                    >
                        Scanner
                    </Link>
                    <Link 
                        to="/about" 
                        className={`font-medium text-sm transition pb-1 border-b-2 ${location.pathname === '/about' ? 'text-theme-lime border-theme-lime' : 'text-gray-400 border-transparent hover:text-white'}`}
                    >
                        How it works
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
