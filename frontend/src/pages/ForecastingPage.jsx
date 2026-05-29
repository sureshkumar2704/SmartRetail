import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { RevenueLineChart } from '../components/charts.jsx';
import { Badge, Button, Card, Select, SectionTitle, Skeleton } from '../components/ui.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { getInventory, runForecast } from '../services/api.js';

export function ForecastingPage() {
  const products = useAsync(() => getInventory(), []);
  const [productId, setProductId] = useState('');
  const [horizon, setHorizon] = useState(7);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedProduct = useMemo(() => products.data?.find((item) => item.id === Number(productId)), [products.data, productId]);

  async function submit() {
    if (!productId) return;
    setLoading(true);
    const response = await runForecast(Number(productId), horizon);
    setResult(response);
    setLoading(false);
  }

  const historical = useMemo(() => Array.from({ length: 14 }, (_, index) => 18 + index * 1.6), []);
  const forecastValues = result?.points.map((point) => point.predicted_units) ?? [];
  const chartLabels = result?.points.map((point) => format(new Date(point.date), 'MMM d')) ?? [];

  const reorderNeed = (forecastValues.reduce((sum, value) => sum + value, 0) || 0) > (selectedProduct?.current_stock ?? 0);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="ML Core" title="Demand Forecasting" />

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="space-y-4">
          <div className="text-sm text-slate-400">Select a product and horizon, then run the model.</div>
          {products.loading ? (
            <Skeleton className="h-48" />
          ) : (
            <>
              <Select value={productId} onChange={(event) => setProductId(event.target.value)}>
                <option value="">Choose Product</option>
                {(products.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
              <Select value={horizon} onChange={(event) => setHorizon(Number(event.target.value))}>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </Select>
              <Button className="w-full" onClick={submit} disabled={!productId || loading}>
                {loading ? 'Running ML Model…' : 'Generate Forecast'}
              </Button>
            </>
          )}

          {selectedProduct ? <Badge tone="neutral">Current stock: {selectedProduct.current_stock}</Badge> : null}
          {reorderNeed && result ? <Button className="w-full" variant="secondary">Auto-Generate Purchase Order</Button> : null}
        </Card>

        <Card>
          {loading ? <Skeleton className="h-[420px]" /> : <RevenueLineChart labels={[...Array(historical.length).keys()].map((value) => `D${value + 1}`)} values={historical} dashed={false} />}
          {result ? <div className="mt-4 text-xs uppercase tracking-[0.3em] text-teal/70">Forecast generated with {result.model}</div> : null}
        </Card>
      </div>

      {result ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <SectionTitle eyebrow="Forecast" title="Predicted Demand" />
            <RevenueLineChart labels={chartLabels} values={forecastValues} dashed />
          </Card>
          <Card>
            <SectionTitle eyebrow="Recommendation" title="Reorder Suggestion" />
            <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-300">
              Predicted demand over the horizon is {forecastValues.reduce((sum, value) => sum + value, 0).toFixed(1)} units.
              {reorderNeed ? ' Stock is below forecasted demand.' : ' Stock is sufficient for the forecast horizon.'}
            </div>
            <div className="mt-5 overflow-hidden rounded-3xl border border-white/8">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Predicted Units</th>
                    <th className="px-4 py-3">Confidence Interval</th>
                  </tr>
                </thead>
                <tbody>
                  {result.points.map((point) => (
                    <tr key={point.date} className="border-t border-white/5">
                      <td className="px-4 py-3">{format(new Date(point.date), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 font-mono">{point.predicted_units.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono">{point.lower_bound.toFixed(2)} - {point.upper_bound.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}