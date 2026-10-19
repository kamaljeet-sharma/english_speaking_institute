import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../api';
import ResourceManager from '../../components/ResourceManager';
import { Alert, Badge, Button, Empty, PageHeader, Spinner, inputCls } from '../../components/ui';
import { fmtDate, fmtDateTime, rupees } from '../../utils';

export const Courses = () => (
  <ResourceManager
    title="Courses" singular="Course" endpoint="/courses"
    defaults={{ level: 'Beginner', mode: 'both', isPublished: true, durationWeeks: 8 }}
    fields={[
      { name: 'title', label: 'Title', type: 'text', required: true, wide: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'level', label: 'Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'mode', label: 'Format', type: 'select', options: ['live', 'recorded', 'both'], hint: '"recorded" courses do not need a batch.' },
      { name: 'price', label: 'Price (₹)', type: 'number', required: true, hint: '0 makes the course free.' },
      { name: 'durationWeeks', label: 'Duration (weeks)', type: 'number' },
      { name: 'thumbnail', label: 'Thumbnail image URL', type: 'url' },
      { name: 'syllabus', label: 'Syllabus (one topic per line)', type: 'lines' },
      { name: 'isPublished', label: 'Visible on website', type: 'checkbox' },
    ]}
    columns={[
      { label: 'Title', render: (c) => <span className="font-semibold">{c.title}</span> },
      { label: 'Level', render: (c) => <Badge>{c.level}</Badge> },
      { label: 'Format', render: (c) => c.mode },
      { label: 'Price', render: (c) => rupees(c.price) },
      { label: 'Status', render: (c) => <Badge tone={c.isPublished ? 'active' : 'inactive'}>{c.isPublished ? 'Published' : 'Hidden'}</Badge> },
    ]}
  />
);

function BatchStudents({ batch }) {
  const [list, setList] = useState(null);
  return (
    <>
      <button className="font-semibold text-ink hover:underline" onClick={() => api.get(`/batches/${batch._id}/students`).then((r) => setList(r.data))}>Students</button>
      {list && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Batch students">
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-surface p-6 text-left">
            <h2 className="text-lg font-bold">{batch.name}: students</h2>
            {list.length === 0 ? <p className="mt-3 text-ink-soft">No students yet.</p> : (
              <ul className="mt-3 divide-y divide-line">{list.map((s) => <li key={s._id} className="py-2"><p className="font-semibold">{s.name}</p><p className="text-sm text-ink-soft">{s.email} · {s.phone}</p></li>)}</ul>
            )}
            <Button variant="ghost" className="mt-4" onClick={() => setList(null)}>Close</Button>
          </div>
        </div>
      )}
    </>
  );
}

export const Batches = () => (
  <ResourceManager
    title="Batches" singular="Batch" endpoint="/batches"
    defaults={{ status: 'upcoming', seatLimit: 20 }}
    fields={[
      { name: 'name', label: 'Batch name', type: 'text', required: true, hint: 'e.g. Weekday Evening' },
      { name: 'course', label: 'Course', type: 'ref', required: true, ref: { endpoint: '/courses' } },
      { name: 'teacher', label: 'Teacher', type: 'ref', ref: { endpoint: '/admin/teachers' } },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'days', label: 'Days', type: 'list', hint: 'Comma separated, e.g. Mon, Wed, Fri' },
      { name: 'timing', label: 'Timing', type: 'text', hint: 'e.g. 7:00 PM - 8:00 PM IST' },
      { name: 'seatLimit', label: 'Seat limit', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['upcoming', 'running', 'completed'] },
    ]}
    columns={[
      { label: 'Batch', render: (b) => <span className="font-semibold">{b.name}</span> },
      { label: 'Course', render: (b) => b.course?.title },
      { label: 'Teacher', render: (b) => b.teacher?.name || '-' },
      { label: 'Schedule', render: (b) => <>{b.days?.join(', ')}<br /><span className="text-ink-soft">{b.timing}</span></> },
      { label: 'Starts', render: (b) => fmtDate(b.startDate) },
      { label: 'Seats', render: (b) => `${b.enrolled ?? 0} / ${b.seatLimit}` },
      { label: 'Status', render: (b) => b.status },
    ]}
    rowActions={(b) => <BatchStudents batch={b} />}
  />
);

function Attendance({ liveClass }) {
  const [data, setData] = useState(null);
  return (
    <>
      <button className="font-semibold text-ink hover:underline" onClick={() => api.get(`/live-classes/${liveClass._id}/attendance`).then((r) => setData(r.data))}>Attendance</button>
      {data && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Attendance">
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-surface p-6 text-left">
            <h2 className="text-lg font-bold">{liveClass.title}</h2>
            <h3 className="mt-3 font-semibold text-teal">Present ({data.present.length})</h3>
            <ul className="text-sm">{data.present.map((s) => <li key={s._id}>{s.name}</li>)}</ul>
            <h3 className="mt-3 font-semibold text-coral">Absent ({data.absent.length})</h3>
            <ul className="text-sm">{data.absent.map((s) => <li key={s._id}>{s.name}</li>)}</ul>
            <Button variant="ghost" className="mt-4" onClick={() => setData(null)}>Close</Button>
          </div>
        </div>
      )}
    </>
  );
}

export const LiveClasses = () => (
  <ResourceManager
    title="Live classes" singular="Live class" endpoint="/live-classes"
    defaults={{ status: 'scheduled', durationMins: 60 }}
    fields={[
      { name: 'batch', label: 'Batch', type: 'ref', required: true, ref: { endpoint: '/batches', label: (b) => `${b.course?.title || ''} - ${b.name}` } },
      { name: 'title', label: 'Class title', type: 'text', required: true },
      { name: 'dateTime', label: 'Date and time', type: 'datetime', required: true },
      { name: 'durationMins', label: 'Duration (minutes)', type: 'number' },
      { name: 'meetingLink', label: 'Meeting link (Zoom / Meet)', type: 'url', required: true, hint: 'Only enrolled students of this batch can see it.' },
      { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'completed', 'cancelled'] },
      { name: 'recordingUrl', label: 'Recording link (after class)', type: 'url' },
    ]}
    columns={[
      { label: 'Class', render: (c) => <span className="font-semibold">{c.title}</span> },
      { label: 'Batch', render: (c) => c.batch?.name },
      { label: 'When', render: (c) => fmtDateTime(c.dateTime) },
      { label: 'Status', render: (c) => c.status },
    ]}
    rowActions={(c) => <Attendance liveClass={c} />}
  />
);

export const Lectures = () => (
  <ResourceManager
    title="Recorded lessons" singular="Lesson" endpoint="/lectures"
    defaults={{ order: 1 }}
    fields={[
      { name: 'course', label: 'Course', type: 'ref', required: true, ref: { endpoint: '/courses' } },
      { name: 'title', label: 'Lesson title', type: 'text', required: true },
      { name: 'videoUrl', label: 'Video link', type: 'url', required: true, hint: 'Unlisted YouTube, Vimeo, or a video file URL from your storage/CDN. Do not use a public link.' },
      { name: 'order', label: 'Order', type: 'number' },
      { name: 'durationMins', label: 'Duration (minutes)', type: 'number' },
      { name: 'notes', label: 'Notes for students', type: 'textarea' },
      { name: 'isFree', label: 'Free preview (visible without enrolling)', type: 'checkbox' },
    ]}
    columns={[
      { label: 'Course', render: (l) => l.course?.title },
      { label: '#', render: (l) => l.order },
      { label: 'Lesson', render: (l) => <span className="font-semibold">{l.title}</span> },
      { label: 'Preview', render: (l) => (l.isFree ? <Badge tone="active">Free</Badge> : '') },
    ]}
  />
);

export const Announcements = () => (
  <ResourceManager
    title="Announcements" singular="Announcement" endpoint="/announcements"
    fields={[
      { name: 'title', label: 'Title', type: 'text', required: true, wide: true },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
      { name: 'batch', label: 'Send to', type: 'ref', ref: { endpoint: '/batches', label: (b) => `${b.course?.title || ''} - ${b.name}` }, hint: 'Leave empty to send to all students.' },
    ]}
    columns={[
      { label: 'Title', render: (a) => <span className="font-semibold">{a.title}</span> },
      { label: 'To', render: (a) => a.batch?.name || 'All students' },
      { label: 'Posted', render: (a) => fmtDateTime(a.createdAt) },
    ]}
  />
);

export const Teachers = () => (
  <ResourceManager
    title="Teachers" singular="Teacher" endpoint="/admin/teachers" canEdit={false} canDelete={false}
    fields={[
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'password', label: 'Temporary password', type: 'text', required: true },
    ]}
    columns={[
      { label: 'Name', render: (t) => <span className="font-semibold">{t.name}</span> },
      { label: 'Email', render: (t) => t.email },
      { label: 'Role', render: (t) => t.role || 'teacher' },
    ]}
  />
);

function useList(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = (params) => api.get(url, { params }).then((r) => setData(r.data)).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [url]);
  return { data, setData, error, setError, load };
}

export function Students() {
  const { data, setData, error, setError, load } = useList('/admin/students');
  const [q, setQ] = useState('');

  const toggle = async (s) => {
    try {
      const { data: r } = await api.patch(`/admin/students/${s._id}/toggle`);
      setData((list) => list.map((x) => (x._id === s._id ? { ...x, isActive: r.isActive } : x)));
    } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <div>
      <PageHeader title="Students">
        <form onSubmit={(e) => { e.preventDefault(); load({ q }); }} className="flex gap-2">
          <input className={inputCls} placeholder="Search name, email or phone" aria-label="Search students" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button type="submit" variant="ghost">Search</Button>
        </form>
      </PageHeader>
      <Alert>{error}</Alert>
      {!data ? <Spinner /> : data.length === 0 ? <Empty>No students found.</Empty> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="border-b border-line bg-paper text-ink-soft"><tr><th className="px-3 py-2">Student</th><th className="px-3 py-2">Contact</th><th className="px-3 py-2">Enrolled in</th><th className="px-3 py-2">Joined</th><th className="px-3 py-2">Status</th><th /></tr></thead>
            <tbody>
              {data.map((s) => (
                <tr key={s._id} className="border-b border-line align-top last:border-0">
                  <td className="px-3 py-2"><p className="font-semibold">{s.name}</p><p className="text-ink-soft">{s.englishLevel || 'Level not set'}</p></td>
                  <td className="px-3 py-2">{s.email}<br /><span className="text-ink-soft">{s.phone}</span></td>
                  <td className="px-3 py-2">{s.enrollments.length === 0 ? '-' : s.enrollments.map((e, i) => <p key={i}>{e.course}{e.batch ? ` (${e.batch})` : ''}</p>)}</td>
                  <td className="px-3 py-2">{fmtDate(s.createdAt)}</td>
                  <td className="px-3 py-2"><Badge tone={s.isActive ? 'active' : 'inactive'}>{s.isActive ? 'Active' : 'Disabled'}</Badge></td>
                  <td className="px-3 py-2 text-right"><button className="font-semibold text-teal hover:underline" onClick={() => toggle(s)}>{s.isActive ? 'Disable' : 'Enable'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function Payments() {
  const { data, error } = useList('/payments');
  const total = (data || []).filter((p) => p.status === 'paid').reduce((a, p) => a + p.amount, 0);
  return (
    <div>
      <PageHeader title="Payments">{data && <p className="font-semibold">Paid total: {rupees(total)}</p>}</PageHeader>
      <Alert>{error}</Alert>
      {!data ? <Spinner /> : data.length === 0 ? <Empty>No payments yet.</Empty> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="border-b border-line bg-paper text-ink-soft"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Student</th><th className="px-3 py-2">Course</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Invoice / Payment ID</th></tr></thead>
            <tbody>
              {data.map((p) => (
                <tr key={p._id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{fmtDate(p.paidAt || p.createdAt)}</td>
                  <td className="px-3 py-2">{p.student?.name}<br /><span className="text-ink-soft">{p.student?.phone}</span></td>
                  <td className="px-3 py-2">{p.course?.title}{p.batch ? ` · ${p.batch.name}` : ''}</td>
                  <td className="px-3 py-2">{rupees(p.amount)}</td>
                  <td className="px-3 py-2"><Badge tone={p.status}>{p.status}</Badge></td>
                  <td className="px-3 py-2 text-xs text-ink-soft">{p.invoiceNo}<br />{p.razorpayPaymentId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function DemoRequests() {
  const { data, setData, error, setError } = useList('/demo');
  const setStatus = async (d, status) => {
    try {
      await api.put(`/demo/${d._id}`, { status });
      setData((list) => list.map((x) => (x._id === d._id ? { ...x, status } : x)));
    } catch (e) { setError(errorMessage(e)); }
  };
  return (
    <div>
      <PageHeader title="Demo requests" />
      <Alert>{error}</Alert>
      {!data ? <Spinner /> : data.length === 0 ? <Empty>No demo requests yet.</Empty> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full  min-w-160 text-left text-sm">
            <thead className="border-b border-line bg-paper text-ink-soft"><tr><th className="px-3 py-2">Received</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Contact</th><th className="px-3 py-2">Level and goal</th><th className="px-3 py-2">Status</th></tr></thead>
            <tbody>
              {data.map((d) => (
                <tr key={d._id} className="border-b border-line align-top last:border-0">
                  <td className="px-3 py-2">{fmtDate(d.createdAt)}</td>
                  <td className="px-3 py-2 font-semibold">{d.name}</td>
                  <td className="px-3 py-2">{d.phone}<br /><span className="text-ink-soft">{d.email}</span></td>
                  <td className="px-3 py-2">{d.level}<p className="text-ink-soft">{d.message}</p></td>
                  <td className="px-3 py-2">
                    <select aria-label="Status" className={inputCls} value={d.status} onChange={(e) => setStatus(d, e.target.value)}>
                      <option value="new">New</option><option value="contacted">Contacted</option><option value="joined">Joined</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
