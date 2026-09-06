import useFetch from '../../utils/useFetch';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/constants';

export default function TechnicianComplaints() {
  const { data, loading } = useFetch('/complaints');

  if (loading) return <Spinner />;
  const complaints = data?.data || [];
  if (!complaints.length) return <EmptyState title="No complaints assigned" />;

  return (
    <div className="space-y-3">
      {complaints.map((c) => (
        <div key={c._id} className="card p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-ink-900">{c.client?.name}</p>
            <Badge value={c.priority} />
          </div>
          <p className="text-sm text-ink-600 mt-1">{c.description}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge value={c.status} />
            <p className="text-[11px] text-ink-400">SLA: {formatDate(c.slaDeadline)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
