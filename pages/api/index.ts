import SettingsModel from 'models/Settings'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const logo = await SettingsModel.find().select('websiteLogoDisplayPath -_id')

  const styles = `
    img {
      border-radius: 1rem;
      transition: transform 200ms ease-in-out;
    }
    img:hover {
      cursor: pointer;
      transform: scale(1.1) translateY(-3.5rem);
    }
  `

  const logoSrc = logo[0]?.websiteLogoDisplayPath
    ? `<style>${styles}</style><img src='${logo[0]?.websiteLogoDisplayPath}' style="border-radius:1rem" />`
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
