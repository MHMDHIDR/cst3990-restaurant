import './globals.css'
import { ThemeProvider } from 'next-themes'
import FileUploadContextProvider from 'contexts/FileUploadContext'
import ToppingsContextProvider from 'contexts/ToppingsContext'
import CartContextProvider from 'contexts/CartContext'
import TagsContextProvider from 'contexts/TagsContext'
import SearchContextProvider from 'contexts/SearchContext'
import DashboardOrderContextProvider from 'contexts/DashboardOrderContext'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider attribute='class'>
        <PayPalScriptProvider
          options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
            currency: 'GBP',
            buyerCountry: 'GB',
            locale: 'en_GB'
          }}
        >
          <FileUploadContextProvider>
            <ToppingsContextProvider>
              <CartContextProvider>
                <TagsContextProvider>
                  <SearchContextProvider>
                    <DashboardOrderContextProvider>
                      <Component {...pageProps} />
                    </DashboardOrderContextProvider>
                  </SearchContextProvider>
                </TagsContextProvider>
              </CartContextProvider>
            </ToppingsContextProvider>
          </FileUploadContextProvider>
        </PayPalScriptProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
