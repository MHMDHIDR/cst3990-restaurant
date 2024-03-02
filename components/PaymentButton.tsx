import React from 'react'
import { origin } from '@constants'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'

const PaymentButton = ({ value, onSuccess }: { value: number; onSuccess: any }) => {
  const createOrder = (
    _: any,
    actions: {
      order: {
        create: (arg: {
          purchase_units: { amount: { value: number } }[]
          application_context: { return_url: string }
        }) => any
      }
    }
  ) =>
    actions.order.create({
      purchase_units: [{ amount: { value } }],
      application_context: { return_url: origin }
    })

  const onApprove = async (data: any, actions: { order: { capture: () => any } }) => {
    await actions.order.capture()
    onSuccess(data)
    return data
  }

  const onCancel = () => alert('Payment cancelled!')

  const onError = (error: any) => console.error('some error happened=> ', error)

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: 'GBP',
        buyerCountry: 'GB',
        locale: 'en_GB'
      }}
    >
      <PayPalButtons
        createOrder={(data: any, actions: any) => createOrder(data, actions)}
        onApprove={(data: any, actions: any) => onApprove(data, actions)}
        onCancel={onCancel}
        onError={onError}
      />
    </PayPalScriptProvider>
  )
}

export default PaymentButton
