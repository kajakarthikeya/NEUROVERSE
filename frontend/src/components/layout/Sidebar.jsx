import { Award, BrainCircuit, LayoutDashboard, LogOut, Orbit } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/learn', label: 'Learning Scene', icon: Orbit },
];

export function Sidebar() {
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }

  return (
    <aside className="glass flex w-full max-w-xs flex-col gap-6 rounded-[32px] p-6 lg:min-h-[calc(100vh-2rem)]">
      <div className="flex items-center gap-4">
        <div className="shadow-glow flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon to-violetNova text-white">
          <BrainCircuit className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm text-slate-400">Welcome back</p>
          <h2 className="text-lg font-semibold text-white">{user?.displayName || 'Explorer'}</h2>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-neon/20 to-violetNova/20 text-white shadow-glow'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white hover:shadow-glow'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Card hover={false} className="border-neon/15 bg-neon/10 p-5">
        <div className="mb-3 flex items-center gap-2 text-neon">
          <Award className="h-4 w-4" />
          <span className="text-sm font-medium">Experience Mode</span>
        </div>
        <p className="text-sm text-slate-300">
          Switch to fullscreen in the learning scene for an immersive VR-style walkthrough.
        </p>
      </Card>

      <Button type="button" variant="secondary" onClick={handleLogout} className="mt-auto w-full justify-center rounded-2xl">
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </aside>
  );
}
