import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
      console.error('Users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      await api.updateUserStatus(userId, newStatus);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const email = user.email || '';
    const name = user.name || user.username || '';
    const matchesSearch = email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">Manage user accounts and permissions</p>
        </div>
        <div className="page-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Users Management</h1>
        <p className="page-subtitle">Manage user accounts and permissions</p>
      </div>
      
      <div className="page-content">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="card">
          <div className="card-header">
            Search & Filter Users
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '16px', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Search Users</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Filter by Status</label>
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <button className="btn btn-secondary" onClick={loadUsers}>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-header">
            All Users ({filteredUsers.length})
          </div>
          <div className="card-body">
            {filteredUsers.length === 0 ? (
              <p>No users found</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Plants</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.username || user.name || 'N/A'}</strong>
                        </td>
                        <td>{user.email || 'N/A'}</td>
                        <td>
                          <span 
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: 
                                user.status === 'active' ? '#d4edda' :
                                user.status === 'inactive' ? '#fff3cd' : '#f8d7da',
                              color:
                                user.status === 'active' ? '#155724' :
                                user.status === 'inactive' ? '#856404' : '#721c24'
                            }}
                          >
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td>{user.plantCount || 0}</td>
                        <td>{formatDate(user.createdAt || new Date())}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleViewUser(user)}
                            style={{ marginRight: '8px' }}
                          >
                            View
                          </button>
                          <button
                            className={`btn ${user.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleUserStatus(
                              user.id, 
                              user.status === 'active' ? 'inactive' : 'active'
                            )}
                            style={{ marginRight: '8px' }}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* User Details Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="User Details"
        >
          {selectedUser && (
            <div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <p>{selectedUser.name || 'Not provided'}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <p>{selectedUser.email}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <p>{selectedUser.status || 'active'}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Plants Count</label>
                <p>{selectedUser.plantCount || 0}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Joined Date</label>
                <p>{formatDate(selectedUser.createdAt || new Date())}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Last Login</label>
                <p>{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default UsersPage;
