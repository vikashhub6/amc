import { useState } from 'react';
import api from '../../api/axios';
import useFetch from '../../utils/useFetch';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { ZONES, PRODUCT_CATEGORIES, AMC_PLANS, formatDate, formatMoney } from '../../utils/constants';

const emptyForm = {
  clientName: '', phone: '', email: '', address: '', zone: ZONES[0],
  category: 'AC', brand: '', modelName: '', serialNumber: '', purchaseDate: '',
  planType: 'Standard', amount: 3500, startDate: new Date().toISOString().slice(0, 10),
};

export default function AdminAMC() {
  const { data, loading, reload } = useFetch('/amc');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // Client + Product + AMC ek hi form se, teen sequential API calls
      const clientRes = await api.post('/clients', {
        name: form.clientName, phone: form.phone, email: form.email, address: form.address, zone: form.zone,
      });
      const client = clientRes.data.data._id;

      const productRes = await api.post('/products', {
        client, category: form.category, brand: form.brand, modelName: form.modelName,
        serialNumber: form.serialNumber, purchaseDate: form.purchaseDate,
      });
      const product = productRes.data.data._id;

      await api.post('/amc', {
        client, product, planType: form.planType, amount: form.amount, startDate: form.startDate,
      });

      setOpen(false);
      setForm(emptyForm);
      reload();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create AMC');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-900">AMC Contracts</h2>
          <p className="text-sm text-ink-500">Clients, products, and their annual maintenance contracts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ New AMC Customer</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : !data?.data?.length ? (
          <EmptyState title="No AMC contracts yet" hint="Click 'New AMC Customer' to add your first one." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Client</th>
                  <th className="text-left font-semibold px-4 py-3">Product</th>
                  <th className="text-left font-semibold px-4 py-3">Plan</th>
                  <th className="text-left font-semibold px-4 py-3">Next Service</th>
                  <th className="text-left font-semibold px-4 py-3">Amount</th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.data.map((c) => (
                  <tr key={c._id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink-800">{c.client?.name}</p>
                      <p className="text-xs text-ink-400">{c.client?.zone}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{c.product?.brand} {c.product?.modelName}</td>
                    <td className="px-4 py-3 text-ink-600">{c.planType}</td>
                    <td className="px-4 py-3 text-ink-600">{formatDate(c.nextServiceDate)}</td>
                    <td className="px-4 py-3 text-ink-600">{formatMoney(c.amount)}</td>
                    <td className="px-4 py-3"><Badge value={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New AMC Customer" width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}

          <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Client</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Name</label><input required className="input" value={form.clientName} onChange={(e) => set('clientName', e.target.value)} /></div>
            <div><label className="label">Phone</label><input required className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
            <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
            <div><label className="label">Zone</label>
              <select className="input" value={form.zone} onChange={(e) => set('zone', e.target.value)}>
                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div className="col-span-2"><label className="label">Address</label><input required className="input" value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
          </div>

          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 pt-2">Product</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Brand</label><input required className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} /></div>
            <div><label className="label">Model</label><input required className="input" value={form.modelName} onChange={(e) => set('modelName', e.target.value)} /></div>
            <div><label className="label">Serial No.</label><input required className="input" value={form.serialNumber} onChange={(e) => set('serialNumber', e.target.value)} /></div>
            <div><label className="label">Purchase Date</label><input type="date" required className="input" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} /></div>
          </div>

          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 pt-2">AMC Plan</p>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">Plan Type</label>
              <select className="input" value={form.planType} onChange={(e) => set('planType', e.target.value)}>
                {AMC_PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="label">Amount (Rs.)</label><input type="number" required className="input" value={form.amount} onChange={(e) => set('amount', e.target.value)} /></div>
            <div><label className="label">Start Date</label><input type="date" required className="input" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} /></div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : 'Create AMC'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
