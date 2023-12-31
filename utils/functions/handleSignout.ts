import { signOut } from 'next-auth/react'
import menuToggler from './menuToggler'

export const handleSignout = async () => {
  localStorage.removeItem('user')
  await signOut({ redirect: false })
  menuToggler()
}
