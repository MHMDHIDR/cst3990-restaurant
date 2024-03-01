import { parseJson } from 'functions/jsonTools'
import type { UserProps } from '@types'

export const { origin }: any = typeof window !== 'undefined' && window.location

export const HEADER_BG_IMG = '/assets/img/header-bg-1.webp'

export const SLIDES_IN_MENU = 10

export const SUGGESTED_FOOTER_ITEMS_COUNT = 4

export const ITEMS_PER_PAGE = 20

export const MAX_QUANTITY = 100

export const FILE_UPLOAD_IMG_SIZE = 122

export const ADDRESS_EXAMPLE = '123 Street, City, Postcode'

export const PHONE_NUM_EXAMPLE = '07767002516'

export const PAYMENT_DATA_EXAMPLE = `[{
    "accelerated": false,
    "orderID": "${Math.random() * 10000}",
    "payerID": "${Math.random() * 10000}",
    "paymentID": null,
    "billingToken": null,
    "facilitatorAccessToken": "${Math.random() * 10000}",
    "paymentSource": "paypal
  }]`

export const SCROLL_LIMIT = 400

export const USER: UserProps =
  typeof window !== 'undefined' &&
  'user' in localStorage &&
  parseJson(localStorage.getItem('user') || '{}')

const url = {
  local: `localhost`,
  dev: `dev.com`
}

export const APP_URL =
  process.env.NODE_ENV === 'development'
    ? `http://${origin?.includes(url.dev) ? url.dev : url.local}:3000`
    : process.env.NEXT_PUBLIC_APP_PUBLIC_URL

export const API_URL = APP_URL + '/api'

export const DEFAULT_USER_DATA = {
  userFullName: 'User Full Name',
  userAccountType: 'user'
}

export const DEFAULT_FOOD_DATA = {
  _id: '',
  foodName: '',
  foodNameEn: '',
  foodPrice: 1,
  category: '',
  categoryEn: '',
  createdAt: '',
  updatedAt: '',
  foodDesc: '',
  foodDescEn: '',
  foodTags: [''],
  foodTagsEn: [''],
  foodToppings: [
    {
      toppingName: '',
      toppingPrice: 1
    }
  ],
  foodToppingsEn: [
    {
      toppingName: '',
      toppingPrice: 1
    }
  ],
  foodImgs: [
    {
      foodImgDisplayName: '',
      foodImgDisplayPath: ''
    }
  ],
  foodImgDisplayName: '',
  foodImgDisplayPath: ''
}

export const ADMIN_EMAIL = async () =>
  await fetch(API_URL + `/users/all`)
    .then(res => res.json())
    .then(({ response }) => response[0].userEmail)
