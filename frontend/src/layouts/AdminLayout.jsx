import { Outlet } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Icon } from '../components/icons';

const NAV = [
  { to: '/admin', end: true, label: 'Dashboard', icon: Icon.dashboard },
  { to: '/admin/clients', label: 'Clients', icon: Icon.users },
  { to: '/admin/products', label: 'Products', icon: Icon.box },
  { to: '/admin/amc', label: 'AMC Contracts', icon: Icon.shield },
  { to: '/admin/technicians', label: 'Technicians', icon: Icon.wrench },
  { to: '/admin/visits', label: 'Service Visits', icon: Icon.calendar },
  { to: '/admin/spare-parts', label: 'Spare Parts', icon: Icon.gear },
  { to: '/admin/complaints', label: 'Complaints', icon: Icon.alert },
  { to: '/admin/payments', label: 'Payments', icon: Icon.card },
  { to: '/admin/feedback', label: 'Feedback', icon: Icon.star },
  { to: '/admin/reports', label: 'Reports', icon: Icon.chart },
  { to: '/admin/alert-logs', label: 'Alert Logs', icon: Icon.bell },
];

export default function AdminLayout() {
  return (
    <AppShell title="Admin Panel" navItems={NAV}>
      <Outlet />
    </AppShell>
  );
}
