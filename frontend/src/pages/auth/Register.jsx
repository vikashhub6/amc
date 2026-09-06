import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ZONES } from '../../utils/constants';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', address: '', zone: ZONES[0],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...form, role: 'customer' });
      navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 p-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-6 space-y-4">
        <div>
          <h1 className="font-extrabold text-lg text-ink-900">Create your account</h1>
          <p className="text-sm text-ink-500">Customer portal &middot; Dynamic Cooling System</p>
        </div>

        {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Full name</label>
            <input required className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input required className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label">Password</label>
            <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => set('password', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label">Address</label>
            <input required className="input" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label">Zone (Vapi area)</label>
            <select className="input" value={form.zone} onChange={(e) => set('zone', e.target.value)}>
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
