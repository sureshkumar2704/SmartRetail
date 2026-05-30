import React from 'react';

export default function ActionCard({ action, onApprove, onReject }) {
  const icon = action.action_type === 'reorder' ? '📦' : action.action_type === 'markdown' ? '💸' : '🔄';
  const urgency = action.payload && action.payload.total_cost ? 'red' : 'amber';

  return (
    <div className={`bg-white/5 border-l-4 border-${urgency}-500 p-4 rounded-md mb-4 shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-slate-400">{icon} {action.action_type.toUpperCase()}</div>
          <div className="text-lg font-semibold">{action.product_name} <span className="text-xs text-slate-400">{action.sku}</span></div>
          <div className="text-sm text-slate-300 mt-2">{action.payload && action.payload.order_qty ? `Order ${action.payload.order_qty} units from ${action.payload.supplier_name || ''}` : (action.payload && action.payload.discount_pct ? `Discount ${action.payload.discount_pct}%` : '')}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onApprove(action)} className="bg-emerald-500 text-white px-3 py-1 rounded">✅ Approve</button>
          <button onClick={() => onReject(action)} className="border border-slate-600 text-slate-100 px-3 py-1 rounded">✗ Reject</button>
        </div>
      </div>
    </div>
  );
}
