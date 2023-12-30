import { useState, useEffect, useRef, useContext, ChangeEvent } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { TagsContext } from 'contexts/TagsContext'
import { FileUploadContext } from 'contexts/FileUploadContext'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useEventListener from 'hooks/useEventListener'
import useAxios from 'hooks/useAxios'
import useAuth from 'hooks/useAuth'
import Modal from 'components/Modal/Modal'
import { Success, Error, Loading } from 'components/Icons/Status'
import AddTags from 'components/AddTags'
import { LoadingCard } from 'components/Loading'
import FileUpload from 'components/FileUpload'
import Layout from 'components/dashboard/Layout'
import { LoadingPage } from 'components/Loading'
import ModalNotFound from 'components/Modal/ModalNotFound'
import { removeSlug, createSlug } from 'functions/slug'
import goTo from 'functions/goTo'
import scrollToView from 'functions/scrollToView'
import { API_URL, DEFAULT_FOOD_DATA, USER } from '@constants'
import { ToppingsProps, foodDataProps, FoodImgsProps } from '@types'
import { stringJson } from 'functions/jsonTools'
import uploadS3 from 'utils/functions/uploadS3'

const EditFood = ({ foodData }: { foodData: foodDataProps }) => {
  useDocumentTitle('Edit Food')

  useEffect(() => {
    scrollToView()
  }, [])

  const [delFoodName, setDelFoodName] = useState('')
  const [action, setAction] = useState('')
  const [delFoodImg, setDelFoodImg] = useState<FoodImgsProps['foodImgDisplayName']>(
    DEFAULT_FOOD_DATA.foodImgDisplayName
  )
  const [data, setData] = useState<foodDataProps['response']>(DEFAULT_FOOD_DATA)
  const [categoryList, setCategoryList] = useState<string[]>([])
  const [toppings, setToppings] = useState<any>([{}])
  const [deleteFoodStatus, setDeleteFoodStatus] = useState()
  const [deleteImgStatus, setDeleteImgStatus] = useState()

  //Form States
  const [foodName, setFoodName] = useState('')
  const [foodPrice, setFoodPrice] = useState('')
  const [category, setCategory] = useState<string[]>([])
  const [foodDesc, setFoodDesc] = useState('')
  const [updatedFoodStatus, setUpdatedFoodStatus] = useState()
  const [loadingMsg, setLoadingMsg] = useState('')
  const [hasConfirmBtns, setHasConfirmBtn] = useState(false)
  const { loading, userType } = useAuth()

  //Contexts
  const { tags, setTags } = useContext(TagsContext)
  const { file } = useContext(FileUploadContext)

  //Form errors messages
  const ImgErr = useRef<HTMLSpanElement>(null)
  const foodNameErr = useRef<HTMLSpanElement>(null)
  const priceErr = useRef<HTMLSpanElement>(null)
  const descErr = useRef<HTMLSpanElement>(null)
  const formMsg = useRef<HTMLDivElement>(null)

  const modalLoading =
    typeof window !== 'undefined' ? document.querySelector('#modal') : null

  const categories = useAxios({ url: '/settings' })

  useEffect(() => {
    if (categories?.response !== null) {
      setData(foodData?.response)
      setToppings(
        !foodData?.response?.foodToppings.length
          ? [foodData?.response?.foodToppings]
          : foodData?.response?.foodToppings
      )
      setCategoryList(categories?.response?.response[0]?.CategoryList)
    }
  }, [categories?.response, foodData?.response])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target
    const newToppings = [...toppings]
    newToppings[index][name] = value
    setToppings(newToppings)
  }

  const handleAddClick = () => {
    setToppings([...toppings, {}])
  }

  const handleRemoveClick = (index: number) => {
    const list = [...toppings]
    list.splice(index, 1)
    setToppings(list)
  }

  useEffect(() => {
    data && setTags(data?.foodTags)
  }, [data, setTags])

  const HandleUpdateFood = async (e: { key: string; preventDefault: () => void }) => {
    e.preventDefault()
    //initial form values if no value was updated taking it from [0] index
    const currentFoodId = data?._id
    const currentFoodName = data?.foodName
    const currentFoodPrice = data?.foodPrice
    const currentCategory = data?.category
    const currentFoodDesc = data?.foodDesc
    const currentTags = tags
    const currentToppings = toppings
    const prevFoodImgPathsAndNames = data?.foodImgs.map(
      ({ foodImgDisplayName, foodImgDisplayPath }) => {
        return {
          foodImgDisplayName,
          foodImgDisplayPath
        }
      }
    )

    //using FormData to send constructed data
    const formData = new FormData()
    formData.append('foodId', String(currentFoodId))
    formData.append('foodName', foodName || currentFoodName)
    formData.append('foodPrice', foodPrice || String(currentFoodPrice))
    formData.append('category', category[0] || currentCategory)
    formData.append('foodDesc', foodDesc || currentFoodDesc)
    formData.append('foodTags', stringJson(currentTags))
    formData.append('foodToppings', stringJson(currentToppings))
    formData.append('foodToppingsEn', stringJson(currentToppings))
    formData.append('prevFoodImgPathsAndNames', stringJson(prevFoodImgPathsAndNames))

    if (
      ImgErr.current!.textContent === '' &&
      foodNameErr.current!.textContent === '' &&
      priceErr.current!.textContent === '' &&
      descErr.current!.textContent === ''
    ) {
      setLoadingMsg(`Updating ${foodName}`)
      modalLoading!.classList.remove('hidden')

      const { foodImgs } = await uploadS3(file)
      formData.append('foodImgs', stringJson(foodImgs.length > 0 ? foodImgs : []))

      try {
        const response = await axios.patch(`${API_URL}/foods/${currentFoodId}`, formData)

        const { foodUpdated } = response.data
        setUpdatedFoodStatus(foodUpdated)

        setTimeout(() => {
          modalLoading!.classList.add('hidden')
        }, 300)
      } catch (err) {
        console.error(err)
      }
    } else {
      formMsg.current!.textContent =
        'Please Fill in All Fields Correctly and Make Sure You Have Uploaded Successfully 😃'
    }
  }

  const handleDeleteFood = async (foodId: string, foodImgs = data?.foodImgs) => {
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
      const response = await axios.delete(`${API_URL}/foods/${foodId}`, {
        data: formData
      })
      const { foodDeleted } = response.data
      setDeleteFoodStatus(foodDeleted)
      //Remove waiting modal
      setTimeout(() => {
        modalLoading!.classList.add('hidden')
      }, 300)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteImg = async (
    foodId: string,
    foodImg: FoodImgsProps['foodImgDisplayName']
  ) => {
    const formData = new FormData()
    formData.append('imgName', foodImg)
    try {
      //You need to name the body {data} so it can be recognized in (.delete) method
      const response = await axios.delete(`${API_URL}/foods/${foodId}`, {
        data: formData
      })
      const { ImgDeleted } = response.data
      setDeleteImgStatus(ImgDeleted)
      //Remove waiting modal
      setTimeout(() => {
        modalLoading!.classList.add('hidden')
      }, 300)
    } catch (err) {
      console.error(err)
    }
  }

  useEventListener('click', (e: any) => {
    switch (e.target.id) {
      case 'deleteFood': {
        setAction('deleteFood')
        setDelFoodName(removeSlug(e.target.dataset.name))
        setHasConfirmBtn(true)
        setLoadingMsg(
          `Are you sure you want to remove this product ${removeSlug(
            e.target.dataset.name
          )}? You can not undo this action.`
        )
        modalLoading!.classList.remove('hidden')
        break
      }
      case 'deleteImg': {
        setAction('deleteImg')
        setHasConfirmBtn(true)
        setLoadingMsg(
          `Are you sure you want to remove this image? You can not undo this action.`
        )
        setDelFoodImg(e.target.dataset.imgName)
        modalLoading!.classList.remove('hidden')
        break
      }
      case 'confirm': {
        action === 'deleteImg'
          ? handleDeleteImg(data?._id, delFoodImg)
          : handleDeleteFood(data?._id, data?.foodImgs)
        break
      }
      case 'cancel': {
        modalLoading!.classList.add('hidden')
        break
      }
    }
  })

  return loading ? (
    <LoadingPage />
  ) : USER?.userAccountType !== 'admin' || userType !== 'admin' ? (
    <ModalNotFound btnLink='/dashboard' btnName='Dashboard' />
  ) : (
    <>
      {updatedFoodStatus === 1 ? (
        <Modal
          status={Success}
          msg={`Updated data for ${removeSlug(
            data?.foodName
          )} successfully 😄 Redirecting you to the menu`}
          redirectLink={goTo('menu')}
          redirectTime={4000}
        />
      ) : updatedFoodStatus === 0 ? (
        <Modal
          status={Error}
          msg={`Something went wrong while updating ${removeSlug(
            data?.foodName
          )}! Please try again later`}
          redirectLink={goTo(`food/edit/${data?._id}`)}
          redirectTime={4000}
        />
      ) : deleteImgStatus === 1 ? (
        <Modal
          status={Success}
          msg={`Image ${delFoodImg} deleted successfully 😄 Redirecting you to the menu`}
          redirectLink={goTo(`food/edit/${data?._id}`)}
          redirectTime={3500}
        />
      ) : deleteImgStatus === 0 ? (
        <Modal
          status={Error}
          msg={`Something went wrong while deleting ${delFoodImg}! Please try again later`}
          redirectLink={goTo(`food/edit/${data?._id}`)}
          redirectTime={3500}
        />
      ) : deleteFoodStatus === 1 ? (
        <Modal
          status={Success}
          msg={`Deleted ${delFoodName} successfully 😄 Redirecting you to the menu`}
          redirectLink={goTo('menu')}
          redirectTime={3500}
        />
      ) : (
        deleteFoodStatus === 0 && (
          <Modal
            status={Error}
            msg={`Something went wrong while deleting ${delFoodName}! Please try again later`}
            redirectLink={goTo(`food/edit/${data?._id}`)}
            redirectTime={3500}
          />
        )
      )}

      <Layout>
        <section className='py-12 my-8 dashboard'>
          <div className='container mx-auto'>
            {/* Confirm Box */}
            <Modal
              status={Loading}
              modalHidden='hidden'
              classes='text-blue-600 dark:text-blue-400 text-lg'
              msg={loadingMsg}
              ctaConfirmBtns={hasConfirmBtns ? ['Delete', 'Cancel'] : undefined}
            />

            <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
              Edit Item
            </h3>

            <div className='dashboard__food__form edit'>
              <div className='food'>
                {data && data !== undefined ? (
                  <form
                    key={String(data?._id)}
                    className='form'
                    encType='multipart/form-data'
                  >
                    <div className='flex flex-col items-center justify-center gap-4 mb-8 sm:justify-between'>
                      <FileUpload
                        data={{
                          foodId: data?._id,
                          foodName: data?.foodName,
                          defaultImg: data?.foodImgs
                        }}
                      />

                      <span
                        className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                        ref={ImgErr}
                      ></span>
                    </div>

                    <label htmlFor='foodName' className='form__group'>
                      <input
                        type='text'
                        id='foodName'
                        className='form__input'
                        defaultValue={removeSlug(data?.foodName)}
                        autoFocus
                        onChange={e => setFoodName(createSlug(e.target.value.trim()))}
                        onKeyUp={e => {
                          const target = (e.target as HTMLInputElement).value.trim()

                          if (target.length > 0 && target.length < 5) {
                            foodNameErr.current!.textContent = `It's too short, please add more characters`
                          } else if (target.length > 30) {
                            foodNameErr.current!.textContent = `It's too long, please remove some characters`
                          } else {
                            foodNameErr.current!.textContent = ''
                          }
                        }}
                      />
                      <span className='form__label'>Name</span>
                      <span
                        className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                        ref={foodNameErr}
                      ></span>
                    </label>

                    <label htmlFor='foodPrice' className='form__group'>
                      <input
                        type='number'
                        id='foodPrice'
                        className='form__input'
                        min='5'
                        max='500'
                        onChange={e =>
                          setFoodPrice((e.target as HTMLInputElement).value.trim())
                        }
                        onKeyUp={e => {
                          const target = parseInt(
                            (e.target as HTMLInputElement).value.trim()
                          )

                          if (target > 0 && target < 5) {
                            priceErr.current!.textContent = `Price can't be less than 5`
                          } else if (target > 500) {
                            priceErr.current!.textContent = `Price can't be more than 500`
                          } else {
                            priceErr.current!.textContent = ''
                          }
                        }}
                        defaultValue={data?.foodPrice}
                      />
                      <span className='form__label'>Price (£)</span>
                      <span
                        className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                        ref={priceErr}
                      ></span>
                    </label>

                    <label htmlFor='category' className='form__group'>
                      <select
                        id='category'
                        className='form__input'
                        required
                        onChange={e =>
                          setCategory([
                            e.target.value.trim(),
                            e.target.options[e.target.selectedIndex].textContent ?? ''
                          ])
                        }
                        defaultValue={data?.category}
                      >
                        <option value=''>Pick a Category</option>
                        {categoryList?.map((category, idx) => (
                          <option key={idx} value={category[0]}>
                            {category[0]}
                          </option>
                        ))}
                      </select>
                      <span className='form__label active'>
                        Please Pick From the List
                      </span>
                    </label>

                    <label htmlFor='foodDescription' className='form__group'>
                      <textarea
                        name='foodDescription'
                        id='foodDescription'
                        className='form__input'
                        minLength={10}
                        maxLength={300}
                        onChange={e => setFoodDesc(e.target.value?.trim())}
                        onKeyUp={(e: any) => {
                          const target = e.target.value?.trim()

                          if (target.length > 0 && target.length < 30) {
                            descErr.current!.textContent = `Description is too short, please add more characters`
                          } else if (target.length > 300) {
                            descErr.current!.textContent = `Description is too long, please remove some characters`
                          } else {
                            descErr.current!.textContent = ''
                          }
                        }}
                        defaultValue={data?.foodDesc}
                      ></textarea>
                      <span className='form__label'>Write a Full Description</span>
                      <span
                        className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                        ref={descErr}
                      ></span>
                    </label>

                    <label htmlFor='foodTags' className='form__group'>
                      <AddTags inputId='foodTags' />
                      <span className='form__label'>
                        Tags help to search for a meal (Tags) - This field is optional
                      </span>
                    </label>

                    <div className='mx-0 mt-4 mb-6 text-center'>
                      <h3 className='mb-10 text-xl'>Toppings (Optional)</h3>
                      <div className='flex justify-around'>
                        <span className='text-xl'>Topping Name</span>
                        <span className='text-xl'>Topping Price (£)</span>
                      </div>
                    </div>
                    {toppings?.map(
                      ({ toppingName, toppingPrice }: ToppingsProps, idx: number) => (
                        <label className='block space-y-2' key={idx}>
                          <div className='flex gap-4 justify-evenly'>
                            <input
                              type='text'
                              id='toppingName'
                              min='5'
                              max='500'
                              className='w-2/4 p-3 text-xl text-gray-700 bg-transparent border-2 border-gray-500 border-solid rounded-lg outline-none focus-within:border-orange-500 dark:focus-within:border-gray-400 dark:text-gray-200'
                              dir='auto'
                              name='toppingName'
                              defaultValue={
                                typeof toppingName === 'string' ? toppingName : ''
                              }
                              onChange={e => handleInputChange(e, idx)}
                            />
                            <input
                              type='number'
                              id='toppingPrice'
                              min='1'
                              max='500'
                              className='w-2/4 p-3 text-xl text-gray-700 bg-transparent border-2 border-gray-500 border-solid rounded-lg outline-none focus-within:border-orange-500 dark:focus-within:border-gray-400 dark:text-gray-200 rtl'
                              dir='auto'
                              name='toppingPrice'
                              defaultValue={toppingPrice}
                              onChange={e => handleInputChange(e, idx)}
                            />
                          </div>
                          <div className='flex gap-4 pb-6'>
                            {toppings.length !== 1 && (
                              <button
                                type='button'
                                data-tooltip={`Delete ${toppingName} topping`}
                                className='px-5 py-2 text-white transition-colors bg-red-500 rounded-lg w-fit hover:bg-red-600'
                                onClick={() => handleRemoveClick(idx)}
                              >
                                -
                              </button>
                            )}
                            {toppings.length - 1 === idx && (
                              <button
                                type='button'
                                data-tooltip={`Add new topping to ${foodName}`}
                                className='px-5 py-2 text-white transition-colors bg-blue-500 rounded-lg w-fit hover:bg-blue-600'
                                onClick={handleAddClick}
                              >
                                +
                              </button>
                            )}
                          </div>
                        </label>
                      )
                    )}

                    <div
                      className='my-14 inline-block md:text-2xl text-red-600 dark:text-red-400 font-[600] py-2 px-1'
                      ref={formMsg}
                    ></div>

                    <div className='flex items-center justify-evenly'>
                      <button
                        id='updateFood'
                        className='min-w-[7rem] bg-green-600 hover:bg-green-700 text-white py-1.5 px-6 rounded-md'
                        onClick={(e: any) => HandleUpdateFood(e)}
                      >
                        Update
                      </button>
                      <button
                        id='deleteFood'
                        type='button'
                        data-name={data?.foodName}
                        className='min-w-[7rem] bg-red-600 hover:bg-red-700 text-white py-1.5 px-6 rounded-md'
                      >
                        Delete
                      </button>
                    </div>
                  </form>
                ) : !foodData ? (
                  <div className='flex flex-col items-center gap-8 text-lg justify-evenly'>
                    <p className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'>
                      Sorry! We Couldn&apos;t Find The Item You&apos;re Looking for 😕
                    </p>
                    <Link
                      href={goTo('dashboard')}
                      className='px-3 py-1 text-orange-800 transition-colors bg-orange-100 border border-orange-700 rounded hover:bg-orange-200'
                    >
                      Go Back to Dashboard
                    </Link>
                  </div>
                ) : foodData === null || foodData?.itemsCount === 0 ? (
                  <LoadingCard />
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}

export async function getServerSideProps({ query: { id } }: { query: { id: string } }) {
  const foodItemURL = `${API_URL}/foods?page=1&limit=1&itemId=${id}`
  const foodData = await fetch(foodItemURL).then(food => food.json())
  return { props: { foodData } }
}

export default EditFood
