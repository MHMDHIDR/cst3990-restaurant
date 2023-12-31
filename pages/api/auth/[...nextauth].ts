import { API_URL } from '@constants'
import axios from 'axios'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const { NEXTAUTH_SECRET } = process.env

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userEmailOrTel: { label: 'EmailOrTel', type: 'text' },
        userPassword: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        console.log('req --> ', req)
        const loginUser = await axios.post(`${API_URL}/users/login`, credentials)
        const { data: user } = loginUser

        if (user.LoggedIn === 1 && user) {
          return user
        }
        return null
      }
    })
  ],
  secret: NEXTAUTH_SECRET,
  callbacks: {}
}

export default NextAuth(authOptions)
