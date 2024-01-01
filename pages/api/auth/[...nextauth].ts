import { API_URL } from '@constants'
import axios from 'axios'
import NextAuth, { AuthOptions, Session, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { JWT } from 'next-auth/jwt'
import { UserProps } from '@types'

const { NEXTAUTH_SECRET } = process.env

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userEmailOrTel: { label: 'EmailOrTel', type: 'text' },
        userPassword: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, _req) {
        try {
          const loginUser = await axios.post(`${API_URL}/users/login`, credentials)
          const { data: user } = loginUser
          if (user && user.LoggedIn === 1) {
            return Promise.resolve(user)
          }

          return Promise.resolve(null)
        } catch (error) {
          console.error('Error during authorization:', error)
          return Promise.resolve(null)
        }
      }
    })
  ],
  secret: NEXTAUTH_SECRET,
  callbacks: {
    async session(params: { session: Session; token: JWT }) {
      const { session, token } = params
      return Promise.resolve({ session, token, expires: session.expires })
    },
    async jwt(params: { token: JWT; user: User }) {
      const { token, user } = params
      if (user) {
        token.user = user
      }
      return Promise.resolve(token)
    }
  }
}

export default NextAuth(authOptions)
