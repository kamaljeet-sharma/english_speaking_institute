import { NavLink, Outlet } from 'react-router-dom';

const items = [
  ['/admin', 'Overview', true],
  ['/admin/courses', 'Courses'],
  ['/admin/batches', 'Batches'],
  ['/admin/live-classes', 'Live classes'],
  ['/admin/lectures', 'Recorded lessons'],
  ['/admin/students', 'Students'],
  ['/admin/payments', 'Payments'],
  ['/admin/announcements', 'Announcements'],
  ['/admin/demo-requests', 'Demo requests'],
  ['/admin/teachers', 'Teachers'],
];

const cls = ({ isActive }) =>
  `block whitespace-nowrap rounded-md px-3 py-2 text-[15px] font-semibold ${isActive ? 'bg-teal text-white' : 'text-ink hover:bg-surface'}`;

export default function AdminLayout() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[210px_1fr]">
      <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto md:block md:space-y-1">
        {items.map(([to, label, end]) => <NavLink key={to} to={to} end={end} className={cls}>{label}</NavLink>)}
      </nav>
      <div className="min-w-0"><Outlet /></div>
    </div>
  );
}
