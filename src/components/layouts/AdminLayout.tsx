import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-indigo-600">Quiz Admin</h1>
            </div>
            <div className="hidden md:flex space-x-6">
              <Link
                to="/admin/questions"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  location.pathname.includes('/admin/questions') && !location.pathname.includes('/create') && !location.pathname.includes('/upload')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                View Questions
              </Link>
              <Link
                to="/admin/questions/create"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  location.pathname === '/admin/questions/create'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Create Question
              </Link>
              <Link
                to="/admin/questions/upload"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  location.pathname === '/admin/questions/upload'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Bulk Upload
              </Link>
              <Link
                to="/admin/quizzes/create"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  location.pathname === '/admin/quizzes/create'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Quiz Builder
              </Link>
              <Link
                to="/admin/quizzes"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  location.pathname === '/admin/quizzes'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                View Quizzes
              </Link>
              <Link
                to="/admin/tags"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  location.pathname === '/admin/tags'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Manage Tags
              </Link>
              <Link
                to="/admin/users"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  location.pathname === '/admin/users'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Manage Users
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}