// Utilitaire pour calculer les scores du questionnaire

import { questions } from '../data/questions';

// Mapping des valeurs pour les questions normales et inversées
const scoreMapping = {
  normal: { a: 4, b: 3, c: 2, d: 1, e: 0 },
  inverted: { a: 0, b: 1, c: 2, d: 3, e: 4 }
};

// Détail des questions avec leur sens (normal ou inversé)
export const questionDetails = [
  { num: 1, sens: 'normal', critere: 'Ambition' },
  { num: 2, sens: 'inversé', critere: 'Vision' },
  { num: 3, sens: 'inversé', critere: 'Communication' },
  { num: 4, sens: 'normal', critere: 'Esprit d\'équipe' },
  { num: 5, sens: 'normal', critere: 'Pertinence' },
  { num: 6, sens: 'normal', critere: 'Décision' },
  { num: 7, sens: 'normal', critere: 'Sens du résultat' },
  { num: 8, sens: 'inversé', critere: 'Leadership' },
  { num: 9, sens: 'normal', critere: 'Initiative' },
  { num: 10, sens: 'normal', critere: 'Organisation' },
  { num: 11, sens: 'normal', critere: 'Recul' },
  { num: 12, sens: 'inversé', critere: 'Résilience' },
  { num: 13, sens: 'inversé', critere: 'Ambition' },
  { num: 14, sens: 'normal', critere: 'Vision' },
  { num: 15, sens: 'inversé', critere: 'Communication' },
  { num: 16, sens: 'normal', critere: 'Esprit d\'équipe' },
  { num: 17, sens: 'normal', critere: 'Pertinence' },
  { num: 18, sens: 'inversé', critere: 'Décision' },
  { num: 19, sens: 'inversé', critere: 'Sens du résultat' },
  { num: 20, sens: 'normal', critere: 'Leadership' },
  { num: 21, sens: 'normal', critere: 'Initiative' },
  { num: 22, sens: 'inversé', critere: 'Organisation' },
  { num: 23, sens: 'inversé', critere: 'Recul' },
  { num: 24, sens: 'normal', critere: 'Résilience' },
  { num: 25, sens: 'inversé', critere: 'Ambition' },
  { num: 26, sens: 'normal', critere: 'Vision' },
  { num: 27, sens: 'normal', critere: 'Communication' },
  { num: 28, sens: 'inversé', critere: 'Esprit d\'équipe' },
  { num: 29, sens: 'inversé', critere: 'Pertinence' },
  { num: 30, sens: 'inversé', critere: 'Décision' },
  { num: 31, sens: 'inversé', critere: 'Sens du résultat' },
  { num: 32, sens: 'inversé', critere: 'Leadership' },
  { num: 33, sens: 'inversé', critere: 'Initiative' },
  { num: 34, sens: 'normal', critere: 'Organisation' },
  { num: 35, sens: 'inversé', critere: 'Recul' },
  { num: 36, sens: 'normal', critere: 'Résilience' },
  { num: 37, sens: 'normal', critere: 'Ambition' },
  { num: 38, sens: 'inversé', critere: 'Vision' },
  { num: 39, sens: 'inversé', critere: 'Communication' },
  { num: 40, sens: 'inversé', critere: 'Esprit d\'équipe' },
  { num: 41, sens: 'inversé', critere: 'Pertinence' },
  { num: 42, sens: 'normal', critere: 'Décision' },
  { num: 43, sens: 'normal', critere: 'Sens du résultat' },
  { num: 44, sens: 'normal', critere: 'Leadership' },
  { num: 45, sens: 'inversé', critere: 'Initiative' },
  { num: 46, sens: 'inversé', critere: 'Organisation' },
  { num: 47, sens: 'normal', critere: 'Recul' },
  { num: 48, sens: 'inversé', critere: 'Résilience' },
  { num: 49, sens: 'inversé', critere: 'Ambition' },
  { num: 50, sens: 'inversé', critere: 'Vision' },
  { num: 51, sens: 'normal', critere: 'Communication' },
  { num: 52, sens: 'inversé', critere: 'Esprit d\'équipe' },
  { num: 53, sens: 'inversé', critere: 'Pertinence' },
  { num: 54, sens: 'normal', critere: 'Décision' },
  { num: 55, sens: 'inversé', critere: 'Sens du résultat' },
  { num: 56, sens: 'normal', critere: 'Leadership' },
  { num: 57, sens: 'inversé', critere: 'Initiative' },
  { num: 58, sens: 'inversé', critere: 'Organisation' },
  { num: 59, sens: 'inversé', critere: 'Recul' },
  { num: 60, sens: 'inversé', critere: 'Résilience' },
  { num: 61, sens: 'normal', critere: 'Ambition' },
  { num: 62, sens: 'normal', critere: 'Vision' },
  { num: 63, sens: 'normal', critere: 'Communication' },
  { num: 64, sens: 'normal', critere: 'Esprit d\'équipe' },
  { num: 65, sens: 'normal', critere: 'Pertinence' },
  { num: 66, sens: 'inversé', critere: 'Décision' },
  { num: 67, sens: 'normal', critere: 'Sens du résultat' },
  { num: 68, sens: 'inversé', critere: 'Leadership' },
  { num: 69, sens: 'normal', critere: 'Initiative' },
  { num: 70, sens: 'normal', critere: 'Organisation' },
  { num: 71, sens: 'normal', critere: 'Recul' },
  { num: 72, sens: 'normal', critere: 'Résilience' }
];

export interface ScoreDetails {
  critere: string;
  scoreTotal: number;
  noteSur5: number;
  famille: string;
  items: Array<{
    numero: number;
    question: string;
    reponse: string;
    score: number;
    sens: string;
  }>;
}

export function calculateScores(responses: { [key: string]: string }): { [key: string]: ScoreDetails } {
  const scores: { [key: string]: ScoreDetails } = {};
  
  // Initialiser les critères
  const criteres = ['Ambition', 'Initiative', 'Résilience', 'Vision', 'Recul', 'Pertinence', 
                    'Organisation', 'Décision', 'Sens du résultat', 'Communication', 
                    'Esprit d\'équipe', 'Leadership'];
  
  const familles: { [key: string]: string } = {
    'Ambition': 'VOULOIR',
    'Initiative': 'VOULOIR',
    'Résilience': 'VOULOIR',
    'Vision': 'PENSER',
    'Recul': 'PENSER',
    'Pertinence': 'PENSER',
    'Organisation': 'AGIR',
    'Décision': 'AGIR',
    'Sens du résultat': 'AGIR',
    'Communication': 'ENSEMBLE',
    'Esprit d\'équipe': 'ENSEMBLE',
    'Leadership': 'ENSEMBLE'
  };
  
  // Initialiser les scores
  criteres.forEach(critere => {
    scores[critere] = {
      critere,
      scoreTotal: 0,
      noteSur5: 0,
      famille: familles[critere],
      items: []
    };
  });
  
  // Calculer les scores pour chaque question
  questionDetails.forEach((detail, index) => {
    const questionNum = detail.num;
    const responseKey = Object.keys(responses).find(key => {
      const parts = key.split('-');
      return parseInt(parts[1]) === questionNum;
    });
    
    if (responseKey && responses[responseKey]) {
      const response = responses[responseKey].toLowerCase() as 'a' | 'b' | 'c' | 'd' | 'e';
      const sens = detail.sens === 'inversé' ? 'inverted' : 'normal';
      const score = scoreMapping[sens][response] || 0;
      
      // Trouver la question correspondante
      const questionText = getQuestionText(questionNum);
      
      scores[detail.critere].items.push({
        numero: questionNum,
        question: questionText,
        reponse: response,
        score: score,
        sens: detail.sens
      });
      
      scores[detail.critere].scoreTotal += score;
    }
  });
  
  // Calculer la note sur 5 pour chaque critère
  Object.values(scores).forEach(score => {
    if (score.items.length > 0) {
      // Chaque critère a 6 questions, max score = 24
      score.noteSur5 = (score.scoreTotal / 24) * 5;
      // Arrondir à 1 décimale
      score.noteSur5 = Math.round(score.noteSur5 * 10) / 10;
    }
  });
  
  return scores;
}

function getQuestionText(questionNum: number): string {
  // Parcourir toutes les sections pour trouver la question
  for (const section of questions) {
    const question = section.questions.find(q => q.id === questionNum);
    if (question) {
      return question.text;
    }
  }
  return '';
}

export function generateScoresTable(scores: { [key: string]: ScoreDetails }) {
  const table: Array<{
    critere: string;
    question: string;
    score: number;
    sens: string;
  }> = [];
  
  Object.values(scores).forEach(scoreDetail => {
    scoreDetail.items.forEach(item => {
      table.push({
        critere: scoreDetail.critere,
        question: item.question,
        score: item.score,
        sens: item.sens
      });
    });
  });
  
  return table;
} 