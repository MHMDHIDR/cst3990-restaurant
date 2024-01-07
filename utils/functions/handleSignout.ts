import { signOut } from 'next-auth/react'
import menuToggler from './menuToggler'

export const handleSignout = async () => {
  await signOut({ redirect: true, callbackUrl: '/' })
  localStorage.removeItem('user')
  menuToggler()
}
