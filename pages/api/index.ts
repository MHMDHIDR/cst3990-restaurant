import SettingsModel from 'models/Settings'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const logo = await SettingsModel.find().select('websiteLogoDisplayPath -_id')

  const logoSrc = logo[0]?.websiteLogoDisplayPath
    ? `<img src='${logo[0]?.websiteLogoDisplayPath}' />`
    : ''

  res.status(200).send(
    `<body
        style='overflow:hidden;word-spacing:2rem;height:100vh;display:grid;place-items:center;background-color:#222'>
        <h1 style='font-size:3em;font-weight:bold;color:white'>
          WELCOME TO RESTAURANT API
        </h1>${logoSrc}
      </body>`
  )
}
