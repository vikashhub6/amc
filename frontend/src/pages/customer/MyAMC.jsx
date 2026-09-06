import { useState } from 'react';
import api from '../../api/axios';
import useFetch from '../../utils/useFetch';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { formatDate, formatMoney } from '../../utils/constants';

export default function MyAMC() {
  const { data, loading, reload } = useFetch('/amc');
  const [busyId, setBusyId] = useState(null);

  async function renew(id) {
    setBusyId(id);
    try {
      await api.post(`/amc/${id}/renew`, {});
      reload();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Spinner />;
  const contracts = data?.data || [];
  if (!contracts.length) return <EmptyState title="No AMC contracts yet" hint="Contact us to set up your Annual Maintenance Contract." />;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {contracts.map((c) => (
        <div key={c._id} className="card p-5">
          <div className="flex items-center justify-between">
            <p className="font-bold text-ink-900">{c.planType} Plan</p>
            <Badge value={c.status} />
          </div>
          <p className="text-sm text-ink-500 mt-1">{c.product?.brand} {c.product?.modelName}</p>
          <div className="mt-3 text-sm space-y-1 text-ink-600">
            <p>Valid: {formatDate(c.startDate)} → {formatDate(c.endDate)}</p>
            <p>Next service due: <span className="font-semibold">{formatDate(c.nextServiceDate)}</span></p>
            <p>Amount: {formatMoney(c.amount)}</p>
          </div>
          {(c.status === 'expiring_soon' || c.status === 'expired') && (
            <button disabled={busyId === c._id} onClick={() => renew(c._id)} className="btn btn-primary w-full mt-4">
              {busyId === c._id ? 'Renewing…' : 'Renew AMC'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
