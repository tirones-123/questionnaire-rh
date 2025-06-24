#!/usr/bin/env node

const fetch = require('node-fetch');

// Configuration du script
const BASE_URL = 'https://questionnaire-rh-git-main-maximemarsal18-gmailcoms-projects.vercel.app';

// Informations utilisateur de test
const userInfo = {
  firstName: 'Maxime',
  lastName: 'Marsal',
  age: '30',
  profession: 'Développeur',
  email: 'maxime.marsal@example.com'
};

// Structure des questions réelles (copiée depuis data/questions.ts)
const sections = [
  {
    id: 1,
    title: "Performance et réussite",
    questions: [
      { id: 1, text: "Attache de l'importance à sa réussite professionnelle" },
      { id: 7, text: "Est focalisé sur la performance et l'efficacité" },
      { id: 10, text: "Utilise efficacement les moyens mis à sa disposition" },
      { id: 36, text: "Va jusqu'au bout de ce qu'il entreprend sans jamais céder à la facilité" },
      { id: 37, text: "Souhaite évoluer en responsabilité ou en influence dans l'entreprise" },
      { id: 61, text: "Est prêt à faire des efforts importants pour réussir professionnellement" },
      { id: 70, text: "Respecte toujours les échéances et les délais" },
      { id: 72, text: "Possède une forte puissance de travail" },
      { id: 13, text: "Préfère son confort personnel à son évolution professionnelle" }
    ]
  },
  {
    id: 2,
    title: "Leadership et influence",
    questions: [
      { id: 20, text: "Possède un fort impact dans les réunions" },
      { id: 32, text: "N'ose pas se placer en leader dans un groupe" },
      { id: 44, text: "Possède une forte présence et sait se faire entendre" },
      { id: 56, text: "Entraîne facilement l'adhésion de ses interlocuteurs" },
      { id: 8, text: "A du mal à se faire entendre et à capter l'attention" },
      { id: 68, text: "Manque de charisme et d'impact sur les autres" },
      { id: 22, text: "A du mal à déléguer" },
      { id: 27, text: "Possède un bon sens pédagogique" },
      { id: 64, text: "Prend du temps pour aider ses collègues" }
    ]
  },
  {
    id: 3,
    title: "Initiative et innovation",
    questions: [
      { id: 9, text: "Prend activement des initiatives même dans des contextes peu stimulants" },
      { id: 21, text: "Sait se stimuler en permanence pour entreprendre" },
      { id: 69, text: "Sait prendre des risques si la situation l'exige" },
      { id: 2, text: "S'intéresse peu aux idées nouvelles et à l'innovation" },
      { id: 50, text: "Ne croit qu'aux solutions qui ont déjà fait leurs preuves" },
      { id: 62, text: "Est curieux de l'évolution de son environnement et est à l'affût de la nouveauté" },
      { id: 45, text: "A besoin d'un environnement stimulant pour se dynamiser" },
      { id: 57, text: "A tendance à se laisser porter par les événements" },
      { id: 33, text: "Pêche par excès de prudence pour avancer" }
    ]
  },
  {
    id: 4,
    title: "Communication et relations",
    questions: [
      { id: 3, text: "A tendance à monopoliser la parole dans les discussions" },
      { id: 15, text: "Ne se met pas suffisamment à la portée de ses interlocuteurs" },
      { id: 39, text: "Manque parfois de sincérité et de transparence avec son entourage professionnel" },
      { id: 51, text: "Prend en compte et intègre véritablement les arguments d'autrui" },
      { id: 63, text: "Ses échanges au sein de l'entreprise sont chaleureux et ouverts" },
      { id: 52, text: "A tendance à travailler de manière isolée et solitaire" },
      { id: 16, text: "Favorise le travail transverse avec d'autres entités ou services" },
      { id: 40, text: "S'intéresse peu aux activités des autres services" },
      { id: 28, text: "A tendance à défendre son territoire au détriment de l'intérêt collectif" }
    ]
  },
  {
    id: 5,
    title: "Adaptabilité et réactivité",
    questions: [
      { id: 6, text: "Sait réagir vite en cas d'urgence ou d'imprévu" },
      { id: 24, text: "S'accommode facilement des ruptures de rythme (déplacements, décalages horaires...)" },
      { id: 54, text: "Sait être réactif pour saisir les opportunités" },
      { id: 12, text: "Est éprouvé par les relations de travail difficiles" },
      { id: 29, text: "Perd de sa perspicacité dans les situations d'urgence" },
      { id: 48, text: "A du mal à s'adapter à des efforts soutenus" },
      { id: 65, text: "Fait preuve d'un bon jugement dans les situations d'urgences" },
      { id: 67, text: "Sait tenir compte des contraintes du terrain" },
      { id: 4, text: "Est solidaire des décisions prises en commun même s'il n'est pas d'accord" }
    ]
  },
  {
    id: 6,
    title: "Analyse et prise de décision",
    questions: [
      { id: 5, text: "Repère rapidement les dysfonctionnements d'une organisation" },
      { id: 11, text: "Conserve son objectivité dans les situations où il est lui-même impliqué" },
      { id: 17, text: "Possède un excellent coup d'œil, perspicace et critique" },
      { id: 18, text: "A du mal à trancher dans les situations floues" },
      { id: 30, text: "A tendance à remettre à plus tard les décisions à prendre" },
      { id: 35, text: "A du mal à argumenter rationnellement ses points de vue" },
      { id: 42, text: "Fait preuve d'indépendance d'esprit pour décider" },
      { id: 66, text: "A du mal à se décider seul" },
      { id: 71, text: "Sait être logique et rationnel dans l'analyse des problèmes complexes" }
    ]
  },
  {
    id: 7,
    title: "Organisation et méthode",
    questions: [
      { id: 23, text: "A tendance à se polariser sur les détails" },
      { id: 31, text: "Son perfectionnisme nuit à son efficacité" },
      { id: 34, text: "Fait preuve de méthode dans le pilotage de ses projets" },
      { id: 43, text: "Sait concrétiser les idées et les projets" },
      { id: 46, text: "Se plaint souvent du manque de moyens pour atteindre ses objectifs" },
      { id: 55, text: "A du mal à fixer des objectifs clairs et concrets" },
      { id: 58, text: "A tendance à se disperser dans son travail" },
      { id: 59, text: "A du mal à saisir l'ensemble des paramètres d'un problème complexe" },
      { id: 60, text: "Manque de ténacité pour mener à leur terme les projets difficiles" }
    ]
  },
  {
    id: 8,
    title: "Vision et projection",
    questions: [
      { id: 14, text: "Possède une bonne intuition pour imaginer la suite des événements" },
      { id: 19, text: "Se préoccupe peu de la pérennité de ce qu'il met en œuvre" },
      { id: 25, text: "A du mal à se projeter dans son avenir professionnel" },
      { id: 26, text: "A la conviction qu'il peut agir sur le futur et modifier le cours des événements" },
      { id: 38, text: "A du mal à se projeter dans le futur" },
      { id: 41, text: "Manque de bon sens dans les situations confuses et incertaines" },
      { id: 47, text: "Sait prendre de la hauteur pour se donner plus de perspectives sur une situation" },
      { id: 49, text: "Se préoccupe peu de son évolution de carrière" },
      { id: 53, text: "A besoin de réfléchir posément plutôt que de faire confiance en son intuition" }
    ]
  }
];

// Réponses spécifiques de Julien
function generateJulienResponses() {
  // Réponses exactes de Julien par numéro de question
  const julienAnswers = {
    1: 'd', 2: 'd', 3: 'd', 4: 'b', 5: 'd', 6: 'a', 7: 'a', 8: 'd', 9: 'd', 10: 'c',
    11: 'c', 12: 'b', 13: 'a', 14: 'b', 15: 'e', 16: 'b', 17: 'c', 18: 'b', 19: 'd', 20: 'c',
    21: 'b', 22: 'b', 23: 'a', 24: 'a', 25: 'b', 26: 'b', 27: 'a', 28: 'd', 29: 'e', 30: 'e',
    31: 'b', 32: 'c', 33: 'c', 34: 'b', 35: 'b', 36: 'd', 37: 'e', 38: 'd', 39: 'd', 40: 'b',
    41: 'd', 42: 'b', 43: 'b', 44: 'b', 45: 'b', 46: 'd', 47: 'c', 48: 'd', 49: 'b', 50: 'd',
    51: 'b', 52: 'd', 53: 'd', 54: 'a', 55: 'd', 56: 'b', 57: 'b', 58: 'b', 59: 'b', 60: 'b',
    61: 'd', 62: 'd', 63: 'a', 64: 'b', 65: 'b', 66: 'b', 67: 'b', 68: 'd', 69: 'b', 70: 'b',
    71: 'b', 72: 'd'
  };
  
  const responses = {};
  
  // Parcourir chaque section et assigner les réponses de Julien
  sections.forEach(section => {
    section.questions.forEach(question => {
      responses[`${section.id}-${question.id}`] = julienAnswers[question.id];
    });
  });
  
  return responses;
}

// Réponses spécifiques d'Arnaud
function generateArnaudResponses() {
  // Réponses exactes d'Arnaud par numéro de question
  const arnaudAnswers = {
    1: 'a', 2: 'd', 3: 'd', 4: 'c', 5: 'a', 6: 'a', 7: 'a', 8: 'e', 9: 'd', 10: 'b',
    11: 'c', 12: 'b', 13: 'e', 14: 'a', 15: 'e', 16: 'b', 17: 'b', 18: 'b', 19: 'b', 20: 'a',
    21: 'c', 22: 'c', 23: 'd', 24: 'b', 25: 'c', 26: 'a', 27: 'a', 28: 'd', 29: 'd', 30: 'b',
    31: 'd', 32: 'c', 33: 'd', 34: 'd', 35: 'd', 36: 'c', 37: 'b', 38: 'd', 39: 'c', 40: 'c',
    41: 'd', 42: 'a', 43: 'a', 44: 'a', 45: 'a', 46: 'c', 47: 'b', 48: 'd', 49: 'c', 50: 'd',
    51: 'b', 52: 'c', 53: 'd', 54: 'a', 55: 'c', 56: 'a', 57: 'd', 58: 'b', 59: 'd', 60: 'c',
    61: 'a', 62: 'b', 63: 'b', 64: 'b', 65: 'a', 66: 'c', 67: 'b', 68: 'e', 69: 'a', 70: 'd',
    71: 'c', 72: 'b'
  };
  
  const responses = {};
  
  // Parcourir chaque section et assigner les réponses d'Arnaud
  sections.forEach(section => {
    section.questions.forEach(question => {
      responses[`${section.id}-${question.id}`] = arnaudAnswers[question.id];
    });
  });
  
  return responses;
}

// Génération des réponses automatiques avec les vrais IDs de questions
function generateResponses(bias = 'balanced') {
  const responseOptions = ['a', 'b', 'c', 'd', 'e'];
  const responses = {};
  
  // Parcourir chaque section avec les vraies questions
  sections.forEach(section => {
    section.questions.forEach(question => {
      let randomResponse;
      
      // Différents modes de génération
      switch (bias) {
        case 'positive':
          // Favoriser les réponses positives (a, b)
          randomResponse = Math.random() < 0.7 ? 
            responseOptions[Math.floor(Math.random() * 2)] : 
            responseOptions[Math.floor(Math.random() * responseOptions.length)];
          break;
        case 'negative':
          // Favoriser les réponses négatives (d, e)
          randomResponse = Math.random() < 0.7 ? 
            responseOptions[3 + Math.floor(Math.random() * 2)] : 
            responseOptions[Math.floor(Math.random() * responseOptions.length)];
          break;
        case 'neutral':
          // Favoriser les réponses neutres (c)
          randomResponse = Math.random() < 0.5 ? 'c' : 
            responseOptions[Math.floor(Math.random() * responseOptions.length)];
          break;
        default: // balanced
          // Distribution équilibrée
          randomResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];
      }
      
      responses[`${section.id}-${question.id}`] = randomResponse;
    });
  });
  
  return responses;
}

// Fonction pour soumettre le questionnaire avec les réponses d'Arnaud
async function submitArnaudQuestionnaire() {
  try {
    console.log('🚀 Début de la soumission du questionnaire d\'Arnaud...');
    console.log(`📍 URL cible: ${BASE_URL}`);
    console.log('🎯 Utilisation des réponses exactes d\'Arnaud');
    
    // Générer les réponses d'Arnaud
    const responses = generateArnaudResponses();
    console.log(`✅ Chargement des ${Object.keys(responses).length} réponses d'Arnaud`);
    
    // Afficher un échantillon des réponses
    console.log('📋 Échantillon des réponses d\'Arnaud:');
    const sampleKeys = Object.keys(responses).slice(0, 5);
    sampleKeys.forEach(key => {
      const questionId = parseInt(key.split('-')[1]);
      const questionText = sections
        .flatMap(s => s.questions)
        .find(q => q.id === questionId)?.text || 'Question introuvable';
      console.log(`   Q${questionId}: ${responses[key]} - "${questionText.substring(0, 50)}..."`);
    });
    console.log('   ...');
    
    // Informations utilisateur pour Arnaud
    const arnaudUserInfo = {
      firstName: 'Arnaud',
      lastName: 'Example',
      age: '32',
      profession: 'Directeur Commercial',
      email: 'arnaud@example.com'
    };
    
    // Préparer les données pour l'API
    const requestData = {
      userInfo: arnaudUserInfo,
      responses: responses
    };
    
    console.log('👤 Informations d\'Arnaud:');
    console.log(`   Nom: ${arnaudUserInfo.firstName} ${arnaudUserInfo.lastName}`);
    console.log(`   Âge: ${arnaudUserInfo.age} ans`);
    console.log(`   Profession: ${arnaudUserInfo.profession}`);
    console.log(`   Email: ${arnaudUserInfo.email}`);
    
    console.log('📤 Envoi de la requête...');
    
    // Soumettre à l'API
    const response = await fetch(`${BASE_URL}/api/submit-questionnaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'auto-submit-script/1.0'
      },
      body: JSON.stringify(requestData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Questionnaire d\'Arnaud soumis avec succès');
      console.log(`📧 ${result.message || 'Réponses envoyées par email'}`);
      
      // Statistiques des réponses d'Arnaud
      const responseStats = {};
      Object.values(responses).forEach(response => {
        responseStats[response] = (responseStats[response] || 0) + 1;
      });
      
      console.log('📊 Statistiques des réponses d\'Arnaud:');
      console.log(`   A (Tout à fait d'accord): ${responseStats.a || 0} (${Math.round((responseStats.a || 0) / 72 * 100)}%)`);
      console.log(`   B (D'accord): ${responseStats.b || 0} (${Math.round((responseStats.b || 0) / 72 * 100)}%)`);
      console.log(`   C (Neutre): ${responseStats.c || 0} (${Math.round((responseStats.c || 0) / 72 * 100)}%)`);
      console.log(`   D (Pas d'accord): ${responseStats.d || 0} (${Math.round((responseStats.d || 0) / 72 * 100)}%)`);
      console.log(`   E (Pas d'accord du tout): ${responseStats.e || 0} (${Math.round((responseStats.e || 0) / 72 * 100)}%)`);
      
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

// Fonction pour soumettre le questionnaire avec les réponses de Julien
async function submitJulienQuestionnaire() {
  try {
    console.log('🚀 Début de la soumission du questionnaire de Julien...');
    console.log(`📍 URL cible: ${BASE_URL}`);
    console.log('🎯 Utilisation des réponses exactes de Julien');
    
    // Générer les réponses de Julien
    const responses = generateJulienResponses();
    console.log(`✅ Chargement des ${Object.keys(responses).length} réponses de Julien`);
    
    // Afficher un échantillon des réponses
    console.log('📋 Échantillon des réponses de Julien:');
    const sampleKeys = Object.keys(responses).slice(0, 5);
    sampleKeys.forEach(key => {
      const questionId = parseInt(key.split('-')[1]);
      const questionText = sections
        .flatMap(s => s.questions)
        .find(q => q.id === questionId)?.text || 'Question introuvable';
      console.log(`   Q${questionId}: ${responses[key]} - "${questionText.substring(0, 50)}..."`);
    });
    console.log('   ...');
    
    // Informations utilisateur pour Julien
    const julienUserInfo = {
      firstName: 'Julien',
      lastName: 'Example',
      age: '35',
      profession: 'Manager',
      email: 'julien@example.com'
    };
    
    // Préparer les données pour l'API
    const requestData = {
      userInfo: julienUserInfo,
      responses: responses
    };
    
    console.log('👤 Informations de Julien:');
    console.log(`   Nom: ${julienUserInfo.firstName} ${julienUserInfo.lastName}`);
    console.log(`   Âge: ${julienUserInfo.age} ans`);
    console.log(`   Profession: ${julienUserInfo.profession}`);
    console.log(`   Email: ${julienUserInfo.email}`);
    
    console.log('📤 Envoi de la requête...');
    
    // Soumettre à l'API
    const response = await fetch(`${BASE_URL}/api/submit-questionnaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'auto-submit-script/1.0'
      },
      body: JSON.stringify(requestData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Questionnaire de Julien soumis avec succès');
      console.log(`📧 ${result.message || 'Réponses envoyées par email'}`);
      
      // Statistiques des réponses de Julien
      const responseStats = {};
      Object.values(responses).forEach(response => {
        responseStats[response] = (responseStats[response] || 0) + 1;
      });
      
      console.log('📊 Statistiques des réponses de Julien:');
      console.log(`   A (Tout à fait d'accord): ${responseStats.a || 0} (${Math.round((responseStats.a || 0) / 72 * 100)}%)`);
      console.log(`   B (D'accord): ${responseStats.b || 0} (${Math.round((responseStats.b || 0) / 72 * 100)}%)`);
      console.log(`   C (Neutre): ${responseStats.c || 0} (${Math.round((responseStats.c || 0) / 72 * 100)}%)`);
      console.log(`   D (Pas d'accord): ${responseStats.d || 0} (${Math.round((responseStats.d || 0) / 72 * 100)}%)`);
      console.log(`   E (Pas d'accord du tout): ${responseStats.e || 0} (${Math.round((responseStats.e || 0) / 72 * 100)}%)`);
      
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

// Fonction principale pour soumettre le questionnaire
async function submitQuestionnaire(bias = 'balanced') {
  try {
    console.log('🚀 Début de la soumission automatique du questionnaire...');
    console.log(`📍 URL cible: ${BASE_URL}`);
    console.log(`🎯 Mode de réponse: ${bias}`);
    
    // Générer les réponses
    const responses = generateResponses(bias);
    console.log(`✅ Génération de ${Object.keys(responses).length} réponses automatiques`);
    
    // Afficher un échantillon des réponses
    console.log('📋 Échantillon des réponses générées:');
    const sampleKeys = Object.keys(responses).slice(0, 5);
    sampleKeys.forEach(key => {
      const questionId = parseInt(key.split('-')[1]);
      const questionText = sections
        .flatMap(s => s.questions)
        .find(q => q.id === questionId)?.text || 'Question introuvable';
      console.log(`   ${key}: ${responses[key]} - "${questionText.substring(0, 50)}..."`);
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
        'User-Agent': 'auto-submit-script/1.0'
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
      console.log(`   A (Tout à fait d'accord): ${responseStats.a || 0} (${Math.round((responseStats.a || 0) / 72 * 100)}%)`);
      console.log(`   B (D'accord): ${responseStats.b || 0} (${Math.round((responseStats.b || 0) / 72 * 100)}%)`);
      console.log(`   C (Neutre): ${responseStats.c || 0} (${Math.round((responseStats.c || 0) / 72 * 100)}%)`);
      console.log(`   D (Pas d'accord): ${responseStats.d || 0} (${Math.round((responseStats.d || 0) / 72 * 100)}%)`);
      console.log(`   E (Pas d'accord du tout): ${responseStats.e || 0} (${Math.round((responseStats.e || 0) / 72 * 100)}%)`);
      
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
async function submitEvaluation(bias = 'balanced') {
  try {
    console.log('🚀 Début de la soumission automatique en mode évaluation...');
    console.log(`🎯 Mode de réponse: ${bias}`);
    
    const evaluationInfo = {
      evaluatedPerson: {
        firstName: 'Jean',
        lastName: 'Dupont',
        position: 'Manager Commercial',
        ageRange: '35-44'
      },
      evaluator: {
        relationship: 'Supérieur hiérarchique',
        hierarchyLevel: 'N+1'
      },
      evaluatorEmail: 'evaluateur@example.com'
    };
    
    const responses = generateResponses(bias);
    
    console.log('👥 Informations d\'évaluation:');
    console.log(`   Évalué: ${evaluationInfo.evaluatedPerson.firstName} ${evaluationInfo.evaluatedPerson.lastName}`);
    console.log(`   Poste: ${evaluationInfo.evaluatedPerson.position}`);
    console.log(`   Tranche d'âge: ${evaluationInfo.evaluatedPerson.ageRange}`);
    console.log(`   Relation: ${evaluationInfo.evaluator.relationship}`);
    console.log(`   Niveau: ${evaluationInfo.evaluator.hierarchyLevel}`);
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
        'User-Agent': 'auto-submit-script/1.0'
      },
      body: JSON.stringify(requestData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Évaluation soumise avec succès');
      console.log(`📧 ${result.message || 'Évaluation envoyée par email'}`);
      
      // Statistiques des réponses
      const responseStats = {};
      Object.values(responses).forEach(response => {
        responseStats[response] = (responseStats[response] || 0) + 1;
      });
      
      console.log('📊 Statistiques des réponses:');
      console.log(`   A: ${responseStats.a || 0}, B: ${responseStats.b || 0}, C: ${responseStats.c || 0}, D: ${responseStats.d || 0}, E: ${responseStats.e || 0}`);
      
    } else {
      console.log('❌ ERREUR lors de la soumission de l\'évaluation:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${result.error || 'Erreur inconnue'}`);
      if (result.details) {
        console.log(`   Détails: ${result.details}`);
      }
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
  node auto-submit-questionnaire.js [mode] [bias]

Modes disponibles:
  auto          Mode autodiagnostic (défaut)
  evaluation    Mode évaluation d'un collaborateur
  julien        Mode avec les réponses exactes de Julien
  arnaud        Mode avec les réponses exactes d'Arnaud
  both          Les deux modes (auto + evaluation)
  help          Affiche cette aide

Biais de réponses disponibles (pour auto et evaluation):
  balanced      Distribution équilibrée (défaut)
  positive      Favorise les réponses positives (a, b)
  negative      Favorise les réponses négatives (d, e)
  neutral       Favorise les réponses neutres (c)

Exemples:
  node auto-submit-questionnaire.js                    # Mode autodiagnostic équilibré
  node auto-submit-questionnaire.js auto positive      # Mode autodiagnostic avec biais positif
  node auto-submit-questionnaire.js evaluation         # Mode évaluation équilibré
  node auto-submit-questionnaire.js julien             # Soumission avec les réponses de Julien
  node auto-submit-questionnaire.js arnaud             # Soumission avec les réponses d'Arnaud
  node auto-submit-questionnaire.js both negative      # Les deux modes avec biais négatif
  node auto-submit-questionnaire.js auto neutral       # Mode autodiagnostic avec biais neutre

📊 Informations:
  - Le questionnaire contient 72 questions réparties en 8 sections
  - Chaque section contient 9 questions
  - Les réponses vont de A (tout à fait d'accord) à E (pas d'accord du tout)
  - L'API génère automatiquement un rapport Excel et Word
  - Les modes "julien" et "arnaud" utilisent des jeux de réponses prédéfinies spécifiques
`);
}

// Point d'entrée principal
async function main() {
  const mode = process.argv[2] || 'auto';
  const bias = process.argv[3] || 'balanced';
  
  console.log('🔧 Script de soumission automatique du questionnaire RH');
  console.log('═'.repeat(60));
  
  // Valider le biais
  const validBiases = ['balanced', 'positive', 'negative', 'neutral'];
  if (!validBiases.includes(bias)) {
    console.log(`❌ Biais inconnu: ${bias}`);
    console.log(`Biais disponibles: ${validBiases.join(', ')}`);
    process.exit(1);
  }
  
  switch (mode.toLowerCase()) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    case 'auto':
    case 'autodiagnostic':
      await submitQuestionnaire(bias);
      break;
      
    case 'evaluation':
    case 'eval':
      await submitEvaluation(bias);
      break;
      
    case 'julien':
      await submitJulienQuestionnaire();
      break;
      
    case 'arnaud':
      await submitArnaudQuestionnaire();
      break;
      
    case 'both':
    case 'all':
      console.log('🔄 Mode combiné: autodiagnostic + évaluation\n');
      await submitQuestionnaire(bias);
      console.log('\n' + '─'.repeat(60) + '\n');
      await submitEvaluation(bias);
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

module.exports = { submitQuestionnaire, submitEvaluation, submitJulienQuestionnaire, submitArnaudQuestionnaire, generateResponses, generateJulienResponses, generateArnaudResponses }; 