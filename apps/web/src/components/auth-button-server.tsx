import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AuthButtonClient } from './auth-button-client'

export async function AuthButtonServer () {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  const cookiesList = cookies()
  const hasOpenBeta = cookiesList.has('invitedId')

  return <AuthButtonClient session={session} hasOpenBeta={hasOpenBeta} />
}
