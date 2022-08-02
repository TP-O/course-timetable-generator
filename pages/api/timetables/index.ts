import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  data: { name: any }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ data: { name: 'tpo' } })
}
