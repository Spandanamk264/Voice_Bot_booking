import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.email === 'admin@sarvamhealth.com';
  const [menuOpen, setMenuOpen] = useState(false);

  const currentPage = location.pathname === '/bookings' ? 'bookings' 
    : location.pathname === '/admin' ? 'admin' 
    : 'voice';

  const handleNav = (path) => (e) => {
    e.preventDefault();
    navigate(path);
    setMenuOpen(false);
  };

  const navLinkClass = (page) => 
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      currentPage === page
        ? 'text-saffron-500 bg-saffron-500/[0.08]'
        : 'text-dark-200 hover:text-dark-50 hover:bg-white/[0.03]'
    }`;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.04]" style={{ background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" onClick={handleNav('/')} className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-500 to-orange-500 flex items-center justify-center shadow-lg shadow-saffron-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-dark-50 group-hover:text-saffron-500 transition-colors">
            Sarvam<span className="text-saffron-500">Health</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          <a href="/" onClick={handleNav('/')} className={navLinkClass('voice')}>Voice Assistant</a>
          {!isAdmin && (
            <a href="/bookings" onClick={handleNav('/bookings')} className={navLinkClass('bookings')}>My Bookings</a>
          )}
          {isAdmin && (
            <a href="/admin" onClick={handleNav('/admin')} className={navLinkClass('admin')}>Admin Dashboard</a>
          )}
        </div>

        {/* Desktop User profile & Logout */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-white">{user?.full_name || 'Patient'}</span>
            <span className="text-xs text-saffron-500">{user?.email || ''}</span>
          </div>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-dark-300 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Mobile: Hamburger button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] text-dark-200"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.04] px-4 pb-4 pt-3 space-y-2" style={{ background: 'rgba(10, 10, 15, 0.98)' }}>
          <a href="/" onClick={handleNav('/')} className={`block ${navLinkClass('voice')}`}>Voice Assistant</a>
          {!isAdmin && (
            <a href="/bookings" onClick={handleNav('/bookings')} className={`block ${navLinkClass('bookings')}`}>My Bookings</a>
          )}
          {isAdmin && (
            <a href="/admin" onClick={handleNav('/admin')} className={`block ${navLinkClass('admin')}`}>Admin Dashboard</a>
          )}

          <div className="border-t border-white/[0.05] pt-3 mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{user?.full_name || 'Patient'}</p>
              <p className="text-xs text-saffron-500">{user?.email || ''}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); setMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
