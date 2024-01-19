import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from 'utils/db'
import UsersModel from 'models/User'
import { genSalt, hash } from 'bcryptjs'
import { UserProps } from '@types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req

  switch (method) {
    case 'POST': {
      const { userFullName, userEmail, userTel, userPassword, signupMethod } = body
      await dbConnect()

      if (signupMethod === 'google') {
        try {
          const user: UserProps = await UsersModel.create({
            userFullName,
            userEmail: userEmail.trim().toLowerCase(),
            signupMethod
          })

          res.json({
            _id: user._id,
            email: user.userEmail,
            userAdded: 1,
            message: 'Google User Successfully Registered You Can Login 👍🏼'
          })
        } catch (error) {
          console.error('Error creating user:', error)
          res.status(400).json({
            userAdded: 0,
            message: 'User Not Added!, Please Try Again Later'
          })
        }
      }

      if (
        userFullName === '' ||
        userEmail === '' ||
        userTel === '' ||
        userPassword === ''
      ) {
        res.status(400)
        throw new Error('Please Fill All Fields')
      } else {
        // Check if user exists
        const userExists = await UsersModel.findOne({ userEmail, userTel })
        if (userExists) return res.status(409)
        // Hash password
        const salt = await genSalt(10)
        const hashedPassword = await hash(userPassword, salt)
        // Create user
        const user: UserProps = await UsersModel.create({
          userFullName,
          userEmail: userEmail.trim().toLowerCase(),
          userTel,
          userPassword: hashedPassword
        })
        //if user is created successfully
        if (user) {
          res.status(201).json({
            _id: user._id,
            email: user.userEmail,
            tel: user.userTel,
            userAdded: 1,
            message: 'User Successfully Registered You Can Login 👍🏼'
          })
        } else {
          res.status(400).json({
            userAdded: 0,
            message: 'User Not Added!, Please Try Again Later'
          })
        }
      }
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}
