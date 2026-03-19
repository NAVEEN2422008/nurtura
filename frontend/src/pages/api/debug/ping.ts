import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // #region agent log
  fetch('http://127.0.0.1:7914/ingest/d6a77df9-41ef-4127-b13c-7e9a9f24285b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e65389'},body:JSON.stringify({sessionId:'e65389',runId:'run1',hypothesisId:'H99',location:'src/pages/api/debug/ping.ts:handler',message:'Debug ping hit',data:{method:req.method},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log

  return res.status(200).json({ success: true, data: { pong: true } })
}

