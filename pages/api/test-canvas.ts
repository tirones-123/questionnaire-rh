import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Testing Canvas...');
  
  try {
    // Test 1: Import Canvas
    const { createCanvas } = await import('canvas');
    console.log('Canvas import successful');
    
    // Test 2: Créer un canvas simple avec texte français
    const canvas = createCanvas(400, 300);
    const ctx = canvas.getContext('2d');
    
    // Fond blanc
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 300);
    
    // Test des caractères français
    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const testTexts = [
      'Résilience',
      'Décision', 
      'Sens du résultat',
      'Esprit d\'équipe',
      'Vision globale des compétences'
    ];
    
    testTexts.forEach((text, i) => {
      ctx.fillText(text, 200, 60 + i * 40);
    });
    
    // Test 3: Convertir en PNG
    const buffer = canvas.toBuffer('image/png');
    console.log('PNG created, size:', buffer.length);
    
    // Test 4: Test import des fonctions de génération
    const { generateRadarChartCanvas, generateSortedBarChartCanvas, generateFamilyBarChartCanvas } = await import('../../utils/chartGeneratorCanvas');
    console.log('Chart generator functions imported successfully');
    
    res.status(200).json({
      success: true,
      message: 'Canvas is working correctly with French characters',
      details: {
        canvasSize: '400x300',
        pngSize: buffer.length,
        frenchTexts: testTexts,
        chartFunctionsAvailable: true
      }
    });
    
  } catch (error) {
    console.error('Canvas error:', error);
    res.status(500).json({
      success: false,
      message: 'Canvas test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 