import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Button, Card, Input } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const baseSeries = [8, 14, 11, 21, 24, 19, 28, 33, 31, 37, 42, 48];

export function LoginPage() {
  const [email, setEmail] = useState('demo@smartretail.ai');
  const [password, setPassword] = useState('demo1234');
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signIn, signInDemo, token } = useAuth();

  useEffect(() => {
    const timer = window.setInterval(() => setStep((current) => (current + 1) % baseSeries.length), 1800);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [navigate, token]);

  const data = useMemo(() => {
    const rotated = [...baseSeries.slice(step), ...baseSeries.slice(0, step)];
    return {
      labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F'],
      datasets: [
        {
          label: 'Sales',
          data: rotated,
          borderColor: '#00D4AA',
          backgroundColor: 'rgba(0, 212, 170, 0.16)',
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [step]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Login failed');
    }
  }

  async function handleDemo() {
    await signInDemo();
    navigate('/dashboard');
  }

  return (
    <div className="relative min-h-screen overflow-hidden floating-particles">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,212,170,0.22),transparent_32%),linear-gradient(180deg,#0A0F1E,#060913)]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center px-6 py-12 lg:px-12">
          <div className="w-full fade-in-up">
            <div className="mb-6 text-xs uppercase tracking-[0.45em] text-teal/70">SmartRetail AI</div>
            <h1 className="max-w-lg font-heading text-5xl font-bold leading-tight text-white md:text-6xl">Turn Transactions into Intelligence.</h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">Live retail analytics, inventory controls, and demand forecasting in one operational command center.</p>
            <Card className="mt-10 max-w-2xl border-white/10 bg-white/5 p-4">
              <Line data={data} options={{ plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94A3B8' } }, y: { ticks: { color: '#94A3B8' } } } }} />
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 lg:px-12">
          <Card className="w-full max-w-md p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-teal/70">Welcome Back</div>
            <h2 className="mt-2 font-heading text-3xl font-bold">Sign in to continue</h2>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
              {error ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
              <Button type="submit" className="w-full">Sign In</Button>
              <Button type="button" variant="secondary" className="w-full" onClick={handleDemo}>Continue as Demo</Button>
            </form>
            <div className="mt-6 text-sm text-slate-400">Use demo credentials to explore every screen without backend setup.</div>
          </Card>
        </div>
      </div>
    </div>
  );
}