import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { FiMenu, FiX, FiHome, FiList, FiPlus, FiUpload, FiBox, FiTag, FiUsers, FiLogOut, FiMessageSquare } from 'react-icons/fi';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { path: '/admin/questions', label: 'View Questions', icon: <FiList className="w-5 h-5" /> },
    { path: '/admin/questions/create', label: 'Create Question', icon: <FiPlus className="w-5 h-5" /> },
    { path: '/admin/questions/upload', label: 'Bulk Upload', icon: <FiUpload className="w-5 h-5" /> },
    { path: '/admin/quizzes/create', label: 'Quiz Builder', icon: <FiPlus className="w-5 h-5" /> },
    { path: '/admin/quizzes', label: 'View Quizzes', icon: <FiBox className="w-5 h-5" /> },
    { path: '/admin/tags', label: 'Manage Tags', icon: <FiTag className="w-5 h-5" /> },
    { path: '/admin/users', label: 'Manage Users', icon: <FiUsers className="w-5 h-5" /> },
    { path: '/admin/community', label: 'Community', icon: <FiMessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-800 to-indigo-900 text-white transition-all duration-300 ease-in-out fixed h-full z-10 overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          <h1 className={`text-xl font-bold ${sidebarOpen ? 'block' : 'hidden'}`}>Quiz Admin</h1>
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-blue-700 focus:outline-none">
            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="mt-5">
          <div className="px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-3 px-4 rounded-md transition-colors duration-150 ${
                  (location.pathname === item.path || 
                   (item.path === '/admin/questions' && location.pathname.includes('/admin/questions') && 
                    !location.pathname.includes('/create') && !location.pathname.includes('/upload')) ||
                   (item.path === '/admin/community' && location.pathname.includes('/admin/community')))
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {navItems.find(item => 
                    location.pathname === item.path || 
                    (item.path === '/admin/questions' && location.pathname.includes('/admin/questions') && 
                     !location.pathname.includes('/create') && !location.pathname.includes('/upload')) ||
                    (item.path === '/admin/community' && location.pathname.includes('/admin/community'))
                  )?.label || 'Dashboard'}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-md">
                  {user?.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                  <FiLogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}