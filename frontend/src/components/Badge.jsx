const COLOR_MAP = {
  // AMC / general status
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  expiring_soon: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  expired: 'bg-ink-100 text-ink-500 ring-1 ring-ink-200',
  cancelled: 'bg-ink-100 text-ink-500 ring-1 ring-ink-200',
  // Visit status
  scheduled: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  in_progress: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  missed: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  // Complaint status
  open: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  assigned: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  resolved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  closed: 'bg-ink-100 text-ink-500 ring-1 ring-ink-200',
  // Priority
  low: 'bg-ink-100 text-ink-600 ring-1 ring-ink-200',
  medium: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  high: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  // Payment
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  overdue: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  // Alerts
  sent: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  failed: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

export default function Badge({ value, children }) {
  const cls = COLOR_MAP[value] || 'bg-ink-100 text-ink-600 ring-1 ring-ink-200';
  return (
    <span className={`badge ${cls}`}>
      {(children || value || '').toString().replace(/_/g, ' ')}
    </span>
  );
}
