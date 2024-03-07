const stripe = require('stripe')(process.env.STRIPE_SECRET)

/**
 * Creates Payment Intent API endpoint to handle payment intent creation
 * @param req
 * @param res
 * @returns clientSecret for payment intent
 */
export default async function handler(req: any, res: any) {
  const { amount } = req.body

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) === 0 ? 1 : Number(amount),
    currency: 'gbp',
    automatic_payment_methods: { enabled: true }
  })

  res.send({
    clientSecret: paymentIntent.client_secret
  })
}
