import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ books: 0, members: 0, issued: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [booksRes, membersRes, issuesRes] = await Promise.all([
        api.get('/books/count'),
        api.get('/members/count'),
        api.get('/issues/count')
      ]);
      setStats({
        books: typeof booksRes.data === 'number' ? booksRes.data : parseInt(booksRes.data, 10) || 0,
        members: typeof membersRes.data === 'number' ? membersRes.data : parseInt(membersRes.data, 10) || 0,
        issued: typeof issuesRes.data === 'number' ? issuesRes.data : parseInt(issuesRes.data, 10) || 0
      });
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setError('Session expired or unauthorized (HTTP ' + status + '). Please sign in again.');
      } else if (status === 404) {
        setError('Statistics endpoints not found (HTTP 404). Please verify backend routing.');
      } else if (status >= 500) {
        setError('Server temporarily unable to load metrics (HTTP ' + status + '). Please retry.');
      } else if (err.code === 'ERR_NETWORK' || (err.message && err.message.toLowerCase().includes('network'))) {
        setError('Network connectivity issue. Unable to connect to backend server.');
      } else {
        setError('Failed to load dashboard stats (HTTP ' + (status || 'Error') + ').');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-800 font-medium">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3"></div>
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library Overview</h1>
          <p className="text-sm text-gray-500">Real-time statistics of books, registered members, and active loans</p>
        </div>
        <button
          onClick={fetchStats}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded cursor-pointer transition font-medium"
        >
          🔄 Refresh Stats
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex justify-between items-center shadow-sm">
          <div>
            <p className="font-semibold text-sm">Dashboard Notice</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchStats}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-semibold cursor-pointer transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card border-l-4 border-emerald-600 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Books</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.books}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-2xl">
            📚
          </div>
        </div>

        <div className="card border-l-4 border-blue-600 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Registered Members</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.members}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-2xl">
            👥
          </div>
        </div>

        <div className="card border-l-4 border-amber-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Books Issued</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.issued}</p>
          </div>
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-2xl">
            🔄
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/books"
            className="p-4 border border-gray-200 rounded-lg hover:border-emerald-600 hover:shadow transition bg-white block"
          >
            <h3 className="font-semibold text-emerald-800">📖 Manage Books</h3>
            <p className="text-xs text-gray-500 mt-1">Add new titles, edit details, or update inventories.</p>
          </Link>
          <Link
            to="/members"
            className="p-4 border border-gray-200 rounded-lg hover:border-emerald-600 hover:shadow transition bg-white block"
          >
            <h3 className="font-semibold text-emerald-800">👥 Manage Members</h3>
            <p className="text-xs text-gray-500 mt-1">View registered students, update details and contacts.</p>
          </Link>
          <Link
            to="/issue"
            className="p-4 border border-gray-200 rounded-lg hover:border-emerald-600 hover:shadow transition bg-white block"
          >
            <h3 className="font-semibold text-emerald-800">🔄 Issue / Return Books</h3>
            <p className="text-xs text-gray-500 mt-1">Lend books to students and process returned titles.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}