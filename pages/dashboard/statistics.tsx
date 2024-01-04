import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import useAxios from 'hooks/useAxios'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useEventListener from 'hooks/useEventListener'
import useAuth from 'hooks/useAuth'
import ModalNotFound from 'components/Modal/ModalNotFound'
import { LoadingPage } from 'components/Loading'
import { DividerStylish } from 'components/Divider'
import Layout from 'components/dashboard/Layout'
import logoutUser from 'functions/logoutUser'
import menuToggler from 'functions/menuToggler'
import { USER } from '@constants'
import { capitalizeText } from 'utils/functions/capitalize'
import type { cCategory, orderProps } from '@types'

const DashboardStatistics = () => {
  useDocumentTitle('Home')
  useEventListener('keydown', (e: any) => e.key === 'Escape' && menuToggler())

  const { userType, userStatus, userId, loading } = useAuth()

  const [_categories, setCategories] = useState<string[]>([''])
  const [ordersBycCategory, setOrdersBycCategory] = useState<cCategory>()
  const [ordersByDate, setOrdersByDate] = useState<cCategory[]>()

  //if there's food id then fetch with food id, otherwise fetch everything
  const getCategories = useAxios({ url: `/settings` })
  const menu = useAxios({ url: `/foods?page=1&limit=0` })
  const orders = useAxios({ url: `/orders?page=1&limit=0` })

  ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

  useEffect(() => {
    if (menu.response !== null) {
      //Statistics
      setCategories(getCategories?.response?.CategoryList || [])
      setOrdersBycCategory(
        orders?.response?.response
          ?.flatMap(({ orderItems }: any) =>
            orderItems.map((item: any) => item.cCategory)
          )
          ?.reduce((acc: { [x: string]: any }, cur: string | number) => {
            acc[cur] = (acc[cur] || 0) + 1
            return acc
          }, {})
      )
      // filter orderDate property and return unique dates not repeated
      setOrdersByDate(
        orders?.response?.response.map(
          ({ orderDate }: { orderDate: orderProps['ordersData']['orderDate'] }) =>
            orderDate.split('T')[0]
        ) && [
          ...new Set(
            orders?.response?.response.map(
              ({ orderDate }: { orderDate: orderProps['ordersData']['orderDate'] }) =>
                orderDate.split('T')[0]
            )
          )
        ]
      )
    }
  }, [
    menu?.response,
    orders?.response,
    orders?.response?.response,
    getCategories?.response?.CategoryList
  ])

  const DoughnutData = {
    labels: ordersBycCategory && Object.keys(ordersBycCategory), // categories?.map(category => category[1]),
    datasets: [
      {
        label: 'Orders',
        data: ordersBycCategory && Object.values(ordersBycCategory),
        backgroundColor: [
          'rgba(155, 52, 18, 0.7)',
          'rgba(171, 0, 87, 0.2)',
          'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: [
          'rgba(155, 52, 18, 0.95)',
          'rgba(171, 0, 87, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 0.5
      }
    ]
  }

  const BarData = {
    labels: orders?.response?.response && ordersByDate,
    datasets: [
      {
        label:
          ordersBycCategory &&
          capitalizeText(Object.keys(ordersBycCategory)[0]!) + ' Orders',
        data: ordersBycCategory && Object.values(ordersBycCategory),
        backgroundColor: ['rgba(155, 52, 18, 0.7)'],
        borderColor: ['rgba(155, 52, 18, 0.95)'],
        borderWidth: 0.5
      },
      {
        label:
          ordersBycCategory &&
          capitalizeText(Object.keys(ordersBycCategory)[1]!) + ' Orders',
        data: ordersBycCategory && Object.values(ordersBycCategory),
        backgroundColor: ['rgba(171, 0, 87, 0.2)'],
        borderColor: ['rgba(171, 0, 87, 1)'],
        borderWidth: 0.5
      },
      {
        label:
          ordersBycCategory &&
          capitalizeText(Object.keys(ordersBycCategory)[2]!) + ' Orders',
        data: ordersBycCategory && Object.values(ordersBycCategory),
        backgroundColor: ['rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 206, 86, 1)'],
        borderWidth: 0.5
      }
    ]
  }

  //check if userStatus is active and the userType is admin
  return loading || !(ordersBycCategory && Object.values(ordersBycCategory)) ? (
    <LoadingPage />
  ) : !USER || (userType !== 'admin' && userType !== 'cashier') ? (
    <ModalNotFound />
  ) : userStatus === 'block' ? (
    logoutUser(userId)
  ) : (
    <Layout>
      <div className='container mx-auto mb-20'>
        <h1 className='mx-0 mt-32 mb-20 text-2xl text-center'>Number of Orders</h1>

        <h2 className='my-3 text-xl font-bold text-center'>Pie Chart</h2>
        <Doughnut
          width={500}
          height={500}
          data={DoughnutData}
          className='max-w-sm mx-auto max-h-96'
        />

        <DividerStylish className='my-24' />

        <h2 className='my-3 text-xl font-bold text-center'>Bar Chart</h2>
        <Bar height={200} data={DoughnutData} />
      </div>
    </Layout>
  )
}

export default DashboardStatistics
