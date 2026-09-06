import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TABS = [
  {
    to: '/technician',
    label: "Today",
    end: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    to: '/technician/complaints',
    label: 'Complaints',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </svg>
    ),
  },
  {
    to: '/technician/profile',
    label: 'Profile',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
];

// Mobile-first PWA-style shell: top app bar + bottom tab nav (no desktop sidebar).
export default function TechnicianShell({ title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col max-w-lg mx-auto lg:border-x border-ink-100">
      <header className="h-14 bg-ink-900 text-white flex items-center justify-between px-4 sticky top-0 z-20 shrink-0">
        <div>
          <p className="text-sm font-bold leading-none">{title}</p>
          <p className="text-[11px] text-ink-400 mt-0.5">{user?.name}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="text-xs font-semibold text-ink-300 hover:text-white px-2 py-1"
        >
          Log out
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-ink-100 flex z-20">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-semibold ${
                isActive ? 'text-brand-600' : 'text-ink-400'
              }`
            }
          >
            {tab.icon}
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
