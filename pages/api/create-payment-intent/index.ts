const stripe = require('stripe')(process.env.STRIPE_SECRET)

const calculateOrderAmount = (_items: any) => {
  return 0
}

export default async function handler(req: any, res: any) {
  const { amount } = req.body

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) ?? calculateOrderAmount(amount),
    currency: 'gbp',
    automatic_payment_methods: {
      enabled: true
    }
  })

  res.send({
    clientSecret: paymentIntent.client_secret
  })
}
