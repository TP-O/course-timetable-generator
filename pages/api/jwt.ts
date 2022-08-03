import { firebaseAdmin } from '@/services/firebase/admin'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const decodedToken = await firebaseAdmin.verifyIdToken(String(req.body.token))
      const token = await firebaseAdmin.createCustomToken(decodedToken.uid)

      return res.status(200).json({ data: token })
    } catch (err) {
      return res.status(500).json({ error: err })
    }
  }

  return res.status(400)
}
