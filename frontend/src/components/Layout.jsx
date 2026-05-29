import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from './ui.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/sales', label: 'Sales Analytics' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/forecast', label: 'Forecasting' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

export function AppShell({ children }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,212,170,0.16),transparent_32%),linear-gradient(180deg,#0A0F1E,#060913)] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 p-4 md:p-6">
        <aside className="glass hidden w-72 shrink-0 rounded-[28px] p-5 lg:block">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.35em] text-teal/70">SmartRetail AI</div>
            <h1 className="mt-2 font-heading text-3xl font-bold">Retail Intelligence</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm transition ${isActive ? 'bg-teal text-slate-950' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 rounded-3xl bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</div>
            <div className="mt-1 font-semibold">{user?.name ?? 'Guest'}</div>
            <div className="text-sm text-slate-400">{user?.email ?? 'demo'}</div>
            <Button className="mt-4 w-full" variant="secondary" onClick={signOut}>Sign Out</Button>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden rounded-[32px] bg-white/[0.03] p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-white/7 bg-surface/70 px-5 py-4 backdrop-blur">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-teal/70">Operational View</div>
              <div className="font-heading text-2xl font-bold">SmartRetail Control Center</div>
            </div>
            <div className="text-right text-sm text-slate-400">
              <div>{user?.name ?? 'Demo User'}</div>
              <div className="text-mono">Analytics active</div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}