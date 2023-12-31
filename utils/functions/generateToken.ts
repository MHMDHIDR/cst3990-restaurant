import { sign } from 'jsonwebtoken'

export const generateToken = (id: any) =>
  sign({ id }, process.env.JWT_SECRET || '', { expiresIn: '30d' })
