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
import Link from 'next/link'

const MostOrdered = () => {
  useDocumentTitle('Most Ordered')
  const { replace } = useRouter()
  const { loading, userStatus, isAuth } = useAuth()
  const [mostOrderedItems, setMostOrderedItems] = useState<any[]>([])

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
      const orderedItems = response.response.response.flatMap(
        (order: any) => order?.orderItems ?? []
      )

      const orderedItemsMap = orderedItems.reduce((map: any, item: any) => {
        const itemId = item.cItemId
        map[itemId] = map[itemId] ? map[itemId] + 1 : 1
        return map
      }, {})

      const sortedOrderedItems = Object.keys(orderedItemsMap)
        .map(itemId => ({
          item: orderedItems.find((item: any) => item.cItemId === itemId),
          count: orderedItemsMap[itemId]
        }))
        .sort((a, b) => b.count - a.count)

      setMostOrderedItems(sortedOrderedItems)
    }
  }, [response.response])

  return loading || !isAuth ? (
    <LoadingPage />
  ) : userStatus === 'block' ? (
    <ModalNotFound />
  ) : (
    <Layout>
      <section className='container py-12 mx-auto my-8'>
        <div className='flex items-center justify-center gap-6 mb-10'>
          <h3 className='mx-0 text-2xl text-center md:text-3xl'>Most Ordered</h3>|
          <Link
            href='/my-orders'
            className='mx-0 text-2xl text-center md:text-3xl underline-hover'
          >
            Orders
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {mostOrderedItems.map((orderedItem: any, idx: number) => {
            return (
              <Link
                key={idx}
                className='p-4 group'
                href={`/view/item/${orderedItem.item.cItemId}`}
              >
                <img
                  src={orderedItem.item.cImg[0].foodImgDisplayPath}
                  alt={orderedItem.item.cHeading}
                  className='w-full h-auto mb-4 transition-transform duration-300 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-105'
                />
                <h4 className='mb-2 text-lg font-semibold'>
                  {orderedItem.item.cHeading}
                </h4>
                <span className='text-gray-600'>
                  Quantity Ordered: {orderedItem.count}
                </span>
                <CartAddButton classes='bg-green-800 hover:bg-green-700 mt-2'>
                  Order Again
                </CartAddButton>
              </Link>
            )
          })}
        </div>
      </section>
    </Layout>
  )
}

export default MostOrdered
