import { Outlet } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Icon } from '../components/icons';

const NAV = [
  { to: '/customer', end: true, label: 'My AMC', icon: Icon.shield },
  { to: '/customer/history', label: 'Service History', icon: Icon.calendar },
  { to: '/customer/complaints', label: 'Complaints', icon: Icon.alert },
];

export default function CustomerLayout() {
  return (
    <AppShell title="Customer Portal" navItems={NAV}>
      <Outlet />
    </AppShell>
  );
}
