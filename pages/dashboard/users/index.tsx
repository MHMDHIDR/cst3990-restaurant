import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useEventListener from 'hooks/useEventListener'
import useAxios from 'hooks/useAxios'
import useAuth from 'hooks/useAuth'
import goTo from 'functions/goTo'
import logoutUser from 'functions/logoutUser'
import { isNumber } from 'functions/isNumber'
import { API_URL, ITEMS_PER_PAGE, USER } from '@constants'
import Modal from 'components/Modal/Modal'
import { Success, Error, Loading } from 'components/Icons/Status'
import { LoadingPage } from 'components/Loading'
import Pagination from 'components/Pagination'
import NavMenu from 'components/NavMenu'
import ModalNotFound from 'components/Modal/ModalNotFound'
import Layout from 'components/dashboard/Layout'

const DashboardUsers = () => {
  useDocumentTitle('Users')

  const { query } = useRouter()
  const { pageNum }: any = query
  const pageNumber = !pageNum || !isNumber(pageNum) || pageNum < 1 ? 1 : parseInt(pageNum)

  const [userId, setUserId] = useState('')
  const [userAccountStatus, setuserAccountStatus] = useState('')
  const [userName, setUserName] = useState('')
  const [deleteUserStatus, setDeleteUserStatus] = useState()
  const [userUpdated, setUserUpdated] = useState()
  const [users, setUsers] = useState<any>('')
  const [modalLoading, setModalLoading] = useState(false)

  const { userType } = useAuth()

  const { loading, ...response } = useAxios({
    url: `/users/all?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`
  })

  useEffect(() => {
    if (response?.response !== null) {
      setUsers(response?.response)
    }
  }, [response.response])

  useEventListener('click', (e: any) => {
    switch (e.target.id) {
      case 'deleteUser':
      case 'blockUser':
      case 'activateUser':
      case 'admin':
      case 'cashier':
      case 'user': {
        setUserId(e.target.dataset.id)
        setUserName(e.target.dataset.name)
        setuserAccountStatus(e.target.dataset.action)
        //show modal
        setModalLoading(true)
        break
      }

      case 'confirm': {
        handleUser(userId, userAccountStatus)
        break
      }

      case 'cancel': {
        setModalLoading(false)
        break
      }

      default: {
        setModalLoading(false)
        break
      }
    }
  })

  const handleUser = async (userId: string, userAccountStatus: string) => {
    if (userAccountStatus === 'delete') {
      try {
        //You need to name the body {data} so it can be recognized in (.delete) method
        //I passed empty data value because delete method needs data object with any
        //value and in this case we don't have any value
        const response = await axios.delete(`${API_URL}/users/${userId}`, { data: '' })
        const { userDeleted } = response.data
        setDeleteUserStatus(userDeleted)

        setTimeout(() => {
          setModalLoading(false)
        }, 300)

        logoutUser(userId)
      } catch (err) {
        console.error(err)
      }
    } else {
      const formData = new FormData()
      formData.append('userAccountStatus', userAccountStatus)

      try {
        const response = await axios.patch(`${API_URL}/users/${userId}`, formData)
        const { userUpdated } = response.data
        setUserUpdated(userUpdated)

        setTimeout(() => {
          setModalLoading(false)
        }, 300)
      } catch (err) {
        console.error(err)
      }
    }
  }

  return loading || !userType ? (
    <LoadingPage />
  ) : userType !== 'admin' || USER?.userAccountType !== 'admin' ? (
    <ModalNotFound />
  ) : (
    <>
      {deleteUserStatus === 1 ? (
        <Modal
          status={Success}
          msg={`${userName} Has Been Deleted Successfully 😄, please wait to be redirected to the users list`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : deleteUserStatus === 0 ? (
        <Modal
          status={Error}
          msg={`An error occurred during deleting ${userName}!`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : userUpdated === 1 ? (
        <Modal
          status={Success}
          msg={`Done ${
            userAccountStatus === 'block'
              ? `❗️Blocking 😔 ${userName}`
              : userAccountStatus === 'active'
              ? `🎉 Activating 😄 ${userName}`
              : userAccountStatus === 'admin'
              ? `🎉 Make ${userName} an admin 😎`
              : userAccountStatus === 'cashier'
              ? `🎉 Make ${userName} a cashier 😎`
              : userAccountStatus === 'user'
              ? `❗️ Make ${userName}  a user 😎`
              : null
          } successfully, please wait to be redirected to the users list`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : userUpdated === 0 ? (
        <Modal
          status={Error}
          msg={`An error occurred during updating ${userName}!`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : null}

      {/* Confirm Box */}
      {modalLoading && (
        <Modal
          status={Loading}
          classes='txt-blue text-center'
          msg={`Are you sure you want to ${
            userAccountStatus === 'block'
              ? `Block ${userName}`
              : userAccountStatus === 'active'
              ? `Activate ${userName}`
              : userAccountStatus === 'admin'
              ? `Make ${userName} to an Admin`
              : userAccountStatus === 'cashier'
              ? `Make ${userName} to a Cashier`
              : userAccountStatus === 'user'
              ? `Make ${userName} to a User`
              : 'Delete'
          } this actoin can't be undone?`}
          ctaConfirmBtns={[
            userAccountStatus === 'block'
              ? 'Block'
              : userAccountStatus === 'active'
              ? 'Activate'
              : userAccountStatus === 'admin'
              ? 'Make Admin'
              : userAccountStatus === 'cashier'
              ? 'Make Cashier'
              : userAccountStatus === 'user'
              ? 'Make User'
              : 'Delete',
            'Cancel'
          ]}
        />
      )}
      <Layout>
        <section className='py-12 my-8 dashboard'>
          <div className='container mx-auto'>
            <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
              Users List
            </h3>

            <table className='table w-full text-center'>
              <thead className='text-white bg-orange-800'>
                <tr>
                  <th className='px-1 py-2'>Name</th>
                  <th className='px-1 py-2'>Email</th>
                  <th className='px-1 py-2'>User Type</th>
                  <th className='px-1 py-2'>User Status</th>
                  <th className='px-1 py-2'>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users?.response?.length > 0 ? (
                  <>
                    {users?.response?.map((item: any, idx: number) => (
                      <tr
                        key={item._id}
                        className='transition-colors even:bg-gray-200 odd:bg-gray-300 dark:even:bg-gray-600 dark:odd:bg-gray-700'
                      >
                        <td className='px-1 py-2'>{item.userFullName}</td>
                        <td className='px-1 py-2'>
                          <p>{item.userEmail}</p>
                        </td>
                        <td
                          className={`px-1 py-2 font-bold${
                            item.userAccountType === 'admin'
                              ? ' text-red-700 dark:text-red-400 font-bold'
                              : item.userAccountType === 'cashier'
                              ? ' text-orange-500 dark:text-orange-400 font-bold'
                              : ' text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          <span
                            data-tooltip={
                              item.userAccountType === 'admin'
                                ? 'The Admin has access to the dashboard, managing the app through it.'
                                : item.userAccountType === 'cashier'
                                ? 'The Cashier has access to the orders page with the ability to approve or reject the order.'
                                : 'The User has access their account, and orders only.'
                            }
                            className='w-40'
                          >
                            {item.userAccountType === 'admin'
                              ? 'Admin'
                              : item.userAccountType === 'cashier'
                              ? 'Cashier'
                              : 'Normal User'}
                          </span>
                        </td>
                        <td
                          className={`px-1 py-2 font-bold${
                            item.userAccountStatus === 'block'
                              ? ' text-red-600 dark:text-red-400'
                              : ' text-green-600 dark:text-green-500'
                          }`}
                        >
                          <span
                            data-tooltip={
                              item.userAccountStatus === 'block'
                                ? 'The blocked user does not have access to the system'
                                : 'The activated user has access to his account, so he can enter the system and perform the procedure that is commensurate with his permissions'
                            }
                          >
                            {item.userAccountStatus === 'block'
                              ? `❌\u00A0\u00A0\u00A0Blocked`
                              : `✅\u00A0\u00A0\u00A0Activate`}
                          </span>
                        </td>
                        <td className='px-1 py-2'>
                          {idx === 0 ? (
                            //first admin account doesn't have to get deleted or blocked from others hence no action provided
                            <span className='text-gray-600 select-none dark:text-gray-200'>
                              No Actions Available
                            </span>
                          ) : (
                            <NavMenu label={`Actions`}>
                              {/* UserStatus Buttons */}
                              {item.userAccountStatus === 'block' ? (
                                <button
                                  id='activateUser'
                                  data-id={item._id}
                                  data-name={item.userFullName}
                                  data-action='active'
                                  className='py-1 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[4rem]'
                                  data-tooltip={`Activate ${item.userFullName}`}
                                >
                                  Activate {item.userFullName}
                                </button>
                              ) : (
                                <button
                                  id='blockUser'
                                  data-id={item._id}
                                  data-name={item.userFullName}
                                  data-action='block'
                                  className='py-1 px-2 text-white border-2 rounded-md bg-neutral-600 hover:bg-neutral-700 min-w-[6.5rem]'
                                  data-tooltip={`Block ${item.userFullName}`}
                                >
                                  Block {item.userFullName}
                                </button>
                              )}

                              {/* UserType Buttons */}
                              {item.userAccountType === 'admin' ? (
                                <>
                                  <button
                                    id='user'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='user'
                                    className='py-1 px-2 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[6.5rem]'
                                    data-tooltip={`Make ${item.userFullName} as User`}
                                  >
                                    Make User
                                  </button>
                                  <button
                                    id='user'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='cashier'
                                    className='py-1 px-2 text-white bg-orange-600 border-2 rounded-md hover:bg-orange-700 min-w-[6.5rem]'
                                    data-tooltip={`Make ${item.userFullName} as Cashier`}
                                  >
                                    Make Cashier
                                  </button>
                                </>
                              ) : item.userAccountType === 'cashier' ? (
                                <>
                                  <button
                                    id='admin'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='admin'
                                    className='py-1 px-2 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[6.5rem]'
                                    data-tooltip={`Make ${item.userFullName} as Admin`}
                                  >
                                    Make Admin
                                  </button>
                                  <button
                                    id='user'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='user'
                                    className='py-1 px-2 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[6.5rem]'
                                    data-tooltip={`Make ${item.userFullName} as User`}
                                  >
                                    Make User
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    id='admin'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='admin'
                                    className='py-1 px-2 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[6.5rem]'
                                    data-tooltip={`Make ${item.userFullName} as Admin`}
                                  >
                                    Make Admin
                                  </button>
                                  <button
                                    id='user'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='cashier'
                                    className='py-1 px-2 text-white bg-orange-600 border-2 rounded-md hover:bg-orange-700 min-w-[6.5rem]'
                                    data-tooltip={`Make ${item.userFullName} as Cashier`}
                                  >
                                    Make Cashier
                                  </button>
                                </>
                              )}

                              {/* Delete Button */}
                              <button
                                id='deleteUser'
                                data-id={item._id}
                                data-name={item.userFullName}
                                data-action='delete'
                                className='py-1 px-2 text-white bg-red-600 rounded-md hover:bg-red-700 min-w-[6.5rem]'
                                data-tooltip={`Delete ${item.userFullName}`}
                              >
                                Delete
                              </button>
                            </NavMenu>
                          )}
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td colSpan={100}>
                        <Pagination
                          routeName={`dashboard/users`}
                          pageNum={pageNumber}
                          numberOfPages={users?.numberOfPages}
                          count={users?.itemsCount}
                          foodId={users?.response?._id}
                          itemsPerPage={ITEMS_PER_PAGE}
                        />
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td />
                    <td />
                    <td className='flex flex-col px-1 py-2'>
                      <p className='my-2 md:text-2xl text-red-600 dark:text-red-400 font-[600] py-2 px-1'>
                        Sorry No Users Found 😔
                      </p>
                      <Link
                        href='dashboard'
                        className='w-fit mx-auto bg-orange-700 hover:bg-orange-800 text-white py-1.5 text-lg px-6 rounded-md'
                      >
                        Go to Dashboard
                      </Link>
                    </td>
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </Layout>
    </>
  )
}

export default DashboardUsers
