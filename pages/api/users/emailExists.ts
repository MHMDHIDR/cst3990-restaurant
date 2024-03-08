import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from 'utils/db'
import UsersModel from 'models/User'
import { UserProps } from '@types'

/**
 * Email Exists API endpoint to handle user login, it checks if the user email exists
 * It has one method POST
 * @param req
 * @param res
 * @returns
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req

  dbConnect()

  switch (method) {
    case 'POST': {
      const { userEmail }: UserProps = body

      // Check for user by using his/her email or telephone number
      const user: UserProps | null = await UsersModel.findOne({ userEmail })

      // Handle case when user is not found
      if (!user) {
        return res.status(404).json(user)
      }

      // If user is found, check if his/her account is active or blocked
      else if (user.userAccountStatus === 'block') {
        return res.status(403).json({
          LoggedIn: 0,
          message: 'Your Account Has Been Blocked, Please Contact The Admin'
        })
      } else {
        res.json({
          LoggedIn: 1,
          message: `Logged In Successfully, Welcome Back To ${
            user.userAccountType === 'admin' ? 'The Dashboard' : 'Your Account'
          }`,
          _id: user._id,
          userAccountType: user.userAccountType,
          userFullName: user.userFullName,
          userEmail: user.userEmail,
          userTel: user.userTel
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
