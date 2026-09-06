import { Link } from 'react-router-dom';
import useFetch from '../../utils/useFetch';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';

export default function TodayVisits() {
  const { data, loading } = useFetch('/technicians/my-today-visits');

  if (loading) return <Spinner />;
  const visits = data?.data || [];

  if (!visits.length) {
    return <EmptyState title="No visits assigned today" hint="Check back tomorrow, or pull to refresh." />;
  }

  return (
    <div className="space-y-3">
      {visits.map((v) => (
        <Link
          key={v._id}
          to={`/technician/visit/${v._id}`}
          className="card p-4 flex items-center justify-between block active:scale-[0.99] transition-transform"
        >
          <div className="min-w-0">
            <p className="font-bold text-ink-900 truncate">{v.client?.name}</p>
            <p className="text-xs text-ink-500 truncate">{v.client?.address}</p>
            <p className="text-xs text-brand-600 font-semibold mt-1">{v.client?.zone}</p>
            {v.product && <p className="text-xs text-ink-400 mt-0.5">{v.product.brand} {v.product.modelName}</p>}
          </div>
          <div className="text-right shrink-0 ml-3">
            <Badge value={v.status} />
            <p className="text-[10px] text-ink-400 mt-1 capitalize">{v.type}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
