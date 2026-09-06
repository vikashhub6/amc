import { useState } from 'react';
import api from '../../api/axios';
import useFetch from '../../utils/useFetch';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/constants';

const STATUSES = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];

export default function AdminComplaints() {
  const { data, loading, reload } = useFetch('/complaints');
  const [busyId, setBusyId] = useState(null);

  async function updateStatus(id, status) {
    setBusyId(id);
    try {
      await api.patch(`/complaints/${id}/status`, { status });
      reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink-900">Complaints</h2>
        <p className="text-sm text-ink-500">Breakdown tickets, auto-assigned to the nearest available technician by zone.</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : !data?.data?.length ? (
          <EmptyState title="No complaints" hint="Complaints raised by customers will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Ticket</th>
                  <th className="text-left font-semibold px-4 py-3">Client</th>
                  <th className="text-left font-semibold px-4 py-3">Issue</th>
                  <th className="text-left font-semibold px-4 py-3">Priority</th>
                  <th className="text-left font-semibold px-4 py-3">Technician</th>
                  <th className="text-left font-semibold px-4 py-3">SLA</th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.data.map((c) => (
                  <tr key={c._id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-ink-500">{c.ticketId}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink-800">{c.client?.name}</p>
                      <p className="text-xs text-ink-400">{c.zone}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600 max-w-xs truncate">{c.description}</td>
                    <td className="px-4 py-3"><Badge value={c.priority} /></td>
                    <td className="px-4 py-3 text-ink-600">{c.assignedTechnician?.name || '—'}</td>
                    <td className="px-4 py-3 text-ink-500 text-xs">{formatDate(c.slaDeadline)}</td>
                    <td className="px-4 py-3">
                      <select
                        disabled={busyId === c._id}
                        value={c.status}
                        onChange={(e) => updateStatus(c._id, e.target.value)}
                        className="input !py-1.5 !text-xs w-auto"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
