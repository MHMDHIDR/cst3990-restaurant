import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from 'utils/db'
import UsersModel from 'models/User'
import { sign } from 'jsonwebtoken'
import { genSalt, hash } from 'bcryptjs'
import email from 'functions/email'
import formHandler from 'utils/functions/form'
import { parseJson } from 'utils/functions/jsonTools'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  const { fields }: any = await formHandler(req)

  dbConnect()

  switch (method) {
    case 'POST': {
      const { userPassword, userToken } = fields
      // Check for user by using his/her email or telephone number
      const user = await UsersModel.findOne({
        userResetPasswordToken: parseJson(userToken)
      })

      if (user && user.userAccountStatus === 'block') {
        res.json({
          newPassSet: 0,
          message: `Your Account Has Been Blocked, Please Contact The Admin`
        })
      } else if (user && user.userAccountStatus === 'active') {
        if (userToken === user.userResetPasswordToken) {
          if (user.userResetPasswordExpires > Date.now()) {
            // Hash new password
            const salt = await genSalt(10)
            const hashedPassword = await hash(userPassword, salt)

            try {
              await UsersModel.findByIdAndUpdate(user._id, {
                userPassword: hashedPassword,
                userResetPasswordToken: null,
                userResetPasswordExpires: null
              })

              res.json({
                message: `Your Password Has Been Reset Successfully, Redirecting You To Login Page...`,
                newPassSet: 1
              })
            } catch (error) {
              res.json({
                message: `Ooops!, something went wrong!: ${error}`,
                newPassSet: 1
              })
            }
          } else {
            res.json({
              newPassSet: 0,
              message: `Sorry, Your Password Reset Link Has Expired, Please Request A New One`
            })
          }
        }

        //send the user an email with a link to reset his/her password
        const emailData = {
          from: 'mr.hamood277@gmail.com',
          to: user.userEmail,
          subject: 'Your Password Has been Reset',
          msg: `
      <h1>Your password has been rest succefully</h1>
      <br />
      <p>
      If you did not reset your password, please contact us as soon as possible, otherwise this email is just for notifying you for the change that happened, no need to reply to this email.</small>
      </p>
      `
        }

        try {
          const { accepted, rejected } = await email(emailData)

          if (accepted.length > 0) {
            res.status(200).json({
              message: `An email has been sent to your email address: ${user.userEmail} with the new password`,
              newPassSet: 1
            })
          } else if (rejected.length > 0) {
            res.status(400).json({
              newPassSet: 0,
              message: `Sorry, we couldn't send the email to your email address: ${
                rejected[0] /*.message*/
              }`
            })
          }
        } catch (error) {
          res.json({ message: `Ooops!, something went wrong!: ${error} `, mailSent: 0 })
        }
      } else if (!user) {
        res.json({ newPassSet: 0, message: `Sorry, we couldn't find your account` })
      }
      break
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}

export const config = {
  api: { bodyParser: false }
}
