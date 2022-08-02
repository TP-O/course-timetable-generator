import { firebaseAdmin } from '@/services/firebase/admin'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await firebaseAdmin.verifyIdToken(String(req.query.aa))

  res.status(200).json({ token })
}
