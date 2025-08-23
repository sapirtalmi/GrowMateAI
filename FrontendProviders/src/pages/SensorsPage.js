import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';

const SensorsPage = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newSensorCount, setNewSensorCount] = useState(1);
  const [generatedSensors, setGeneratedSensors] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    try {
      setLoading(true);
      const response = await api.getSensors();
      setSensors(response.data);
    } catch (err) {
      setError('Failed to load sensors');
      console.error('Sensors error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSensor = (sensor) => {
    setSelectedSensor(sensor);
    setIsModalOpen(true);
  };

  const handleGenerateSensors = async (e) => {
    e.preventDefault();
    try {
      const response = await api.generateSensorIds(newSensorCount);
      setGeneratedSensors(response.data.sensorIds);
      setSuccess(`Successfully generated ${newSensorCount} sensor ID(s)`);
      setNewSensorCount(1);
      loadSensors(); // Refresh the sensors list
    } catch (err) {
      setError('Failed to generate sensor IDs');
    }
  };

  const handleDeleteSensor = async (sensorId) => {
    if (window.confirm('Are you sure you want to delete this sensor?')) {
      try {
        await api.deleteSensor(sensorId);
        setSensors(sensors.filter(sensor => sensor.id !== sensorId));
        setSuccess('Sensor deleted successfully');
      } catch (err) {
        setError('Failed to delete sensor');
      }
    }
  };

  const filteredSensors = sensors.filter(sensor => {
    const sensorId = sensor.SensorID || sensor.deviceId || sensor.id || '';
    const pairingKey = sensor.PairingKey || '';
    const currUserID = sensor.currUserID || '';
    const matchesSearch = sensorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pairingKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         currUserID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sensor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'inactive': return '#6c757d';
      case 'error': return '#dc3545';
      case 'maintenance': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Sensors Management</h1>
          <p className="page-subtitle">Manage sensor devices and generate new sensor IDs</p>
        </div>
        <div className="page-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading sensors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Sensors Management</h1>
        <p className="page-subtitle">Manage sensor devices and generate new sensor IDs</p>
      </div>
      
      <div className="page-content">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Generate Sensor IDs */}
        <div className="card">
          <div className="card-header">
            Generate New Sensor IDs
          </div>
          <div className="card-body">
            <form onSubmit={handleGenerateSensors} style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label className="form-label">Number of Sensor IDs to Generate</label>
                <input
                  type="number"
                  className="form-input"
                  value={newSensorCount}
                  onChange={(e) => setNewSensorCount(parseInt(e.target.value))}
                  min="1"
                  max="100"
                  required
                />
              </div>
              <button type="submit" className="btn btn-success">
                Generate Sensor IDs
              </button>
            </form>

            {generatedSensors.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4>Generated Sensor IDs:</h4>
                <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '4px', marginTop: '8px' }}>
                  {generatedSensors.map((sensorId, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <code style={{ fontSize: '14px', background: 'white', padding: '4px 8px', borderRadius: '4px' }}>
                        {sensorId}
                      </code>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => copyToClipboard(sensorId)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-header">
            Search & Filter Sensors
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '16px', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Search Sensors</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by Sensor ID, Pairing Key or User ID..."
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
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="error">Error</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <button className="btn btn-secondary" onClick={loadSensors}>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Sensors Table */}
        <div className="card">
          <div className="card-header">
            All Sensors ({filteredSensors.length})
          </div>
          <div className="card-body">
            {filteredSensors.length === 0 ? (
              <p>No sensors found</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Sensor ID</th>
                      <th>Pairing Key</th>
                      <th>Status</th>
                      <th>Owner</th>
                      <th>Connection</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSensors.map((sensor) => (
                      <tr key={sensor.id}>
                        <td>
                          <code style={{ background: '#f8f9fa', padding: '2px 6px', borderRadius: '3px' }}>
                            {sensor.SensorID || sensor.deviceId || 'N/A'}
                          </code>
                        </td>
                        <td>
                          <code style={{ background: '#e3f2fd', padding: '2px 6px', borderRadius: '3px' }}>
                            {sensor.PairingKey || 'N/A'}
                          </code>
                        </td>
                        <td>
                          <span 
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: getStatusColor(sensor.status),
                              color: 'white'
                            }}
                          >
                            {sensor.status?.toUpperCase() || 'INACTIVE'}
                          </span>
                        </td>
                        <td>
                          {sensor.currUserID ? (
                            <div>
                              <strong>User ID:</strong>
                              <br />
                              <code style={{ background: '#e8f5e8', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>
                                {sensor.currUserID}
                              </code>
                            </div>
                          ) : (
                            <span style={{ color: '#999' }}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          <span 
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: sensor.currUserID ? '#d4edda' : '#f8d7da',
                              color: sensor.currUserID ? '#155724' : '#721c24'
                            }}
                          >
                            {sensor.currUserID ? 'Connected' : 'Available'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleViewSensor(sensor)}
                            style={{ marginRight: '8px' }}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteSensor(sensor.id)}
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

        {/* Sensor Details Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Sensor Details"
        >
          {selectedSensor && (
            <div>
              <div className="form-group">
                <label className="form-label">Sensor ID</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <code style={{ background: '#f8f9fa', padding: '8px', borderRadius: '4px', flex: 1 }}>
                    {selectedSensor.SensorID || selectedSensor.deviceId || 'N/A'}
                  </code>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => copyToClipboard(selectedSensor.SensorID || selectedSensor.deviceId)}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pairing Key</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <code style={{ background: '#e3f2fd', padding: '8px', borderRadius: '4px', flex: 1 }}>
                    {selectedSensor.PairingKey || 'N/A'}
                  </code>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => copyToClipboard(selectedSensor.PairingKey)}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <p>
                  <span 
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: getStatusColor(selectedSensor.status),
                      color: 'white'
                    }}
                  >
                    {selectedSensor.status?.toUpperCase() || 'INACTIVE'}
                  </span>
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Connected User ID</label>
                {selectedSensor.currUserID ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <code style={{ background: '#e8f5e8', padding: '8px', borderRadius: '4px', flex: 1 }}>
                      {selectedSensor.currUserID}
                    </code>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => copyToClipboard(selectedSensor.currUserID)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <p style={{ color: '#999' }}>Not connected to any user</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Connection Status</label>
                <p>
                  <span 
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: selectedSensor.currUserID ? '#d4edda' : '#f8d7da',
                      color: selectedSensor.currUserID ? '#155724' : '#721c24'
                    }}
                  >
                    {selectedSensor.currUserID ? 'Connected' : 'Available'}
                  </span>
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Created</label>
                <p>{formatDate(selectedSensor.createdAt || selectedSensor.created_at || new Date())}</p>
              </div>
              {selectedSensor.last_updated && (
                <div className="form-group">
                  <label className="form-label">Last Updated</label>
                  <p>{formatDate(selectedSensor.last_updated || selectedSensor.lastUpdated)}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default SensorsPage;
