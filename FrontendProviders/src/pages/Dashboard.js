import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHazards: 0,
    totalSensors: 0,
    totalPlants: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load each data source individually with error handling
      let totalUsers = 0;
      let totalHazards = 0;
      let totalSensors = 0;
      let totalPlants = 0;

      try {
        const usersRes = await api.getUsers();
        totalUsers = usersRes.data.length;
        console.log('Users loaded:', totalUsers);
      } catch (err) {
        console.error('Failed to load users:', err);
      }

      try {
        const hazardsRes = await api.getHazards();
        totalHazards = hazardsRes.data.length;
        console.log('Hazards loaded:', totalHazards);
      } catch (err) {
        console.error('Failed to load hazards:', err);
      }

      try {
        const sensorsRes = await api.getSensors();
        totalSensors = sensorsRes.data.length;
        console.log('Sensors loaded:', totalSensors);
      } catch (err) {
        console.error('Failed to load sensors:', err);
      }

      try {
        const plantsRes = await api.getPlants();
        totalPlants = plantsRes.data.length;
        console.log('Plants loaded:', totalPlants);
      } catch (err) {
        console.error('Failed to load plants:', err);
      }

      setStats({
        totalUsers,
        totalHazards,
        totalSensors,
        totalPlants
      });

      console.log('Final stats:', { totalUsers, totalHazards, totalSensors, totalPlants });

      // Mock recent activity - replace with actual API call when available
      setRecentActivity([
        { id: 1, type: 'user', action: 'New user registered', user: 'john.doe@email.com', timestamp: new Date().toISOString() },
        { id: 2, type: 'hazard', action: 'New hazard reported', details: 'Drought warning in Zone A', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, type: 'sensor', action: 'Sensor data received', sensor: 'SENSOR_001', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: 4, type: 'plant', action: 'Plant health check', plant: 'Tomato Plant #42', timestamp: new Date(Date.now() - 10800000).toISOString() },
      ]);

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return '👤';
      case 'hazard': return '⚠️';
      case 'sensor': return '📊';
      case 'plant': return '🌱';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">GrowMate Admin Overview</p>
        </div>
        <div className="page-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">GrowMate Admin Overview</p>
      </div>
      
      <div className="page-content">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card users">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card hazards">
            <div className="stat-number">{stats.totalHazards}</div>
            <div className="stat-label">Active Hazards</div>
          </div>
          <div className="stat-card sensors">
            <div className="stat-number">{stats.totalSensors}</div>
            <div className="stat-label">Sensors</div>
          </div>
          <div className="stat-card plants">
            <div className="stat-number">{stats.totalPlants}</div>
            <div className="stat-label">Plants Monitored</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            Recent Activity
          </div>
          <div className="card-body">
            {recentActivity.length === 0 ? (
              <p>No recent activity</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Action</th>
                      <th>Details</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td>
                          <span style={{ marginRight: '8px' }}>
                            {getActivityIcon(activity.type)}
                          </span>
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </td>
                        <td>{activity.action}</td>
                        <td>
                          {activity.user || activity.details || activity.sensor || activity.plant || '-'}
                        </td>
                        <td>{formatTimestamp(activity.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            Quick Actions
          </div>
          <div className="card-body">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/sensors'}
            >
              Generate New Sensor ID
            </button>
            <button 
              className="btn btn-success"
              onClick={() => window.location.href = '/users'}
            >
              View All Users
            </button>
            <button 
              className="btn btn-warning"
              onClick={() => window.location.href = '/hazards'}
            >
              Manage Hazards
            </button>
            <button 
              className="btn btn-secondary"
              onClick={loadDashboardData}
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
