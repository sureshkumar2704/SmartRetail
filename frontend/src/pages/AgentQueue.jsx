import React, { useEffect, useState } from 'react';
import { getAgentActions, approveAgentAction, rejectAgentAction, getPurchaseOrders } from '../services/api.js';
import ActionCard from '../components/ActionCard.jsx';

export default function AgentQueuePage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ pending: 0, approvedToday: 0, pendingValue: 0 });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getAgentActions('pending');
    setActions(data || []);
    const pos = await getPurchaseOrders();
    const pendingValue = (pos || []).filter(p => p.status === 'draft' || p.status === 'sent').reduce((s, p) => s + (p.total_cost || 0), 0);
    setSummary({ pending: data.length || 0, approvedToday: 0, pendingValue });
    setLoading(false);
  }

  async function handleApprove(action) {
    // optimistic update
    setActions(prev => prev.filter(a => a.id !== action.id));
    try {
      await approveAgentAction(action.id);
      setSummary(s => ({ ...s, pending: Math.max(0, s.pending - 1), approvedToday: s.approvedToday + 1 }));
    } catch (err) {
      // rollback
      load();
    }
  }

  async function handleReject(action) {
    const notes = prompt('Rejection notes (optional)');
    setActions(prev => prev.filter(a => a.id !== action.id));
    try {
      await rejectAgentAction(action.id, notes);
      setSummary(s => ({ ...s, pending: Math.max(0, s.pending - 1) }));
    } catch (err) {
      load();
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agent Queue</h1>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          {loading ? <div>Loading…</div> : (
            actions.length === 0 ? <div className="p-8 text-center text-slate-400">All clear — no actions pending.</div> : (
              actions.map(a => <ActionCard key={a.id} action={a} onApprove={handleApprove} onReject={handleReject} />)
            )
          )}
        </div>
        <div className="col-span-4">
          <div className="bg-white/5 p-4 rounded mb-4">
            <div className="text-sm text-slate-400">Pending</div>
            <div className="text-3xl font-semibold">{summary.pending}</div>
            <div className="text-xs text-slate-400 mt-2">Approved today: {summary.approvedToday}</div>
            <div className="text-sm mt-4">PO value pending: ${summary.pendingValue.toFixed(2)}</div>
          </div>
          <div className="bg-white/5 p-4 rounded">
            <div className="text-sm text-slate-400">Actions by type</div>
            {/* lightweight summary; could be a small chart */}
            <div className="mt-2">Reorders: {actions.filter(a => a.action_type === 'reorder').length}</div>
            <div>Markdown: {actions.filter(a => a.action_type === 'markdown').length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
