import { useAuth } from '../../context/AuthContext';

export default function TechnicianProfile() {
  const { user } = useAuth();
  return (
    <div className="card p-5 space-y-3">
      <div className="w-14 h-14 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-lg mx-auto">
        {(user?.name || '?').slice(0, 1).toUpperCase()}
      </div>
      <div className="text-center">
        <p className="font-bold text-ink-900">{user?.name}</p>
        <p className="text-xs text-ink-500 capitalize">{user?.role}</p>
      </div>
      <div className="border-t border-ink-100 pt-3 text-sm space-y-2">
        <p><span className="text-ink-400">Email:</span> {user?.email}</p>
        <p><span className="text-ink-400">Phone:</span> {user?.phone}</p>
      </div>
    </div>
  );
}
