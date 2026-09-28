import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(x => x.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const resendKey = Deno.env.get('RESEND_API_KEY')
  const recoveryEmail = Deno.env.get('ADMIN_RECOVERY_EMAIL') || 'bhavypc.08@gmail.com'

  try {
    const body = await req.json()
    const action = body?.action

    if (action === 'request') {
      const otp = String(Math.floor(100000 + Math.random() * 900000))
      const code_hash = await sha256(otp)
      await supabase.from('admin_recovery_codes').insert({
        code_hash,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      })

      if (!resendKey) return json({ ok: true, demo: true, message: 'Recovery code created. Configure RESEND_API_KEY for real email delivery.' })

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: Deno.env.get('ADMIN_FROM_EMAIL') || recoveryEmail,
          to: [recoveryEmail],
          subject: 'Riya Luxury Makeup Studio — Admin recovery OTP',
          html: `<div style="font-family:Arial,sans-serif"><h2>Admin recovery</h2><p>Your one-time verification code is:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px">${otp}</div><p>This code expires in 10 minutes.</p></div>`,
        }),
      })

      if (!emailRes.ok) return json({ error: 'Email delivery failed.' }, 502)
      return json({ ok: true })
    }

    if (action === 'verify') {
      const otp = String(body?.otp || '')
      const hash = await sha256(otp)
      const { data: rows, error } = await supabase
        .from('admin_recovery_codes')
        .select('id,expires_at,attempts,used')
        .eq('code_hash', hash)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
      if (error) return json({ error: 'Recovery lookup failed.' }, 500)
      const row = rows?.[0]
      if (!row) return json({ error: 'Invalid or expired OTP.' }, 400)
      await supabase.from('admin_recovery_codes').update({ used: true }).eq('id', row.id)
      return json({ ok: true })
    }

    return json({ error: 'Unknown action.' }, 400)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error.' }, 500)
  }
})
