import '../styles/globals.css'
import { ThemeProvider } from 'next-themes'
import FileUploadContextProvider from 'contexts/FileUploadContext'
import ToppingsContextProvider from 'contexts/ToppingsContext'
import CartContextProvider from 'contexts/CartContext'
import TagsContextProvider from 'contexts/TagsContext'
import SearchContextProvider from 'contexts/SearchContext'
import DashboardOrderContextProvider from 'contexts/DashboardOrderContext'
// import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider attribute='class'>
        {/* <PayPalScriptProvider
          options={{
            clientId:
              'AYJHPBtF1WJl8Hh6hDGouvXVcyO6e2sBrAIfp3ghvIX6EZJMAci75L_gB2kCGLhZWIU3pw8KeaHiipc1'
          }}
        > */}
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
        {/* </PayPalScriptProvider> */}
      </ThemeProvider>
    </SessionProvider>
  )
}
