import { Model } from 'mongoose'
import dbConnect from 'utils/db'

/**
 * Paginated results middleware to handle paginated requests
 * @param model The model to make the request based on and paginate the results
 * @param req
 * @param res
 * @returns
 */
const paginatedResults = async (model: Model<any>, req: any, res: any) => {
  try {
    const mongoose: any = await dbConnect()

    // if connection to db is successful
    if (mongoose) {
      const { itemId, category, orderDate, createdAt, updatedAt, page, limit } = req.query

      const startIndex = (Number(page) - 1) * Number(limit)
      const endIndex = Number(page) * Number(limit)
      const response: any = {}

      if (endIndex < (await model.countDocuments())) {
        response.next = {
          page: Number(page) + 1,
          limit: limit
        }
      }

      if (startIndex > 0) {
        response.previous = {
          page: Number(page) - 1,
          limit: limit
        }
      }

      try {
        let sortQuery = {}
        if (orderDate) sortQuery = { orderDate: Number(orderDate) }
        else if (createdAt) sortQuery = { createdAt: Number(createdAt) }
        else if (updatedAt) sortQuery = { updatedAt: Number(updatedAt) }

        response.response = itemId
          ? await model.findById(itemId)
          : category
          ? await model
              .find({ category })
              .limit(Number(limit))
              .skip(startIndex)
              .sort(sortQuery)
          : await model.find().limit(Number(limit)).skip(startIndex)

        response.itemsCount = category
          ? await model.countDocuments({ category })
          : await model.estimatedDocumentCount()

        response.numberOfPages = Math.ceil(response.itemsCount / Number(limit))

        response.category = category

        res.paginatedResults = response

        return response
      } catch (e: any) {
        res.status(500).json({ message: e.message })
      }
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export default paginatedResults
