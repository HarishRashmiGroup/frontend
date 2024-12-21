import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search, Edit2, User, X } from 'lucide-react';

const TaskStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  PAUSED: 'paused'
};

const Task = ({
  createdBy,
  description,
  dueDate,
  id,
  responsiblePersonId,
  responsiblePersonName,
  responsiblePersonEmail,
  status,
  onTaskUpdate
}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedDueDate, setEditedDueDate] = useState(dueDate);
  const [editedStatus, setEditedStatus] = useState(status);
  const [editedResponsiblePersonId, setEditedResponsiblePersonId] = useState(responsiblePersonId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Add the required states
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState(null);
  const [selectedUser, setSelectedUser] = useState({name:responsiblePersonName,email: responsiblePersonEmail});

  // Add this effect to handle user search
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

  // Update this function to handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setEditedResponsiblePersonId(user.id);
    setSearchQuery('');
    setUsers([]);
  };

  // Function to clear selected user
  const clearSelectedUser = () => {
    setSelectedUser(null);
    setEditedResponsiblePersonId(null);
    setNewUserEmail(null);
    setNewUserName(null)
    setSearchQuery('');
  };

  // Toggle between new user or search existing
  const toggleNewUser = (checked) => {
    setIsNewUser(checked);
    if (checked) {
      setSelectedUser(null);
      setEditedResponsiblePersonId(null);
    }
    else{
      setNewUserEmail(null);
      setNewUserName(null);
    }
    setSearchQuery('');
    setUsers([]);
  };
  useEffect(() => {
    if (isModalOpen) {
      setEditedDescription(description);
      setEditedDueDate(dueDate);
      setEditedResponsiblePersonId(responsiblePersonId);
      setEditedStatus(status);
    }
  }, [isModalOpen, description, dueDate, responsiblePersonId, status]);

  const isOverdue = React.useMemo(() => {
    return new Date(dueDate) < new Date() && status === TaskStatus.PENDING;
  }, [dueDate, status]);

  const getStyles = React.useMemo(() => {
    const styles = {
      background: '',
      text: '',
      hover: ''
    };

    if (status === TaskStatus.COMPLETED) {
      styles.background = 'bg-green-100';
      styles.text = 'text-green-800';
      styles.hover = 'hover:bg-green-200';
    } else if (isOverdue) {
      styles.background = 'bg-red-100';
      styles.text = 'text-red-800';
      styles.hover = 'hover:bg-red-200';
    } else if (status === TaskStatus.PAUSED) {
      styles.background = 'bg-gray-100';
      styles.text = 'text-gray-800';
      styles.hover = 'hover:bg-gray-200';
    }
    else {
      styles.background = 'bg-yellow-100';
      styles.text = 'text-yellow-800';
      styles.hover = 'hover:bg-yellow-200';
    }

    return styles;
  }, [status, isOverdue]);

  const handleEditSubmit = async () => {
    if (!editedDescription.trim()) {
      setError('Description cannot be empty');
      onTaskUpdate();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://backend-9xmz.onrender.com/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: editedDescription.trim(),
          dueDate: editedDueDate,
          assignedTo: editedResponsiblePersonId??undefined,
          status: editedStatus,
          newUserEmail,
          newUserName
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      const updatedTask = await response.json();
      onTaskUpdate?.(updatedTask);
      setIsModalOpen(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
  };

  return (
    <>
      <div
        className={`w-full max-w-md ${getStyles.background} transition-all duration-200 
          rounded-lg shadow-sm hover:shadow-md`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-black/10">
          <div className="flex items-center space-x-2">
            <User className={`h-4 w-4 ${getStyles.text}`} />
            {/*   */}
          </div>
          <button
            className={`p-2 rounded-full transition-colors ${getStyles.hover}`}
            onClick={() => setIsModalOpen(true)}
            aria-label="Edit task"
          >
            <Edit2 className={`h-4 w-4 ${getStyles.text}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-2">
          <p className={`text-sm ${getStyles.text} break-words`}>
            {description}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs ${getStyles.text}`}>
              {responsiblePersonName}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${getStyles.background} ${getStyles.text}`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ overflow: 'auto' }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Edit Task</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows="3"
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>

              {/* Due Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editedDueDate}
                  onChange={(e) => setEditedDueDate(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Responsible Person */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsible Person
                </label>
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
                      <span className="text-sm font-medium">Assigned To</span>
                      <X
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
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.value)}
                    />
                    <input
                      type="email"
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.value)}
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
                        autoComplete="off"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email"
                      />
                      <Search className="absolute right-2 top-2 text-gray-400" size={20} />
                    </div>

                    {users.length > 0 && (
                      <ul className="mt-2 border rounded-md max-h-32 overflow-y-auto">
                        {users.map((user) => (
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

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(TaskStatus).map(statusOption => (
                    <option key={statusOption} value={statusOption}>{statusOption}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 p-4 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={isLoading || !editedDescription.trim()}
                className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Task;
