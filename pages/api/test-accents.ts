import { NextApiRequest, NextApiResponse } from 'next';
import { generateRadarChartImproved, generateSortedBarChartImproved, generateFamilyBarChartImproved } from '../../utils/chartGeneratorImproved';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Testing French accents in charts...');
  
  try {
    // Données de test avec tous les caractères français
    const testScores = {
      'Ambition': {
        critere: 'Ambition',
        scoreTotal: 24,
        noteSur5: 4.0,
        famille: 'VOULOIR',
        items: []
      },
      'Initiative': {
        critere: 'Initiative',
        scoreTotal: 16,
        noteSur5: 2.7,
        famille: 'VOULOIR',
        items: []
      },
      'Résilience': {
        critere: 'Résilience', // Teste é
        scoreTotal: 17,
        noteSur5: 2.9,
        famille: 'VOULOIR',
        items: []
      },
      'Vision': {
        critere: 'Vision',
        scoreTotal: 25,
        noteSur5: 4.2,
        famille: 'PENSER',
        items: []
      },
      'Recul': {
        critere: 'Recul',
        scoreTotal: 20,
        noteSur5: 3.3,
        famille: 'PENSER',
        items: []
      },
      'Pertinence': {
        critere: 'Pertinence',
        scoreTotal: 25,
        noteSur5: 4.2,
        famille: 'PENSER',
        items: []
      },
      'Organisation': {
        critere: 'Organisation',
        scoreTotal: 13,
        noteSur5: 2.1,
        famille: 'AGIR',
        items: []
      },
      'Décision': {
        critere: 'Décision', // Teste é
        scoreTotal: 20,
        noteSur5: 3.3,
        famille: 'AGIR',
        items: []
      },
      'Sens du résultat': {
        critere: 'Sens du résultat', // Teste é
        scoreTotal: 25,
        noteSur5: 4.2,
        famille: 'AGIR',
        items: []
      },
      'Communication': {
        critere: 'Communication',
        scoreTotal: 24,
        noteSur5: 4.0,
        famille: 'ENSEMBLE',
        items: []
      },
      'Esprit d\'équipe': {
        critere: 'Esprit d\'équipe', // Teste apostrophe + è
        scoreTotal: 19,
        noteSur5: 3.1,
        famille: 'ENSEMBLE',
        items: []
      },
      'Leadership': {
        critere: 'Leadership',
        scoreTotal: 28,
        noteSur5: 4.6,
        famille: 'ENSEMBLE',
        items: []
      }
    };

    console.log('Generating test charts with French characters...');

    // Test 1: Graphique radar
    const radarChart = generateRadarChartImproved(testScores);
    console.log('Radar chart generated, length:', radarChart.length);
    
    // Test 2: Graphique trié
    const sortedChart = generateSortedBarChartImproved(testScores);
    console.log('Sorted chart generated, length:', sortedChart.length);
    
    // Test 3: Graphique par famille
    const familyChart = generateFamilyBarChartImproved(testScores);
    console.log('Family chart generated, length:', familyChart.length);

    // Vérifier que les entités HTML sont présentes
    const frenchCharsTests = {
      résilience: radarChart.includes('&#233;'), // é
      décision: sortedChart.includes('&#233;'), // é  
      apostrophe: familyChart.includes('&#39;'), // '
      titre: radarChart.includes('comp&#233;tences') // é dans compétences
    };

    console.log('French character encoding tests:', frenchCharsTests);

    res.status(200).json({
      success: true,
      message: 'French accents test completed',
      charts: {
        radar: {
          length: radarChart.length,
          hasEncoding: radarChart.includes('&#'),
          preview: radarChart.substring(0, 200) + '...'
        },
        sorted: {
          length: sortedChart.length,
          hasEncoding: sortedChart.includes('&#'),
          preview: sortedChart.substring(0, 200) + '...'
        },
        family: {
          length: familyChart.length,
          hasEncoding: familyChart.includes('&#'),
          preview: familyChart.substring(0, 200) + '...'
        }
      },
      encodingTests: frenchCharsTests,
      frenchWords: [
        'Résilience', 
        'Décision', 
        'Sens du résultat', 
        'Esprit d\'équipe',
        'Vision globale des compétences'
      ]
    });

  } catch (error) {
    console.error('Error testing French accents:', error);
    res.status(500).json({
      success: false,
      message: 'French accents test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 