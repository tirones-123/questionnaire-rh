import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Testing Sharp encoding methods...');
  
  try {
    // Test 1: SVG avec entités HTML
    const svgWithEntities = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <text x="200" y="50" text-anchor="middle" font-family="Arial" font-size="20">R&#233;silience</text>
  <text x="200" y="80" text-anchor="middle" font-family="Arial" font-size="20">D&#233;cision</text>
  <text x="200" y="110" text-anchor="middle" font-family="Arial" font-size="20">Esprit d&#39;&#233;quipe</text>
  <text x="200" y="140" text-anchor="middle" font-family="Arial" font-size="20">Sens du r&#233;sultat</text>
</svg>`;

    // Test 2: SVG avec caractères UTF-8 directs
    const svgWithUTF8 = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <text x="200" y="50" text-anchor="middle" font-family="Arial" font-size="20">Résilience</text>
  <text x="200" y="80" text-anchor="middle" font-family="Arial" font-size="20">Décision</text>
  <text x="200" y="110" text-anchor="middle" font-family="Arial" font-size="20">Esprit d'équipe</text>
  <text x="200" y="140" text-anchor="middle" font-family="Arial" font-size="20">Sens du résultat</text>
</svg>`;

    // Test 3: SVG avec caractères UTF-8 et meta charset
    const svgWithCharset = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description>
        <dc:format xmlns:dc="http://purl.org/dc/elements/1.1/">image/svg+xml</dc:format>
      </rdf:Description>
    </rdf:RDF>
  </metadata>
  <text x="200" y="50" text-anchor="middle" font-family="Arial" font-size="20">Résilience</text>
  <text x="200" y="80" text-anchor="middle" font-family="Arial" font-size="20">Décision</text>
  <text x="200" y="110" text-anchor="middle" font-family="Arial" font-size="20">Esprit d'équipe</text>
  <text x="200" y="140" text-anchor="middle" font-family="Arial" font-size="20">Sens du résultat</text>
</svg>`;

    console.log('Testing different SVG encoding approaches with Sharp...');

    // Convertir avec Sharp
    const png1 = await sharp(Buffer.from(svgWithEntities, 'utf8'))
      .resize(400, 200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();

    const png2 = await sharp(Buffer.from(svgWithUTF8, 'utf8'))
      .resize(400, 200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();

    const png3 = await sharp(Buffer.from(svgWithCharset, 'utf8'))
      .resize(400, 200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();

    res.status(200).json({
      success: true,
      message: 'Sharp encoding tests completed',
      tests: {
        entitiesHTML: {
          svgLength: svgWithEntities.length,
          pngSize: png1.length,
          preview: svgWithEntities.substring(0, 300)
        },
        directUTF8: {
          svgLength: svgWithUTF8.length,
          pngSize: png2.length,
          preview: svgWithUTF8.substring(0, 300)
        },
        withCharset: {
          svgLength: svgWithCharset.length,
          pngSize: png3.length,
          preview: svgWithCharset.substring(0, 300)
        }
      },
      recommendations: [
        'Test 1: HTML entities (current approach)',
        'Test 2: Direct UTF-8 characters', 
        'Test 3: UTF-8 with explicit charset metadata'
      ]
    });

  } catch (error) {
    console.error('Sharp encoding test error:', error);
    res.status(500).json({
      success: false,
      message: 'Sharp encoding test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 