import NextAuth, { type AuthOptions, Session, User, Account, Profile } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'
import { API_URL } from '@constants'
import type { JWT } from 'next-auth/jwt'
import { UserGoogleProps, UserProps } from '@types'

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET } = process.env

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userEmailOrTel: { label: 'Email or Phone Number', type: 'text' },
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
    async signIn({ account, profile }): Promise<string | boolean> {
      const { email } = profile!
      if (!email) throw new Error('No email found')

      const { data: userExists }: { data: UserProps } = await axios.post(
        `${API_URL}/users/emailExists`,
        { userEmail: email }
      )
      if (!userExists) {
        // Create new user if doesn't exist
        const data = {
          userFullName: profile?.name,
          userEmail: profile?.email,
          signupMethod: account?.provider
        }
        const { data: newUser }: { data: UserGoogleProps } = await axios.post(
          `${API_URL}/users/join`,
          data
        )

        return true
      } else {
        if (userExists && userExists.userAccountType === 'admin') {
          // return Promise.resolve('/dashboard')
          return true
        } else if (userExists && userExists.userAccountType !== 'admin') {
          // return Promise.resolve('/')
          return true
        }
      }

      return false

      //this works for google only
      // if (account?.provider === 'google') {
      //   return true
      // }

      // return false
    },
    async session(params: { session: Session; token: JWT; user: User }) {
      const { session, token } = params
      return Promise.resolve({ session, token, expires: session.expires })
    },
    async jwt(params: {
      token: JWT & UserProps
      user: User
      account: Account | null
      profile?: Profile
    }) {
      const { token, user, profile } = params

      if (profile) {
        const { data: userExists }: { data: UserProps } = await axios.post(
          `${API_URL}/users/emailExists`,
          { userEmail: profile?.email ?? '' }
        )

        if (userExists) {
          token.user = userExists

          // token.name = userExists.userFullName
          // token.email = userExists.userEmail
          // token.userAccountType = userExists.userAccountType
          // token.userAccountStatus = userExists.userAccountStatus

          return token
        } else {
          token.user = user
          return token
        }
      }

      console.log('token nextAuth ==>', token)

      return token
    }
  }
}

export default NextAuth(authOptions)
