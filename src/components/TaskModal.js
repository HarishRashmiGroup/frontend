import React, { useState, useEffect } from 'react';
import { X, Search, UserX } from 'lucide-react';

const TaskModal = ({ selectedDate, onClose, handleRefresh }) => {
  const [formData, setFormData] = useState({
    description: '',
    dueDate: selectedDate || new Date(),
    status: 'pending',
    userId: '',
    newUser: {
      name: '',
      email: ''
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const searchUsers = async () => {
      if (!isNewUser && searchQuery.length >= 2) {
        try {
          const response = await fetch(`https://backend-9xmz.onrender.com/users/search?q=${searchQuery}`);
          const data = await response.json();
          setUsers(data);
        } catch (err) {
          console.error('Error searching users:', err);
        }
      } else {
        setUsers([]);
      }
    };
    searchUsers();
  }, [searchQuery, isNewUser]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormData(prev => ({
      ...prev,
      userId: user.id,
      newUser: { name: '', email: '' }
    }));
    setSearchQuery('');
    setUsers([]);
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
    setFormData(prev => ({
      ...prev,
      userId: '',
      newUser: { name: '', email: '' }
    }));
    setSearchQuery('');
  };

  const toggleNewUser = (checked) => {
    setIsNewUser(checked);
    if (checked) {
      setSelectedUser(null);
      setFormData(prev => ({
        ...prev,
        userId: '',
        newUser: { name: '', email: '' }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        newUser: { name: '', email: '' }
      }));
    }
    setSearchQuery('');
    setUsers([]);
  };

  const submitForm = async () => {
    try {
      setIsSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('https://backend-9xmz.onrender.com/tasks', {
      // const response = await fetch('http://localhost:3003/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save task');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
      handleRefresh();
    }
  };

  const formatDateForInput = (date) => {
    return date instanceof Date
      ? date.toISOString().split('T')[0]
      : date;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Task</h2>
          <X
            className="cursor-pointer text-gray-500 hover:text-gray-800"
            onClick={onClose}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full border rounded-md p-2 text-sm"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              className="w-full border rounded-md p-2 text-sm"
              value={formatDateForInput(formData.dueDate)}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="newUser"
                checked={isNewUser}
                onChange={(e) => toggleNewUser(e.target.checked)}
                className="rounded"
                disabled={!!selectedUser}
              />
              <label htmlFor="newUser" className="text-sm font-medium text-gray-700">
                Assign to a new Person
              </label>
            </div>

            {selectedUser ? (
              <div className="border rounded-md p-3 bg-gray-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Assignned To</span>
                  <UserX
                    className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500"
                    onClick={clearSelectedUser}
                  />
                </div>
                <div className="text-sm">
                  <div>{selectedUser.name}</div>
                  <div className="text-gray-500">{selectedUser.email}</div>
                </div>
              </div>
            ) : isNewUser ? (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full border rounded-md p-2 text-sm"
                  placeholder="Name"
                  value={formData.newUser.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    newUser: { ...prev.newUser, name: e.target.value }
                  }))}
                />
                <input
                  type="email"
                  className="w-full border rounded-md p-2 text-sm"
                  placeholder="Email"
                  value={formData.newUser.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    newUser: { ...prev.newUser, email: e.target.value }
                  }))}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border rounded-md p-2 pr-8 text-sm"
                    value={searchQuery}
                    autoComplete='off'
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email"
                  />
                  <Search className="absolute right-2 top-2 text-gray-400" size={20} />
                </div>

                {users.length > 0 && (
                  <ul className="mt-2 border rounded-md max-h-32 overflow-y-auto">
                    {users.map(user => (
                      <li
                        key={user.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleUserSelect(user)}
                      >
                        {user.name} ({user.email})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={submitForm}
            disabled={isSaving || !formData.description || (!isNewUser && !formData.userId) || (isNewUser && (!formData.newUser.name || !formData.newUser.email))}
          >
            {isSaving ? 'Saving...' : 'Save Task'}
          </button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;