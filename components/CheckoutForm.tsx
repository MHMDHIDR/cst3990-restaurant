import React from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { APP_PAYMENT_SUCCESS_URL } from '@constants'

export default function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (!stripe) {
      return
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    )

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!')
          break
        case 'processing':
          setMessage('Your payment is processing.')
          break
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.')
          break
        default:
          setMessage('Something went wrong.')
          break
      }
    })
  }, [stripe])

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: APP_PAYMENT_SUCCESS_URL
      }
    })

    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message || 'An unexpected error occurred.')
    } else {
      setMessage('An unexpected error occurred.')
    }

    setIsLoading(false)
  }

  const paymentElementOptions = {
    layout: 'tabs'
  }

  return (
    <form id='payment-form' onSubmit={handleSubmit}>
      <PaymentElement id='payment-element' options={paymentElementOptions as any} />

      <button
        className='block w-full px-5 py-6 mx-auto my-4 text-white bg-blue-600 rounded-md hover:bg-blue-700'
        disabled={isLoading || !stripe || !elements}
        id='submit'
      >
        <span id='button-text'>Stripe Payment 💳</span>

        {isLoading ? <div className='spinner' id='spinner'></div> : 'Stripe Payment 💳'}
      </button>
      {message && <div id='payment-message'>{message}</div>}
    </form>
  )
}
