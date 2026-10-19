import { NavLink, Outlet } from 'react-router-dom';

const tab = ({ isActive }) =>
  `border-b-2 px-1 py-3 text-[15px] font-semibold ${isActive ? 'border-teal text-teal' : 'border-transparent text-ink-soft hover:text-ink'}`;

export default function StudentLayout() {
  return (
    <div>
      <div className="border-b border-line bg-surface">
        <nav className="mx-auto flex max-w-6xl gap-6 px-4" aria-label="Student sections">
          <NavLink end to="/student" className={tab}>Dashboard</NavLink>
          <NavLink to="/student/payments" className={tab}>Payments</NavLink>
          <NavLink to="/student/profile" className={tab}>Profile</NavLink>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8"><Outlet /></div>
    </div>
  );
}
