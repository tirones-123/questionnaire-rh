import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'No API key' });
  }

  try {
    console.log('Testing OpenAI with fetch...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say hello in 3 words' }],
        max_tokens: 10,
        temperature: 0.1
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI error:', data);
      return res.status(response.status).json({
        error: 'OpenAI API error',
        status: response.status,
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      response: data.choices?.[0]?.message?.content || 'No response',
      model: data.model,
      usage: data.usage
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Request failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 