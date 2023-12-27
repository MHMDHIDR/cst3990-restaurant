import Link from 'next/link'

const buttonStyle = `m-1 p-2 text-sm text-white rounded-md min-w-[7rem] overflow-hidden text-left`

export const AcceptBtn = ({ id, email }: any) => {
  return (
    <button
      id='acceptOrder'
      data-id={id}
      data-status='accept'
      data-email={email}
      className={`${buttonStyle} bg-green-600 hover:bg-green-700`}
      data-tooltip={`Accept Order`}
    >
      <span className='py-0.5 px-1 md:pl-1 bg-green-300 rounded-md'>&#9989;</span>
      <span className={`inline-block pointer-events-none pl-3`}>Accept</span>
    </button>
  )
}

export const EditBtn = ({ id }: any) => {
  return (
    <Link
      href={`/dashboard/orders/edit/${id}`}
      id='editOrder'
      className={`${buttonStyle} bg-gray-600 hover:bg-gray-700`}
      data-tooltip={`Edit Order`}
    >
      <span className='py-0.5 px-1 md:pl-1 bg-gray-300 rounded-md'>&#9997;</span>
      <span className={`inline-block pointer-events-none pl-3`}>Edit</span>
    </Link>
  )
}

export const RejectBtn = ({ id, email }: any) => {
  return (
    <button
      id='rejectOrder'
      data-id={id}
      data-status='reject'
      data-email={email}
      className={`${buttonStyle} bg-gray-600 hover:bg-gray-700`}
      data-tooltip={`Reject Order`}
    >
      <span className='py-0.5 px-1 md:pl-1 bg-gray-300 rounded-md'>&#10060;</span>
      <span className={`inline-block pointer-events-none pl-3`}>Reject</span>
    </button>
  )
}

export const DeleteBtn = ({ id, email }: any) => {
  return (
    <button
      id='deleteOrder'
      data-id={id}
      data-status='delete'
      data-email={email}
      className={`${buttonStyle} bg-red-600 hover:bg-red-700`}
      data-tooltip={`Delete Order`}
    >
      <span className='py-0.5 px-1 md:pl-1 bg-red-200 rounded-md'>&#128465;</span>
      <span className={`inline-block pointer-events-none pl-3`}>Delete</span>
    </button>
  )
}

export const InvoiceBtn = ({ id, email, onClick }: any) => {
  return (
    <button
      id='invoice'
      data-id={id}
      data-status='invoice'
      data-email={email}
      className={`${buttonStyle} bg-blue-600 hover:bg-blue-700`}
      data-tooltip={`Create Order Receipt`}
      onClick={onClick}
    >
      <span className='py-0.5 px-1 bg-blue-200 rounded-md pointer-events-none'>
        &#128424;
      </span>
      <span className={`inline-block pointer-events-none pl-3`}>Create Receipt</span>
    </button>
  )
}
