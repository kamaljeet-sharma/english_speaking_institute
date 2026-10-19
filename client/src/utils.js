export const rupees = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
    : '';

// Turns a YouTube / Vimeo watch link into an embeddable URL
export function toEmbedUrl(url = '') {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return url;
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
    }
    if (u.hostname === 'youtu.be') return `https://www.youtube-nocookie.com/embed${u.pathname}?rel=0`;
    if (u.hostname.includes('vimeo.com') && !u.hostname.startsWith('player')) {
      return `https://player.vimeo.com/video/${u.pathname.split('/').filter(Boolean).pop()}`;
    }
  } catch {}
  return url;
}

export const isEmbeddable = (url = '') => /youtube|youtu\.be|vimeo/.test(url);
