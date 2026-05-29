import { useState } from 'react';
import { Button, Card, Modal, SectionTitle } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { getReports, scheduleReports } from '../services/api';

const reportKinds = [
  { key: 'sales-summary', title: 'Monthly Sales Summary' },
  { key: 'inventory', title: 'Inventory Health Report' },
  { key: 'forecast', title: 'Demand Forecast Report' },
] as const;

export function ReportsPage() {
  const [open, setOpen] = useState<null | (typeof reportKinds)[number]['key']>(null);
  const [schedule, setSchedule] = useState(false);
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const reports = {
    sales: useAsync(() => getReports('sales-summary'), []),
    inventory: useAsync(() => getReports('inventory'), []),
    forecast: useAsync(() => getReports('forecast'), []),
  };

  async function toggleSchedule(next: boolean) {
    setSchedule(next);
    await scheduleReports({ enabled: next, frequency });
  }

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Reports" title="Reports & Export" />
      <Card className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input type="checkbox" checked={schedule} onChange={(event) => toggleSchedule(event.target.checked)} />
          Schedule Report
        </label>
        <select className="rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm" value={frequency} onChange={(event) => setFrequency(event.target.value as 'Daily' | 'Weekly' | 'Monthly')}>
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        {reportKinds.map((kind) => (
          <Card key={kind.key} className="space-y-4">
            <div className="h-36 rounded-3xl bg-gradient-to-br from-teal/30 to-amber-500/20" />
            <div className="font-heading text-xl font-bold">{kind.title}</div>
            <div className="text-sm text-slate-400">Generated today at 00:00 UTC</div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setOpen(kind.key)}>View</Button>
              <Button onClick={() => window.print()}>Download CSV</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={Boolean(open)} title="Report Preview" onClose={() => setOpen(null)}>
        <div className="text-sm text-slate-300">Preview content loads from the report endpoints and can be expanded into charts and tables.</div>
      </Modal>
    </div>
  );
}
