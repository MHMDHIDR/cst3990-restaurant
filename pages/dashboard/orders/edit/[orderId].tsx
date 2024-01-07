import { useContext, useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { ToppingsContext } from 'contexts/ToppingsContext'
import { DashboardOrderContext } from 'contexts/DashboardOrderContext'
import { CartContext } from 'contexts/CartContext'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAuth from 'hooks/useAuth'
import { validPhone } from 'functions/validForm'
import {
  API_URL,
  MAX_QUANTITY,
  PHONE_NUM_EXAMPLE,
  ADDRESS_EXAMPLE,
  USER
} from '@constants'
import Modal from 'components/Modal/Modal'
import { Success, Error, Loading } from 'components/Icons/Status'
import { LoadingPage, LoadingSpinner } from 'components/Loading'
import Layout from 'components/dashboard/Layout'
import CartItems from 'components/CartItems'
import NoItems from 'components/NoItems'
import { ClickableButton } from 'components/Button'
import Arrow from 'components/Icons/Arrow'
import { orderDataProps, selectedToppingsProps } from '@types'
import goTo from 'functions/goTo'
import abstractText from 'functions/abstractText'
import { stringJson } from 'functions/jsonTools'
import { formattedPrice, unformattedPrice } from 'utils/functions/format'
import ModalNotFound from 'components/Modal/ModalNotFound'
import logoutUser from 'utils/functions/logoutUser'

const DashboardOrdersEdit = ({ OrdersData }: { OrdersData: orderDataProps }) => {
  const { orderItemToppings, setOrderItemToppings } = useContext(ToppingsContext)
  const { ordersData, setOrdersData, orderItemsGrandPrice, setOrderItemsGrandPrice } =
    useContext(DashboardOrderContext)
  const { grandPrice } = useContext(CartContext)

  const { userType, userStatus, userId, loading } = useAuth()

  const { orderId } = useRouter().query

  useEffect(() => {
    setOrdersData(OrdersData?.response)
    setOrderItemToppings(OrdersData.response?.orderToppings!)
  }, [OrdersData, setOrderItemToppings, setOrdersData, grandPrice])

  //Form States
  const [orderEmail] = useState(ordersData?.userEmail)
  const [personName, setPersonName] = useState(ordersData?.personName)
  const [personPhone, setPersonPhone] = useState(ordersData?.personPhone)
  const [personAddress, setPersonAddress] = useState(ordersData?.personAddress)
  const [personNotes, setPersonNotes] = useState(ordersData?.personNotes)
  const [orderUpdated, setOrderUpdated] = useState()
  const [isLoading, setIsLoading] = useState(false)

  const modalLoading =
    typeof window !== 'undefined' ? document.querySelector('#modal') : null

  //Declaring Referenced Element
  const personNameErr = useRef<HTMLSpanElement>(null)
  const personPhoneErr = useRef<HTMLSpanElement>(null)
  const personAddressErr = useRef<HTMLSpanElement>(null)
  const formErr = useRef<HTMLParagraphElement>(null)
  const grandPriceRef = useRef<HTMLElement>(null)

  useDocumentTitle(
    ordersData
      ? `Edit Order Details For ${abstractText(ordersData.personName, 20)}`
      : 'Edit The Order Details'
  )

  useEffect(() => {
    setOrderItemsGrandPrice(grandPriceRef?.current?.textContent || orderItemsGrandPrice)
  }, [grandPriceRef?.current?.textContent, orderItemsGrandPrice, setOrderItemsGrandPrice])

  const handleCollectOrder = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (
      personName !== '' &&
      personPhone !== '' &&
      personNameErr.current!.textContent === '' &&
      personPhoneErr.current!.textContent === '' &&
      personAddressErr.current!.textContent === ''
    ) {
      modalLoading?.classList.remove('hidden')

      handleSaveOrder()
      formErr.current!.textContent = ''
    } else {
      formErr.current!.textContent = 'Please fill all fields correctly'
    }
  }

  const handleSaveOrder = async () => {
    //using FormData to send constructed data
    const formData = new FormData()
    formData.append('orderEmail', orderEmail || ordersData?.userEmail)
    formData.append('personName', personName || ordersData?.personName)
    formData.append('personPhone', personPhone || ordersData?.personPhone)
    formData.append('personAddress', personAddress || ordersData?.personAddress)
    formData.append('personNotes', personNotes || ordersData?.personNotes)
    formData.append('checkedToppings', stringJson(orderItemToppings))
    formData.append('foodItems', stringJson(ordersData?.orderItems))
    formData.append('grandPrice', unformattedPrice(grandPriceRef?.current?.textContent!))

    try {
      setIsLoading(true)
      const response = await axios.patch(`${API_URL}/orders/${orderId}`, formData)
      const { OrderStatusUpdated } = response.data
      setOrderUpdated(OrderStatusUpdated)

      setTimeout(() => {
        modalLoading?.classList.add('hidden')
      }, 300)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return loading ? (
    <LoadingPage />
  ) : !USER && userType !== 'admin' && userType !== 'cashier' ? (
    <ModalNotFound />
  ) : userStatus === 'block' ? (
    logoutUser(userId)
  ) : (
    <Layout>
      <section id='orderFood' className='py-12 my-8'>
        {isLoading ? (
          <Modal
            status={Loading}
            classes='txt-blue text-center'
            msg={`Updating Order Status...`}
          />
        ) : orderUpdated === 1 ? (
          <Modal
            status={Success}
            msg={`Order Details Updated, Successfully! 😄, Redirecting to Orders Page...`}
            btnName='View Orders'
            btnLink={goTo(`orders`)}
            redirectLink={goTo(`orders`)}
            redirectTime={4000}
          />
        ) : (
          orderUpdated === 0 && (
            <Modal
              status={Error}
              msg={`Sorry! Something went wrong while updating the order details 😥`}
              redirectLink={goTo(`orders`)}
              redirectTime={4000}
            />
          )
        )}

        <div className='container mx-auto text-center'>
          {ordersData && ordersData.orderItems?.length > 0 ? (
            <>
              <Link href={goTo(`orders`)} className='flex'>
                <ClickableButton>
                  <>
                    <Arrow className={`inline-flex mr-4`} toLeft />
                    <span>Go Back to Orders</span>
                  </>
                </ClickableButton>
              </Link>

              <h2 className='inline-block mb-20 text-3xl font-bold'>
                Edit Order Details For ({abstractText(ordersData.personName, 40)})
              </h2>

              <CartItems
                orderItems={ordersData?.orderItems}
                orderToppings={orderItemToppings}
              />

              <p className='my-10 text-xl font-bold text-center text-green-700 select-none dark:text-green-400'>
                Please Do not forget to press the Update button at the bottom of the page
                to update the order information
              </p>

              <form method='POST' onSubmit={handleCollectOrder}>
                <label htmlFor='name' className={`form__group`}>
                  <input
                    className={`relative form__input`}
                    id='name'
                    name='name'
                    type='text'
                    defaultValue={personName || ordersData.personName}
                    onChange={e => setPersonName(e.target.value.trim())}
                    onKeyUp={(e: any) => {
                      const target = e.target.value.trim()

                      if (target.length > 0 && target.length < 4) {
                        personNameErr.current!.textContent = 'Please enter a valid name'
                      } else if (target.length > 30) {
                        personNameErr.current!.textContent =
                          'The name is too long, please add a name of up to 30 characters'
                      } else {
                        personNameErr.current!.textContent = ''
                      }
                    }}
                    required
                  />
                  <span className={`form__label`}>
                    Your Full Name &nbsp;
                    <strong className='text-xl leading-4 text-red-600'>*</strong>
                  </span>
                  <span
                    className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                    ref={personNameErr}
                  ></span>
                </label>
                <label htmlFor='phoneNumber' className={`form__group`}>
                  <input
                    className={`form__input`}
                    id='phoneNumber'
                    name='phoneNumber'
                    type='tel'
                    defaultValue={personPhone || ordersData.personPhone}
                    onChange={e => setPersonPhone(e.target.value.trim())}
                    onKeyUp={(e: any) => {
                      const target = e.target.value.trim()
                      const NUM_LENGTH = 10

                      if (target.length > 0 && target.length < NUM_LENGTH) {
                        personPhoneErr.current!.textContent =
                          'Please enter a phone number in the same format as the phone number in the example'
                      } else if (!validPhone(target, NUM_LENGTH)) {
                        personPhoneErr.current!.textContent = `Phone Number is Invalid! WhatsApp Number must be a valid number`
                      } else {
                        personPhoneErr.current!.textContent = ''
                      }
                    }}
                    required
                  />
                  <span className={`form__label`}>
                    Phone Number, (e.g: {PHONE_NUM_EXAMPLE}) &nbsp;
                    <strong className='text-xl leading-4 text-red-600'>*</strong>
                  </span>
                  <span
                    className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                    ref={personPhoneErr}
                  ></span>
                </label>
                <label htmlFor='Address' className={`form__group`}>
                  <input
                    className={`form__input`}
                    id='Address'
                    name='Address'
                    type='text'
                    defaultValue={personAddress || ordersData.personAddress}
                    onChange={e => setPersonAddress(e.target.value.trim())}
                    onKeyUp={(e: any) => {
                      const target = e.target.value.trim()

                      if (target.length > 0 && target.length < 4) {
                        personAddressErr.current!.textContent =
                          'Please enter a valid name'
                      } else {
                        personAddressErr.current!.textContent = ''
                      }
                    }}
                    required
                  />
                  <span className={`form__label`}>
                    Address, (e.g: {ADDRESS_EXAMPLE})&nbsp;
                    <strong className='text-xl leading-4 text-red-600'>*</strong>
                  </span>
                  <span
                    className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                    ref={personAddressErr}
                  ></span>
                </label>
                <label htmlFor='message' className={`form__group`}>
                  <textarea
                    className={`form__input`}
                    id='message'
                    name='message'
                    defaultValue={personNotes || ordersData.personNotes}
                    maxLength={MAX_QUANTITY * 2}
                    onChange={e => setPersonNotes(e.target.value.trim())}
                  ></textarea>

                  <span className={`form__label`}>
                    You Can Add Notes or Additions for The chef to Add to Your Order 😄
                    &nbsp;😄
                  </span>
                </label>
                <p
                  className='block text-2xl my-4 text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={formErr}
                ></p>
                <span className='inline-block px-3 py-1 my-4 text-xl text-green-800 bg-green-300 border border-green-800 rounded-md select-none'>
                  Total Price:&nbsp;
                  <strong>
                    <span ref={grandPriceRef}>
                      {formattedPrice(
                        ordersData?.orderItems?.reduce(
                          (acc: number, item: any) =>
                            acc +
                            item.cPrice * item.cQuantity +
                            orderItemToppings?.reduce(
                              (acc: number, curr: selectedToppingsProps) =>
                                curr.toppingId.slice(0, -2) === item.cItemId
                                  ? acc +
                                    curr.toppingPrice *
                                      item.cToppings.reduce(
                                        (acc: number, curr2: selectedToppingsProps) =>
                                          curr2.toppingId === curr.toppingId
                                            ? curr2.toppingQuantity
                                            : acc,
                                        0
                                      )
                                  : acc,
                              0
                            ),
                          0
                        )
                      )}
                    </span>
                  </strong>
                </span>

                <div className='flex flex-col items-center justify-evenly'>
                  <button
                    type='submit'
                    className={`w-full py-2 text-white text-lg uppercase bg-green-800 hover:bg-green-700 rounded-lg scale-100 transition-all flex justify-center items-center gap-3`}
                    onClick={handleCollectOrder}
                  >
                    {isLoading && isLoading ? (
                      <>
                        <LoadingSpinner />
                        Updating Details...
                      </>
                    ) : (
                      'Update Order Details'
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : ordersData &&
            (!ordersData.orderItems || ordersData.orderItems?.length === 0) ? (
            <LoadingPage />
          ) : (
            <NoItems
              msg={`Sorry! No meals or drinks were found in your order ${
                ordersData?.personName || 'Customer'
              } 😥 You can return to the orders page and review the rest of the orders, or return to the dashboard`}
              links={[
                { to: `orders`, label: 'View Orders' },
                { to: `dashboard`, label: 'Dashboard' }
              ]}
            />
          )}
        </div>
      </section>
    </Layout>
  )
}

export async function getServerSideProps({ query: { orderId } }: any) {
  const url = `${API_URL}/orders?page=1&limit=1&itemId=${orderId}`
  const OrdersData = await fetch(url).then(order => order.json())

  return { props: { OrdersData } }
}

export default DashboardOrdersEdit
