const fs = require('fs');

// Test data
const mockUserInfo = {
  firstName: 'Test',
  lastName: 'User',
  age: '35',
  profession: 'Manager',
  email: 'test@example.com'
};

// Mock responses (72 questions avec des réponses variées pour avoir des scores intéressants)
const mockResponses = {};
const responsePatterns = {
  1: ['a', 'a', 'b', 'a', 'd', 'a', 'b', 'a', 'b'], // Section AMBITION - scores élevés
  2: ['b', 'a', 'a', 'b', 'e', 'a', 'a', 'b', 'a'], // Section INITIATIVE  
  3: ['a', 'a', 'a', 'd', 'e', 'a', 'a', 'b', 'a'], // Section RÉSILIENCE
  4: ['b', 'd', 'b', 'e', 'd', 'a', 'd', 'e', 'c'], // Section VISION - scores moyens
  5: ['a', 'd', 'd', 'a', 'e', 'b', 'a', 'd', 'd'], // Section RECUL
  6: ['b', 'a', 'd', 'e', 'c', 'b', 'a', 'c', 'e'], // Section PERTINENCE
  7: ['a', 'e', 'b', 'e', 'e', 'b', 'c', 'd', 'e'], // Section ORGANISATION - scores faibles
  8: ['a', 'd', 'e', 'd', 'a', 'c', 'b', 'e', 'a']  // Section DÉCISION/RÉSULTAT/etc.
};

// Utiliser les patterns prédéfinis
for (let section = 1; section <= 8; section++) {
  for (let question = 1; question <= 9; question++) {
    const pattern = responsePatterns[section] || ['c', 'c', 'c', 'c', 'c', 'c', 'c', 'c', 'c'];
    mockResponses[`${section}-${question}`] = pattern[question - 1];
  }
}

console.log('🧪 Test spécifique des graphiques (sans email)...');
console.log('Attente du démarrage du serveur...');

// Attendre 2 secondes pour que le serveur soit prêt
setTimeout(() => {
  console.log('📡 Envoi de la requête de test...');

  fetch('http://localhost:3000/api/test-chart-generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userInfo: mockUserInfo,
      responses: mockResponses
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('\n✅ Réponse reçue:');
    console.log('📊 Message:', data.message);
    
    if (data.success) {
      console.log('\n🎉 Test réussi ! Génération complète des graphiques !');
      console.log('\n📈 Résultats:');
      console.log(`- Critères analysés: ${data.results.scoresCount}`);
      console.log(`- Contenu du rapport: ${data.results.reportContentLength} caractères`);
      console.log(`- Document Word: ${data.results.wordDocumentSize} bytes`);
      
      console.log('\n🎨 Tailles des graphiques SVG:');
      console.log(`- Radar: ${data.results.chartSizes.radar} caractères`);
      console.log(`- Trié: ${data.results.chartSizes.sorted} caractères`);
      console.log(`- Famille: ${data.results.chartSizes.family} caractères`);
      
      console.log('\n📁 Fichiers générés:');
      data.results.outputFiles.forEach(file => {
        console.log(`- ${file}`);
      });
      
      console.log('\n🔍 Vous pouvez maintenant:');
      console.log('1. Ouvrir les fichiers .svg dans un navigateur pour voir les graphiques');
      console.log('2. Ouvrir test-output-rapport.docx dans Word pour voir le rapport complet');
      
    } else {
      console.log('❌ Erreur:', data.error);
      if (data.details) {
        console.log('🔍 Détails:', data.details);
      }
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur de requête:', error.message);
    process.exit(1);
  });
}, 2000); 