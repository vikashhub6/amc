import { useState } from 'react';
import api from '../../api/axios';
import useFetch from '../../utils/useFetch';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/constants';

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} onClick={() => onChange(n)} className={n <= value ? 'text-amber-400' : 'text-ink-200'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2 2 9.3l6.9-1L12 2Z" /></svg>
        </button>
      ))}
    </div>
  );
}

function FeedbackForm({ visitId, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await api.post('/feedback', { serviceVisit: visitId, rating, comment });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-ink-100 space-y-2">
      <StarRating value={rating} onChange={setRating} />
      <input className="input !text-xs" placeholder="Any comments? (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <button disabled={saving} onClick={submit} className="btn btn-primary text-xs">{saving ? 'Saving…' : 'Submit feedback'}</button>
    </div>
  );
}

export default function ServiceHistory() {
  const { data, loading, reload } = useFetch('/service-visits');
  const [feedbackGiven, setFeedbackGiven] = useState({});

  if (loading) return <Spinner />;
  const visits = data?.data || [];
  if (!visits.length) return <EmptyState title="No service visits yet" />;

  return (
    <div className="space-y-3">
      {visits.map((v) => (
        <div key={v._id} className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink-800">{v.product?.brand} {v.product?.modelName}</p>
              <p className="text-xs text-ink-400">Technician: {v.technician?.name} · {formatDate(v.completedDate || v.scheduledDate)}</p>
            </div>
            <Badge value={v.status} />
          </div>
          {v.technicianNotes && <p className="text-sm text-ink-600 mt-2">{v.technicianNotes}</p>}
          {v.status === 'completed' && !feedbackGiven[v._id] && (
            <FeedbackForm visitId={v._id} onDone={() => { setFeedbackGiven((f) => ({ ...f, [v._id]: true })); reload(); }} />
          )}
        </div>
      ))}
    </div>
  );
}
