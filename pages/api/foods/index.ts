import { NextApiResponse } from 'next'
import FoodModel from 'models/Foods'
import paginatedResults from 'middleware/paginatedResults'
import { fileRequestProps, ToppingsProps } from '@types'
import formHandler from 'functions/form'
import { parseJson } from 'functions/jsonTools'

/**
 * API endpoint to handle food requests
 * It handles GET and POST requests
 * GET: to get all foods
 * POST: to add a new food
 * @param req
 * @param res
 */
const handler = async (req: fileRequestProps, res: NextApiResponse) => {
  const { method } = req

  switch (method) {
    case 'GET': {
      try {
        const foods = await paginatedResults(FoodModel, req, res)
        res.status(200).json(foods)
      } catch (error) {
        res.json('Failed to get food!: ' + error)
      }
      break
    }

    case 'POST': {
      const { fields }: any = await formHandler(req)
      const {
        foodName,
        foodPrice,
        category,
        foodDesc,
        foodToppings,
        foodTags,
        foodImgs
      } = fields
      const toppings = foodToppings && parseJson(foodToppings)
      const tags = parseJson(foodTags)

      await FoodModel.create({
        foodName,
        foodPrice: parseInt(foodPrice),
        category,
        foodDesc,
        foodToppings: toppings.map(({ toppingName, toppingPrice }: ToppingsProps) => {
          return {
            toppingName,
            toppingPrice: Number(toppingPrice)
          }
        }),
        foodTags: tags,
        foodImgs: parseJson(foodImgs)
      })

      res.status(201).json({
        foodAdded: 1,
        message: 'Food added successfully'
      })

      break
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}

export const config = {
  api: { bodyParser: false }
}

export default handler
