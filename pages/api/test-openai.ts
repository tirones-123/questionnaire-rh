import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('Testing OpenAI connection...');
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key format:', apiKey?.startsWith('sk-') ? 'Valid format' : 'Invalid format');
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'OpenAI API key not configured',
      details: 'OPENAI_API_KEY environment variable is missing'
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log('Making test call to OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'API is working!' in exactly 3 words." }
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content || 'No response';
    console.log('OpenAI response:', response);

    return res.status(200).json({ 
      success: true,
      message: 'OpenAI API is working',
      response: response,
      apiKeyFormat: apiKey.startsWith('sk-') ? 'Valid' : 'Invalid',
      model: completion.model,
      usage: completion.usage
    });
  } catch (error) {
    console.error('OpenAI test error:', error);
    
    const errorDetails: any = {
      error: 'OpenAI API test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    };

    if (error instanceof Error && error.message.includes('401')) {
      errorDetails.suggestion = 'Check if your API key is valid and has not been revoked';
    }
    
    if (error instanceof Error && error.message.includes('429')) {
      errorDetails.suggestion = 'Rate limit exceeded - wait a moment and try again';
    }

    return res.status(500).json(errorDetails);
  }
} 