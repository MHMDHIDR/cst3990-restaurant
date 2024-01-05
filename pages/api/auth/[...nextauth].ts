import NextAuth, { AuthOptions, Session, User } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'
import { API_URL } from '@constants'
import type { JWT } from 'next-auth/jwt'

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET } = process.env

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!
    }),
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
    },
    async signIn({ account, profile }): Promise<string | boolean> {
      if (!profile?.email) {
        throw new Error('No email found')
      }

      if (account?.provider === 'google') {
        // must return true to allow sign in
        return true
      }

      // else must return false to prevent sign in
      return false
    }
  }
}

export default NextAuth(authOptions)
