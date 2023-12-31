import { useState, useEffect } from 'react'
import { getSession, useSession } from 'next-auth/react'
import { stringJson } from 'functions/jsonTools'
import useAxios from './useAxios'
import { LoggedInUserProps, UserProps } from '@types'

/**
 * Custom hook to check if user is logged in then redirect to dashboard or home page
 */

const useAuth = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false)
  const [userType, setUserType] = useState<string>('')
  const [userStatus, setUserStatus] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [headers, setHeaders] = useState<UserProps>()
  const { data: session }: { data: LoggedInUserProps } = useSession()

  useEffect(() => {
    const getUserSession = async () => {
      const session: any = await getSession()
      const { user }: { user: UserProps } = session?.token || { user: null }
      setHeaders(user)
      return user
    }

    getUserSession()
  }, [])

  const { loading, ...response }: any = useAxios({
    url: `/users`,
    headers: stringJson(headers!)
  })

  useEffect(() => {
    if (!session?.token!.user) {
      setIsAuth(false)
      setUserType('')
    }

    if (
      !loading &&
      ['admin', 'cashier', 'user'].includes(response.response?.userAccountType)
    ) {
      setIsAuth(true)
      setUserType(response.response?.userAccountType)
      setUserStatus(response.response?.userAccountStatus)
      setUserId(response.response?._id)
    }

    return (): void => {
      setIsAuth(false)
      setUserType('')
      setUserStatus('')
      setUserId('')
    }
  }, [response.response])

  return {
    user: session?.token!.user,
    isAuth,
    userType,
    userStatus,
    userId,
    loading
  }
}

export default useAuth
