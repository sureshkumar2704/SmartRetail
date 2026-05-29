export type DateRangeKey = 'today' | '7d' | '30d' | 'custom';

export type Summary = {
  total_revenue: number;
  total_transactions: number;
  top_selling_product: string;
  low_stock_alerts: number;
};

export type TrendPoint = { date: string; revenue: number };
export type CategoryPoint = { category: string; revenue: number };
export type HourPoint = { hour: number; avg_sales: number };
export type TransactionRow = {
  id: number;
  transaction_code: string;
  date: string;
  product: string;
  category: string;
  quantity: number;
  revenue: number;
  notes?: string | null;
};
export type InventoryRow = {
  id: number;
  name: string;
  sku: string;
  category: string;
  current_stock: number;
  reorder_level: number;
  status: 'In Stock' | 'Low' | 'Out';
  unit_price: number;
};
export type ForecastPoint = {
  date: string;
  predicted_units: number;
  lower_bound: number;
  upper_bound: number;
};
