#!/usr/bin/env node

const fetch = require('node-fetch');

// Configuration du script
const BASE_URL = 'https://questionnaire-rh-git-main-maximemarsal18-gmailcoms-projects.vercel.app';

// Informations utilisateur de test
const userInfo = {
  firstName: 'Test',
  lastName: 'Utilisateur',
  age: '30',
  profession: 'Développeur',
  email: 'test@example.com'
};

// Génération des réponses automatiques (répartition équilibrée)
function generateResponses() {
  const responseOptions = ['a', 'b', 'c', 'd', 'e'];
  const responses = {};
  
  // 8 sections × 9 questions = 72 questions
  for (let sectionId = 1; sectionId <= 8; sectionId++) {
    for (let questionId = 1; questionId <= 9; questionId++) {
      // Génère une réponse aléatoire mais équilibrée
      const randomResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];
      responses[`${sectionId}-${questionId}`] = randomResponse;
    }
  }
  
  return responses;
}

// Fonction principale pour soumettre le questionnaire
async function submitQuestionnaire() {
  try {
    console.log('🚀 Début de la soumission automatique du questionnaire...');
    console.log(`📍 URL cible: ${BASE_URL}`);
    
    // Générer les réponses
    const responses = generateResponses();
    console.log(`✅ Génération de ${Object.keys(responses).length} réponses automatiques`);
    
    // Afficher un échantillon des réponses
    console.log('📋 Échantillon des réponses générées:');
    const sampleKeys = Object.keys(responses).slice(0, 5);
    sampleKeys.forEach(key => {
      console.log(`   ${key}: ${responses[key]}`);
    });
    console.log('   ...');
    
    // Préparer les données pour l'API
    const requestData = {
      userInfo: userInfo,
      responses: responses
    };
    
    console.log('👤 Informations utilisateur:');
    console.log(`   Nom: ${userInfo.firstName} ${userInfo.lastName}`);
    console.log(`   Âge: ${userInfo.age} ans`);
    console.log(`   Profession: ${userInfo.profession}`);
    console.log(`   Email: ${userInfo.email}`);
    
    console.log('📤 Envoi de la requête...');
    
    // Soumettre à l'API
    const response = await fetch(`${BASE_URL}/api/submit-questionnaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Questionnaire soumis avec succès');
      console.log(`📧 ${result.message || 'Réponses envoyées par email'}`);
      
      // Statistiques des réponses
      const responseStats = {};
      Object.values(responses).forEach(response => {
        responseStats[response] = (responseStats[response] || 0) + 1;
      });
      
      console.log('📊 Statistiques des réponses:');
      console.log(`   A (Tout à fait d'accord): ${responseStats.a || 0}`);
      console.log(`   B (D'accord): ${responseStats.b || 0}`);
      console.log(`   C (Neutre): ${responseStats.c || 0}`);
      console.log(`   D (Pas d'accord): ${responseStats.d || 0}`);
      console.log(`   E (Pas d'accord du tout): ${responseStats.e || 0}`);
      
    } else {
      console.log('❌ ERREUR lors de la soumission:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${result.error || 'Erreur inconnue'}`);
      if (result.details) {
        console.log(`   Détails: ${result.details}`);
      }
    }
    
  } catch (error) {
    console.log('💥 ERREUR CRITIQUE:');
    console.log(`   ${error.message}`);
    console.log('   Vérifiez votre connexion internet et que l\'URL est accessible');
  }
}

// Fonction pour soumettre une évaluation (mode évaluation)
async function submitEvaluation() {
  try {
    console.log('🚀 Début de la soumission automatique en mode évaluation...');
    
    const evaluationInfo = {
      evaluatedPerson: {
        firstName: 'Jean',
        lastName: 'Dupont',
        position: 'Manager',
        ageRange: '35-44'
      },
      evaluator: {
        relationship: 'Supérieur hiérarchique',
        hierarchyLevel: 'N+1'
      },
      evaluatorEmail: 'evaluateur@example.com'
    };
    
    const responses = generateResponses();
    
    console.log('👥 Informations d\'évaluation:');
    console.log(`   Évalué: ${evaluationInfo.evaluatedPerson.firstName} ${evaluationInfo.evaluatedPerson.lastName}`);
    console.log(`   Poste: ${evaluationInfo.evaluatedPerson.position}`);
    console.log(`   Relation: ${evaluationInfo.evaluator.relationship}`);
    console.log(`   Email évaluateur: ${evaluationInfo.evaluatorEmail}`);
    
    const requestData = {
      evaluationInfo: evaluationInfo,
      responses: responses
    };
    
    console.log('📤 Envoi de l\'évaluation...');
    
    const response = await fetch(`${BASE_URL}/api/submit-evaluation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Évaluation soumise avec succès');
      console.log(`📧 ${result.message || 'Évaluation envoyée par email'}`);
    } else {
      console.log('❌ ERREUR lors de la soumission de l\'évaluation:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${result.error || 'Erreur inconnue'}`);
    }
    
  } catch (error) {
    console.log('💥 ERREUR CRITIQUE pour l\'évaluation:');
    console.log(`   ${error.message}`);
  }
}

// Interface en ligne de commande
function showHelp() {
  console.log(`
🎯 Script de soumission automatique du questionnaire RH

Usage:
  node auto-submit-questionnaire.js [mode]

Modes disponibles:
  auto          Mode autodiagnostic (défaut)
  evaluation    Mode évaluation d'un collaborateur
  both          Les deux modes
  help          Affiche cette aide

Exemples:
  node auto-submit-questionnaire.js              # Mode autodiagnostic
  node auto-submit-questionnaire.js auto         # Mode autodiagnostic
  node auto-submit-questionnaire.js evaluation   # Mode évaluation
  node auto-submit-questionnaire.js both         # Les deux modes
`);
}

// Point d'entrée principal
async function main() {
  const mode = process.argv[2] || 'auto';
  
  console.log('🔧 Script de soumission automatique du questionnaire RH');
  console.log('═'.repeat(60));
  
  switch (mode.toLowerCase()) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    case 'auto':
    case 'autodiagnostic':
      await submitQuestionnaire();
      break;
      
    case 'evaluation':
    case 'eval':
      await submitEvaluation();
      break;
      
    case 'both':
    case 'all':
      console.log('🔄 Mode combiné: autodiagnostic + évaluation\n');
      await submitQuestionnaire();
      console.log('\n' + '─'.repeat(60) + '\n');
      await submitEvaluation();
      break;
      
    default:
      console.log(`❌ Mode inconnu: ${mode}`);
      console.log('Utilisez "node auto-submit-questionnaire.js help" pour voir l\'aide');
      process.exit(1);
  }
  
  console.log('\n🏁 Script terminé');
}

// Vérification des dépendances
try {
  require('node-fetch');
} catch (error) {
  console.log('❌ ERREUR: node-fetch n\'est pas installé');
  console.log('📦 Installez-le avec: npm install node-fetch');
  process.exit(1);
}

// Lancement du script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { submitQuestionnaire, submitEvaluation, generateResponses }; 