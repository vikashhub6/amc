import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'technician') navigate('/technician');
      else navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-600/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-800/30 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 mx-auto flex items-center justify-center font-black text-white text-lg mb-3">
            DC
          </div>
          <h1 className="text-white font-extrabold text-xl">Dynamic Cooling System</h1>
          <p className="text-ink-400 text-sm mt-1">AMC Management &middot; Vapi, Gujarat</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h2 className="font-bold text-ink-900">Sign in</h2>

          {error && (
            <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>
          )}

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-ink-500">
            New customer?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </form>

        <div className="mt-4 card p-4 text-xs text-ink-500 space-y-1">
          <p className="font-semibold text-ink-600">Demo logins (after `npm run seed`)</p>
          <p>Admin: admin@dynamiccooling.in / admin123</p>
          <p>Technician: ramesh.tech@dynamiccooling.in / tech123</p>
        </div>
      </div>
    </div>
  );
}
