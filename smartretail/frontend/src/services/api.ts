import axios from 'axios';
import type { CategoryPoint, ForecastPoint, HourPoint, InventoryRow, Summary, TransactionRow, TrendPoint } from '../types';

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

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data as { token: string; user: { id: number; name: string; email: string } };
}

export async function demoLogin() {
  const { data } = await api.post('/auth/demo');
  return data as { token: string; user: { id: number; name: string; email: string } };
}

export async function getSummary() {
  const { data } = await api.get('/dashboard/summary');
  return data as Summary;
}

export async function getSalesTrend(days: number) {
  const { data } = await api.get('/sales/trend', { params: { days } });
  return data as TrendPoint[];
}

export async function getSalesByCategory() {
  const { data } = await api.get('/sales/by-category');
  return data as CategoryPoint[];
}

export async function getHourlyPattern() {
  const { data } = await api.get('/sales/hourly-pattern');
  return data as HourPoint[];
}

export async function getProductsTop() {
  const { data } = await api.get('/products/top');
  return data as { product: string; revenue: number }[];
}

export async function getProducts() {
  const { data } = await api.get('/products');
  return data as { id: number; name: string; current_stock: number }[];
}

export async function getTransactions(page = 1, limit = 50, category?: string) {
  const { data } = await api.get('/transactions', { params: { page, limit, category: category || undefined } });
  return data as { items: TransactionRow[]; total: number; page: number; limit: number };
}

export async function getInventory() {
  const { data } = await api.get('/inventory');
  return data as InventoryRow[];
}

export async function updateInventory(id: number, payload: { current_stock: number; reorder_level: number }) {
  const { data } = await api.put(`/inventory/${id}`, payload);
  return data as InventoryRow;
}

export async function runForecast(product_id: number, horizon: number) {
  const { data } = await api.post('/forecast', { product_id, horizon });
  return data as { product_id: number; horizon: number; points: ForecastPoint[]; model: string };
}

export async function getReports(kind: 'sales-summary' | 'inventory' | 'forecast') {
  const { data } = await api.get(`/reports/${kind}`);
  return data as { generated_at: string; title: string; items?: unknown[]; metrics?: unknown[] };
}

export async function scheduleReports(payload: { enabled: boolean; frequency: 'Daily' | 'Weekly' | 'Monthly' }) {
  const { data } = await api.post('/reports/schedule', payload);
  return data as { ok: boolean };
}

export async function saveStoreSettings(payload: {
  store_name: string;
  currency: string;
  timezone: string;
  reorder_threshold: number;
  low_stock_alert: boolean;
  daily_report_email: boolean;
  forecast_accuracy_alert: boolean;
}) {
  const { data } = await api.put('/settings/store', payload);
  return data as { ok: boolean };
}

export async function getHeatmap(days = 90) {
  const { data } = await api.get('/sales/heatmap', { params: { days } });
  return data as { date: string; value: number }[];
}

export default api;
