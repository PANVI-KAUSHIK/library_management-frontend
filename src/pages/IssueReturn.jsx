import React, { useEffect, useState } from 'react';
import api from '../api';
import { format } from 'date-fns';

function IssueReturn() {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [form, setForm] = useState({ memberId: '', bookId: '', dueDate: '' });
  const [returnId, setReturnId] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [filterMemberId, setFilterMemberId] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, booksRes, issuesRes] = await Promise.all([
        api.get('/members').catch(() => ({ data: [] })),
        api.get('/books').catch(() => ({ data: [] })),
        api.get('/issues').catch(() => ({ data: [] }))
      ]);
      setMembers(membersRes.data || []);
      setBooks(booksRes.data || []);
      setIssues(issuesRes.data || []);
    } catch {
      setMessage({ text: 'Error loading library data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectBook = (bookId) => {
    setForm(prev => ({ ...prev, bookId: String(bookId) }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIssue = e => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!form.memberId || !form.bookId || !form.dueDate) {
      setMessage({ text: 'Please select a Member, a Book, and a Due Date', type: 'error' });
      return;
    }

    // Format date with end of day time for Jackson LocalDateTime compatibility
    const formattedDueDate = form.dueDate.includes('T')
      ? form.dueDate
      : `${form.dueDate}T23:59:59`;

    api.post('/issues', {
      memberId: parseInt(form.memberId, 10),
      bookId: parseInt(form.bookId, 10),
      dueDate: formattedDueDate
    })
      .then(() => {
        setMessage({ text: 'Book issued successfully to student!', type: 'success' });
        fetchData();
        setForm(prev => ({ ...prev, bookId: '', dueDate: '' }));
      })
      .catch(err => {
        const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to issue book';
        setMessage({ text: errMsg, type: 'error' });
      });
  };

  const handleReturn = (idToReturn) => {
    const targetId = idToReturn || returnId;
    if (!targetId) {
      setMessage({ text: 'Please enter or select an Issue ID to return', type: 'error' });
      return;
    }

    setMessage({ text: '', type: '' });
    api.put(`/issues/${targetId}/return`)
      .then(() => {
        setMessage({ text: `Issue #${targetId} marked as returned successfully!`, type: 'success' });
        fetchData();
        setReturnId('');
      })
      .catch(err => {
        const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to return book';
        setMessage({ text: errMsg, type: 'error' });
      });
  };

  // Filter displayed issues based on filterMemberId if set
  const displayedIssues = filterMemberId
    ? issues.filter(issue => issue.member?.id === parseInt(filterMemberId, 10))
    : issues;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issue & Return Books</h1>
          <p className="text-sm text-gray-500">Lend books to students, track due dates, and record returns</p>
        </div>
        <button
          onClick={fetchData}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded cursor-pointer transition font-medium"
        >
          🔄 Refresh Data
        </button>
      </div>

      {message.text && (
        <div
          className={`p-3.5 rounded-lg text-sm font-medium shadow-sm transition ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600'
              : 'bg-red-50 text-red-700 border-l-4 border-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Forms Section: Issue & Quick Return */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue Book Form */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Issue Book to Student</h2>
          <form onSubmit={handleIssue} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Member <span className="text-red-500">*</span>
              </label>
              <select
                name="memberId"
                value={form.memberId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
              >
                <option value="">-- Choose Member ({members.length} registered) --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Class: {m.studentClass || 'N/A'}, Sec: {m.section || 'N/A'}, Roll: {m.rollNo || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Book <span className="text-red-500">*</span>
              </label>
              <select
                name="bookId"
                value={form.bookId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
              >
                <option value="">-- Choose Book ({books.length} in catalog) --</option>
                {books.map(b => (
                  <option
                    key={b.id}
                    value={b.id}
                    disabled={b.availableCopies <= 0}
                  >
                    {b.title} by {b.author} ({b.availableCopies} available {b.availableCopies <= 0 ? '- OUT OF STOCK' : ''})
                  </option>
                ))}
              </select>
              {books.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No books currently in catalog. Please add books in the Book Management tab first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
            >
              Issue Book
            </button>
          </form>
        </div>

        {/* Quick Return by ID */}
        <div className="card flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Return by ID</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleReturn();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Transaction ID</label>
                <input
                  type="number"
                  placeholder="Enter Issue ID number"
                  value={returnId}
                  onChange={e => setReturnId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow transition cursor-pointer text-sm"
              >
                Process Return
              </button>
            </form>
          </div>
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-xs leading-relaxed border border-blue-100">
            💡 <strong>Quick Return</strong>: You can also click the green <strong>Return Book</strong> button directly on any loan record in the table below.
          </div>
        </div>
      </div>

      {/* Available Books in Library */}
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Available Books in Library ({books.length})
          </h2>
          <span className="text-xs text-gray-500">
            Click 'Select for Issue' on any available title
          </span>
        </div>

        {books.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No books found in the catalog.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-emerald-800 text-white">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold">ID</th>
                <th className="px-4 py-2.5 text-left font-semibold">Title</th>
                <th className="px-4 py-2.5 text-left font-semibold">Author</th>
                <th className="px-4 py-2.5 text-left font-semibold">Category</th>
                <th className="px-4 py-2.5 text-center font-semibold">Stock</th>
                <th className="px-4 py-2.5 text-center font-semibold">Available</th>
                <th className="px-4 py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {books.map(b => (
                <tr
                  key={b.id}
                  className={`hover:bg-gray-50 transition ${
                    form.bookId === String(b.id) ? 'bg-emerald-50' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 text-gray-500 font-mono">#{b.id}</td>
                  <td className="px-4 py-2.5 font-semibold text-gray-900">{b.title}</td>
                  <td className="px-4 py-2.5 text-gray-600">{b.author}</td>
                  <td className="px-4 py-2.5 text-gray-600">{b.category || 'General'}</td>
                  <td className="px-4 py-2.5 text-center text-gray-700">{b.totalCopies}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        b.availableCopies > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {b.availableCopies} available
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleSelectBook(b.id)}
                      disabled={b.availableCopies <= 0}
                      className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                        form.bookId === String(b.id)
                          ? 'bg-emerald-700 text-white font-bold'
                          : b.availableCopies > 0
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {form.bookId === String(b.id) ? '✓ Selected' : 'Select for Issue'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* All Issued Books & Loans History */}
      <div className="card overflow-x-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Loan Transactions & History ({displayedIssues.length})
          </h2>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-500 font-medium">Filter by Member:</span>
            <select
              value={filterMemberId}
              onChange={e => setFilterMemberId(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded bg-white text-xs"
            >
              <option value="">All Members</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} (Roll: {m.rollNo})</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 py-4 text-center">Loading transactions...</p>
        ) : displayedIssues.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No loan records found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-emerald-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Issue ID</th>
                <th className="px-4 py-3 text-left font-semibold">Student Member</th>
                <th className="px-4 py-3 text-left font-semibold">Book Title</th>
                <th className="px-4 py-3 text-left font-semibold">Issue Date</th>
                <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {displayedIssues.map(issue => (
                <tr key={issue.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-gray-500 font-bold">#{issue.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{issue.member?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Roll: {issue.member?.rollNo || 'N/A'} (Class: {issue.member?.studentClass || 'N/A'})</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {issue.book?.title || 'Unknown Title'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {issue.issueDate ? format(new Date(issue.issueDate), 'MMM dd, yyyy') : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {issue.dueDate ? format(new Date(issue.dueDate), 'MMM dd, yyyy') : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        issue.status === 'ISSUED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {issue.status === 'ISSUED' ? (
                      <button
                        onClick={() => handleReturn(issue.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer transition shadow-sm"
                      >
                        Return Book
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Returned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default IssueReturn;
