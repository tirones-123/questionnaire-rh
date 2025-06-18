import { NextApiRequest, NextApiResponse } from 'next';
import { generateRadarChartFixed, generateSortedBarChartFixed, generateFamilyBarChartFixed } from '../../utils/chartGeneratorFixed';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Testing UTF-8 direct approach for French characters...');
  
  try {
    // Données de test avec caractères français
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

    console.log('Generating charts with UTF-8 direct encoding...');

    // Test 1: Graphique radar
    const radarChart = generateRadarChartFixed(testScores);
    console.log('Radar chart generated, length:', radarChart.length);
    
    // Test 2: Graphique trié
    const sortedChart = generateSortedBarChartFixed(testScores);
    console.log('Sorted chart generated, length:', sortedChart.length);
    
    // Test 3: Graphique par famille
    const familyChart = generateFamilyBarChartFixed(testScores);
    console.log('Family chart generated, length:', familyChart.length);

    // Vérifier que les caractères français sont présents (pas d'entités HTML)
    const frenchCharsTests = {
      résilience: radarChart.includes('Résilience'), // UTF-8 direct
      décision: sortedChart.includes('Décision'), // UTF-8 direct  
      apostrophe: familyChart.includes('Esprit d\'équipe'), // UTF-8 direct
      résultat: radarChart.includes('résultat'), // UTF-8 direct
      compétences: radarChart.includes('compétences') // UTF-8 direct
    };

    console.log('UTF-8 direct character tests:', frenchCharsTests);

    res.status(200).json({
      success: true,
      message: 'UTF-8 direct encoding test completed',
      approach: 'Direct UTF-8 characters (no HTML entities)',
      charts: {
        radar: {
          length: radarChart.length,
          containsUTF8: radarChart.includes('Résilience'),
          preview: radarChart.substring(0, 200) + '...'
        },
        sorted: {
          length: sortedChart.length,
          containsUTF8: sortedChart.includes('Décision'),
          preview: sortedChart.substring(0, 200) + '...'
        },
        family: {
          length: familyChart.length,
          containsUTF8: familyChart.includes('équipe'),
          preview: familyChart.substring(0, 200) + '...'
        }
      },
      utf8Tests: frenchCharsTests,
      frenchWords: [
        'Résilience', 
        'Décision', 
        'Sens du résultat', 
        'Esprit d\'équipe',
        'Vision globale des compétences'
      ]
    });

  } catch (error) {
    console.error('Error testing UTF-8 direct approach:', error);
    res.status(500).json({
      success: false,
      message: 'UTF-8 direct test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 