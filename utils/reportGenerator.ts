import OpenAI from 'openai';
import { ScoreDetails } from './scoreCalculator';

interface GenerateReportParams {
  type: 'autodiagnostic' | 'evaluation';
  person: {
    firstName: string;
    lastName: string;
    age: string;
    profession: string;
  };
  evaluator?: {
    firstName: string;
    lastName: string;
  };
  scores: { [key: string]: ScoreDetails };
  scoresTable: Array<{
    critere: string;
    question: string;
    score: number;
    sens: string;
  }>;
}

export async function generateReportContent(params: GenerateReportParams): Promise<string> {
  const { type, person, evaluator, scores, scoresTable } = params;

  // Vérifier la clé API
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not defined in environment variables');
    throw new Error('Configuration error: OpenAI API key is missing');
  }

  console.log('Starting report generation with OpenAI...');
  console.log('Report type:', type);
  console.log('Person:', person.firstName, person.lastName);

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  // Préparer le tableau des scores pour le prompt
  const scoresTableText = scoresTable
    .map(row => `${row.critere}\t${row.question}\t${row.score}\t${row.sens}`)
    .join('\n');

  // Préparer le tableau des scores globaux
  const globalScoresText = Object.values(scores)
    .map(score => `${score.critere}\t${score.noteSur5.toFixed(1)}`)
    .join('\n');

  const promptType = type === 'evaluation' 
    ? `Rapport d'évaluation du potentiel de : ${person.firstName} ${person.lastName}, ${person.age} ans, ${person.profession}
évalué par ${evaluator?.firstName || 'un évaluateur'} ${evaluator?.lastName || ''}`
    : `Rapport d'autodiagnostic de ${person.firstName} ${person.lastName}, ${person.age} ans, ${person.profession}`;

  const evaluationInstructions = type === 'evaluation'
    ? `IMPORTANT : Ce rapport est basé sur l'évaluation faite par ${evaluator?.firstName || 'l\'évaluateur'}. 
Dans les parties 1 et 5 du rapport, variez les formulations pour rappeler que c'est le point de vue de l'évaluateur :
- "Selon ${evaluator?.firstName || 'l\'évaluateur'}"
- "D'après ${evaluator?.firstName || 'l\'évaluateur'}"
- "Dans la perception de ${evaluator?.firstName || 'l\'évaluateur'}"
- "${evaluator?.firstName || 'L\'évaluateur'} observe que"
- "Du point de vue de ${evaluator?.firstName || 'l\'évaluateur'}"
Utilisez uniquement le prénom de l'évaluateur, jamais le nom complet.`
    : '';

  const systemPrompt = `Tu es consultant·e RH senior, expert·e de l'analyse du potentiel.
Ta mission : transformer les résultats d'un questionnaire d'évaluation en rapport structuré, nuancé et exploitable pour la personne évaluée et son/sa manager, en respectant scrupuleusement la mise en forme du modèle.

${evaluationInstructions}

STRUCTURE EXACTE À RESPECTER :

${promptType.toUpperCase()}

1. Analyse critère par critère

FAMILLE « VOULOIR » (MOTEUR PERSONNEL)

AMBITION
Volonté de progresser dans sa carrière en construisant un parcours porteur de sens
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

[Continuer pour les 12 critères dans l'ordre exact du modèle]

2. Analyse du profil d'ensemble
[Résumé transversal – 200 à 300 mots]

3. Points de vigilance
- [4 à 8 points, format bullet]

4. Recommandations de développement
- [1 à 2 recommandations par point de vigilance]

5. Conclusion synthétique
[80 à 120 mots]

BARÈME D'INTERPRÉTATION :
≥ 4,2 : Point fort
3,3 – 4,1 : Dimension solide  
2,3 – 3,2 : Axe de progression
< 2,3 : Point de vigilance

RÈGLES CRITIQUES :
- Utiliser EXACTEMENT les titres et sous-titres du modèle
- Respecter l'ordre des 12 critères
- Jamais mentionner "item", "score sur 4", "question inversée"
- Virgule comme séparateur décimal (3,4 et non 3.4)
- Analyses fluides et nuancées, pas de répétitions mécaniques`;

  const userPrompt = `Voici les données à analyser :

SCORES GLOBAUX PAR CRITÈRE :
Critère\tNote sur 5
${globalScoresText}

DÉTAIL DES RÉPONSES :
Critère\tQuestion\tScore\tValence
${scoresTableText}

Génère le rapport complet en respectant EXACTEMENT la structure demandée.`;

  try {
    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      console.error('OpenAI returned empty content');
      throw new Error('La génération du rapport a échoué : contenu vide');
    }

    console.log('Report generated successfully, length:', content.length);
    return content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    
    if (error instanceof Error) {
      // Erreur spécifique OpenAI
      if (error.message.includes('401')) {
        throw new Error('Erreur d\'authentification OpenAI : vérifiez votre clé API');
      }
      if (error.message.includes('429')) {
        throw new Error('Limite de taux OpenAI atteinte : réessayez dans quelques secondes');
      }
      if (error.message.includes('500') || error.message.includes('503')) {
        throw new Error('Service OpenAI temporairement indisponible');
      }
    }
    
    throw new Error('Erreur lors de la génération du rapport : ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
  }
} 