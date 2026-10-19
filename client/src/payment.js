import api from './api';

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load the payment window. Check your internet connection.'));
    document.body.appendChild(s);
  });
}

/**
 * Runs the whole enroll + pay flow.
 * Resolves with { invoiceNo } on success, rejects with an Error (message is user-friendly).
 */
export async function enrollAndPay({ courseId, batchId }) {
  const { data: order } = await api.post('/payments/order', { courseId, batchId });

  if (order.free) return {};

  // Local testing mode (PAYMENT_MODE=demo on the server)
  if (order.demo) {
    const ok = window.confirm(`Demo mode: pretend to pay ₹${order.amount / 100} for "${order.courseTitle}"?`);
    if (!ok) throw new Error('Payment cancelled.');
    const { data } = await api.post('/payments/verify', { paymentId: order.paymentId });
    return data;
  }

  await loadRazorpayScript();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'WellTalk Institute of English Language',
      description: order.courseTitle,
      prefill: order.prefill,
      theme: { color: '#FE424D' },
      handler: async (response) => {
        try {
          const { data } = await api.post('/payments/verify', response);
          resolve(data);
        } catch (err) {
          reject(new Error(err.response?.data?.message || 'We could not confirm your payment. If money was deducted, it will be reflected within a few minutes or contact us.'));
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment window closed. You have not been charged.')) },
    });
    rzp.on('payment.failed', (r) => reject(new Error(r.error?.description || 'Payment failed. Please try again.')));
    rzp.open();
  });
}
