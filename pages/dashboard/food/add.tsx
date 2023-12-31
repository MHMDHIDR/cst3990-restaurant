import { useState, useEffect, useRef, useContext, ChangeEvent } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { TagsContext } from 'contexts/TagsContext'
import { FileUploadContext } from 'contexts/FileUploadContext'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAxios from 'hooks/useAxios'
import useAuth from 'hooks/useAuth'
import uploadS3 from 'utils/functions/uploadS3'
import Modal from 'components/Modal/Modal'
import { Success, Error, Loading } from 'components/Icons/Status'
import AddTags from 'components/AddTags'
import FileUpload from 'components/FileUpload'
import Layout from 'components/dashboard/Layout'
import { LoadingPage } from 'components/Loading'
import ModalNotFound from 'components/Modal/ModalNotFound'
import { createSlug } from 'functions/slug'
import goTo from 'functions/goTo'
import scrollToView from 'functions/scrollToView'
import { selectedToppingsProps } from '@types'
import { API_URL, USER } from '@constants'
import { stringJson } from 'functions/jsonTools'
import { focus } from 'utils/functions/focus'
import { capitalizeText } from 'utils/functions/capitalize'

const AddFood = () => {
  useDocumentTitle('Add Food or Drink')

  useEffect(() => {
    scrollToView()
  }, [])

  //Form States
  const [foodName, setFoodName] = useState('')
  const [foodPrice, setFoodPrice] = useState('')
  const [category, setCategory] = useState([''])
  const [foodDesc, setFoodDesc] = useState('')
  const [addFoodStatus, setAddFoodStatus] = useState()
  const [addFoodMessage, setAddFoodMessage] = useState()
  const [categoryList, setCategoryList] = useState<string[]>([])
  const [toppings, setToppings] = useState<any>([{}])
  const { loading, userType } = useAuth()

  //Contexts
  const { tags } = useContext(TagsContext)
  const { file } = useContext(FileUploadContext)

  //Form errors messages
  const modalLoadingRef = useRef<HTMLElement>(null)
  const ImgErr = useRef<HTMLSpanElement>(null)
  const foodNameErr = useRef<HTMLSpanElement>(null)
  const priceErr = useRef<HTMLSpanElement>(null)
  const descErr = useRef<HTMLSpanElement>(null)
  const formMsg = useRef<HTMLDivElement>(null)

  //fetching categories
  const { response } = useAxios({ url: '/settings' })
  useEffect(() => {
    if (response !== null) {
      setCategoryList(response?.response[0]?.CategoryList)
    }
  }, [response])

  const HandleAddFood = async (e: {
    target: any
    key?: string
    preventDefault: () => void
  }) => {
    e.preventDefault()

    //using FormData to send constructed data
    const formData = new FormData()
    formData.append('foodName', foodName)
    formData.append('foodPrice', foodPrice)
    formData.append('category', category[0])
    formData.append('foodDesc', foodDesc)
    formData.append('foodToppings', stringJson(toppings))
    formData.append('foodTags', stringJson(tags))

    if (
      ImgErr.current!.textContent === '' &&
      foodNameErr.current!.textContent === '' &&
      priceErr.current!.textContent === '' &&
      descErr.current!.textContent === ''
    ) {
      if (modalLoadingRef.current) {
        modalLoadingRef.current.classList.remove('hidden')
      }

      const { foodImgs } = await uploadS3(file)
      formData.append('foodImgs', stringJson(foodImgs.length > 0 ? foodImgs : []))

      try {
        const response = await axios.post(`${API_URL}/foods`, formData)
        const { foodAdded, message } = response.data
        setAddFoodStatus(foodAdded)
        setAddFoodMessage(message)

        setTimeout(() => {
          modalLoadingRef!.current!.classList.add('hidden')
        }, 300)
      } catch (err) {
        formMsg.current!.textContent = `Something went wrong! 😥 Please try again later.`
      }
    } else {
      formMsg.current!.textContent =
        'Please make sure that all fields are filled correctly! 😃'
    }
  }

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

  console.log(userType)

  return loading ? (
    <LoadingPage />
  ) : userType !== 'admin' || USER?.userAccountType !== 'admin' ? (
    <ModalNotFound />
  ) : (
    <>
      {addFoodStatus === 1 ? (
        <Modal
          status={Success}
          msg={`${category[1]} Has Been Added Successfully! 🎉, Wait a moment you will be redirected to the menu page`}
          redirectLink={goTo(`menu`)}
          redirectTime={3000}
          ref={modalLoadingRef}
        />
      ) : (
        addFoodStatus === 0 && <Modal status={Error} msg={addFoodMessage} />
      )}

      <Layout>
        <section className='py-12 my-8 dashboard'>
          <div className='container mx-auto'>
            <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
              Add Foods, Drinks, or Sweets
            </h3>
            <div className='food'>
              {/* Show Modal Loading when submitting form */}
              <Modal
                status={Loading}
                modalHidden='hidden'
                classes='text-blue-500 text-center'
                msg='Please wait a moment...'
              />

              <form
                method='POST'
                className='form'
                encType='multipart/form-data'
                onSubmit={e => HandleAddFood(e)}
              >
                <div className='flex flex-col items-center justify-center gap-4 mb-8 sm:justify-between'>
                  <FileUpload
                    data={{
                      defaultImg: [
                        {
                          foodImgDisplayName: 'food',
                          foodImgDisplayPath: 'https://source.unsplash.com/random?food'
                        }
                      ],
                      foodName: 'Food, Drink, Sweet'
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
                    autoFocus
                    required
                    onChange={e => setFoodName(createSlug(e.target.value.trim()))}
                    onKeyUp={e => {
                      const target = (e.target as HTMLInputElement).value.trim()

                      if (target.length > 0 && target.length < 5) {
                        foodNameErr.current!.textContent = `The name of the meal or drink is too short`
                      } else if (target.length > 30) {
                        foodNameErr.current!.textContent = `The name of the meal or drink is too long`
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
                    required
                    onChange={e => setFoodPrice(e.target.value.trim())}
                    onKeyUp={e => {
                      const target = parseInt((e.target as HTMLInputElement).value.trim())

                      if (target > 0 && target < 5) {
                        priceErr.current!.textContent = `The price of the meal or drink is too low`
                      } else if (target > 1000) {
                        priceErr.current!.textContent = `The price of the meal or drink is too high`
                      } else {
                        priceErr.current!.textContent = ''
                      }
                    }}
                  />
                  <span className='form__label'>Price £</span>
                  <span
                    className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                    ref={priceErr}
                  ></span>
                </label>

                <label htmlFor='category' className='form__group'>
                  <select
                    id='category'
                    className='form__input'
                    onChange={e =>
                      setCategory([
                        e.target.value.trim(),
                        e.target.options[e.target.selectedIndex].textContent!
                      ])
                    }
                    required
                  >
                    <option value=''>Pick a Category</option>
                    {categoryList?.map((category, idx) => (
                      <option key={idx} value={category[0]}>
                        {capitalizeText(category[0])}
                      </option>
                    ))}
                  </select>
                  <span className='form__label active'>Please Pick from the list</span>
                </label>

                <label htmlFor='foodDescription' className='form__group'>
                  <textarea
                    name='foodDescription'
                    id='foodDescription'
                    minLength={10}
                    maxLength={300}
                    className='form__input'
                    required
                    onChange={e => setFoodDesc(e.target.value.trim())}
                    onKeyUp={e => {
                      const target = (e.target as HTMLTextAreaElement).value.trim()

                      if (target.length > 0 && target.length < 30) {
                        descErr.current!.textContent = `Description is too short to describe the food or drink`
                      } else if (target.length > 300) {
                        descErr.current!.textContent = `Description is too long to describe the food or drink`
                      } else {
                        descErr.current!.textContent = ''
                      }
                    }}
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
                  ({ toppingName, toppingPrice }: selectedToppingsProps, idx: number) => (
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
                          defaultValue={toppingName}
                          onChange={e => handleInputChange(e, idx)}
                          onKeyDown={(e: any) => {
                            if (e.key === `Enter`) e.preventDefault()
                          }}
                        />
                        <input
                          type='number'
                          id='toppingPrice'
                          min='1'
                          max='500'
                          className='w-2/4 p-3 text-xl text-gray-700 bg-transparent border-2 border-gray-500 border-solid rounded-lg outline-none focus-within:border-orange-500 dark:focus-within:border-gray-400 dark:text-gray-200'
                          dir='auto'
                          name='toppingPrice'
                          defaultValue={toppingPrice}
                          onChange={e => handleInputChange(e, idx)}
                          onKeyDown={(e: any) => {
                            if (e.key === `Enter`) {
                              e.preventDefault()
                              if (!e.target.value.trim()) return
                              handleAddClick()
                              setTimeout(() => focus(e), 10)
                            }
                          }}
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
                            data-tooltip={`Add a new topping for ${foodName}`}
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
                    type='submit'
                    className='min-w-[7rem] bg-green-600 hover:bg-green-700 text-white py-1.5 px-6 rounded-md'
                  >
                    Add
                  </button>
                  <Link
                    href={goTo('menu')}
                    className='text-gray-800 underline-hover text-bold dark:text-white'
                  >
                    Menu
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}

export default AddFood
