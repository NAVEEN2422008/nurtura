import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📜 AI History proxy:', req.query);

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const pregnancyId = (req.query.pregnancyId as string) || '';
  const limit = Number(req.query.limit) || 50;
  const offset = Number(req.query.offset) || 0;

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/chat/history/${encodeURIComponent(pregnancyId || '')}${limit ? `?limit=${limit}` : ''}${offset ? `&offset=${offset}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json();
      return res.status(backendRes.status).json({ success: false, error: errorData.error || 'Backend error' });
    }

    const data = await backendRes.json();
    console.log('📜 AI History response:', data.data?.messages?.length || 0, 'messages');
    res.status(200).json(data);
  } catch (error) {
    console.error('History proxy error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
