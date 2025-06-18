import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Testing Sharp...');
  
  try {
    // Test 1: Créer un SVG simple
    const svgTest = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#4CAF50"/>
        <circle cx="100" cy="100" r="50" fill="white"/>
        <text x="100" y="110" text-anchor="middle" font-size="20" fill="black">TEST</text>
      </svg>
    `;
    
    console.log('SVG created, length:', svgTest.length);
    
    // Test 2: Convertir en PNG
    const pngBuffer = await sharp(Buffer.from(svgTest))
      .resize(200, 200)
      .png()
      .toBuffer();
    
    console.log('PNG created, size:', pngBuffer.length);
    
    // Test 3: Obtenir les métadonnées
    const metadata = await sharp(pngBuffer).metadata();
    console.log('PNG metadata:', metadata);
    
    res.status(200).json({
      success: true,
      message: 'Sharp is working correctly',
      details: {
        svgLength: svgTest.length,
        pngSize: pngBuffer.length,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        }
      }
    });
    
  } catch (error) {
    console.error('Sharp error:', error);
    res.status(500).json({
      success: false,
      message: 'Sharp test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 