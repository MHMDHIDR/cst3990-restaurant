import { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'
import dbConnect from 'utils/db'
import UsersModel from 'models/User'
import SettingsModel from 'models/Settings'
import { APP_URL, DEFAULT_USER_DATA } from '@constants'
import email, { customEmail } from 'functions/email'
import formHandler from 'functions/form'
import { UserProps } from '@types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  const { fields }: any = await formHandler(req)

  dbConnect()

  switch (method) {
    case 'POST': {
      const { userEmail, userTel }: UserProps = fields

      const user: UserProps =
        (await UsersModel.findOne({ $or: [{ userEmail }, { userTel }] })) ??
        DEFAULT_USER_DATA

      //Using Logo For the Email Template
      const webappData = await SettingsModel.find().select('websiteLogoDisplayPath -_id')

      const logoSrc = webappData[0]?.websiteLogoDisplayPath ?? ''

      if (!user) {
        return res.status(404).json({
          forgotPassSent: 0,
          message: `Sorry, we couldn't find your account`
        })
      } else {
        if (user.userAccountStatus === 'block') {
          res.json({
            forgotPassSent: 0,
            message: `Your Account Has Been Blocked, Please Contact The Admin`
          })
        } else if (
          user.userResetPasswordToken &&
          Number(user.userResetPasswordExpires) > Date.now()
        ) {
          res.json({
            forgotPassSent: 0,
            message: `Your Already Have A Pending Password Reset Request, Please Check Your Email Inbox`
          })
        } else if (user.userAccountStatus === 'active') {
          const userResetPasswordToken = randomUUID()
          const userResetPasswordExpires = Date.now() + 3600000 // 1 hour

          await UsersModel.findByIdAndUpdate(user._id, {
            userResetPasswordToken,
            userResetPasswordExpires
          })

          //send the user an email with a link to reset his/her password
          const resetLink = APP_URL + `/auth/reset?t=${userResetPasswordToken}`

          const emailData = {
            from: 'mr.hamood277@gmail.com',
            to: user.userEmail,
            subject: 'Reset Password',
            msg: customEmail({ resetLink, logoSrc })
          }

          try {
            const { accepted, rejected } = await email(emailData)

            if (accepted.length > 0) {
              res.status(200).json({
                message: `An email has been sent to your email address: ${user.userEmail} with the instructions on how to reset the password`,
                forgotPassSent: 1
              })
            } else if (rejected.length > 0) {
              res.status(400).json({
                forgotPassSent: 0,
                message: `Sorry, we couldn't send the email to your email address: ${
                  rejected[0] /*.message*/
                }`
              })
            }
          } catch (error) {
            res.json({ message: `Ooops!, something went wrong!: ${error} `, mailSent: 0 })
          }
        }
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
