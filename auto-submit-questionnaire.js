#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'https://questionnaire-rh-git-main-maximemarsal18-gmailcoms-projects.vercel.app';
const API_ENDPOINT = '/api/submit-questionnaire';

// Données utilisateur de test
const testUsers = [
  {
    firstName: 'Marie',
    lastName: 'Dupont',
    age: '35',
    profession: 'Manager Commercial',
    email: 'marie.dupont@example.com'
  },
  {
    firstName: 'Jean',
    lastName: 'Martin',
    age: '42',
    profession: 'Directeur Marketing',
    email: 'jean.martin@example.com'
  },
  {
    firstName: 'Sophie',
    lastName: 'Bernard',
    age: '28',
    profession: 'Chef de Projet IT',
    email: 'sophie.bernard@example.com'
  },
  {
    firstName: 'Pierre',
    lastName: 'Durand',
    age: '38',
    profession: 'Responsable RH',
    email: 'pierre.durand@example.com'
  }
];

// Structure des sections et questions (copiée depuis votre data/questions.ts)
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

// Options de réponse
const responseOptions = ['a', 'b', 'c', 'd', 'e'];

// Générateur de profils de réponses prédéfinis
const responseProfiles = {
  'high_performer': {
    name: 'Performant élevé',
    weights: { a: 0.4, b: 0.3, c: 0.2, d: 0.08, e: 0.02 } // Favorise les réponses positives
  },
  'average': {
    name: 'Profil équilibré',
    weights: { a: 0.2, b: 0.25, c: 0.3, d: 0.15, e: 0.1 } // Distribution équilibrée
  },
  'conservative': {
    name: 'Profil conservateur',
    weights: { a: 0.1, b: 0.2, c: 0.4, d: 0.2, e: 0.1 } // Favorise les réponses neutres
  },
  'low_confidence': {
    name: 'Confiance faible',
    weights: { a: 0.05, b: 0.15, c: 0.3, d: 0.3, e: 0.2 } // Favorise les réponses négatives
  }
};

// Fonction pour générer une réponse selon un profil
function generateWeightedResponse(profile) {
  const weights = responseProfiles[profile].weights;
  const random = Math.random();
  let cumulative = 0;
  
  for (const [option, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (random <= cumulative) {
      return option;
    }
  }
  return 'c'; // Fallback
}

// Fonction pour générer des réponses pour toutes les questions
function generateResponses(profile = 'average') {
  const responses = {};
  
  sections.forEach(section => {
    section.questions.forEach(question => {
      const key = `${section.id}-${question.id}`;
      responses[key] = generateWeightedResponse(profile);
    });
  });
  
  return responses;
}

// Fonction pour faire une requête HTTPS
function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Fonction principale pour soumettre un questionnaire
async function submitQuestionnaire(userInfo, profile = 'average', dryRun = false) {
  console.log(`\n🎯 Génération d'un questionnaire pour ${userInfo.firstName} ${userInfo.lastName}`);
  console.log(`📊 Profil de réponses: ${responseProfiles[profile].name}`);
  
  // Générer les réponses
  const responses = generateResponses(profile);
  
  // Compter les réponses générées
  const responseCount = Object.keys(responses).length;
  console.log(`✅ ${responseCount} réponses générées`);
  
  // Afficher un échantillon des réponses si demandé
  if (process.argv.includes('--verbose')) {
    console.log('\n📝 Échantillon des réponses:');
    Object.entries(responses).slice(0, 10).forEach(([key, value]) => {
      const [sectionId, questionId] = key.split('-');
      const section = sections.find(s => s.id === parseInt(sectionId));
      const question = section?.questions.find(q => q.id === parseInt(questionId));
      console.log(`  ${key}: ${value} - "${question?.text.substring(0, 50)}..."`);
    });
  }
  
  if (dryRun) {
    console.log('🔄 Mode test - questionnaire non soumis');
    return { success: true, dryRun: true };
  }
  
  // Préparer les données pour l'API
  const payload = {
    userInfo: userInfo,
    responses: responses
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'AutoSubmit-Script/1.0'
    }
  };
  
  try {
    console.log('📤 Soumission du questionnaire...');
    const response = await makeRequest(BASE_URL + API_ENDPOINT, options, payload);
    
    if (response.success) {
      console.log('✅ Questionnaire soumis avec succès!');
      console.log(`📧 Response: ${response.statusCode}`);
      return { success: true, response: response };
    } else {
      console.error('❌ Erreur lors de la soumission:');
      console.error(`Status: ${response.statusCode}`);
      console.error(`Body: ${response.body}`);
      return { success: false, error: response };
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return { success: false, error: error };
  }
}

// Fonction pour soumettre plusieurs questionnaires
async function submitMultipleQuestionnaires(count = 1, profiles = ['average'], dryRun = false) {
  console.log(`\n🚀 Lancement de ${count} soumission(s) de questionnaire(s)`);
  console.log(`🌐 URL cible: ${BASE_URL}${API_ENDPOINT}`);
  
  const results = [];
  
  for (let i = 0; i < count; i++) {
    const userIndex = i % testUsers.length;
    const profileIndex = i % profiles.length;
    
    const user = { ...testUsers[userIndex] };
    // Ajouter un suffixe pour éviter les doublons
    if (count > 1) {
      user.email = user.email.replace('@', `+${i + 1}@`);
      user.firstName = `${user.firstName}${i + 1}`;
    }
    
    const profile = profiles[profileIndex];
    
    const result = await submitQuestionnaire(user, profile, dryRun);
    results.push(result);
    
    // Pause entre les soumissions pour éviter de surcharger le serveur
    if (i < count - 1) {
      console.log('⏳ Pause de 2 secondes...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Résumé
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n📊 RÉSUMÉ:');
  console.log(`✅ Succès: ${successful}`);
  console.log(`❌ Échecs: ${failed}`);
  console.log(`📈 Taux de succès: ${((successful / results.length) * 100).toFixed(1)}%`);
  
  return results;
}

// Interface en ligne de commande
async function main() {
  const args = process.argv.slice(2);
  
  // Aide
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🎯 Script d'auto-soumission de questionnaires RH

Usage:
  node auto-submit-questionnaire.js [options]

Options:
  --count <n>        Nombre de questionnaires à soumettre (défaut: 1)
  --profile <name>   Profil de réponses: high_performer, average, conservative, low_confidence
  --profiles <list>  Liste de profils séparés par des virgules (ex: average,high_performer)
  --dry-run         Mode test sans soumission réelle
  --verbose         Affichage détaillé des réponses générées
  --help, -h        Afficher cette aide

Exemples:
  node auto-submit-questionnaire.js
  node auto-submit-questionnaire.js --count 3 --profile high_performer
  node auto-submit-questionnaire.js --count 5 --profiles average,conservative --dry-run
  node auto-submit-questionnaire.js --verbose --dry-run
    `);
    return;
  }
  
  // Paramètres
  const countIndex = args.indexOf('--count');
  const count = countIndex !== -1 ? parseInt(args[countIndex + 1]) || 1 : 1;
  
  const profileIndex = args.indexOf('--profile');
  const profilesIndex = args.indexOf('--profiles');
  
  let profiles = ['average'];
  if (profileIndex !== -1) {
    profiles = [args[profileIndex + 1] || 'average'];
  } else if (profilesIndex !== -1) {
    profiles = (args[profilesIndex + 1] || 'average').split(',');
  }
  
  // Valider les profils
  profiles = profiles.filter(p => responseProfiles[p]);
  if (profiles.length === 0) {
    profiles = ['average'];
  }
  
  const dryRun = args.includes('--dry-run');
  
  console.log('🎯 Auto-Submit Questionnaire RH');
  console.log('================================');
  
  // Vérifier les profils disponibles
  if (args.includes('--list-profiles')) {
    console.log('\n📋 Profils de réponses disponibles:');
    Object.entries(responseProfiles).forEach(([key, profile]) => {
      console.log(`  ${key}: ${profile.name}`);
    });
    return;
  }
  
  // Lancer les soumissions
  await submitMultipleQuestionnaires(count, profiles, dryRun);
}

// Lancer le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  submitQuestionnaire,
  submitMultipleQuestionnaires,
  generateResponses,
  testUsers,
  responseProfiles
}; 