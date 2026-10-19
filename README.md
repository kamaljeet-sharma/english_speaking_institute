# WellTalk: Institute of English Language (MERN)

Theme: black (`#000`), brand red `#FE424D`, white text. Colors live in `client/src/index.css` under `@theme`.

Live classes, batches, recorded lessons, online payments (Razorpay), student dashboard and admin panel.

## Run locally

You need Node 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

```bash
# 1. Backend
cd server
npm install
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm run seed              # creates the admin user + sample courses/batches/lessons
npm run dev               # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

Default admin (change it in `.env` before seeding): `admin@institute.com` / `Admin@12345`
Sample teacher: `teacher@institute.com` / `Teacher@123`

## Payments

- `PAYMENT_MODE=demo` (default): clicking "Pay" shows a confirm box and enrolls the student. For testing only.
- `PAYMENT_MODE=razorpay`: add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (use **test keys** first).
  Set the webhook in the Razorpay dashboard to `https://YOUR-API/api/payments/webhook`
  (events: `payment.captured`, `order.paid`) with the secret in `RAZORPAY_WEBHOOK_SECRET`.

Flow: order created on server -> Razorpay checkout -> server verifies signature -> enrollment created
and student added to batch. The webhook does the same if the browser closes early.

## Admin: first steps

1. Teachers: add a teacher.
2. Courses: create a course. 3. Batches: create a batch for it (timing, seats, teacher).
4. Live classes: schedule classes with a Zoom/Meet link (students see it only after enrolling, only near class time).
5. Recorded lessons: add unlisted YouTube/Vimeo links (or CDN URLs). Mark one as "free preview" if you like.

## Folder structure

```
server/  config, models, middleware, routes, utils (generic CRUD), server.js, seed.js
client/  src/pages (public, student, admin), components (ResourceManager = generic admin CRUD), api.js, payment.js
```

## Before going live

- Use a strong `JWT_SECRET`, set `CLIENT_URL` to your real domain, switch to `PAYMENT_MODE=razorpay`.
- Unlisted YouTube links can be shared by students. For stronger protection use Vimeo domain-restricted embeds or signed CDN URLs.
- Add refresh tokens / httpOnly cookies, email notifications (Nodemailer), and refunds as next steps.
- Deploy: frontend on Vercel/Netlify (add a rewrite of `/api/*` to your backend or set a base URL), backend on Render/Railway, database on MongoDB Atlas.
