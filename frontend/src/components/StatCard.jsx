export default function StatCard({ label, value, hint, tone = 'brand', icon }) {
  const toneClasses = {
    brand: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    sky: 'bg-sky-50 text-sky-700',
  };

  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <p className="mt-1.5 text-2xl font-extrabold text-ink-900 tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      </div>
      {icon && (
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${toneClasses[tone]}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
