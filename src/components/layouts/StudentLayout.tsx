import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { FiHome, FiBook, FiPlusCircle, FiBarChart2, FiLogOut, FiMenu, FiX, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';

export function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const navItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { path: '/student/quizzes', label: 'My Quizzes', icon: <FiBook className="w-5 h-5" /> },
    { path: '/student/quizzes/create', label: 'Create Quiz', icon: <FiPlusCircle className="w-5 h-5" /> },
    { path: '/student/analytics', label: 'My Performance', icon: <FiBarChart2 className="w-5 h-5" /> },
    { path: '/student/community', label: 'Community', icon: <FiUsers className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className={`fixed top-0 w-full z-10 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0"
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Student Portal
                </h1>
              </motion.div>
              
              {/* Mobile menu button */}
              <div className="md:hidden ml-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  {isMobileMenuOpen ? 
                    <FiX className="w-6 h-6" /> : 
                    <FiMenu className="w-6 h-6" />
                  }
                </button>
              </div>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <NavLink 
                  key={item.path}
                  to={item.path}
                  isActive={
                    item.path === '/student/analytics' 
                      ? location.pathname.includes(item.path)
                      : location.pathname === item.path
                  }
                  icon={item.icon}
                  label={item.label}
                />
              ))}
            </div>
            
            {/* User profile and logout */}
            <div className="flex items-center space-x-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="hidden md:flex items-center space-x-3"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow"
              >
                <FiLogOut className="mr-2 h-4 w-4" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    (item.path === '/student/analytics' 
                      ? location.pathname.includes(item.path)
                      : location.pathname === item.path)
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-sm rounded-lg p-6"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}

// NavLink component for desktop navigation
function NavLink({ to, isActive, icon, label }: { 
  to: string; 
  isActive: boolean; 
  icon: React.ReactNode; 
  label: string 
}) {
  return (
    <Link
      to={to}
      className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 group`}
    >
      <div className="flex items-center">
        <span className={`mr-2 ${isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
          {icon}
        </span>
        <span className={isActive ? 'text-indigo-700' : 'text-gray-600 group-hover:text-gray-900'}>
          {label}
        </span>
      </div>
      
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  );
}