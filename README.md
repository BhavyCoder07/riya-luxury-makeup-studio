# Riya Luxury Makeup Studio — Premium Website + Booking App

This project is a polished React/Vite implementation of the Riya Luxury Makeup Studio brief. It includes a premium customer site, portfolio, services, jewellery rental catalogue, customer login/register, booking wizard, availability/capacity logic, booking status lookup, customer dashboard, notifications, reviews, enquiries and a secure-style `/admin101` area.

## What works immediately

The project ships with a **local demo/data mode** so it can be opened and tested without a backend account. Data is stored in the browser's localStorage. This is ideal for design review and testing the complete UX flow.

The demo includes:
- premium responsive frontend
- smooth motion and micro-interactions
- service catalog and pricing
- portfolio/gallery/lightbox
- before/after slider
- jewellery catalogue
- reviews and moderation flow
- customer registration/login
- simulated OTP flow for UX testing
- booking wizard
- fixed time slots from 9 AM to 9 PM
- maximum 2 confirmed bookings per slot
- availability blocking
- customer dashboard
- booking status page
- admin dashboard at `/#/admin101`
- booking approval/rejection/rescheduling
- payment tracking
- portfolio/jewellery/social/settings admin tools

## Important production-hosting reality

GitHub Pages and Blogger are static hosts. They cannot safely run your database, secure admin authentication, real SMS OTP or server-side email delivery by themselves.

For a REAL public production version, use:

**GitHub Pages (frontend) + Supabase (Auth + PostgreSQL + Storage + Edge Functions)**

That lets you keep the frontend free/cheap while moving sensitive logic and customer data to a real backend.

The included `supabase/schema.sql` contains the production database starter with Row Level Security policies and a transaction-protected booking RPC that enforces the 2-confirmed-bookings-per-slot rule.

## Local development

1. Install Node.js 20+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local URL shown by Vite.

## Build for GitHub Pages

1. Push this repository to GitHub.
2. Enable GitHub Actions.
3. Add a workflow that runs `npm ci` and `npm run build` and publishes `dist`.
4. Because this is a hash-based SPA, routes use forms such as `/#/portfolio` and `/#/admin101` on static hosting.

## Production Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Enable Email/Password authentication.
4. Enable Phone authentication and connect an SMS provider for real OTP delivery.
5. Create your real owner/admin auth account in Supabase Auth.
6. Set that profile's `role` to `admin` using the SQL comment at the bottom of `schema.sql`.
7. Add storage buckets and secure policies for portfolio/jewellery images.
8. Configure transactional email/edge functions for booking emails and the admin recovery flow.
9. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your frontend deployment environment.

## Security notes

- Never put the real admin password in frontend code.
- Never store customer passwords as readable text.
- The local demo admin is only for local testing and is NOT a secure production authentication mechanism.
- In production, use Supabase Auth + RLS and create the owner/admin account there.
- The included booking RPC uses a transaction/advisory lock to prevent two simultaneous final-slot requests from producing a third confirmed booking.

## Brand

Official logo file: `public/rs-logo.png`

Business email: Riyasengar337@gmail.com
Phone: 8192068191
Studio: RS Luxury Makeup Studio, Near Flyover, Hathras Junction
Instagram: https://www.instagram.com/rs_luxury_makeup_studio_5321/

## Temporary images

Temporary portfolio images are external royalty-free/editorial image URLs intended for demo layout only. Replace them with the studio's real portfolio images through the portfolio management flow before public marketing use. Do not represent stock images as actual client work.
