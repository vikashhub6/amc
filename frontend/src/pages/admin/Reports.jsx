import useFetch from "../../utils/useFetch";
import Spinner from "../../components/Spinner";
import { formatMoney } from "../../utils/constants";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AdminReports() {
  const { data: trend, loading: trendLoading } = useFetch(
    "/dashboard/monthly-trend",
  );
  const { data: area, loading: areaLoading } = useFetch("/dashboard/area-wise");
  const revenue = trend?.data?.revenueByMonth || [];
  const amcs = trend?.data?.newAMCByMonth || [];
  const areas = area?.data || [];

  if (trendLoading || areaLoading) return <Spinner className="min-h-[60vh]" />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink-900">Reports</h2>
        <p className="text-sm text-ink-500">
          Revenue, AMC growth, and zone-wise service activity.
        </p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-ink-100">
            <h3 className="font-bold text-ink-900">Monthly revenue</h3>
          </div>
          {!revenue.length ? (
            <p className="p-5 text-sm text-ink-500">
              No monthly revenue records.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Month</th>
                  <th className="text-right px-5 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {revenue.map((item) => (
                  <tr key={`${item._id.year}-${item._id.month}`}>
                    <td className="px-5 py-3">
                      {MONTHS[item._id.month - 1]} {item._id.year}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">
                      {formatMoney(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-ink-100">
            <h3 className="font-bold text-ink-900">AMC growth</h3>
          </div>
          {!amcs.length ? (
            <p className="p-5 text-sm text-ink-500">No AMC growth records.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Month</th>
                  <th className="text-right px-5 py-3">New contracts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {amcs.map((item) => (
                  <tr key={`${item._id.year}-${item._id.month}`}>
                    <td className="px-5 py-3">
                      {MONTHS[item._id.month - 1]} {item._id.year}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">
                      {item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-ink-100">
          <h3 className="font-bold text-ink-900">Area-wise report</h3>
        </div>
        {!areas.length ? (
          <p className="p-5 text-sm text-ink-500">No area report records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Zone</th>
                  <th className="text-right px-5 py-3">Clients</th>
                  <th className="text-right px-5 py-3">Complaints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {areas.map((item) => (
                  <tr key={item.zone}>
                    <td className="px-5 py-3 font-semibold">{item.zone}</td>
                    <td className="px-5 py-3 text-right">{item.clients}</td>
                    <td className="px-5 py-3 text-right">{item.complaints}</td>
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
