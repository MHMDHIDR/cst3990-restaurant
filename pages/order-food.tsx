import { useContext, useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { CartContext } from 'contexts/CartContext'
import { ToppingsContext } from 'contexts/ToppingsContext'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAxios from 'hooks/useAxios'
import { MAX_QUANTITY, origin, USER } from '@constants'
import Modal from 'components/Modal/Modal'
import { Success, Loading } from 'components/Icons/Status'
import { LoadingPage, LoadingSpinner } from 'components/Loading'
import CartItems from 'components/CartItems'
import NoItems from 'components/NoItems'
import Layout from 'components/Layout'
import { selectedToppingsProps, orderMsgProps } from '@types'
import { validPhone } from 'functions/validForm'
import scrollToView from 'functions/scrollToView'
import { parseJson, stringJson } from 'functions/jsonTools'
import { useSession } from 'next-auth/react'
import { formattedPrice } from 'utils/functions/format'

const formDataFromLocalStorage =
  typeof window !== 'undefined'
    ? parseJson(localStorage.getItem('formDataCart') || '[]')
    : []

//orderFood
const OrderFood = () => {
  useDocumentTitle('Cart Items')
  const { pathname } = useRouter()

  useEffect(() => {
    scrollToView()
  }, [])

  const { items, grandPrice, setGrandPrice } = useContext(CartContext)
  const { checkedToppings } = useContext(ToppingsContext)

  //Form States
  const { data: session } = useSession()
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [personName, setPersonName] = useState(formDataFromLocalStorage.personName || '')
  const [personPhone, setPersonPhone] = useState(
    formDataFromLocalStorage.personPhone || ''
  )
  const [personAddress, setPersonAddress] = useState(
    formDataFromLocalStorage.personAddress || ''
  )
  const [personNotes, setPersonNotes] = useState(
    formDataFromLocalStorage.personNotes || ''
  )
  const [orderFoodStatus, setOrderFoodStatus] = useState(0)
  const [responseMsg, setResponseMsg] = useState<orderMsgProps>({
    Success: '',
    Failure: ''
  })
  const [showLoginRegisterModal, setShowLoginRegisterModal] = useState(false)
  const [showOrderInProcessModal, setShowOrderInProcessModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  //Declaring Referenced Element
  const personNameErr = useRef<HTMLSpanElement>(null)
  const personPhoneErr = useRef<HTMLSpanElement>(null)
  const personAddressErr = useRef<HTMLSpanElement>(null)
  const formErr = useRef<HTMLParagraphElement>(null)
  const grandPriceRef = useRef<HTMLElement>(null)

  const { loading, ...response } = useAxios({ url: '/settings' })

  useEffect(() => {
    if (response.response !== null) {
      setResponseMsg(response.response.response[0].orderMsg)
    }
  }, [response.response])

  useEffect(() => {
    setUserId(USER?._id!)
    setUserEmail(USER?.userEmail || session!?.user?.email!)

    localStorage.setItem(
      'formDataCart',
      stringJson({ personName, personPhone, personAddress, personNotes })
    )
  }, [personName, personPhone, personAddress, personNotes, session])

  useEffect(() => {
    setGrandPrice(grandPriceRef?.current?.textContent || grandPrice)
  }, [grandPriceRef?.current?.textContent, grandPrice, setGrandPrice])

  const handleCollectOrder = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (
      personName !== '' &&
      personPhone !== '' &&
      personNameErr.current!.textContent === '' &&
      personPhoneErr.current!.textContent === '' &&
      personAddressErr.current!.textContent === ''
    ) {
      formErr.current!.textContent = ''

      //if there's No user in localStorage then show modal to login or register else collect order
      if (USER || session!?.user) {
        setShowLoginRegisterModal(false)
        //setShowPaymentModal(true)
      } else {
        setShowLoginRegisterModal(true)
      }
    } else {
      formErr.current!.textContent = 'Please fill in the required fields'
    }
  }

  const handleSaveOrder = async (/*paymentData: any*/) => {
    //using FormData to send constructed data
    const formData = new FormData()
    formData.append('userId', userId)
    formData.append('userEmail', userEmail)
    formData.append('personName', personName)
    formData.append('personPhone', personPhone)
    formData.append('personAddress', personAddress)
    formData.append('personNotes', personNotes)
    formData.append('checkedToppings', stringJson(checkedToppings))
    formData.append('foodItems', stringJson(items))
    formData.append('grandPrice', grandPriceRef?.current?.textContent || '')
    formData.append('paymentData', 'stringJson(paymentData)')

    try {
      const response = await axios.post(`${origin}/api/orders`, formData)
      const { orderAdded, message } = response.data
      setIsLoading(false)
      setOrderFoodStatus(orderAdded)
      orderAdded === 0 &&
        setResponseMsg(msg => {
          return { ...msg, Failure: msg.Failure + message }
        })
      //remove all items from cart
      if (orderAdded) {
        const cartItems = ['restCartItems', 'restCheckedToppings', 'formDataCart']
        cartItems.forEach(item => localStorage.removeItem(item))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Layout>
      <section id='orderFood' className='py-12 my-8'>
        {orderFoodStatus === 1 ? (
          <Modal
            status={Success}
            msg={responseMsg.Success}
            btnName='View Orders'
            btnLink='/view'
            redirectLink='/view'
            redirectTime={10000}
          />
        ) : showLoginRegisterModal === true ? (
          <Modal
            status={Loading}
            msg={`You need to login or register to complete your order`}
            btnName='Login or Register'
            btnLink={`/auth/login?redirect=${pathname}`}
          />
        ) : showOrderInProcessModal === true ? (
          <Modal
            status={Loading}
            msg='Ordering is in the process, please wait a moment...'
            extraComponents={<>{handleSaveOrder(/*paymentData*/)}</>}
            btnName='Return'
            btnLink={`order-food`}
          />
        ) : null}

        <div className='container mx-auto text-center'>
          {loading ? (
            <LoadingPage />
          ) : items.length > 0 ? (
            <>
              <h2 className='inline-block mb-20 text-3xl font-bold'>Cart</h2>
              <CartItems />

              <form method='POST' onSubmit={handleCollectOrder}>
                <Link
                  href='/view'
                  className={`relative block p-2 mx-auto my-10 text-xl text-gray-900 bg-orange-400 border group border-orange-700 hover:bg-orange-500 transition-colors rounded-md w-[20rem] lg:w-[25rem] pl-10`}
                >
                  <span
                    className={`absolute inline-flex justify-center pt-3.5 pointer-events-none transition-all bg-white border border-orange-700 rounded-full -top-1.5 w-14 h-14 group-hover:left-2 left-6 mr-3 [transform:rotateY(180deg)]`}
                  >
                    🛒
                  </span>
                  Explore other meals
                </Link>

                <h2 className='mb-10 text-2xl'>Please add order details</h2>
                <label htmlFor='name' className={`form__group`}>
                  <input
                    className={`relative form__input`}
                    id='name'
                    name='name'
                    type='text'
                    defaultValue={personName}
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
                    defaultValue={personPhone}
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
                    {/* UK phone number */}
                    Phone Number (e.g: 123 4567 8900)&nbsp;
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
                    defaultValue={personAddress}
                    onChange={e => setPersonAddress(e.target.value.trim())}
                    onKeyUp={(e: any) => {
                      const target = e.target.value.trim()

                      if (target.length > 0 && target.length < 4) {
                        personAddressErr.current!.textContent =
                          'Please enter a phone number in the same format as the phone number in the example'
                      } else {
                        personAddressErr.current!.textContent = ''
                      }
                    }}
                    required
                  />
                  <span className={`form__label`}>
                    Address, (e.g: zone 00, 000st, building 000)&nbsp;
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
                    defaultValue={personNotes}
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
                  Total Price:{' '}
                  <strong ref={grandPriceRef}>
                    {formattedPrice(
                      items.reduce(
                        (acc: number, item: any) =>
                          acc +
                          item.cPrice * item.cQuantity +
                          checkedToppings.reduce(
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
                        Checking and Confirming Details...
                      </>
                    ) : (
                      'Confirm Order Details'
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <NoItems
              links={[
                { to: `../view`, label: 'View Meals' },
                { to: `../categories`, label: 'View Categories' }
              ]}
            />
          )}
        </div>
      </section>
    </Layout>
  )
}

export default OrderFood
