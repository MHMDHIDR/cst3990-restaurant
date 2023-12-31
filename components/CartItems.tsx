import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { CartContext } from 'contexts/CartContext'
import { ToppingsContext } from 'contexts/ToppingsContext'
import { DashboardOrderContext } from 'contexts/DashboardOrderContext'
import { removeSlug } from 'functions/slug'
import Divider from 'components/Divider'
import { CartRemoveButton } from 'components/CartButton'
import { selectedToppingsProps } from '@types'
import { MAX_QUANTITY } from '@constants'
import Image from 'next/image'
import { formattedPrice } from 'utils/functions/format'

const CartItems: any = ({ orderItems, orderToppings }: any) => {
  const { items } = useContext(CartContext)
  const isDashboard = useRouter().pathname.includes('/dashboard')

  //if orderItems defined in dashboard
  return isDashboard ? (
    <Items
      orderItems={orderItems}
      orderToppings={orderToppings}
      isDashboard={isDashboard}
    />
  ) : (
    !isDashboard && <Items orderItems={items} isDashboard={isDashboard} />
  )
}

const Items = ({
  orderItems,
  orderToppings,
  isDashboard
}: {
  orderItems: any
  orderToppings?: any
  isDashboard: boolean
}) => {
  const {
    handleToppingChecked,
    checkedToppings,
    handleOrderItemToppingChecked,
    orderItemToppings,
    setOrderItemToppings
  } = useContext(ToppingsContext)
  const { items, setItems, removeFromCart, setGrandPrice } = useContext(CartContext)
  const { removeOrderFromItems } = useContext(DashboardOrderContext)
  const [_orderItemQuantity, setOrderItemQuantity] = useState(0)

  useEffect(() => {
    setOrderItemToppings(orderToppings)
  }, [orderToppings, setOrderItemToppings])

  return orderItems?.map((item: any) => {
    //if has topping in original item (food) object
    const hasToppings = typeof item?.cToppings[0]?.toppingName === 'string'

    return (
      <div key={item.cItemId}>
        <div
          className={`grid items-center
            grid-cols-1
            lg:grid-cols-2
            xl:grid-cols-3
            2xl:grid-cols-4
            gap-y-10
            gap-x-5
          `}
        >
          {/* Product Image */}
          <Image
            loading='lazy'
            src={item?.cImg[0].foodImgDisplayPath}
            alt={removeSlug(item?.cHeading)}
            width='128'
            height='128'
            className='object-cover w-32 h-32 max-w-[10rem] max-h-[10rem] p-1 mx-auto border border-gray-400 aspect-square dark:border-gray-300 rounded-xl'
          />

          {/* Product Details */}
          <div
            className={`flex flex-col gap-2 space-y-3 select-none ${
              !hasToppings && 'xl:col-start-2 xl:col-end-4'
            }`}
          >
            <h2 className='text-lg font-semibold text-center underline underline-offset-8'>
              {removeSlug(item?.cHeading)}
            </h2>
            <p>{item?.cDesc}</p>
          </div>

          {/* Product Toppings and it's Quantity */}
          {hasToppings && (
            <div className='flex items-center justify-around gap-y-10 xl:gap-x-5 sm:flex-row'>
              <div className='flex flex-col gap-2 text-lg select-none md:items-start'>
                <h2 className='text-center ltr'>Toppings</h2>
                {item?.cToppings?.map(
                  ({
                    toppingId = '123id',
                    toppingName = 'Topping',
                    toppingPrice = 1,
                    toppingQuantity = 1
                  }: selectedToppingsProps) => (
                    <div className='flex items-center gap-3' key={toppingId}>
                      <input
                        type='checkbox'
                        id={toppingId}
                        value={toppingName}
                        className='cursor-pointer min-w-[1.5rem] min-h-[1.5rem]'
                        onChange={() =>
                          orderToppings
                            ? handleOrderItemToppingChecked(toppingId, toppingPrice)
                            : handleToppingChecked(toppingId, toppingPrice)
                        }
                        defaultChecked={
                          orderToppings
                            ? orderItemToppings?.find(
                                (topping: { toppingId: string }) =>
                                  topping.toppingId === toppingId
                              )
                            : checkedToppings.find(
                                (topping: { toppingId: string }) =>
                                  topping.toppingId === toppingId
                              )
                        }
                      />
                      <label
                        htmlFor={toppingId}
                        className='cursor-pointer p-1.5 text-base rounded-md select-none'
                      >
                        {toppingName}
                      </label>
                      <label
                        htmlFor={toppingId}
                        className='px-3 py-1 mr-2 -ml-2 text-base text-green-800 bg-green-300 rounded-md cursor-pointer bg-opacity-80 min-w-fit'
                      >
                        <strong>{formattedPrice(toppingPrice * toppingQuantity)}</strong>
                      </label>
                    </div>
                  )
                )}
              </div>
              <div className='flex flex-col items-center gap-2 text-lg select-none'>
                <h2 className='text-center ltr'>Toppings Quantity</h2>
                {item?.cToppings.map((topping: any, idx: number) => {
                  const toppingId = item.cItemId + idx

                  return (
                    <div key={toppingId} className='flex gap-1 select-none'>
                      <button
                        className='quantity-btn number-hover'
                        onClick={() => {
                          if (orderToppings) {
                            setItems(
                              orderItems.map((item: any) => {
                                if (
                                  topping.toppingQuantity < MAX_QUANTITY &&
                                  item.cItemId === toppingId.slice(0, -1)
                                ) {
                                  topping.toppingQuantity++
                                  setOrderItemQuantity(topping.toppingQuantity)
                                }
                                return item
                              })
                            )
                          } else if (topping.toppingQuantity < MAX_QUANTITY) {
                            setItems(
                              items.map((item: any) => {
                                if (item.cItemId === toppingId.slice(0, -1)) {
                                  topping.toppingQuantity++
                                  setOrderItemQuantity(topping.toppingQuantity)
                                }
                                return item
                              })
                            )
                          }
                        }}
                      >
                        +
                      </button>
                      <span className='text-lg font-bold quantity-btn'>
                        {topping.toppingQuantity}
                      </span>
                      <button
                        className='quantity-btn number-hover'
                        onClick={() => {
                          if (orderToppings) {
                            setItems(
                              orderItems.map((item: any) => {
                                if (
                                  topping.toppingQuantity > 1 &&
                                  item.cItemId === toppingId.slice(0, -1)
                                ) {
                                  topping.toppingQuantity--
                                  setOrderItemQuantity(topping.toppingQuantity)
                                }
                                return item
                              })
                            )
                          } else if (topping.toppingQuantity > 1) {
                            setItems(
                              items.map(item => {
                                if (item.cItemId === toppingId.slice(0, -1)) {
                                  topping.toppingQuantity--
                                  setOrderItemQuantity(topping.toppingQuantity)
                                }
                                return item
                              })
                            )
                          }
                        }}
                      >
                        -
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Product Quantity */}
          <div
            className={`flex items-center justify-center space-y-1 select-none flex-col ${
              !hasToppings &&
              'lg:col-start-2 lg:col-end-4 xl:col-start-auto xl:col-end-auto'
            }`}
          >
            <h2 className='text-lg text-center ltr'>Quantity</h2>
            <span className='text-lg font-bold quantity-btn'>{item.cQuantity}</span>
            <div className='flex gap-2 select-none justify-evenly'>
              <button
                className='quantity-btn number-hover'
                onClick={() => {
                  if (item.cQuantity < MAX_QUANTITY) {
                    item.cQuantity++
                    setItems([...items])
                    setGrandPrice(
                      items.reduce(
                        (acc, item) =>
                          acc +
                          item.cPrice * item.cQuantity +
                          (orderToppings
                            ? orderToppings.reduce(
                                (acc: number, curr: selectedToppingsProps) =>
                                  curr.toppingId.slice(0, -2) === item.cItemId
                                    ? acc +
                                      Number(curr.toppingPrice) *
                                        item.cToppings.reduce(
                                          (acc: number, curr2: selectedToppingsProps) =>
                                            curr2.toppingId === curr.toppingId
                                              ? curr2.toppingQuantity
                                              : acc,
                                          0
                                        )
                                    : acc,
                                0
                              )
                            : checkedToppings.reduce(
                                (acc: number, curr: selectedToppingsProps) =>
                                  curr.toppingId.slice(0, -2) === item.cItemId
                                    ? acc +
                                      Number(curr.toppingPrice) *
                                        item.cToppings.reduce(
                                          (acc: number, curr2: selectedToppingsProps) =>
                                            curr2.toppingId === curr.toppingId
                                              ? curr2.toppingQuantity
                                              : acc,
                                          0
                                        )
                                    : acc,
                                0
                              )),
                        0
                      )
                    )
                  }
                }}
              >
                +
              </button>
              <button
                className='quantity-btn number-hover'
                //Decrement items quantity
                onClick={() => {
                  if (item.cQuantity > 1) {
                    item.cQuantity--
                    setItems([...items])
                    setGrandPrice(
                      items.reduce(
                        (acc, item) =>
                          acc +
                          item.cPrice * item.cQuantity +
                          //calculate all items checked toppings prices * all items checked toppings quantities
                          (orderToppings
                            ? orderToppings.reduce(
                                (acc: number, curr: selectedToppingsProps) =>
                                  curr.toppingId.slice(0, -2) === item.cItemId
                                    ? acc +
                                      Number(curr.toppingPrice) *
                                        item.cToppings.reduce(
                                          (acc: number, curr2: selectedToppingsProps) =>
                                            curr2.toppingId === curr.toppingId
                                              ? curr2.toppingQuantity
                                              : acc,
                                          0
                                        )
                                    : acc,
                                0
                              )
                            : checkedToppings.reduce(
                                (acc: number, curr: selectedToppingsProps) =>
                                  curr.toppingId.slice(0, -2) === item.cItemId
                                    ? acc +
                                      Number(curr.toppingPrice) *
                                        item.cToppings.reduce(
                                          (acc: number, curr2: selectedToppingsProps) =>
                                            curr2.toppingId === curr.toppingId
                                              ? curr2.toppingQuantity
                                              : acc,
                                          0
                                        )
                                    : acc,
                                0
                              )),
                        0
                      )
                    )
                  }
                }}
              >
                -
              </button>
            </div>
          </div>

          {/* Product Price */}
          <span
            className={`p-3 mx-auto text-sm text-green-800 bg-green-300 border border-green-800 rounded-md select-none w-fit xl:col-start-1 xl:col-end-3 ${
              !hasToppings && 'xl:row-start-2 xl:row-end-3'
            }`}
          >
            <span>
              The price of the meal, including the calculation of the additions and the
              quantity for the additions and the meal :&nbsp;
            </span>
            <strong className='text-lg'>
              {formattedPrice(
                item.cPrice * item.cQuantity +
                  (orderToppings
                    ? orderItemToppings?.reduce(
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
                      )
                    : checkedToppings.reduce(
                        (acc: number, curr: selectedToppingsProps) =>
                          curr.toppingId.slice(0, -2) === item.cItemId
                            ? acc +
                              Number(curr.toppingPrice) *
                                item.cToppings.reduce(
                                  (acc: number, curr2: selectedToppingsProps) =>
                                    curr2.toppingId === curr.toppingId
                                      ? curr2.toppingQuantity
                                      : acc,
                                  0
                                )
                            : acc,
                        0
                      ))
              )}
            </strong>
          </span>

          <CartRemoveButton
            classes='bg-red-800 hover:bg-red-700 xl:col-start-4 xl:col-end-5'
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to delete (${item.cHeading}) from ${
                    isDashboard ? 'Order' : 'Cart'
                  }?`
                )
              ) {
                isDashboard
                  ? removeOrderFromItems(item.cItemId)
                  : removeFromCart(item.cItemId)
              }
            }}
          >
            {`Remove From ${isDashboard ? 'Order' : 'Cart'}`}
          </CartRemoveButton>
        </div>
        <Divider />
      </div>
    )
  })
}

export default CartItems
