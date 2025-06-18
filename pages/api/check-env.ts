import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  return res.status(200).json({
    openaiKeyExists: !!apiKey,
    openaiKeyLength: apiKey?.length || 0,
    openaiKeyFormat: apiKey?.startsWith('sk-') ? 'Valid format (sk-...)' : 'Invalid format',
    openaiKeyFirstChars: apiKey ? `${apiKey.substring(0, 7)}...` : 'No key',
    smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
} 