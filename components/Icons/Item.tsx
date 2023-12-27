export const AddCartIcon = ({ width = '10', height = '10', className = '' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 512 512'
    height='50'
    className={`w-${width} h-${height} ${className} max-w-[1rem]`}
    xlinkTitle='Add Button'
  >
    <title>Add Button</title>
    <circle className='addToCart' cx='176' cy='416' r='16'></circle>
    <circle className='addToCart' cx='400' cy='416' r='16'></circle>
    <polyline className='addToCart' points='48 80 112 80 160 352 416 352'></polyline>
    <path
      className='addToCart'
      d='M160,288H409.44a8,8,0,0,0,7.85-6.43l28.8-144a8,8,0,0,0-7.85-9.57H128'
    ></path>
  </svg>
)

export const RemoveCartIcon = ({ width = '10', height = '10', className = '' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 512 512'
    height='50'
    className={`w-${width} h-${height} ${className} max-w-[1rem]`}
    xlinkTitle='Add Button'
  >
    <title>Remove Button</title>
    <path
      className='addToCart'
      d='M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320'
    ></path>
    <line className='addToCart' x1='80' y1='112' x2='432' y2='112'></line>
    <path
      className='addToCart'
      d='M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40'
    ></path>
    <line className='addToCart' x1='256' y1='176' x2='256' y2='400'></line>
    <line className='addToCart' x1='184' y1='176' x2='192' y2='400'></line>
    <line className='addToCart' x1='328' y1='176' x2='320' y2='400'></line>
  </svg>
)
