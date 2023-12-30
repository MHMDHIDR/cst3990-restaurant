import { createLocaleDateString, formattedPrice } from 'utils/functions/format'
import Divider, { DividerStylish } from 'components/Divider'
import Image from 'next/image'
import { PayPal } from 'components/Icons/Payments'
import { selectedToppingsProps } from '@types'

const Invoice = ({ ordersData, orderItemsIds, orderToppingsId, forwardedRef }: any) => {
  const inSeletedToppings = orderToppingsId?.map((selected: any) =>
    //if there is no toppings in order then selected will be empty array
    (selected || []).filter((element: any) =>
      orderItemsIds.map((id: any) => id?.includes(element?.slice(0, -2)))
    )
  )

  const {
    personName,
    personPhone,
    personAddress,
    userEmail,
    orderId,
    orderDate,
    orderItems,
    orderToppings,
    grandPrice,
    paymentData
  } = ordersData || ''

  const orderItems_cToppings = ordersData?.orderItems[0].cToppings

  return (
    <div className='hidden'>
      <div
        ref={forwardedRef}
        className='flex flex-col justify-between h-screen px-10 py-6 bg-white min-w-min ltr rounded-xl'
      >
        <header className='flex flex-col gap-y-8'>
          <nav className='flex flex-col items-center justify-center gap-y-2'>
            <Image
              src={`/assets/img/icons/mobile/apple-icon-180.png`}
              className='rounded-lg'
              width='50'
              height='50'
              alt='Invoice Logo'
            />
            <h1 className='text-2xl text-orange-700'>Invoice</h1>
          </nav>
          <div className='flex items-center justify-between'>
            <p className='w-1/2'>
              It Was Our Pleasure Serving You, {personName}. We Hope You Enojoyed Your
              Order, Hope to See You Soon.
            </p>
            <div className='flex flex-col'>
              <span>ORDER Number: {orderId}</span>
              <span>ORDER Date:{createLocaleDateString(orderDate)}</span>
            </div>
          </div>
        </header>
        <table className='table w-full text-center border-collapse table-auto'>
          <thead className='text-white bg-orange-700'>
            <tr>
              <th className='pl-3'>No</th>
              <th className='px-2 min-w-[20rem]'>Items</th>
              <th className='px-2'>Quantity</th>
              <th className='pr-3'>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orderItems?.map((item: any, idx: number) => (
              <tr key={item.cItemId}>
                <td className='px-1 py-2 max-w-[0.25rem]'>{idx + 1}</td>
                <td>
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center w-full gap-4'>
                      <Image
                        loading='lazy'
                        src={
                          item.cImg[0].foodImgDisplayPath ||
                          `/assets/img/icons/mobile/apple-icon-180.png`
                        }
                        alt={item.cImg[0].foodImgDisplayName || `order view`}
                        width={56}
                        height={56}
                        className='object-cover rounded-lg shadow-md w-14 h-14'
                      />
                      <span>{item.cHeading || 'Order Name'}</span>
                    </div>
                    <div className='flex flex-col gap-2'>
                      {inSeletedToppings
                        .map((id: string) => id.slice(0, -2))
                        ?.includes(item.cItemId) && (
                        <h3 className='font-bold'>Toppings</h3>
                      )}
                      {item?.cToppings?.map(
                        ({
                          toppingId,
                          toppingName,
                          toppingPrice,
                          toppingQuantity
                        }: selectedToppingsProps) =>
                          orderToppings
                            .map(({ toppingId }: { toppingId: string }) => toppingId)
                            ?.includes(toppingId) && (
                            <div key={toppingId} className='flex gap-2.5 text-xs'>
                              <span className='px-2 py-1 text-orange-900 bg-orange-200 rounded-lg'>
                                {toppingName}
                              </span>
                              <span className='px-2 py-1 text-orange-900 bg-orange-200 rounded-lg'>
                                Item Price {toppingPrice}
                              </span>
                              <span className='px-2 py-1 text-orange-900 bg-orange-200 rounded-lg'>
                                Ordered Quantity {toppingQuantity}
                              </span>
                              <span className='px-2 py-1'>
                                Total Price:
                                <strong className='px-2 text-green-900 bg-green-200 rounded-lg'>
                                  {formattedPrice(toppingPrice * toppingQuantity!)}
                                </strong>
                              </span>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                  <Divider marginY={2} thickness={0.5} />
                </td>
                <td>{item.cQuantity || 'Quantity'}</td>
                <td>
                  <span className='flex flex-col gap-2'>
                    <span>
                      Item Price&nbsp;
                      <strong className='px-2 text-green-800 bg-green-300 rounded-lg bg-opacity-70'>
                        {formattedPrice(item.cPrice || 1)}
                      </strong>
                    </span>
                    {orderToppings?.length > 0 && (
                      <span className='mt-4'>
                        Toppings Price &nbsp;
                        <strong className='px-2 text-green-800 bg-green-300 rounded-lg bg-opacity-70'>
                          {formattedPrice(
                            orderToppings.reduce((acc: any, topping: any) => {
                              const item = orderItems_cToppings.find(
                                (item: any) => item.toppingId === topping.toppingId
                              )
                              if (item) {
                                return acc + topping.toppingPrice * item.toppingQuantity
                              }
                              return acc
                            }, 0)
                          )}
                        </strong>
                      </span>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='flex items-center justify-between'>
          <h3 className='font-bold'>TOTAL PRICE</h3>
          <h3 className='inline-block px-10 py-1 text-lg font-bold text-green-800 bg-green-300 rounded-lg bg-opacity-70'>
            {formattedPrice(grandPrice)}
          </h3>
        </div>

        <DividerStylish className='my-10' />

        <div className='flex items-center justify-between'>
          <div className='flex flex-col items-start justify-between w-1/2'>
            <h3 className='text-xs'>BILLING INFORMATION</h3>
            <span>Name: {personName}</span>
            <span>Address: {personAddress}</span>
            <span>Tel: {personPhone}</span>
            <span>Email: {userEmail}</span>
          </div>
          <div className='flex flex-col items-end justify-between w-1/2'>
            <h3 className='text-xs'>BILLING INFORMATION</h3>
            <span className='flex'>
              Payment Type:
              {paymentData?.paymentSource === 'paypal' && (
                <PayPal className='w-[22px] h-[22px]' />
              )}
              {paymentData?.paymentSource}
            </span>
            <span>Transaction ID: {paymentData?.paymentID || paymentData?.orderID}</span>
          </div>
        </div>
        <div className='text-center'>
          <p>{createLocaleDateString(new Date().toString())}</p>
          <p>Restaurant App - &copy; 2021 - {new Date().getFullYear()}</p>
          <p>Have a nice day</p>
        </div>
      </div>
    </div>
  )
}

export default Invoice
