import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, code } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        verification_code: code,
        type: 'email_change'
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings`
    }
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: 'Email sent' })
}
