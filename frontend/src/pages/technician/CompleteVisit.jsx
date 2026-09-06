import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import useFetch from '../../utils/useFetch';
import Spinner from '../../components/Spinner';
import SignaturePad from '../../components/SignaturePad';
import Badge from '../../components/Badge';

export default function CompleteVisit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: visitRes, loading } = useFetch(`/service-visits/${id}`);
  const { data: partsRes } = useFetch('/spare-parts');

  const [photosBefore, setPhotosBefore] = useState([]);
  const [photosAfter, setPhotosAfter] = useState([]);
  const [signature, setSignature] = useState(null);
  const [notes, setNotes] = useState('');
  const [partsUsed, setPartsUsed] = useState([]); // [{sparePart, quantity}]
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (loading) return <Spinner />;
  const visit = visitRes?.data;
  if (!visit) return <p className="text-sm text-ink-500">Visit not found.</p>;

  function addPart() {
    const first = partsRes?.data?.[0];
    if (!first) return;
    setPartsUsed((p) => [...p, { sparePart: first._id, quantity: 1 }]);
  }
  function updatePart(i, field, value) {
    setPartsUsed((p) => p.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  function removePart(i) {
    setPartsUsed((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      photosBefore.forEach((f) => fd.append('photosBefore', f));
      photosAfter.forEach((f) => fd.append('photosAfter', f));
      if (signature) fd.append('signature', signature);
      fd.append('technicianNotes', notes);
      fd.append('partsUsed', JSON.stringify(partsUsed.filter((p) => p.sparePart && p.quantity > 0)));

      await api.put(`/service-visits/${id}/complete`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDone(true);
      setTimeout(() => navigate('/technician'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSaving(false);
    }
  }

  if (visit.status === 'completed' || done) {
    return (
      <div className="card p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 13 4 4L19 7" /></svg>
        </div>
        <p className="font-bold text-ink-900">Service already completed</p>
        <p className="text-sm text-ink-500 mt-1">Redirecting…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <p className="font-bold text-ink-900">{visit.client?.name}</p>
          <Badge value={visit.status} />
        </div>
        <p className="text-xs text-ink-500 mt-1">{visit.client?.address}</p>
        {visit.product && <p className="text-xs text-ink-400 mt-0.5">{visit.product.brand} {visit.product.modelName}</p>}
      </div>

      {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}

      <div className="card p-4">
        <label className="label">Photos - Before</label>
        <input type="file" accept="image/*" multiple capture="environment" onChange={(e) => setPhotosBefore([...e.target.files])} className="text-xs" />
        <label className="label mt-3">Photos - After</label>
        <input type="file" accept="image/*" multiple capture="environment" onChange={(e) => setPhotosAfter([...e.target.files])} className="text-xs" />
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="label !mb-0">Parts used</label>
          <button type="button" onClick={addPart} className="btn btn-ghost text-xs">+ Add part</button>
        </div>
        {partsUsed.length === 0 && <p className="text-xs text-ink-400">No parts used yet.</p>}
        <div className="space-y-2">
          {partsUsed.map((row, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select className="input !text-xs flex-1" value={row.sparePart} onChange={(e) => updatePart(i, 'sparePart', e.target.value)}>
                {(partsRes?.data || []).map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.quantityInStock} left)</option>
                ))}
              </select>
              <input type="number" min={1} className="input !text-xs w-16" value={row.quantity} onChange={(e) => updatePart(i, 'quantity', Number(e.target.value))} />
              <button type="button" onClick={() => removePart(i)} className="btn btn-ghost !p-2 text-rose-500">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <label className="label">Technician notes</label>
        <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Work done, observations…" />
      </div>

      <div className="card p-4">
        <label className="label">Customer signature</label>
        <SignaturePad onChange={setSignature} />
      </div>

      <button type="submit" disabled={saving} className="btn btn-primary w-full py-3">
        {saving ? 'Submitting…' : 'Mark Service Completed'}
      </button>
    </form>
  );
}
