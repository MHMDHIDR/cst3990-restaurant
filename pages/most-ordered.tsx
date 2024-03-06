import { useEffect, useState } from 'react'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAuth from 'hooks/useAuth'
import ModalNotFound from 'components/Modal/ModalNotFound'
import Layout from 'components/Layout'
import { useRouter } from 'next/router'
import { LoadingPage } from 'components/Loading'
import useAxios from 'hooks/useAxios'
import { ITEMS_PER_PAGE } from '@constants'
import { isNumber } from 'utils/functions/isNumber'
import { CartAddButton } from 'components/CartButton'

const MostOrdered = () => {
  useDocumentTitle('Most Ordered')
  const { replace } = useRouter()
  const { loading, userStatus, isAuth } = useAuth()
  const [mostOrderedItems, setMostOrderedItems] = useState<any>([])

  useEffect(() => {
    if (!loading && !isAuth) {
      replace('/')
    }
  }, [loading, isAuth, replace])

  const { query } = useRouter()
  const { pageNum }: any = query
  const pageNumber = !pageNum || !isNumber(pageNum) || pageNum < 1 ? 1 : parseInt(pageNum)
  const { loading: LoadingOrders, ...response } = useAxios({
    url: `/orders?page=${pageNumber}&limit=${ITEMS_PER_PAGE}&orderDate=-1`
  })

  useEffect(() => {
    if (response.response !== null) {
      setMostOrderedItems(response.response.response) // Fix: Pass the response as an array
    }
  }, [response.response])

  return loading || !isAuth ? (
    <LoadingPage />
  ) : userStatus === 'block' ? (
    <ModalNotFound />
  ) : (
    <Layout>
      <section className='container py-12 mx-auto my-8'>
        <div className='flex items-center justify-center mb-10'>
          <h3 className='mx-0 text-2xl text-center md:text-3xl'>Most Ordered</h3>
        </div>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {mostOrderedItems.map((order: any) =>
            order?.orderItems?.map((item: any, idx: number) => (
              <div key={idx} className='p-4 border border-gray-200 rounded-lg'>
                <img
                  src={item.cImg[0].foodImgDisplayPath}
                  alt={item.cHeading}
                  className='w-full h-auto mb-4 rounded-lg'
                />
                <h4 className='mb-2 text-lg font-semibold'>{item.cHeading}</h4>
                <span className='text-gray-600'>Quantity: {item.cQuantity}</span>
                <CartAddButton classes='bg-green-800 hover:bg-green-700'>
                  Order Again
                </CartAddButton>
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  )
}

export default MostOrdered
