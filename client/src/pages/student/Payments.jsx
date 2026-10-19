import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../api';
import { Alert, Badge, Empty, Spinner } from '../../components/ui';
import { fmtDate, rupees } from '../../utils';

export default function Payments() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/payments/my').then((r) => setList(r.data)).catch((e) => setError(errorMessage(e))); }, []);

  const printInvoice = (p, user) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<title>${p.invoiceNo}</title><body style="font-family:system-ui;max-width:560px;margin:40px auto">
      <h2>WellTalk Institute of English Language</h2><h3>Invoice ${p.invoiceNo}</h3>
      <p>Date: ${fmtDate(p.paidAt)}</p>
      <table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border-bottom:1px solid #ccc">${p.course?.title || ''}${p.batch ? ' (' + p.batch.name + ')' : ''}</td><td style="padding:8px;border-bottom:1px solid #ccc;text-align:right">${rupees(p.amount)}</td></tr>
      <tr><td style="padding:8px"><b>Total paid</b></td><td style="padding:8px;text-align:right"><b>${rupees(p.amount)}</b></td></tr></table>
      <p style="color:#666;font-size:13px">Payment ID: ${p.razorpayPaymentId || '-'}</p>
      <script>window.print()</script></body>`);
    w.document.close();
  };

  if (error) return <Alert>{error}</Alert>;
  if (!list) return <Spinner />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Payment history</h1>
      {list.length === 0 ? <Empty>No payments yet.</Empty> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-ink-soft">
              <tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Course</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Status</th><th className="px-3 py-2" /></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{fmtDate(p.paidAt || p.createdAt)}</td>
                  <td className="px-3 py-2">{p.course?.title}{p.batch ? ` · ${p.batch.name}` : ''}</td>
                  <td className="px-3 py-2">{rupees(p.amount)}</td>
                  <td className="px-3 py-2"><Badge tone={p.status}>{p.status}</Badge></td>
                  <td className="px-3 py-2 text-right">
                    {p.status === 'paid' && <button className="font-semibold text-teal hover:underline" onClick={() => printInvoice(p)}>Invoice</button>}
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
