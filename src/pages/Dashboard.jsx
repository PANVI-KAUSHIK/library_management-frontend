import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ books: 0, members: 0, issued: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, membersRes, issuesRes] = await Promise.all([
          api.get('/books/count'),
          api.get('/members/count'),
          api.get('/issues/count')
        ]);
        setStats({
          books: booksRes.data,
          members: membersRes.data,
          issued: issuesRes.data
        });
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
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

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
        {error}
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
      </div>

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