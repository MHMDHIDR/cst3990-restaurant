import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import useEventListener from 'hooks/useEventListener'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAuth from 'hooks/useAuth'
import Notification from 'components/Notification'
import { LoadingSpinner, LoadingPage } from 'components/Loading'
import Layout from 'components/Layout'
import { EyeIconOpen, EyeIconClose } from 'components/Icons/EyeIcon'
import { API_URL, USER } from '@constants'
import { parseJson, stringJson } from 'functions/jsonTools'
import type { UserProps } from '@types'

const LoginDataFromLocalStorage =
  typeof window !== 'undefined' && parseJson(localStorage.getItem('LoginData') || '{}')

const Login = () => {
  useDocumentTitle('Login')
  const router = useRouter()
  const { redirect } = router.query
  const { data: session } = useSession()

  useEffect(() => {
    USER || session!?.user ? router.push('/') : null
  }, [router, session])

  const [userEmailOrTel, setEmailOrTel] = useState(
    LoginDataFromLocalStorage.userEmailOrTel || ''
  )
  const [userPassword, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isSendingLoginForm, setIsSendingLoginForm] = useState(false)
  const [loggedInStatus, setLoggedInStatus] = useState<UserProps['LoggedIn']>(0)
  const [loginMsg, setLoginMsg] = useState<UserProps['message']>('')

  const modalLoading =
    typeof window !== 'undefined' ? document.querySelector('#modal') : null

  const { loading } = useAuth()

  useEventListener('click', (e: any) => {
    //confirm means cancel Modal message (hide it)
    if (e.target.id === 'confirm') {
      modalLoading!.classList.add('hidden')
    }
  })

  const sendLoginForm = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsSendingLoginForm(true)

    try {
      const loginUser = await axios.post(`${API_URL}/users/login`, {
        userPassword,
        userEmail: userEmailOrTel.trim().toLowerCase(),
        userTel: userEmailOrTel.trim().toLowerCase()
      })

      const { data } = loginUser
      const {
        LoggedIn,
        _id,
        userAccountType,
        userFullName,
        userEmail,
        token,
        message
      }: UserProps = data

      setLoggedInStatus(LoggedIn)
      setLoginMsg(message)

      if (LoggedIn === 1) {
        localStorage.setItem(
          'user',
          stringJson({ _id, userAccountType, userFullName, userEmail, token })
        )

        redirect
          ? router.push(`${redirect}`)
          : userAccountType === 'user'
          ? window.location.replace('/')
          : userAccountType === 'admin'
          ? window.location.replace(`/dashboard`)
          : null
      }
    } catch (error: any) {
      console.log(error)

      setLoggedInStatus(error.response?.data?.LoggedIn)
      setLoginMsg(error.response?.data?.message)
    } finally {
      setIsSendingLoginForm(false)
    }
  }

  return USER || loading || session!?.user ? (
    <LoadingPage />
  ) : (
    <Layout>
      <section className='py-12 my-8'>
        <div className='container mx-auto'>
          <Notification sendStatus={loggedInStatus!} sendStatusMsg={loginMsg!} />

          <h3
            className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'
            data-section='login'
          >
            Login
          </h3>
          <div className='max-w-6xl mx-auto'>
            <form className='mt-32' onSubmit={sendLoginForm}>
              <label htmlFor='email' className='form__group'>
                <input
                  className='form__input'
                  id='email'
                  name='email'
                  type='text'
                  onChange={e => setEmailOrTel(e.target.value)}
                  defaultValue={userEmailOrTel}
                  dir='auto'
                  autoFocus
                  required
                />
                <span className='form__label'>Email or Phone Number</span>
              </label>

              <label htmlFor='password' className='form__group'>
                <input
                  className='form__input'
                  id='password'
                  name='password'
                  type={passwordVisible ? 'text' : 'password'}
                  onChange={e => setPassword(e.target.value)}
                  dir='auto'
                  required
                />
                <span
                  className={`absolute cursor-pointer px-2 text-xs text-black capitalize transition-all bg-gray-200 select-none sm:text-sm md:text-lg dark:text-gray-100 dark:bg-gray-800 opacity-60 right-1`}
                  onClick={() => setPasswordVisible(prevState => !prevState)}
                >
                  {passwordVisible ? (
                    <EyeIconClose className={`stroke-red-700 dark:stroke-red-400`} />
                  ) : (
                    <EyeIconOpen className={`fill-green-700 dark:fill-green-400`} />
                  )}
                </span>
                <span className='form__label'> Password</span>
              </label>

              <div className='flex flex-col gap-6 text-center border-none form__group ltr'>
                <div className='flex flex-wrap items-center justify-around gap-y-4'>
                  <button
                    className={`w-fit px-12 py-3 text-white uppercase bg-orange-700 rounded-lg hover:bg-orange-800 scale-100 transition-all order-2`}
                    type='submit'
                    id='submitBtn'
                  >
                    {isSendingLoginForm ? (
                      <>
                        <LoadingSpinner />
                        &nbsp; Login In...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>

                <strong className='block mx-auto my-8 text-orange-800 dark:text-orange-600 w-fit'>
                  OR
                </strong>

                <div className='flex flex-wrap items-center justify-evenly gap-y-6'>
                  <Link
                    href='/auth/join'
                    className='mx-auto text-center text-orange-700 underline-hover dark:text-orange-800 sm:dark:text-orange-500 w-fit'
                  >
                    Join our Community and Order
                  </Link>

                  <Link
                    href='/auth/forgot'
                    className='mx-auto text-center text-orange-700 underline-hover dark:text-orange-800 sm:dark:text-orange-500 w-fit'
                  >
                    Forgot my password
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  )
}
export default Login
