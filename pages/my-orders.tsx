import { useEffect } from 'react'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAuth from 'hooks/useAuth'
import OrdersTable from 'components/dashboard/OrdersTable'
import ModalNotFound from 'components/Modal/ModalNotFound'
import Layout from 'components/Layout'
import { useRouter } from 'next/router'
import { LoadingPage } from 'components/Loading'
import Link from 'next/link'
import scrollToView from 'utils/functions/scrollToView'

const MyOrders = () => {
  useDocumentTitle('My Orders')
  useEffect(() => {
    scrollToView(700)
  }, [])
  const { replace } = useRouter()
  const { loading, userStatus, isAuth } = useAuth()

  useEffect(() => {
    if (!loading && !isAuth) {
      replace('/')
    }
  }, [loading, isAuth, replace])

  return loading || !isAuth ? (
    <LoadingPage />
  ) : userStatus === 'block' ? (
    <ModalNotFound />
  ) : (
    <Layout>
      <section className='container py-12 mx-auto my-8 overflow-x-auto xl:max-w-full'>
        <div className='2xl:flex 2xl:flex-col 2xl:items-center 2xl:w-full'>
          <div className='flex items-center justify-center gap-6 mb-10'>
            <h3 className='mx-0 text-2xl text-center md:text-3xl'>Orders</h3>|
            <Link
              href='/most-ordered'
              className='mx-0 text-2xl text-center md:text-3xl underline-hover'
            >
              Most Ordered
            </Link>
          </div>
          <OrdersTable ordersByUserEmail={true} />
        </div>
      </section>
    </Layout>
  )
}

export default MyOrders
