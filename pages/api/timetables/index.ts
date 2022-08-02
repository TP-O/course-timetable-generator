import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: any
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ name: 'tpo' })
}
