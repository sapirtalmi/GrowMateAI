import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import HazardsMap from '../components/HazardsMap';

const HazardsPage = () => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [newHazard, setNewHazard] = useState({
    title: '',
    description: '',
    severity: 'medium',
    latitude: '',
    longitude: '',
    radius: 1000
  });
  const [showMap, setShowMap] = useState(true);
  const [mapPopupHazardId, setMapPopupHazardId] = useState(null);

  useEffect(() => {
    loadHazards();
  }, []);

  const loadHazards = async () => {
    try {
      setLoading(true);
      const response = await api.getHazards();
      setHazards(response.data);
    } catch (err) {
      setError('Failed to load hazards');
      console.error('Hazards error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHazard = (hazard) => {
    setSelectedHazard(hazard);
    setIsModalOpen(true);
  };

  const handleCreateHazard = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createHazard({
        ...newHazard,
        latitude: parseFloat(newHazard.latitude),
        longitude: parseFloat(newHazard.longitude),
        radius: parseInt(newHazard.radius)
      });
      setHazards([response.data, ...hazards]);
      setIsCreateModalOpen(false);
      setNewHazard({
        title: '',
        description: '',
        severity: 'medium',
        latitude: '',
        longitude: '',
        radius: 1000
      });
    } catch (err) {
      setError('Failed to create hazard');
    }
  };

  const handleDeleteHazard = async (hazardId) => {
    if (window.confirm('Are you sure you want to delete this hazard?')) {
      try {
        await api.deleteHazard(hazardId);
        setHazards(hazards.filter(hazard => hazard.id !== hazardId));
      } catch (err) {
        setError('Failed to delete hazard');
      }
    }
  };

  const handleUpdateHazardStatus = async (hazardId, newStatus) => {
    try {
      await api.updateHazardStatus(hazardId, newStatus);
      setHazards(hazards.map(hazard => 
        hazard.id === hazardId ? { ...hazard, status: newStatus } : hazard
      ));
    } catch (err) {
      setError('Failed to update hazard status');
    }
  };

  const filteredHazards = hazards.filter(hazard => {
    const title = hazard.title || hazard.type || '';
    const description = hazard.description || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || hazard.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Hazards Management</h1>
          <p className="page-subtitle">Monitor and manage environmental hazards</p>
        </div>
        <div className="page-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading hazards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Hazards Management</h1>
        <p className="page-subtitle">Monitor and manage environmental hazards</p>
      </div>
      
      <div className="page-content">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Filters and Actions */}
        <div className="card">
          <div className="card-header">
            Search & Filter Hazards
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto auto auto', gap: '16px', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Search Hazards</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Filter by Severity</label>
                <select
                  className="form-select"
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <button 
                className="btn btn-success"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Hazard
              </button>
              <button className="btn btn-secondary" onClick={loadHazards}>
                Refresh
              </button>
              <button 
                className={`btn ${showMap ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
          </div>
        </div>

        {/* Hazards Map */}
        {showMap && (
          <div className="card hazards-map">
            <div className="card-header">
              Hazards Map Overview ({filteredHazards.length} hazards shown)
            </div>
            <div className="card-body">
              <HazardsMap 
                hazards={filteredHazards} 
                selectedHazard={selectedHazard}
                mapPopupHazardId={mapPopupHazardId}
                onHazardSelect={(hazard) => {
                  setSelectedHazard(hazard);
                  setIsModalOpen(true);
                }}
                onPopupClose={() => setMapPopupHazardId(null)}
              />
              <div style={{ 
                marginTop: '12px', 
                fontSize: '12px', 
                color: '#666',
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#28a745' }}></div>
                  <span>Low Severity</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffc107' }}></div>
                  <span>Medium Severity</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fd7e14' }}></div>
                  <span>High Severity</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc3545' }}></div>
                  <span>Critical Severity</span>
                </div>
                <div style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
                  Click on markers for details • Circles show hazard radius
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hazards Table */}
        <div className="card">
          <div className="card-header">
            All Hazards ({filteredHazards.length})
            {showMap && (
              <small style={{ 
                marginLeft: '16px', 
                fontWeight: 'normal', 
                color: '#666',
                fontSize: '12px'
              }}>
                💡 Click any row to highlight it on the map above
              </small>
            )}
          </div>
          <div className="card-body">
            {filteredHazards.length === 0 ? (
              <p>No hazards found</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Location</th>
                      <th>Reports</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHazards.map((hazard) => (
                      <tr 
                        key={hazard.id}
                        onClick={() => {
                          setMapPopupHazardId(hazard.id);
                          // Scroll to map if it's visible
                          if (showMap) {
                            const mapElement = document.querySelector('.card:has(.hazards-map)');
                            if (mapElement) {
                              mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }
                        }}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: mapPopupHazardId === hazard.id ? '#f8f9fa' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = mapPopupHazardId === hazard.id ? '#f8f9fa' : 'transparent';
                        }}
                      >
                        <td>
                          <strong>{hazard.title || hazard.type || 'Untitled Hazard'}</strong>
                          <br />
                          <small style={{ color: '#666' }}>
                            {(hazard.description || 'No description available').substring(0, 50)}...
                          </small>
                        </td>
                        <td>
                          <span 
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: getSeverityColor(hazard.severity),
                              color: 'white'
                            }}
                          >
                            {hazard.severity?.toUpperCase() || 'MEDIUM'}
                          </span>
                        </td>
                        <td>
                          {hazard.latitude?.toFixed(4)}, {hazard.longitude?.toFixed(4)}
                        </td>
                        <td>
                          <span style={{
                            background: '#e9ecef',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {hazard.reportsCount || hazard.reports_count || 0} reports
                          </span>
                          {hazard.verified && (
                            <span style={{
                              marginLeft: '4px',
                              color: '#28a745',
                              fontSize: '12px'
                            }}>✓</span>
                          )}
                        </td>
                        <td>
                          <span 
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: hazard.status === 'active' ? '#d4edda' : '#f8d7da',
                              color: hazard.status === 'active' ? '#155724' : '#721c24'
                            }}
                          >
                            {hazard.status || 'active'}
                          </span>
                        </td>
                        <td>{formatDate(hazard.createdAt || hazard.created_at || new Date())}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewHazard(hazard);
                            }}
                            style={{ marginRight: '8px' }}
                          >
                            View
                          </button>
                          <button
                            className={`btn ${hazard.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateHazardStatus(
                                hazard.id, 
                                hazard.status === 'active' ? 'inactive' : 'active'
                              );
                            }}
                            style={{ marginRight: '8px' }}
                          >
                            {hazard.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHazard(hazard.id);
                            }}
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

        {/* Hazard Details Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Hazard Details"
        >
          {selectedHazard && (
            <div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <p>{selectedHazard.title}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <p>{selectedHazard.description}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <p>
                  <span 
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: getSeverityColor(selectedHazard.severity),
                      color: 'white'
                    }}
                  >
                    {selectedHazard.severity?.toUpperCase() || 'MEDIUM'}
                  </span>
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <p>Latitude: {selectedHazard.latitude}</p>
                <p>Longitude: {selectedHazard.longitude}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Radius</label>
                <p>{selectedHazard.radius || 1000} meters</p>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <p>{selectedHazard.status || 'active'}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Created</label>
                <p>{formatDate(selectedHazard.createdAt || selectedHazard.created_at || new Date())}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Created By</label>
                <p>{selectedHazard.createdBy || 'System'}</p>
              </div>
            </div>
          )}
        </Modal>

        {/* Create Hazard Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Hazard"
        >
          <form onSubmit={handleCreateHazard}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={newHazard.title}
                onChange={(e) => setNewHazard({...newHazard, title: e.target.value})}
                required
                placeholder="e.g., Drought Warning"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="3"
                value={newHazard.description}
                onChange={(e) => setNewHazard({...newHazard, description: e.target.value})}
                required
                placeholder="Detailed description of the hazard..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select
                className="form-select"
                value={newHazard.severity}
                onChange={(e) => setNewHazard({...newHazard, severity: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={newHazard.latitude}
                onChange={(e) => setNewHazard({...newHazard, latitude: e.target.value})}
                required
                placeholder="e.g., 32.0853"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={newHazard.longitude}
                onChange={(e) => setNewHazard({...newHazard, longitude: e.target.value})}
                required
                placeholder="e.g., 34.7818"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Radius (meters)</label>
              <input
                type="number"
                className="form-input"
                value={newHazard.radius}
                onChange={(e) => setNewHazard({...newHazard, radius: e.target.value})}
                required
                min="100"
                max="50000"
              />
            </div>
            <div style={{ marginTop: '24px' }}>
              <button type="submit" className="btn btn-success">
                Create Hazard
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ marginLeft: '8px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default HazardsPage;
