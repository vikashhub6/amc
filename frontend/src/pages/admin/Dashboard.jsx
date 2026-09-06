import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useFetch from '../../utils/useFetch';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import { Icon } from '../../components/icons';
import { formatMoney } from '../../utils/constants';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#3fc0b8', '#f59e0b', '#0ea5e9', '#f43f5e', '#9aa4b2'];

export default function Dashboard() {
  const { data: summary, loading } = useFetch('/dashboard/summary');
  const { data: trend } = useFetch('/dashboard/monthly-trend');

  if (loading || !summary) return <Spinner className="min-h-[60vh]" />;
  const s = summary.data;

  const revenueSeries = (trend?.data?.revenueByMonth || []).map((r) => ({
    month: MONTHS[r._id.month - 1],
    revenue: r.revenue,
  }));
  const amcSeries = (trend?.data?.newAMCByMonth || []).map((r) => ({
    month: MONTHS[r._id.month - 1],
    count: r.count,
  }));
  const complaintPie = (s.complaintsByStatus || []).map((c) => ({ name: c._id, value: c.count }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active AMC Contracts" value={s.activeAMC} tone="brand" icon={Icon.shield} hint={`${s.expiringSoon} expiring soon`} />
        <StatCard label="Overdue Visits" value={s.overdueVisits} tone="rose" icon={Icon.alert} />
        <StatCard label="Pending Payments" value={s.pendingPayments} tone="amber" icon={Icon.card} />
        <StatCard label="Total Revenue (paid)" value={formatMoney(s.totalRevenue)} tone="emerald" icon={Icon.chart} />
        <StatCard label="Total Clients" value={s.totalClients} tone="sky" icon={Icon.users} />
        <StatCard label="Total Complaints" value={s.totalComplaints} tone="amber" icon={Icon.alert} />
        <StatCard label="Complaint Resolution Rate" value={`${s.complaintResolutionRate}%`} tone="emerald" icon={Icon.chart} />
        <StatCard label="Avg. Feedback Rating" value={`${s.avgRating} / 5`} tone="brand" icon={Icon.star} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card p-5 xl:col-span-2">
          <h3 className="font-bold text-ink-900 mb-4">Revenue trend (last 6 months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueSeries}>
              <CartesianGrid stroke="#eef0f3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7686' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7686' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ borderRadius: 10, border: '1px solid #eef0f3' }} />
              <Line type="monotone" dataKey="revenue" stroke="#16827f" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-ink-900 mb-4">Complaints by status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={complaintPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {complaintPie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eef0f3' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 xl:col-span-3">
          <h3 className="font-bold text-ink-900 mb-4">New AMC contracts (last 6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={amcSeries}>
              <CartesianGrid stroke="#eef0f3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7686' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7686' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eef0f3' }} />
              <Bar dataKey="count" fill="#3fc0b8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
