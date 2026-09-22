export default function SectionPlaceholder({ title, description }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink-900">{title}</h2>
        <p className="text-sm text-ink-500">{description}</p>
      </div>
      <div className="card p-8 text-center">
        <p className="font-semibold text-ink-800">{title} is ready</p>
        <p className="text-sm text-ink-500 mt-1">
          This section is connected and ready for records.
        </p>
      </div>
    </div>
  );
}
