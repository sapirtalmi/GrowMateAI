// src/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API = axios.create({
  baseURL: 'https://smart-gardening-functions.azurewebsites.net/api',
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log('[API]', config.method?.toUpperCase(), config.baseURL + (config.url || ''));
  return config;
});

// --- exact routes (case-sensitive) ---
export const getFutureGardens  = () => API.get('/getFutureGardens');
export const saveFutureGarden  = (payload: any) => API.post('/saveFutureGarden', payload);
export const deleteFutureGarden = (id: string) => API.delete(`/deleteFutureGarden/${id}`);
export const updateFutureGarden = (id: string, body: any) => API.patch(`/editFutureGarden/${id}`, body);
export const planYourGarden     = (body: any) => API.post('/planYourGarden', body);
