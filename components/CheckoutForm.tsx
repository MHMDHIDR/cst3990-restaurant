import { useEffect, useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { APP_PAYMENT_SUCCESS_URL } from '@constants'
import { LoadingSpinner } from './Loading'

export default function CheckoutForm({ onClick }: { onClick: () => void }) {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [onComplete, setOnComplete] = useState(false)

  useEffect(() => {
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
  } as any

  return (
    <form id='payment-form' onSubmit={handleSubmit}>
      <PaymentElement
        id='payment-element'
        options={paymentElementOptions}
        onChange={({ complete }) => setOnComplete(complete)}
      />
      <button
        id='submit'
        className={`block w-full px-5 py-6 mx-auto my-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 ${
          isLoading ? 'cursor-progress' : 'cursor-pointer'
        }${!stripe || !elements ? ' opacity-50' : ''}`}
        onClick={() => {
          if (onComplete) {
            onClick()
          }
        }}
        disabled={isLoading || !stripe || !elements}
      >
        <span id='button-text'>
          {isLoading ? <LoadingSpinner /> : 'Stripe Payment 💳'}
        </span>
      </button>

      {message && <div id='payment-message'>{message}</div>}
    </form>
  )
}
