const fs = require('fs');

// Test data
const mockUserInfo = {
  firstName: 'Test',
  lastName: 'User',
  age: '35',
  profession: 'Manager',
  email: 'test@example.com'
};

// Mock responses (72 questions avec des réponses variées)
const mockResponses = {};
for (let section = 1; section <= 8; section++) {
  for (let question = 1; question <= 9; question++) {
    const responses = ['a', 'b', 'c', 'd', 'e'];
    mockResponses[`${section}-${question}`] = responses[Math.floor(Math.random() * responses.length)];
  }
}

console.log('Attente du démarrage du serveur...');

// Attendre 3 secondes pour que le serveur démarre
setTimeout(() => {
  console.log('Envoi de la requête de test...');

  fetch('http://localhost:3000/api/submit-questionnaire', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userInfo: mockUserInfo,
      responses: mockResponses
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Réponse reçue:', data);
    if (data.success) {
      console.log('🎉 Test réussi ! Rapport généré avec succès.');
    } else {
      console.log('❌ Erreur:', data.error);
      if (data.details) {
        console.log('Détails:', data.details);
      }
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur de requête:', error);
    process.exit(1);
  });
}, 3000); 