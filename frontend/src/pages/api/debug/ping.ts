import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ success: true, data: { pong: true } })
}

