import React, { useState } from 'react';
import { api } from '../services/api';

const DebugPanel = () => {
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, { 
      test, 
      result, 
      details, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const testApiConnection = async () => {
    console.log('🧪 Testing API connection...');
    addTestResult('API Connection', 'Testing...', 'Checking if backend is reachable');
    
    try {
      // Test a simple endpoint that doesn't require auth
      const response = await fetch('https://smartgardeningfunctions.azurewebsites.net/api/getHazards');
      if (response.ok) {
        addTestResult('API Connection', 'SUCCESS', `Status: ${response.status}`);
      } else {
        addTestResult('API Connection', 'PARTIAL', `Backend reachable but returned: ${response.status}`);
      }
    } catch (error) {
      addTestResult('API Connection', 'FAILED', error.message);
    }
  };

  const testAdminLogin = async () => {
    console.log('🧪 Testing admin login with test credentials...');
    addTestResult('Admin Login Test', 'Testing...', 'Trying common admin credentials');
    
    const testCredentials = [
      { email: 'admin@growmate.com', password: 'admin123' },
      { email: 'admin@example.com', password: 'password' },
      { email: 'admin', password: 'admin' }
    ];

    for (const cred of testCredentials) {
      try {
        const response = await api.login(cred.email, cred.password);
        addTestResult('Admin Login Test', 'SUCCESS', `Logged in with ${cred.email}`);
        return;
      } catch (error) {
        addTestResult('Admin Login Test', 'FAILED', `${cred.email}: ${error.response?.data || error.message}`);
      }
    }
  };

  const checkLocalStorage = () => {
    console.log('🧪 Checking localStorage...');
    const token = localStorage.getItem('token');
    const keys = Object.keys(localStorage);
    
    addTestResult('LocalStorage Check', 'INFO', `Keys: ${keys.join(', ')}`);
    addTestResult('Token Check', token ? 'FOUND' : 'NOT_FOUND', token ? `Length: ${token.length}` : 'No token in localStorage');
  };

  const clearTestResults = () => {
    setTestResults([]);
    console.clear();
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      backgroundColor: 'white', 
      border: '2px solid #ccc', 
      borderRadius: '8px', 
      padding: '16px', 
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h4>🔧 Debug Panel</h4>
      
      <div style={{ marginBottom: '12px' }}>
        <button onClick={testApiConnection} style={{ marginRight: '8px', padding: '4px 8px' }}>
          Test API
        </button>
        <button onClick={testAdminLogin} style={{ marginRight: '8px', padding: '4px 8px' }}>
          Test Login
        </button>
        <button onClick={checkLocalStorage} style={{ marginRight: '8px', padding: '4px 8px' }}>
          Check Storage
        </button>
        <button onClick={clearTestResults} style={{ padding: '4px 8px' }}>
          Clear
        </button>
      </div>

      <div style={{ maxHeight: '200px', overflow: 'auto' }}>
        {testResults.map((result, index) => (
          <div key={index} style={{ 
            marginBottom: '4px', 
            padding: '4px',
            backgroundColor: 
              result.result === 'SUCCESS' ? '#d4edda' :
              result.result === 'FAILED' ? '#f8d7da' :
              result.result === 'Testing...' ? '#fff3cd' : '#e2e3e5',
            borderRadius: '4px'
          }}>
            <strong>{result.test}:</strong> {result.result}
            {result.details && <div style={{ fontSize: '10px', color: '#666' }}>{result.details}</div>}
            <div style={{ fontSize: '9px', color: '#999' }}>{result.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugPanel;
