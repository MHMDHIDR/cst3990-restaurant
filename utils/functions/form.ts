import { fileRequestProps } from '@types'
import formidable from 'formidable'
import { NextApiRequest } from 'next'

export default async function formHandler(req: fileRequestProps | NextApiRequest) {
  const form = formidable()

  const [fields, files] = await form.parse(req)

  return {
    fields: Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, value ? value[0] : ''])
    ),
    files
  }
}
