import { useState } from 'react';
import api from '../../api/axios';
import useFetch from '../../utils/useFetch';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';

export default function CustomerComplaints() {
  const { user } = useAuth();
  const { data: amcData } = useFetch('/amc');
  const { data, loading, reload } = useFetch('/complaints');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const product = amcData?.data?.[0]?.product?._id;
      await api.post('/complaints', { client: user.client, product, description, priority });
      setDescription('');
      reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to raise complaint');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="card p-5 space-y-3">
        <h3 className="font-bold text-ink-900">Raise a complaint</h3>
        {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
        <div>
          <label className="label">What's wrong?</label>
          <textarea required className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. AC not cooling properly" />
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {['low', 'medium', 'high', 'critical'].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button disabled={saving} className="btn btn-primary">{saving ? 'Submitting…' : 'Submit complaint'}</button>
      </form>

      <div>
        <h3 className="font-bold text-ink-900 mb-3">My complaints</h3>
        {loading ? (
          <Spinner />
        ) : !data?.data?.length ? (
          <EmptyState title="No complaints raised yet" />
        ) : (
          <div className="space-y-3">
            {data.data.map((c) => (
              <div key={c._id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink-800">{c.description}</p>
                  <p className="text-xs text-ink-400 mt-1">Ticket {c.ticketId} · {c.assignedTechnician?.name ? `Assigned to ${c.assignedTechnician.name}` : 'Awaiting assignment'}</p>
                </div>
                <Badge value={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
