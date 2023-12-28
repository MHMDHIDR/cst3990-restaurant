import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from 'utils/db'
import UsersModel from 'models/User'
import { compare } from 'bcryptjs'
import { generateToken } from 'utils/functions/generateToken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req

  dbConnect()

  switch (method) {
    case 'POST': {
      const { userEmail, userTel, userPassword } = body
      // Check for user by using his/her email or telephone number
      const user = await UsersModel.findOne({
        $or: [{ userEmail }, { userTel }]
      })

      if (user && user.userAccountAction === 'block') {
        res.status(403).json({
          LoggedIn: 0,
          message: 'Your Account Has Been Blocked, Please Contact The Admin'
        })
      } else if (user && (await compare(userPassword, user.userPassword))) {
        res.status(200).json({
          LoggedIn: 1,
          message: `Logged In Successfully, Welcome Back To ${
            user.userAccountType === 'admin' ? 'The Dashboard' : 'Your Account'
          }`,
          _id: user.id,
          userAccountType: user.userAccountType,
          userFullName: user.userFullName,
          userEmail: user.userEmail,
          userTel: user.userTel,
          token: generateToken(user._id)
        })
      } else {
        res.json({
          LoggedIn: 0,
          message: 'Invalid Email/Telephone Number Or Password'
        })
      }
      break
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}
