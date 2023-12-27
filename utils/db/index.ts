import mongoose, { type ConnectOptions } from 'mongoose'

const { MONGODB_URI } = process.env
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

var global: any = typeof global !== 'undefined' ? global : {}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  // Check if we have a connection to the database
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', true)

    cached.promise = await mongoose.connect(MONGODB_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    } as ConnectOptions)

    console.log('✅ Mongoose 🚀')
  }
  cached.conn = cached.promise

  return await cached.conn
}

export default dbConnect
