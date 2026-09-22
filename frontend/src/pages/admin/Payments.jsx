import useFetch from "../../utils/useFetch";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import Badge from "../../components/Badge";
import { formatDate, formatMoney } from "../../utils/constants";

export default function AdminPayments() {
  const { data, loading } = useFetch("/payments");
  const payments = data?.data || [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink-900">Payments</h2>
        <p className="text-sm text-ink-500">
          Invoices, due dates, and payment status.
        </p>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : !payments.length ? (
          <EmptyState
            title="No payments yet"
            hint="Payment records will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Invoice</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Due Date</th>
                  <th className="text-left px-4 py-3">Method</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-3 font-semibold text-ink-800">
                      {payment.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {payment.client?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {formatMoney(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {formatDate(payment.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {payment.method || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={payment.status} />
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
