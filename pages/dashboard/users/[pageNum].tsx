import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useEventListener from 'hooks/useEventListener'
import useAxios from 'hooks/useAxios'
import { API_URL, USER, ITEMS_PER_PAGE } from '@constants'
import Modal from 'components/Modal/Modal'
import { Success, Error, Loading } from 'components/Icons/Status'
import { LoadingPage, LoadingSpinner } from 'components/Loading'
import Pagination from 'components/Pagination'
import NavMenu from 'components/NavMenu'
import ModalNotFound from 'components/Modal/ModalNotFound'
import Layout from 'components/dashboard/Layout'
import goTo from 'functions/goTo'
import logoutUser from 'functions/logoutUser'
import { isNumber } from 'functions/isNumber'

const DashboardUsers = () => {
  useDocumentTitle('Users')

  const { query } = useRouter()
  const { pageNum }: any = query
  const pageNumber = !pageNum || !isNumber(pageNum) || pageNum < 1 ? 1 : parseInt(pageNum)

  const [userId, setUserId] = useState('')
  const [userAccountAction, setUserAccountAction] = useState('')
  const [userName, setUserName] = useState('')
  const [deleteUserStatus, setDeleteUserStatus] = useState()
  const [userUpdated, setUserUpdated] = useState()
  const [data, setData] = useState<any>('')
  const [modalLoading, setModalLoading] = useState(false)

  //get users data only if the admin is authenticated and logged in
  const { loading, ...response } = useAxios({
    url: `/users/all?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`
  })

  useEffect(() => {
    if (response.response !== null) {
      setData(response.response)
    }
  }, [response.response])

  useEventListener('click', (e: any) => {
    if (
      e.target.id === 'deleteUser' ||
      e.target.id === 'blockUser' ||
      e.target.id === 'activateUser' ||
      e.target.id === 'admin' ||
      e.target.id === 'cashier' ||
      e.target.id === 'user'
    ) {
      setUserId(e.target.dataset.id)
      setUserName(e.target.dataset.name)
      setUserAccountAction(e.target.dataset.action)
      //show modal
      setModalLoading(true)
    }

    if (e.target.id === 'cancel') {
      setModalLoading(false)
    } else if (e.target.id === 'confirm') {
      handleUser(userId, userAccountAction)
    }
  })

  const handleUser = async (userId: string, userAccountAction: string) => {
    if (userAccountAction === 'delete') {
      try {
        //You need to name the body {data} so it can be recognized in (.delete) method
        const response = await axios.delete(`${API_URL}/users/${userId}`, { data })

        const { userDeleted } = response.data

        setDeleteUserStatus(userDeleted)
        //Remove waiting modal
        setTimeout(() => {
          setModalLoading(false)
        }, 300)

        logoutUser(userId)
      } catch (err) {
        console.error(err)
      }
    } else {
      const formData = new FormData()
      formData.append('userAccountAction', userAccountAction)

      try {
        const response = await axios.patch(`${API_URL}/users/${userId}`, formData)

        const { userUpdated } = response.data
        setUserUpdated(userUpdated)
        //Remove waiting modal
        setTimeout(() => {
          setModalLoading(false)
        }, 300)
      } catch (err) {
        console.error(err)
      }
    }
  }

  return loading ? (
    <LoadingPage />
  ) : USER?.userAccountType !== 'admin' ? (
    <ModalNotFound btnLink='/dashboard' btnName='Dashboard' />
  ) : (
    <>
      {deleteUserStatus === 1 ? (
        <Modal
          status={Success}
          msg={`Done Deleting ${userName} Please wait while we redirect you to users list`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : deleteUserStatus === 0 ? (
        <Modal
          status={Error}
          msg={`Error Deleting ${userName}!`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : userUpdated === 1 ? (
        <Modal
          status={Success}
          msg={`Done ${
            userAccountAction === 'block'
              ? `❗️ Blocking 😔 ${userName} `
              : userAccountAction === 'active'
              ? `🎉 Activating 😄 ${userName}`
              : userAccountAction === 'admin'
              ? `🎉 Making ${userName} To Admin 😎`
              : userAccountAction === 'cashier'
              ? `🎉 Making ${userName} To Cashier 😎`
              : userAccountAction === 'user'
              ? `❗️ Making ${userName}  To User 😎`
              : null
          } Please wait while we redirect you to users list`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : userUpdated === 0 ? (
        <Modal
          status={Error}
          msg={`Error Deleting ${userName}!`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : null}

      {/* Confirm Box */}
      {modalLoading && (
        <Modal
          status={Loading}
          modalHidden='hidden'
          classes='txt-blue text-center'
          msg={`Are you sure you want to ${
            userAccountAction === 'block'
              ? `Blocking ${userName}`
              : userAccountAction === 'active'
              ? `Activating ${userName}`
              : userAccountAction === 'admin'
              ? `Make ${userName} an admin`
              : userAccountAction === 'cashier'
              ? `Make ${userName} a cashier`
              : userAccountAction === 'user'
              ? `Make ${userName} a user`
              : 'Cancel'
          } You can not undo this action`}
          ctaConfirmBtns={[
            userAccountAction === 'block'
              ? 'Block'
              : userAccountAction === 'active'
              ? 'Activate'
              : userAccountAction === 'admin'
              ? 'Make Admin'
              : userAccountAction === 'cashier'
              ? 'Make Cashier'
              : userAccountAction === 'user'
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
              Customers List
            </h3>

            <table className='table w-full text-center'>
              <thead className='text-white bg-orange-800'>
                <tr>
                  <th className='px-1 py-2'>Full Name</th>
                  <th className='px-1 py-2'>Email</th>
                  <th className='px-1 py-2'>User Type</th>
                  <th className='px-1 py-2'>User Status</th>
                  <th className='px-1 py-2'>Action</th>
                </tr>
              </thead>

              <tbody>
                {(data ?? data !== undefined) && data?.response?.length > 0 ? (
                  <>
                    {data?.response?.map((item: any, idx: number) => (
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
                                ? 'المدير يملك صلاحية الدخول على لوحة التحكم، فعليه يستطيع إدارة الموقع من خلالها'
                                : item.userAccountType === 'cashier'
                                ? 'الكاشير يملك صلاحية الدخول للوحة التحكم والوصول لصفحة الطلبات مع إمكانية الموافقة أو رفض الطلب'
                                : 'المستخدم العادي يملك صلاحية الدخول على حسابه ورؤية الطلبات الخاصة به فقط'
                            }
                            className='w-40'
                          >
                            {item.userAccountType === 'admin'
                              ? 'مدير'
                              : item.userAccountType === 'cashier'
                              ? 'كاشير'
                              : 'مستخدم عادي'}
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
                                ? 'Blocked users can not login to their accounts and can not access the system'
                                : 'Active users can login to their accounts and can access the system and make actions based on their account type'
                            }
                          >
                            {item.userAccountStatus === 'block'
                              ? '❌ Blocked'
                              : '✅Active'}
                          </span>
                        </td>
                        <td className='px-1 py-2'>
                          {idx === 0 ? (
                            //first admin account doesn't have to get deleted or blocked from others hence no action provided
                            <span className='text-gray-600 select-none dark:text-gray-200'>
                              No Actions
                            </span>
                          ) : (
                            <NavMenu>
                              {/* UserStatus Buttons */}
                              {item.userAccountStatus === 'block' ? (
                                <button
                                  id='activateUser'
                                  data-id={item._id}
                                  data-name={item.userFullName}
                                  data-action='active'
                                  className='py-1 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[4rem]'
                                  data-tooltip='تفعيل المستخدم'
                                >
                                  تفعيل
                                </button>
                              ) : (
                                <button
                                  id='blockUser'
                                  data-id={item._id}
                                  data-name={item.userFullName}
                                  data-action='block'
                                  className='py-1 px-2 text-white border-2 rounded-md bg-neutral-600 hover:bg-neutral-700 min-w-[6.5rem]'
                                  data-tooltip='حظر المستخدم'
                                >
                                  حظر
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
                                    data-tooltip='تحويل الى مستخدم عادي'
                                  >
                                    تحويل لمستخدم
                                  </button>
                                  <button
                                    id='user'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='cashier'
                                    className='py-1 px-2 text-white bg-orange-600 border-2 rounded-md hover:bg-orange-700 min-w-[6.5rem]'
                                    data-tooltip='تحويل الى لكاشير'
                                  >
                                    تحويل لكاشير
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
                                    data-tooltip='تحول الى مدير'
                                  >
                                    تحول لمدير
                                  </button>
                                  <button
                                    id='user'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='user'
                                    className='py-1 px-2 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[6.5rem]'
                                    data-tooltip='تحويل الى مستخدم عادي'
                                  >
                                    تحويل لمستخدم
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
                                    data-tooltip='تحول الى مدير'
                                  >
                                    تحول لمدير
                                  </button>
                                  <button
                                    id='user'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='cashier'
                                    className='py-1 px-2 text-white bg-orange-600 border-2 rounded-md hover:bg-orange-700 min-w-[6.5rem]'
                                    data-tooltip='تحويل الى لكاشير'
                                  >
                                    تحويل لكاشير
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
                                data-tooltip='حذف المستخدم'
                              >
                                حذف
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
                          numberOfPages={data?.numberOfPages}
                          count={data?.itemsCount}
                          foodId={data?.response?._id}
                          itemsPerPage={ITEMS_PER_PAGE}
                        />
                      </td>
                    </tr>
                  </>
                ) : !data || !data === null || data?.itemsCount === undefined ? (
                  <tr>
                    <td />
                    <td className='flex justify-center py-10'>
                      <LoadingSpinner size='10' />
                    </td>
                    <td />
                  </tr>
                ) : (
                  <tr>
                    <td />
                    <td />
                    <td className='flex flex-col px-1 py-2'>
                      <p className='my-2 md:text-2xl text-red-600 dark:text-red-400 font-[600] py-2 px-1'>
                        عفواً، لم يتم العثور على مستخدمين
                      </p>
                      <Link
                        href='/dashboard'
                        className='w-fit mx-auto bg-orange-700 hover:bg-orange-800 text-white py-1.5 text-lg px-6 rounded-md'
                      >
                        العودة للوحة التحكم
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
