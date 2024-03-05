import { useEffect } from 'react'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAuth from 'hooks/useAuth'
import OrdersTable from 'components/dashboard/OrdersTable'
import ModalNotFound from 'components/Modal/ModalNotFound'
import Layout from 'components/Layout'
import { useRouter } from 'next/router'
import { LoadingPage } from 'components/Loading'
import Link from 'next/link'

const MostOrdered = () => {
  useDocumentTitle('My Orders')
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
          <div className='flex items-center justify-center gap-6 divide-x-2'>
            <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
              Most Ordered
            </h3>
            <Link
              href='/my-orders'
              className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl underline-hover'
            >
              Orders
            </Link>
          </div>
          <OrdersTable ordersByUserEmail={true} />
        </div>
      </section>
    </Layout>
  )
}

export default MostOrdered
