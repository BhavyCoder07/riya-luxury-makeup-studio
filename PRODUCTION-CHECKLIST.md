# Production checklist

Before publishing this app as a real business system:

- Create a Supabase project.
- Run `supabase/schema.sql`.
- Configure Email/Password auth.
- Configure real phone OTP/SMS provider if you want SMS login.
- Create the owner's Auth user and give it the `admin` profile role.
- Configure Storage buckets and RLS for portfolio/jewellery images.
- Deploy the admin recovery Edge Function and configure `RESEND_API_KEY`, `ADMIN_RECOVERY_EMAIL` and `ADMIN_FROM_EMAIL` secrets.
- Connect the frontend Supabase client to the production repository before public use.
- Configure your exact Google Maps URL in admin settings.
- Replace temporary portfolio imagery with your own work.
- Replace placeholder policy text with the final studio policies.
- Test two simultaneous final-slot booking attempts.
- Test customer-to-customer access isolation.
- Test admin authorization and audit logs.
- Test email delivery and OTP delivery.
- Add a custom domain after the public site is stable.

The provided local/demo app is intentionally usable without these services, but local storage is NOT a production-grade backend and must not be used for live customer data.
