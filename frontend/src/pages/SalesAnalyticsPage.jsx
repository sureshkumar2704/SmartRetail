import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { BarsChart } from '../components/charts.jsx';
import { Badge, Button, Card, Drawer, Select, SectionTitle, Skeleton } from '../components/ui.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { getHeatmap, getHourlyPattern, getTransactions } from '../services/api.js';

function HeatmapCalendar({ cells }) {
  const values = cells.map((cell) => cell.value);
  const max = Math.max(...values, 1);

  return (
    <div className="grid grid-cols-7 gap-2">
      {cells.slice(-42).map((cell) => {
        const opacity = 0.1 + (cell.value / max) * 0.9;

        return (
          <div key={cell.date} className="rounded-xl border border-white/7 p-3 text-[11px] text-slate-300" style={{ backgroundColor: `rgba(0, 212, 170, ${opacity})` }}>
            <div>{format(new Date(cell.date), 'MMM d')}</div>
            <div className="font-mono text-xs">${cell.value.toFixed(0)}</div>
          </div>
        );
      })}
    </div>
  );
}

function CsvExportButton({ rows }) {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        const header = ['Transaction ID', 'Date', 'Product', 'Category', 'Quantity', 'Revenue'];
        const csv = [header, ...rows.map((row) => [row.transaction_code, row.date, row.product, row.category, row.quantity, row.revenue])]
          .map((line) => line.map((value) => `"${String(value).split('"').join('""')}"`).join(','))
          .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'smartretail-transactions.csv';
        link.click();
      }}
    >
      Export CSV
    </Button>
  );
}

export function SalesAnalyticsPage() {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const transactions = useAsync(() => getTransactions(page, limit, category === 'All' ? undefined : category), [page, limit, category]);
  const heatmap = useAsync(() => getHeatmap(), [category, page]);
  const hourly = useAsync(() => getHourlyPattern(), [category, page]);

  const rows = transactions.data?.items ?? [];
  const tableRows = useMemo(() => rows, [rows]);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Transactions" title="Sales Analytics" action={<CsvExportButton rows={tableRows} />} />

      <Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="All">All Categories</option>
            <option value="Beverages">Beverages</option>
            <option value="Electronics">Electronics</option>
            <option value="Grocery">Grocery</option>
          </Select>
          <Select value="30d" onChange={() => undefined}>
            <option value="30d">Last 30 Days</option>
          </Select>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-heading text-xl font-bold">Transactions</h3>
            <Badge tone="neutral">Page {page}</Badge>
          </div>
          {transactions.loading ? (
            <Skeleton className="h-[540px]" />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/8">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="cursor-pointer border-t border-white/5 hover:bg-white/5" onClick={() => setSelected(row)}>
                      <td className="px-4 py-3 font-mono">{row.transaction_code}</td>
                      <td className="px-4 py-3">{format(new Date(row.date), 'MMM d, HH:mm')}</td>
                      <td className="px-4 py-3">{row.product}</td>
                      <td className="px-4 py-3">{row.category}</td>
                      <td className="px-4 py-3">{row.quantity}</td>
                      <td className="px-4 py-3 font-mono">${row.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <Button variant="secondary" onClick={() => setPage((current) => Math.max(current - 1, 1))}>Previous</Button>
            <Button variant="secondary" onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle eyebrow="Density" title="Heatmap Calendar" />
            {heatmap.loading ? <Skeleton className="h-80" /> : <HeatmapCalendar cells={heatmap.data ?? []} />}
          </Card>
          <Card>
            <SectionTitle eyebrow="Pattern" title="Hourly Sales" />
            {hourly.loading ? <Skeleton className="h-80" /> : <BarsChart labels={(hourly.data ?? []).map((item) => `${item.hour}:00`)} values={(hourly.data ?? []).map((item) => item.avg_sales)} />}
          </Card>
        </div>
      </div>

      <Drawer open={Boolean(selected)} title="Transaction Details" onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-3 text-sm text-slate-300">
            <div>Transaction: <span className="font-mono text-white">{selected.transaction_code}</span></div>
            <div>Product: {selected.product}</div>
            <div>Category: {selected.category}</div>
            <div>Quantity: {selected.quantity}</div>
            <div>Revenue: ${selected.revenue.toFixed(2)}</div>
            <div>Notes: {selected.notes ?? 'No notes recorded'}</div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}