import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from 'utils/db'
import SettingsModel from 'models/Settings'
import { S3 } from 'aws-sdk'
import formHandler from 'utils/functions/form'
import { parseJson } from 'functions/jsonTools'

const { AWS_ACCESS_ID, AWS_SECRET, AWS_BUCKET_NAME } = process.env
const s3 = new S3({
  credentials: {
    accessKeyId: AWS_ACCESS_ID ?? '',
    secretAccessKey: AWS_SECRET ?? ''
  }
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req
  const { fields }: any = await formHandler(req)
  const {
    appName,
    appDesc,
    AppTaglinesList,
    orderMsgSuccess,
    orderMsgFailure,
    whatsAppNumber,
    instagramAccount,
    twitterAccount,
    CategoryList,
    foodImgs,
    prevLogoImgPath,
    prevLogoImgName
  } = fields

  await dbConnect()

  switch (method) {
    case 'PATCH': {
      const { id }: any = query
      const websiteLogoDisplayName: string = parseJson(foodImgs)[0]
        ? parseJson(foodImgs)[0].foodImgDisplayName
        : prevLogoImgName
      const websiteLogoDisplayPath: string = parseJson(foodImgs)[0]
        ? parseJson(foodImgs)[0].foodImgDisplayPath
        : prevLogoImgPath

      // If We have new Image parseJson(foodImgs)[0] will be true
      if (parseJson(foodImgs)[0]) {
        // Delete previous logo image from S3
        s3.deleteObject(
          {
            Bucket: AWS_BUCKET_NAME!,
            Key: prevLogoImgName
          },
          async (error, _data) => {
            if (error)
              return res
                .status(500)
                .json({ message: `Error: ${error}`, settingsUpdated: 0 })
          }
        )
        // Update other settings
        updateSettings()
      } else {
        // Update other settings without logo
        updateSettings()

        break
      }

      async function updateSettings() {
        try {
          await SettingsModel.findByIdAndUpdate(
            id,
            {
              websiteLogoDisplayName,
              websiteLogoDisplayPath,
              appName,
              appDesc,
              AppTaglinesList: parseJson(AppTaglinesList),
              whatsAppNumber,
              instagramAccount,
              twitterAccount,
              CategoryList: parseJson(CategoryList),
              orderMsg: {
                Success: orderMsgSuccess,
                Failure: orderMsgFailure
              }
            },
            { new: true }
          )

          res.status(200).json({
            message: `Settings Updated Successfully`,
            settingsUpdated: 1
          })
        } catch (error) {
          res.status(500).json({
            message: `Something went wrong => 😥: ${error}`,
            settingsUpdated: 0
          })
        }
      }
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
