const stripe = require('stripe')(process.env.STRIPE_SECRET)

const calculateOrderAmount = (_items: any) => {
  return 1
}

export default async function handler(req: any, res: any) {
  const { amount } = req.body

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) === 0 ? calculateOrderAmount(amount) : Number(amount),
    currency: 'gbp',
    automatic_payment_methods: {
      enabled: true
    }
  })

  res.send({
    clientSecret: paymentIntent.client_secret
  })
}
