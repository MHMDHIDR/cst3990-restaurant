import { signOut } from 'next-auth/react'
import menuToggler from './menuToggler'
import { APP_URL } from '@constants'

export const handleSignout = async () => {
  await signOut({ redirect: true, callbackUrl: APP_URL ?? '/' })
  localStorage.removeItem('user')
  menuToggler()
}
