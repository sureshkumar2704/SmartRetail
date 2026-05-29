import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { BarChartHorizontal, BarsChart, CategoryDonutChart, RevenueLineChart } from '../components/charts';
import { Button, Card, CountUp, SectionTitle, Skeleton } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { getProductsTop, getSalesByCategory, getSalesTrend, getSummary } from '../services/api';
import type { DateRangeKey } from '../types';

const rangeDays: Record<DateRangeKey, number> = { today: 1, '7d': 7, '30d': 30, custom: 30 };

export function DashboardPage() {
  const [range, setRange] = useState<DateRangeKey>('30d');
  const days = rangeDays[range];
  const summary = useAsync(() => getSummary(), [range]);
  const trend = useAsync(() => getSalesTrend(days), [days]);
  const categories = useAsync(() => getSalesByCategory(), [days]);
  const products = useAsync(() => getProductsTop(), [days]);

  const trendData = trend.data ?? [];
  const categoryData = categories.data ?? [];
  const productData = products.data ?? [];

  const trendLabels = trendData.map((point) => format(new Date(point.date), 'MMM d'));
  const trendValues = trendData.map((point) => point.revenue);

  const topLabels = productData.map((item) => item.product);
  const topValues = productData.map((item) => item.revenue);

  const kpis = useMemo(
    () => [
      { label: 'Total Revenue', value: summary.data?.total_revenue ?? 0 },
      { label: 'Total Transactions', value: summary.data?.total_transactions ?? 0 },
      { label: 'Top-Selling Product', value: summary.data?.top_selling_product ?? 'N/A' },
      { label: 'Low Stock Alerts', value: summary.data?.low_stock_alerts ?? 0 },
    ],
    [summary.data],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle eyebrow="Overview" title="Dashboard" />
        <div className="flex gap-2">
          {(['today', '7d', '30d', 'custom'] as DateRangeKey[]).map((item) => (
            <Button key={item} variant={range === item ? 'primary' : 'secondary'} onClick={() => setRange(item)}>
              {item.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.loading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          kpis.map((item) => (
            <Card key={item.label} className="fade-in-up">
              <div className="text-sm text-slate-400">{item.label}</div>
              <div className="mt-3 break-words font-heading text-3xl font-bold">
                {typeof item.value === 'number' ? <CountUp value={item.value} /> : item.value}
              </div>
            </Card>
          ))
        )}
      </div>

      <Card>
        <SectionTitle eyebrow="Trend" title="Revenue Trend Chart" />
        {trend.loading ? <Skeleton className="h-80" /> : <RevenueLineChart labels={trendLabels} values={trendValues} />}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle eyebrow="Mix" title="Category Sales Donut" />
          {categories.loading ? <Skeleton className="h-80" /> : <CategoryDonutChart labels={categoryData.map((item) => item.category)} values={categoryData.map((item) => item.revenue)} />}
        </Card>
        <Card>
          <SectionTitle eyebrow="Ranking" title="Top 5 Products" />
          {products.loading ? <Skeleton className="h-80" /> : <BarChartHorizontal labels={topLabels} values={topValues} title="Revenue" />}
        </Card>
      </div>
    </div>
  );
}
