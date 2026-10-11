import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api';

export default function Layout({ children, user, setUser }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    api.post('/auth/logout')
      .then(() => {
        setUser(null);
        navigate('/login');
      })
      .catch(() => {
        setUser(null);
        navigate('/login');
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="bg-emerald-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📚</span>
            <Link to={user ? "/dashboard" : "/login"} className="text-xl font-bold tracking-tight hover:text-emerald-100 transition">
              Library Management System
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="relative flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProfile(!showProfile)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium px-3 py-1.5 rounded-md flex items-center space-x-2 border border-emerald-600 cursor-pointer transition"
                >
                  <span>👤 {user.name || user.username}</span>
                  <span className="text-xs">▼</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-emerald-950 hover:bg-black text-white text-sm font-medium px-3.5 py-1.5 rounded-md cursor-pointer transition"
                >
                  Logout
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <div className="absolute right-0 top-11 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 text-gray-800 animate-in fade-in duration-150">
                    <div className="border-b border-gray-100 pb-2 mb-3">
                      <p className="font-semibold text-gray-900">{user.name || 'User Profile'}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Class:</span>
                        <span className="font-medium text-gray-800">{user.studentClass || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Section:</span>
                        <span className="font-medium text-gray-800">{user.section || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Roll No:</span>
                        <span className="font-medium text-gray-800">{user.rollNo || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="bg-white text-emerald-800 hover:bg-emerald-50 text-sm font-medium px-3.5 py-1.5 rounded-md transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium px-3.5 py-1.5 rounded-md transition border border-emerald-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Bar for authenticated sessions */}
      {user && (
        <nav className="bg-emerald-700 text-white shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2 py-2 text-sm font-medium">
            <Link to="/dashboard" className="px-3 py-1.5 rounded hover:bg-emerald-600 transition">
              📊 Dashboard
            </Link>
            <Link to="/books" className="px-3 py-1.5 rounded hover:bg-emerald-600 transition">
              📖 Book Management
            </Link>
            <Link to="/members" className="px-3 py-1.5 rounded hover:bg-emerald-600 transition">
              👥 Member Management
            </Link>
            <Link to="/issue" className="px-3 py-1.5 rounded hover:bg-emerald-600 transition">
              🔄 Issue / Return
            </Link>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-500">
        Library Management System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
