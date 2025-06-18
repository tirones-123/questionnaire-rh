const fs = require('fs');
const path = require('path');

// Mock des données de test
const mockScores = {
  'Ambition': {
    critere: 'Ambition',
    scoreTotal: 24,
    noteSur5: 4.0,
    famille: 'VOULOIR',
    items: []
  },
  'Initiative': {
    critere: 'Initiative',
    scoreTotal: 23,
    noteSur5: 2.7,
    famille: 'VOULOIR',
    items: []
  },
  'Résilience': {
    critere: 'Résilience',
    scoreTotal: 19,
    noteSur5: 2.9,
    famille: 'VOULOIR',
    items: []
  },
  'Vision': {
    critere: 'Vision',
    scoreTotal: 18,
    noteSur5: 4.2,
    famille: 'PENSER',
    items: []
  },
  'Recul': {
    critere: 'Recul',
    scoreTotal: 19,
    noteSur5: 3.3,
    famille: 'PENSER',
    items: []
  },
  'Pertinence': {
    critere: 'Pertinence',
    scoreTotal: 19,
    noteSur5: 4.2,
    famille: 'PENSER',
    items: []
  },
  'Organisation': {
    critere: 'Organisation',
    scoreTotal: 12,
    noteSur5: 2.1,
    famille: 'AGIR',
    items: []
  },
  'Décision': {
    critere: 'Décision',
    scoreTotal: 18,
    noteSur5: 3.3,
    famille: 'AGIR',
    items: []
  },
  'Sens du résultat': {
    critere: 'Sens du résultat',
    scoreTotal: 17,
    noteSur5: 4.2,
    famille: 'AGIR',
    items: []
  },
  'Communication': {
    critere: 'Communication',
    scoreTotal: 18,
    noteSur5: 4.0,
    famille: 'ENSEMBLE',
    items: []
  },
  'Esprit d\'équipe': {
    critere: 'Esprit d\'équipe',
    scoreTotal: 20,
    noteSur5: 3.1,
    famille: 'ENSEMBLE',
    items: []
  },
  'Leadership': {
    critere: 'Leadership',
    scoreTotal: 20,
    noteSur5: 4.6,
    famille: 'ENSEMBLE',
    items: []
  }
};

async function testCharts() {
  try {
    // Importer les fonctions de génération de graphiques
    const { generateRadarChart, generateSortedBarChart, generateFamilyBarChart } = require('./utils/chartGenerator');
    
    console.log('Génération des graphiques de test...');
    
    // Générer les graphiques
    const radarSvg = generateRadarChart(mockScores);
    const sortedSvg = generateSortedBarChart(mockScores);
    const familySvg = generateFamilyBarChart(mockScores);
    
    // Sauvegarder les SVG pour vérification
    fs.writeFileSync('test-radar.svg', radarSvg);
    fs.writeFileSync('test-sorted.svg', sortedSvg);
    fs.writeFileSync('test-family.svg', familySvg);
    
    console.log('✅ Graphiques SVG générés avec succès:');
    console.log('- test-radar.svg (' + radarSvg.length + ' chars)');
    console.log('- test-sorted.svg (' + sortedSvg.length + ' chars)');
    console.log('- test-family.svg (' + familySvg.length + ' chars)');
    
    // Tester la conversion PNG
    const sharp = require('sharp');
    
    console.log('\nTest de conversion PNG...');
    
    try {
      const pngBuffer = await sharp(Buffer.from(radarSvg))
        .resize(600, 600, { 
          fit: 'inside', 
          withoutEnlargement: false,
          background: { r: 255, g: 255, b: 255, alpha: 1 } 
        })
        .png({ quality: 90, compressionLevel: 6 })
        .toBuffer();
        
      fs.writeFileSync('test-radar.png', pngBuffer);
      console.log('✅ Conversion PNG réussie: test-radar.png (' + pngBuffer.length + ' bytes)');
      
    } catch (pngError) {
      console.error('❌ Erreur de conversion PNG:', pngError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test des graphiques:', error);
  }
}

// Exécuter le test
testCharts(); 