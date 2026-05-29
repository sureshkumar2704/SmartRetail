import { useState } from 'react';
import { Button, Card, Input, SectionTitle } from '../components/ui';
import { saveStoreSettings } from '../services/api';

const tabs = ['Profile', 'Store Config', 'Notifications'] as const;

export function SettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Profile');
  const [confirm, setConfirm] = useState('');
  const [storeName, setStoreName] = useState('SmartRetail Store');
  const [email, setEmail] = useState('manager@smartretail.ai');

  async function save() {
    await saveStoreSettings({
      store_name: storeName,
      currency: 'USD',
      timezone: 'UTC',
      reorder_threshold: 20,
      low_stock_alert: true,
      daily_report_email: true,
      forecast_accuracy_alert: true,
    });
    window.alert('Settings saved');
  }

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Administration" title="Settings" />
      <Card>
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button key={item} className={`rounded-2xl px-4 py-3 text-sm transition ${tab === item ? 'bg-teal text-slate-950' : 'bg-white/5 text-white'}`} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>
      </Card>

      {tab === 'Profile' ? (
        <Card className="space-y-4">
          <Input value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="Full name" />
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <Input type="file" />
          <Button onClick={save}>Save Changes</Button>
        </Card>
      ) : null}

      {tab === 'Store Config' ? (
        <Card className="space-y-4">
          <Input value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="Store name" />
          <Input defaultValue="USD" placeholder="Currency" />
          <Input defaultValue="UTC" placeholder="Timezone" />
          <Input defaultValue={20} type="number" placeholder="Reorder threshold" />
          <Button onClick={save}>Save Changes</Button>
        </Card>
      ) : null}

      {tab === 'Notifications' ? (
        <Card className="space-y-4">
          <label className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">Low Stock Alert <input type="checkbox" defaultChecked /></label>
          <label className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">Daily Report Email <input type="checkbox" defaultChecked /></label>
          <label className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">Forecast Accuracy Alert <input type="checkbox" defaultChecked /></label>
          <Button onClick={save}>Save Changes</Button>
        </Card>
      ) : null}

      <Card className="space-y-4 border-rose-500/20">
        <div className="font-heading text-xl font-bold text-rose-300">Danger Zone</div>
        <Input value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder='Type CONFIRM to enable' />
        <Button variant="secondary" disabled={confirm !== 'CONFIRM'} className="border border-rose-500/20 text-rose-200">Clear All Data</Button>
      </Card>
    </div>
  );
}
