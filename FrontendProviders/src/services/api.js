import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://smartgardeningfunctions.azurewebsites.net/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
});

// Add token to requests if available
axiosInstance.interceptors.request.use((config) => {
  console.log('🚀 API Request Interceptor triggered:', {
    method: config.method?.toUpperCase(),
    url: `${config.baseURL}${config.url}`,
    originalHeaders: { ...config.headers }
  });
  
  const token = localStorage.getItem('token');
  console.log('🔑 Token check:', { 
    hasToken: !!token, 
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
  });
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Token added to Authorization header');
  } else {
    console.log('⚠️ No token found in localStorage');
  }
  
  console.log('📤 Final request headers:', { ...config.headers });
  return config;
});

// Handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - removing token and redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Unified API object
export const api = {
  // Auth
  login: async (email, password) => {
    console.log('🔐 Attempting login with:', { email, passwordLength: password.length });
    console.log('🌐 Full URL:', `${API_BASE_URL}/loginadmin`);
    try {
      const response = await axiosInstance.post('/loginadmin', { email, password });
      console.log('🎉 Login successful:', response.data);
      return response;
    } catch (error) {
      console.error('💥 Login failed:', error);
      console.error('💥 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  },

  verifyToken: async () => {
    console.log('🔍 Verifying token...');
    try {
      const response = await axiosInstance.get('/adminverifytoken');
      console.log('✅ Token verification successful:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      throw error;
    }
  },

  // Users
  getUsers: async () => {
    console.log('👥 Getting users...');
    const token = localStorage.getItem('token');
    console.log('🔑 Token status before request:', { 
      hasToken: !!token, 
      tokenLength: token?.length 
    });
    
    try {
      const response = await axiosInstance.get('/getallusersadmin');
      console.log('✅ Users retrieved successfully:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Failed to get users:', error);
      throw error;
    }
  },

  updateUserStatus: async (userId, status) => {
    const response = await axiosInstance.put(`/adminupdateuserstatus/${userId}`, { status });
    return response;
  },

  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/admindeleteuser/${userId}`);
    return response;
  },

  // Hazards
  getHazards: async () => {
    console.log('🚨 Getting all hazards for admin...');
    try {
      const response = await axiosInstance.get('/getallhazardsadmin');
      console.log('✅ Hazards retrieved successfully:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Failed to get hazards:', error);
      throw error;
    }
  },

  createHazard: async (hazardData) => {
    const response = await axiosInstance.post('/createHazard', hazardData);
    return response;
  },

  updateHazardStatus: async (hazardId, status) => {
    const response = await axiosInstance.put(`/adminupdatehazardstatus/${hazardId}`, { status });
    return response;
  },

  deleteHazard: async (hazardId) => {
    const response = await axiosInstance.delete(`/deletehazardadmin/${hazardId}`);
    return response;
  },

  // Sensors
  getSensors: async () => {
    console.log('🔧 Getting all sensors for admin...');
    try {
      const response = await axiosInstance.get('/getallsensorsadmin');
      console.log('✅ Sensors retrieved successfully:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Failed to get sensors:', error);
      throw error;
    }
  },

  generateSensorIds: async (count) => {
    const response = await axiosInstance.post('/admingeneratesensorids', { count });
    return response;
  },

  updateSensorStatus: async (sensorId, status) => {
    const response = await axiosInstance.put(`/adminupdatesensorstatus/${sensorId}`, { status });
    return response;
  },

  deleteSensor: async (sensorId) => {
    const response = await axiosInstance.delete(`/deletesensoradmin/${sensorId}`);
    return response;
  },

  // Plants/Statistics
  getPlants: async () => {
    const response = await axiosInstance.get('/getallplantsadmin');
    return response;
  },

  getDashboardStats: async () => {
    const response = await axiosInstance.get('/AdminGetDashboardStats');
    return response;
  }
};

export default api;
