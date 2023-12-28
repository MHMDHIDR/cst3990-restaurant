import NextAuth from 'next-auth'

const { NEXTAUTH_SECRET } = process.env

export const authOptions = {
  providers: [],
  secret: NEXTAUTH_SECRET,
  callbacks: {
    // async signIn({ account, profile }: any) {
    //   return true
    // }
  }
}

export default NextAuth(authOptions)
