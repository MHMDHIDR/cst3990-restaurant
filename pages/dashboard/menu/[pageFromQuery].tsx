import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Axios from 'axios'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useEventListener from 'hooks/useEventListener'
import useAuth from 'hooks/useAuth'
import Modal from 'components/Modal/Modal'
import { Success, Error, Loading } from 'components/Icons/Status'
import { LoadingPage, LoadingSpinner } from 'components/Loading'
import Pagination from 'components/Pagination'
import ModalNotFound from 'components/Modal/ModalNotFound'
import NavMenu from 'components/NavMenu'
import Layout from 'components/dashboard/Layout'
import abstractText from 'functions/abstractText'
import { removeSlug } from 'functions/slug'
import goTo from 'functions/goTo'
import { isNumber } from 'functions/isNumber'
import { createLocaleDateString, formattedPrice } from 'utils/functions/format'
import scrollToView from 'functions/scrollToView'
import { API_URL, ITEMS_PER_PAGE, USER } from '@constants'
import { parseJson, stringJson } from 'functions/jsonTools'
import { ClickableButton } from 'components/Button'
import Add from 'components/Icons/Add'
import { capitalizeText } from 'utils/functions/capitalize'
import type { FoodImgsProps } from '@types'

const DashboardMenu = () => {
  useDocumentTitle('Menu')

  const [delFoodId, setDelFoodId] = useState('')
  const [delFoodName, setDelFoodName] = useState('')
  const [delFoodImg, setDelFoodImg] = useState<FoodImgsProps[]>([
    {
      foodImgDisplayPath: '',
      foodImgDisplayName: ''
    }
  ])
  const [deleteFoodStatus, setDeleteFoodStatus] = useState()
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [menuFood, setMenuFood] = useState<any>()
  const { loading, userType } = useAuth()
  const { query } = useRouter()
  const { pageFromQuery }: any = query

  const UrlSplit =
    typeof window !== 'undefined' ? window.location.pathname.split('/') : [1]

  const pageNumber = isNumber(Number(pageFromQuery))
    ? Number(pageFromQuery)
    : !isNumber(Number(UrlSplit[UrlSplit.length - 1]))
    ? 1
    : Number(UrlSplit[UrlSplit.length - 1])

  useEffect(() => {
    Axios.get(`foods?page=${pageNumber}&limit=${ITEMS_PER_PAGE}&createdAt=-1`).then(
      ({ data }) => setMenuFood(data)
    )
    scrollToView()
  }, [pageNumber])

  useEventListener('click', (e: any) => {
    switch (e.target.id) {
      case 'deleteFood': {
        setDelFoodId(e.target.dataset.id)
        setDelFoodName(removeSlug(e.target.dataset.name))
        setDelFoodImg(parseJson(e.target.dataset.imgname))
        setModalLoading(true)
        break
      }

      case 'confirm': {
        handleDeleteFood(delFoodId)
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

  const handleDeleteFood = async (
    foodId: string,
    foodImgs: FoodImgsProps[] = delFoodImg
  ) => {
    const prevFoodImgPathsAndNames = foodImgs.map(
      ({ foodImgDisplayPath, foodImgDisplayName }) => {
        return {
          foodImgDisplayPath,
          foodImgDisplayName
        }
      }
    )

    //Using FormData to send constructed data
    const formData = new FormData()
    formData.append('prevFoodImgPathsAndNames', stringJson(prevFoodImgPathsAndNames))
    try {
      //You need to name the body {data} so it can be recognized in (.delete) method
      const response = await Axios.delete(`${API_URL}/foods/${foodId}`, {
        data: formData
      })
      const { foodDeleted } = response.data
      setDeleteFoodStatus(foodDeleted)
      //Remove waiting modal
      setTimeout(() => {
        setModalLoading(false)
      }, 300)
    } catch (err) {
      console.error(err)
    }
  }

  return loading ? (
    <LoadingPage />
  ) : !USER && userType !== 'admin' && userType !== 'cashier' ? (
    <ModalNotFound />
  ) : (
    <>
      {deleteFoodStatus === 1 ? (
        <Modal
          status={Success}
          msg={`${delFoodName} Has Been Deleted Successfully 😄!, Redirecting...`}
          redirectLink={goTo('menu')}
          redirectTime={3500}
        />
      ) : deleteFoodStatus === 0 ? (
        <Modal
          status={Error}
          msg={`Error Deleting ${delFoodName}, Please Try Again Later 😥`}
          redirectLink={goTo('menu')}
          redirectTime={3500}
        />
      ) : null}

      <Layout>
        <section className='py-12 my-8 dashboard'>
          <div className='container mx-auto'>
            {/* Confirm Box */}
            {modalLoading ? (
              <Modal
                status={Loading}
                classes='text-blue-600 dark:text-blue-400 text-lg'
                msg={`Are you sure you want to delete ${delFoodName}? You can not undo this action`}
                ctaConfirmBtns={['Delete', 'Cancel']}
              />
            ) : null}

            <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
              Foods, Drinks, and Sweets Menu
            </h3>

            <Link href={goTo('food/add')}>
              <ClickableButton>
                <>
                  <Add className={`inline-flex mr-4`} />
                  <span>Add an Item</span>
                </>
              </ClickableButton>
            </Link>
            <table className='table w-full text-center'>
              <thead className='text-white bg-orange-800'>
                <tr>
                  <th className='px-1 py-2'>Order</th>
                  <th className='px-1 py-2'>Image</th>
                  <th className='px-1 py-2'>Name</th>
                  <th className='px-1 py-2'>Description</th>
                  <th className='px-1 py-2'>Price</th>
                  <th className='px-1 py-2'>The Update Date/Time</th>
                  <th className='px-1 py-2'>Actions</th>
                </tr>
              </thead>

              <tbody>
                {menuFood?.response?.length > 0 ? (
                  <>
                    {menuFood?.response?.map((item: any, idx: number) => (
                      <tr
                        key={item._id}
                        className='transition-colors even:bg-gray-200 odd:bg-gray-300 dark:even:bg-gray-600 dark:odd:bg-gray-700'
                      >
                        <td className='px-1 py-2 font-bold'>
                          {/* Display the index consider the ITEMS_PER_PAGE and the current page then calculate the index */}
                          {idx + 1 + ITEMS_PER_PAGE * (pageNumber - 1)}
                        </td>
                        <td className='px-1 py-2 pr-3 min-w-[5rem]'>
                          <Image
                            loading='lazy'
                            height={56}
                            width={56}
                            src={item.foodImgs[0]?.foodImgDisplayPath}
                            alt={capitalizeText(item.foodName)}
                            className='object-cover mx-auto rounded-lg shadow-md h-14 w-14'
                          />
                        </td>
                        <td className='px-1 py-2'>
                          {typeof window !== 'undefined' && window.innerWidth < 1360
                            ? abstractText(removeSlug(capitalizeText(item.foodName)), 10)
                            : removeSlug(capitalizeText(item.foodName))}
                        </td>
                        <td className='px-1 py-2'>
                          <p>
                            {typeof window !== 'undefined' && window.innerWidth < 1200
                              ? abstractText(item.foodDesc, 20)
                              : item.foodDesc}
                          </p>
                        </td>
                        <td className='px-1 py-2 min-w-[5.5rem]'>
                          <span>
                            <strong className='inline-block m-2 text-xl text-green-700 dark:text-green-400'>
                              {formattedPrice(item.foodPrice)}
                            </strong>
                          </span>
                        </td>
                        <td className='px-1 py-2 min-w-[16rem]'>
                          {createLocaleDateString(item.updatedAt)}
                        </td>
                        <td className='px-1 py-2'>
                          <NavMenu label={`Actions`}>
                            <Link
                              href={goTo(`food/edit/${item._id}`)}
                              className='px-4 py-1 mx-2 text-white bg-green-600 rounded-md hover:bg-green-700'
                            >
                              Edit Item
                            </Link>
                            <button
                              id='deleteFood'
                              data-id={item._id}
                              data-name={capitalizeText(item.foodName)}
                              data-imgname={stringJson(item.foodImgs)}
                              className='px-4 py-1 mx-2 text-white bg-red-600 rounded-md hover:bg-red-700'
                            >
                              Delete Item
                            </button>
                          </NavMenu>
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td colSpan={100}>
                        <Pagination
                          routeName={`dashboard/menu`}
                          pageNum={pageNumber}
                          numberOfPages={menuFood?.numberOfPages}
                          count={menuFood?.itemsCount}
                          foodId={menuFood?.response?._id}
                          itemsPerPage={ITEMS_PER_PAGE}
                        />
                      </td>
                    </tr>
                  </>
                ) : !menuFood?.response ? (
                  <tr>
                    <td />
                    <td />
                    <td />
                    <td className='flex justify-center py-10'>
                      <LoadingSpinner size='10' />
                    </td>
                    <td />
                    <td />
                  </tr>
                ) : (
                  <tr>
                    <td />
                    <td />
                    <td />
                    <td className='flex flex-col px-1 py-2'>
                      <p className='my-2 md:text-2xl text-red-600 dark:text-red-400 font-[600] py-2 px-1'>
                        Sorry! No Items Found
                      </p>
                      <div className='flex justify-center gap-4'>
                        <Link
                          href={goTo('food/add')}
                          className='min-w-[7rem] bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-6 rounded-md'
                        >
                          Add an Item
                        </Link>
                        <Link
                          href={goTo('dashboard')}
                          className='min-w-[7rem] bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-6 rounded-md'
                        >
                          Dashboard
                        </Link>
                      </div>
                    </td>
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

export default DashboardMenu
