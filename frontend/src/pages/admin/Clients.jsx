import useFetch from "../../utils/useFetch";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";

export default function AdminClients() {
  const { data, loading } = useFetch("/clients");
  const clients = data?.data || [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink-900">Clients</h2>
        <p className="text-sm text-ink-500">
          Customer accounts and service locations.
        </p>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : !clients.length ? (
          <EmptyState
            title="No clients yet"
            hint="Clients will appear here after they are added."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Zone</th>
                  <th className="text-left px-4 py-3">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {clients.map((client) => (
                  <tr key={client._id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-3 font-semibold text-ink-800">
                      {client.name}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{client.phone}</td>
                    <td className="px-4 py-3 text-ink-600">
                      {client.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{client.zone}</td>
                    <td className="px-4 py-3 text-ink-600">{client.address}</td>
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
