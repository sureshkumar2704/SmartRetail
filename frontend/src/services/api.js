import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartretail_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function demoLogin() {
  const { data } = await api.post('/auth/demo');
  return data;
}

export async function getSummary() {
  const { data } = await api.get('/dashboard/summary');
  return data;
}

export async function getSalesTrend(days) {
  const { data } = await api.get('/sales/trend', { params: { days } });
  return data;
}

export async function getSalesByCategory() {
  const { data } = await api.get('/sales/by-category');
  return data;
}

export async function getHourlyPattern() {
  const { data } = await api.get('/sales/hourly-pattern');
  return data;
}

export async function getProductsTop() {
  const { data } = await api.get('/products/top');
  return data;
}

export async function getProducts() {
  const { data } = await api.get('/products');
  return data;
}

export async function getTransactions(page = 1, limit = 50, category) {
  const { data } = await api.get('/transactions', { params: { page, limit, category: category || undefined } });
  return data;
}

export async function getInventory() {
  const { data } = await api.get('/inventory');
  return data;
}

export async function updateInventory(id, payload) {
  const { data } = await api.put(`/inventory/${id}`, payload);
  return data;
}

export async function runForecast(product_id, horizon) {
  const { data } = await api.post('/forecast', { product_id, horizon });
  return data;
}

export async function getReports(kind) {
  const { data } = await api.get(`/reports/${kind}`);
  return data;
}

export async function scheduleReports(payload) {
  const { data } = await api.post('/reports/schedule', payload);
  return data;
}

export async function saveStoreSettings(payload) {
  const { data } = await api.put('/settings/store', payload);
  return data;
}

export async function getHeatmap(days = 90) {
  const { data } = await api.get('/sales/heatmap', { params: { days } });
  return data;
}

export async function runAgent() {
  const { data } = await api.post('/agent/run');
  return data;
}

export async function getAgentActions(status = 'pending') {
  const { data } = await api.get('/agent/actions', { params: { status } });
  return data;
}

export async function approveAgentAction(id) {
  const { data } = await api.post(`/agent/actions/${id}/approve`);
  return data;
}

export async function rejectAgentAction(id, outcome_notes) {
  const { data } = await api.post(`/agent/actions/${id}/reject`, null, { params: { outcome_notes } });
  return data;
}

export async function getPurchaseOrders() {
  const { data } = await api.get('/agent/purchase-orders');
  return data;
}

export default api;