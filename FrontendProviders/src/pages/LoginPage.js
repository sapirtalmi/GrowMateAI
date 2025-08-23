import React, { useState } from 'react';
import { api } from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Login form submitted');
    console.log('📧 Form data:', { 
      email: formData.email, 
      passwordLength: formData.password.length,
      hasEmail: !!formData.email,
      hasPassword: !!formData.password 
    });
    
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Calling API login...');
      const response = await api.login(formData.email, formData.password);
      console.log('🎯 Login response received:', response);
      
      const { token, user } = response.data;
      console.log('🔑 Extracted from response:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        user: user 
      });
      
      console.log('✅ Calling onLogin callback...');
      onLogin(token, user);
    } catch (err) {
      console.error('🚨 Login error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          err.message || 
                          'Login failed. Please try again.';
      console.error('📢 Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      console.log('🏁 Login attempt finished');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">GrowMate Providers</h1>
        <p className="login-subtitle">Admin Control Panel</p>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="admin@growmate.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', color: '#7f8c8d', fontSize: '14px' }}>
          <p>For admin access only</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
