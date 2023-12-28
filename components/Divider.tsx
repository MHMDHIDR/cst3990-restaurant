import { DividerProps } from '@types'

const Divider = ({
  thickness = 0,
  style = 'dashed',
  marginY = 14,
  color = 'orange'
}: DividerProps) => (
  <hr
    className={`my-${marginY} border${
      !thickness || thickness === 0 || thickness === 1 ? '' : '-' + thickness
    } border-${style}  border-${color}-800 dark:border-${color}-700 rounded w-full`}
  />
)

export const DividerStylish = ({
  children,
  className
}: {
  children?: string
  className?: string
}) => (
  <div
    className={`flex relative w-full justify-center items-center m-4 before:[background:linear-gradient(90deg,transparent,#777,transparent)] dark:before:[background:linear-gradient(90deg,transparent,#999,transparent)] before:absolute before:left-0 before:top-1/2 before:w-full before:h-px${
      className ? ' ' + className : ''
    }`}
  >
    {children ? (
      <span className='z-10 px-2 bg-white dark:text-neutral-200 dark:bg-gray-800'>
        {children}
      </span>
    ) : null}
  </div>
)

export default Divider
