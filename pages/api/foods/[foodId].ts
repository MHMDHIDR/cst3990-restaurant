import { NextApiResponse } from 'next'
import dbConnect from 'utils/db'
import FoodModel from 'models/Foods'
import { fileRequestProps, FoodImgsProps, ToppingsProps } from '@types'
import { AWSError, S3 } from 'aws-sdk'
import formHandler from 'functions/form'
import { parseJson } from 'functions/jsonTools'

const { AWS_ACCESS_ID, AWS_SECRET, AWS_BUCKET_NAME } = process.env
const s3 = new S3({
  credentials: {
    accessKeyId: AWS_ACCESS_ID || '',
    secretAccessKey: AWS_SECRET || ''
  }
})

export default async function handler(req: fileRequestProps, res: NextApiResponse) {
  const { method, query } = req
  const { foodId } = query
  const { fields }: any = await formHandler(req)
  const {
    foodName,
    foodPrice,
    category,
    foodDesc,
    foodTags,
    foodToppings,
    foodImgs,
    prevFoodImgPathsAndNames,
    imgName
  } = fields
  await dbConnect()

  switch (method) {
    case 'PATCH': {
      const tags = parseJson(foodTags)
      const toppings = parseJson(foodToppings).map(
        ({ toppingName, toppingPrice }: ToppingsProps) => {
          return {
            toppingName,
            toppingPrice: Number(toppingPrice)
          }
        }
      )

      //if the user has uploaded a new image
      if (foodImgs) {
        try {
          await FoodModel.findByIdAndUpdate(
            foodId,
            {
              foodName,
              foodPrice,
              category,
              foodDesc,
              foodToppings: toppings,
              foodTags: tags,
              //get prev imgs array and concat them with new ones uploaded to s3
              foodImgs: parseJson(prevFoodImgPathsAndNames).concat(
                parseJson(foodImgs).map(
                  ({ foodImgDisplayName, foodImgDisplayPath }: any) => {
                    return {
                      foodImgDisplayName,
                      foodImgDisplayPath
                    }
                  }
                )
              ),
              updatedAt: Date.now()
            },
            { new: true }
          )
          res.status(200).json({ message: 'Food Updated Successfully', foodUpdated: 1 })
        } catch (error) {
          res.status(500).json({ message: error, foodUpdated: 0 })
        }
      } else {
        //else update food data without affecting images
        try {
          await FoodModel.findByIdAndUpdate(foodId, {
            foodName,
            foodPrice,
            category,
            foodDesc,
            foodToppings: toppings,
            foodTags: tags,
            updatedAt: Date.now()
          })

          res.status(200).json({
            message: 'Food Updated Successfully',
            foodUpdated: 1
          })
        } catch (error) {
          res.status(500).json({
            message: `Sorry! Something went wrong, check the error => 😥: \n ${error}`,
            foodUpdated: 0
          })
        }
      }
      break
    }

    case 'DELETE': {
      /*if imgName is defined delete only one image*/
      if (imgName) {
        const deleteObjectAndProceed = async (
          imgName: string,
          foodId: string[] | string | undefined
        ): Promise<{ success: boolean; error?: string }> => {
          try {
            // Delete the image from S3
            await s3.deleteObject({ Bucket: AWS_BUCKET_NAME!, Key: imgName }).promise()

            // Find the food and delete the image by using the imgName
            const food = await FoodModel.findById(foodId)
            if (!food) {
              return { success: false, error: 'Food not found' }
            }

            const foodImgs = food.foodImgs.filter(
              (img: { foodImgDisplayName: string | string[] }) =>
                img.foodImgDisplayName !== imgName
            )

            // Update the food model
            await FoodModel.findByIdAndUpdate(foodId, { foodImgs })

            return { success: true }
          } catch (error) {
            return { success: false, error: 'Unexpected error' }
          }
        }

        // Invoking the deleteObjectAndProceed function
        const result = await deleteObjectAndProceed(imgName, foodId)

        if (result.success) {
          res.status(200).json({ message: 'Image Deleted Successfully', ImgDeleted: 1 })
        } else {
          res
            .status(500)
            .json({ message: `Error deleting image: ${result.error}`, ImgDeleted: 0 })
        }
      } else {
        //else delete entire food data with its images
        //delete the old images from s3 bucket using the prevFoodImgPathsAndNames
        const Objects = parseJson(prevFoodImgPathsAndNames).map(
          ({ foodImgDisplayName }: FoodImgsProps) => ({ Key: foodImgDisplayName })
        )

        s3.deleteObjects(
          {
            Bucket: process.env.AWS_BUCKET_NAME || '',
            Delete: { Objects }
          },
          async (error, _data) => {
            if (error) {
              res.status(500).json({
                message: error,
                foodDeleted: 0
              })
            }

            try {
              await FoodModel.findByIdAndDelete(foodId)

              res.json({
                message: 'Food Deleted Successfully',
                foodDeleted: 1
              })
              return
            } catch (error) {
              res.json({
                message: `Sorry! Something went wrong, check the error => 😥: \n ${error}`,
                foodDeleted: 0
              })
              return
            }
          }
        )
      }
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
