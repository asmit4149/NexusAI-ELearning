import { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, BrainCircuit, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ theme, toggleTheme }) => {
  const { user, logout } = useContext(AuthContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'glass-panel border-b border-white/20 dark:border-slate-800/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 p-1.5 shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-110 group-hover:shadow-primary-500/50">
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <BrainCircuit className="h-6 w-6 text-white relative z-10" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">AI</span>
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors">Platform</Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors">Pricing</Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors">Enterprise</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          {user ? (
            <div className="flex items-center gap-4 ml-2 pl-4 border-l border-slate-200 dark:border-slate-700">
              <Link to="/dashboard" className="text-sm font-medium text-slate-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
                Dashboard
              </Link>
              <Link to="/recommendations" className="text-sm font-medium text-slate-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
                Recommendations
              </Link>
              <Link to="/certificates" className="text-sm font-medium text-slate-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
                Certificates
              </Link>
              <Link to="/study-planner" className="text-sm font-medium text-slate-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
                Study Planner
              </Link>
              {(user.role === 'Instructor' || user.role === 'Admin') && (
                <>
                  <Link to="/instructor-analytics" className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
                    Analytics
                  </Link>
                  <Link to="/instructor/create-challenge" className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                    Create Challenge
                  </Link>
                </>
              )}
              <button
                onClick={logout}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-all shadow-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-2 pl-4 border-l border-slate-200 dark:border-slate-700">
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
                Sign in
              </Link>
              <Link
                to="/register"
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-105 hover:shadow-primary-500/50"
              >
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 overflow-hidden"
          >
            <div className="flex flex-col px-4 pt-2 pb-6 space-y-4">
              <Link to="/" className="text-base font-medium text-slate-700 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">Platform</Link>
              <Link to="/" className="text-base font-medium text-slate-700 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">Pricing</Link>
              <Link to="/" className="text-base font-medium text-slate-700 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">Enterprise</Link>
              
              <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-2"></div>
              
              {user ? (
                <>
                  <Link to="/dashboard" className="text-base font-medium text-primary-600 dark:text-primary-400 p-2">Dashboard</Link>
                  <Link to="/recommendations" className="text-base font-medium text-primary-600 dark:text-primary-400 p-2">Recommendations</Link>
                  <Link to="/certificates" className="text-base font-medium text-primary-600 dark:text-primary-400 p-2">Certificates</Link>
                  <Link to="/study-planner" className="text-base font-medium text-primary-600 dark:text-primary-400 p-2">Study Planner</Link>
                  {(user.role === 'Instructor' || user.role === 'Admin') && (
                    <>
                      <Link to="/instructor-analytics" className="text-base font-medium text-amber-600 dark:text-amber-400 p-2">Analytics</Link>
                      <Link to="/instructor/create-challenge" className="text-base font-medium text-purple-600 dark:text-purple-400 p-2">Create Challenge</Link>
                    </>
                  )}
                  <button onClick={logout} className="w-full text-left p-2 text-base font-medium text-slate-700 dark:text-slate-300">Logout</button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Link to="/login" className="flex items-center justify-center rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">Sign in</Link>
                  <Link to="/register" className="flex items-center justify-center rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white dark:bg-primary-500">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
