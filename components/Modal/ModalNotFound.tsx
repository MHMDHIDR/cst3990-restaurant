import Modal from './Modal'
import { Error } from '../Icons/Status'
import { ModalProps } from '@types'

const ModalNotFound = ({
  // status prop type react element
  status = Error,
  btnLink = '/',
  btnName = 'Home',
  msg = `We apologize for the inconvenience, but it appears that the page you are looking for does not exist! Or you misspelled the page name! Click to ${btnName} Click the button below`
}: ModalProps) => {
  return <Modal status={status} msg={msg} btnName={btnName} btnLink={btnLink} />
}

export default ModalNotFound
