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

CONTEXTE DES CRITÈRES - Base tes analyses sur ces définitions et principes :

AMBITION : Volonté de progresser en élargissant ses responsabilités. Peut être ancienne/récente, managériale/expertise/entrepreneuriale. Mesure la force motrice, l'implication et la capacité à affronter les obstacles.

INITIATIVE : Dynamisme et besoin d'agir sans attendre. Énergie interne constante, autonomie. Trois niveaux : suiveur/réactif/entrepreneur.

RÉSILIENCE : Persévérance dans les tensions. Dimensions physiologique (résistance à l'effort) et psychologique (face aux conflits). Force de continuité dans la durée.

VISION : Intuition pour imaginer l'avenir. Repose sur curiosité, intuition et imagination. Démarche proactive tournée vers le changement.

RECUL : Analyse objective et rationnelle. Distance par rapport aux événements et à soi. Approche analytique et synthétique complémentaires.

PERTINENCE : Compréhension instantanée par intuition. Diagnostic rapide, bon sens, esprit critique. Lecture fine et instinctive des enjeux.

ORGANISATION : Structuration permettant l'efficacité. Hiérarchiser, planifier, déléguer. Clarté et respect des délais avec souplesse.

DÉCISION : Trancher rapidement dans l'incertitude. Indépendance d'esprit, intégration de données nouvelles, positionnement clair.

SENS DU RÉSULTAT : Attention aux résultats concrets. Pragmatisme et efficacité. Actions utiles et adaptées aux besoins du terrain.

COMMUNICATION : Écoute et dialogue ouvert. Authenticité, clarté, fluidité du contenu. Empathie et création d'un espace de confiance.

ESPRIT D'ÉQUIPE : Action dans un projet collectif. Communique sur son travail, s'intéresse aux autres, partage compétences. Maintient la cohésion.

LEADERSHIP : Susciter l'adhésion par sa personnalité. Conviction, engagement, séduction. Effet d'entraînement vers un but commun.

STRUCTURE EXACTE À RESPECTER :

${promptType.toUpperCase()}

1. Analyse critère par critère

FAMILLE « VOULOIR » (MOTEUR PERSONNEL)

AMBITION
La volonté de progresser dans sa carrière en élargissant le champ de ses responsabilités et en construisant un parcours porteur de sens
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

INITIATIVE
Le dynamisme d'une personne, le besoin de prendre des initiatives et d'impulser des projets sans attendre l'évolution des événements
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

RÉSILIENCE
Faire preuve de persévérance et d'opiniâtreté dans les situations de tensions psychologiques et physiologiques
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

FAMILLE « PENSER » (INTELLIGENCE DES SITUATIONS)

VISION
Faire preuve d'intuition pour imaginer l'avenir afin de mieux gérer l'instant présent en préparant et anticipant le futur avec des idées novatrices
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

RECUL
Prendre du recul sur les événements et sur les hommes pour étudier avec objectivité et rationalité une situation avec un esprit analytique et synthétique à la fois
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

PERTINENCE
La compréhension instantanée d'une situation par l'intuition et la perspicacité
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

FAMILLE « AGIR » (EFFICACITÉ DANS L'ACTION)

ORGANISATION
L'attachement à une structuration du travail permettant une efficacité collective et individuelle
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

DÉCISION
La capacité à trancher et agir rapidement face à l'urgence et aux changements de l'environnement
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

SENS DU RÉSULTAT
L'attention portée aux résultats concrets, avec une action ancrée dans les réalités opérationnelles
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

FAMILLE « ENSEMBLE » (POSTURE RELATIONNELLE)

COMMUNICATION
Être à l'écoute et favoriser un dialogue ouvert où chacun peut s'exprimer librement
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

ESPRIT D'ÉQUIPE
L'aptitude à inscrire son action dans un projet collectif, en valorisant la cohésion du groupe
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

LEADERSHIP
La faculté de susciter l'adhésion et de mobiliser un groupe autour d'un projet par sa personnalité
Score : X,X – [Interprétation selon barème]
[Analyse qualitative – 120 à 180 mots]

2. Analyse du profil d'ensemble
[Résumé transversal – 200 à 300 mots]

3. Points de vigilance
- [4 à 8 points, format bullet]
Exemples de vigilances à considérer selon les profils :
- Forte ambition + faible esprit d'équipe = risque pour l'harmonie collective
- Forte initiative + faible recul = risque d'imprudence
- Fort sens du résultat + faible vision = risque de ne pas innover
- Forte communication + faible résilience = risque d'évitement du conflit

4. Recommandations de développement
- [1 à 2 recommandations par point de vigilance]
Exemples d'actions concrètes :
- Coaching sur projet professionnel, prise de décision, leadership
- Missions transverses pour développer la vision systémique
- Contextes permettant l'erreur comme apprentissage
- Indicateurs clairs et bilans d'action réguliers

5. Conclusion synthétique
[80 à 120 mots]

BARÈME D'INTERPRÉTATION :
≥ 4,2 : Point fort
3,3 – 4,1 : Dimension solide  
2,3 – 3,2 : Axe de progression
< 2,3 : Point de vigilance

RÈGLES CRITIQUES :
- Utiliser EXACTEMENT les titres et sous-titres du modèle
- TOUJOURS commencer par le titre "1. Analyse critère par critère" avant la première famille
- Inclure TOUTES les 4 familles avec leurs 3 critères chacune (12 critères au total)
- Respecter l'ordre des 12 critères
- Jamais mentionner "item", "score sur 4", "question inversée"
- Virgule comme séparateur décimal (3,4 et non 3.4)
- Analyses fluides et nuancées, pas de répétitions mécaniques
- S'inspirer des principes et mécanismes décrits pour chaque critère
- Intégrer les dimensions spécifiques (ex: ambition managériale/expertise/entrepreneuriale)
- Utiliser les niveaux de développement quand pertinent (ex: suiveur/réactif/entrepreneur pour l'initiative)`;

  const userPrompt = `Voici les données à analyser :

SCORES GLOBAUX PAR CRITÈRE :
Critère\tNote sur 5
${globalScoresText}

DÉTAIL DES RÉPONSES :
Critère\tQuestion\tScore\tValence
${scoresTableText}

Génère le rapport complet en respectant EXACTEMENT la structure demandée.

IMPORTANT : Le rapport DOIT COMMENCER par le titre de section "1. Analyse critère par critère" sur une ligne seule, AVANT la première famille.`;

  try {
    console.log('Calling OpenAI API...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      console.error('OpenAI returned empty content');
      throw new Error('La génération du rapport a échoué : contenu vide');
    }

    console.log('Report generated successfully');
    return content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    
    if (error instanceof Error) {
      // Erreur spécifique OpenAI
      if (error.message.includes('401') || error.message.includes('Incorrect API key')) {
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