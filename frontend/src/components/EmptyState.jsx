export default function EmptyState({ title = 'Nothing here yet', hint, action }) {
  return (
    <div className="text-center py-14 px-4">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-ink-100 flex items-center justify-center mb-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-ink-400">
          <path d="M3 7h18M3 12h18M3 17h10" />
        </svg>
      </div>
      <p className="font-semibold text-ink-700">{title}</p>
      {hint && <p className="text-sm text-ink-400 mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
