import React, { useEffect, useState } from 'react';
import api from '../api';

function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const fetchBooks = () => {
    setLoading(true);
    api.get('/books')
      .then(res => setBooks(res.data))
      .catch(() => setMessage({ text: 'Failed to load books catalog', type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      author: '',
      isbn: '',
      category: '',
      totalCopies: ''
    });
    setEditingId(null);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateIsbn = () => {
    // Generate a random 13-digit ISBN format
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    setForm(prev => ({ ...prev, isbn: `978${randomDigits}` }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim() || !form.totalCopies) {
      setMessage({ text: 'Please fill in all required fields (Title, Author, ISBN, Total Copies)', type: 'error' });
      return;
    }

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      category: form.category.trim() || 'General',
      totalCopies: parseInt(form.totalCopies, 10) || 1
    };

    if (editingId) {
      api.put(`/books/${editingId}`, payload)
        .then(() => {
          setMessage({ text: 'Book updated successfully!', type: 'success' });
          fetchBooks();
          resetForm();
        })
        .catch(err => {
          const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update book. Please check details.';
          setMessage({ text: errMsg, type: 'error' });
        });
    } else {
      api.post('/books', payload)
        .then(() => {
          setMessage({ text: 'Book added to library catalog successfully!', type: 'success' });
          fetchBooks();
          resetForm();
        })
        .catch(err => {
          const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to add book. Ensure the ISBN is unique.';
          setMessage({ text: errMsg, type: 'error' });
        });
    }
  };

  const handleEdit = book => {
    setForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || '',
      totalCopies: book.totalCopies != null ? book.totalCopies : ''
    });
    setEditingId(book.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      api.delete(`/books/${id}`)
        .then(() => {
          setMessage({ text: 'Book deleted successfully', type: 'success' });
          fetchBooks();
        })
        .catch(err => setMessage({ text: err.response?.data?.message || 'Delete failed', type: 'error' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Management</h1>
          <p className="text-sm text-gray-500">Add new books to inventory, track copies, and manage library catalog</p>
        </div>
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

      {/* Book Form Card */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {editingId ? 'Edit Book Details' : 'Add New Book'}
          </h2>
          {editingId && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
              Editing Book #{editingId}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Introduction to Algorithms"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="author"
              placeholder="e.g. Thomas H. Cormen"
              value={form.author}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">
                ISBN <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateIsbn}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline"
              >
                Auto Generate
              </button>
            </div>
            <input
              type="text"
              name="isbn"
              placeholder="e.g. 9780262033848"
              value={form.isbn}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category / Genre</label>
            <input
              type="text"
              name="category"
              placeholder="e.g. Computer Science, Fiction, Science"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Copies <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalCopies"
              placeholder="Total stock quantity"
              value={form.totalCopies}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
            />
          </div>

          <div className="md:col-span-3 flex items-center space-x-3 pt-2">
            <button
              type="submit"
              className="btn-primary"
            >
              {editingId ? 'Update Book' : 'Add Book'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-outline"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Book Catalog Table */}
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Book Catalog ({books.length})
          </h2>
          <button
            onClick={fetchBooks}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded cursor-pointer transition font-medium"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Loading books catalog...</p>
        ) : books.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <span className="text-3xl block mb-2">📚</span>
            <p className="font-medium">No books in catalog yet</p>
            <p className="text-xs text-gray-400 mt-1">Use the form above to add your first book.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-emerald-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Author</th>
                <th className="px-4 py-3 text-left font-semibold">ISBN</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-center font-semibold">Total</th>
                <th className="px-4 py-3 text-center font-semibold">Available</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {books.map(book => (
                <tr key={book.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-500 font-mono">#{book.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{book.title}</td>
                  <td className="px-4 py-3 text-gray-600">{book.author}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{book.isbn || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{book.category || 'General'}</td>
                  <td className="px-4 py-3 text-center font-medium text-gray-700">{book.totalCopies}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        book.availableCopies > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {book.availableCopies} available
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium cursor-pointer transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-medium cursor-pointer transition"
                    >
                      Delete
                    </button>
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

export default Books;
