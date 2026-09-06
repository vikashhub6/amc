import useFetch from '../../utils/useFetch';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';

export default function AdminTechnicians() {
  const { data, loading } = useFetch('/technicians');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink-900">Technicians</h2>
        <p className="text-sm text-ink-500">Field technicians, their zones and specializations.</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : !data?.data?.length ? (
          <EmptyState title="No technicians yet" hint="Run the seed script or register technician users." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Name</th>
                  <th className="text-left font-semibold px-4 py-3">Contact</th>
                  <th className="text-left font-semibold px-4 py-3">Zones</th>
                  <th className="text-left font-semibold px-4 py-3">Specialization</th>
                  <th className="text-left font-semibold px-4 py-3">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.data.map((t) => (
                  <tr key={t._id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-3 font-semibold text-ink-800">{t.name}</td>
                    <td className="px-4 py-3 text-ink-600">{t.phone}<br /><span className="text-xs text-ink-400">{t.email}</span></td>
                    <td className="px-4 py-3 text-ink-600">{t.zones?.join(', ')}</td>
                    <td className="px-4 py-3 text-ink-600">{t.specialization?.join(', ')}</td>
                    <td className="px-4 py-3">
                      <Badge value={t.isAvailable ? 'active' : 'cancelled'}>{t.isAvailable ? 'Available' : 'Unavailable'}</Badge>
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
