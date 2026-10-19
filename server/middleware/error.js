export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong.';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue || {})[0] || 'Value'} already exists.`;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id or value.';
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
}
