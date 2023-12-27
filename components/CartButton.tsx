import { ButtonProps } from '@types'
import { AddCartIcon, RemoveCartIcon } from 'components/Icons/Item'

export const CartAddButton = ({ classes = '', children }: ButtonProps) => {
  return (
    <CartButton classes={classes} CartButtonIcon={<AddCartIcon />}>
      {children}
    </CartButton>
  )
}

export const CartRemoveButton = ({ classes = '', onClick, children }: ButtonProps) => {
  return (
    <CartButton onClick={onClick} classes={classes} CartButtonIcon={<RemoveCartIcon />}>
      {children}
    </CartButton>
  )
}

const CartButton = ({ classes = '', CartButtonIcon, onClick, children }: ButtonProps) => {
  return (
    <button
      className={`flex items-center justify-between pr-8 text-white rounded-lg ${classes} gap-x-5 cursor-pointer`}
      onClick={onClick}
    >
      <span className='px-3 mr-3 bg-gray-100 rounded-tl rounded-bl'>
        {CartButtonIcon}
      </span>
      <span className='w-full text-center'>{children}</span>
    </button>
  )
}
