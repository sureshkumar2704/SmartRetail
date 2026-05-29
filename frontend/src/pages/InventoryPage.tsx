import { useMemo, useState } from 'react';
import { BarChartHorizontal } from '../components/charts';
import { Badge, Button, Card, Input, Modal, SectionTitle, Skeleton } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { getInventory, updateInventory } from '../services/api';
import type { InventoryRow } from '../types';

function statusTone(status: InventoryRow['status']) {
  if (status === 'Out') return 'danger';
  if (status === 'Low') return 'warning';
  return 'success';
}

export function InventoryPage() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<InventoryRow | null>(null);
  const [stock, setStock] = useState(0);
  const [reorder, setReorder] = useState(0);
  const inventory = useAsync(() => getInventory(), [selected]);

  const filtered = useMemo(
    () => (inventory.data ?? []).filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.sku.toLowerCase().includes(query.toLowerCase())),
    [inventory.data, query],
  );
  const alerts = filtered.filter((item) => item.current_stock <= item.reorder_level);

  const chartLabels = filtered.slice(0, 8).map((item) => item.name);
  const chartValues = filtered.slice(0, 8).map((item) => item.current_stock);

  async function saveChanges() {
    if (!selected) return;
    const updated = await updateInventory(selected.id, { current_stock: stock, reorder_level: reorder });
    setSelected(updated);
  }

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Inventory" title="Inventory Management" action={<Button onClick={() => window.print()}>Export Inventory Report</Button>} />
      {alerts.length > 0 ? (
        <div className="rounded-3xl border border-rose-500/25 bg-rose-500/10 px-5 py-4 text-rose-100">
          Low stock alert: {alerts.map((item) => item.name).join(', ')}
        </div>
      ) : null}

      <Card>
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products by name or SKU" />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          {inventory.loading ? (
            <Skeleton className="h-[600px]" />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/8">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Current Stock</th>
                    <th className="px-4 py-3">Reorder Level</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="cursor-pointer border-t border-white/5 hover:bg-white/5" onClick={() => { setSelected(item); setStock(item.current_stock); setReorder(item.reorder_level); }}>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 font-mono">{item.sku}</td>
                      <td className="px-4 py-3">{item.category}</td>
                      <td className="px-4 py-3">{item.current_stock}</td>
                      <td className="px-4 py-3">{item.reorder_level}</td>
                      <td className="px-4 py-3"><Badge tone={statusTone(item.status)}>{item.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle eyebrow="Distribution" title="Stock Level Distribution" />
            <BarChartHorizontal labels={chartLabels} values={chartValues} title="Stock" />
          </Card>
        </div>
      </div>

      <Modal open={Boolean(selected)} title="Edit Stock" onClose={() => setSelected(null)}>
        {selected ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Input type="number" value={stock} onChange={(event) => setStock(Number(event.target.value))} placeholder="Current stock" />
            <Input type="number" value={reorder} onChange={(event) => setReorder(Number(event.target.value))} placeholder="Reorder level" />
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={saveChanges}>Save Stock</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
