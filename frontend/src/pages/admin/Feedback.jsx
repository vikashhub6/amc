import useFetch from "../../utils/useFetch";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";

export default function AdminFeedback() {
  const { data, loading } = useFetch("/feedback");
  const feedback = data?.data || [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink-900">Feedback</h2>
        <p className="text-sm text-ink-500">
          Customer ratings and comments from completed visits.
        </p>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : !feedback.length ? (
          <EmptyState
            title="No feedback yet"
            hint="Customer feedback will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Technician</th>
                  <th className="text-left px-4 py-3">Rating</th>
                  <th className="text-left px-4 py-3">Comment</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {feedback.map((item) => (
                  <tr key={item._id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-3 font-semibold text-ink-800">
                      {item.client?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {item.technician?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-amber-600 font-bold">
                      {"★".repeat(item.rating)}{" "}
                      <span className="text-ink-500 font-normal">
                        {item.rating}/5
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {item.comment || "-"}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
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
