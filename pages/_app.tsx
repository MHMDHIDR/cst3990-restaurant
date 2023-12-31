import './globals.css'
import { ThemeProvider } from 'next-themes'
import FileUploadContextProvider from 'contexts/FileUploadContext'
import ToppingsContextProvider from 'contexts/ToppingsContext'
import CartContextProvider from 'contexts/CartContext'
import TagsContextProvider from 'contexts/TagsContext'
import SearchContextProvider from 'contexts/SearchContext'
import DashboardOrderContextProvider from 'contexts/DashboardOrderContext'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider attribute='class'>
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
      </ThemeProvider>
    </SessionProvider>
  )
}
