import { Schema, models, model } from 'mongoose'

const reqString = { type: String, required: true }

const typeString = { type: String, required: false }

const userAccountStatus = { ...reqString, enum: ['active', 'block'], default: 'active' }

const userAccountType = {
  ...reqString,
  enum: ['admin', 'cashier', 'user'],
  default: 'user'
}

const UserSchema = new Schema({
  userFullName: reqString,
  userEmail: reqString,
  userTel: typeString,
  userPassword: typeString,
  userAccountStatus,
  userAccountType,
  signupMethod: typeString,
  userResetPasswordToken: typeString,
  userResetPasswordExpires: typeString
})

export default models?.users || model('users', UserSchema)
