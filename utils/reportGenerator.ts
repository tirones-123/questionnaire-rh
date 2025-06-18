import OpenAI from 'openai';
import { ScoreDetails } from './scoreCalculator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ReportData {
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

export async function generateReportContent(data: ReportData): Promise<string> {
  // Préparer le tableau de scores pour le prompt
  const scoresTableText = data.scoresTable
    .map(row => `${row.critere}\t${row.question}\t${row.score}\t${row.sens}`)
    .join('\n');
  
  // Préparer le résumé des scores par critère
  const scoresSummary = Object.values(data.scores)
    .map(s => `${s.critere}: Score total = ${s.scoreTotal}, Note sur 5 = ${s.noteSur5}`)
    .join('\n');
  
  const isEvaluation = data.type === 'evaluation';
  const evaluatorName = data.evaluator?.firstName || '';
  const evaluatedName = data.person.firstName;
  
  const systemPrompt = `Tu es consultant·e RH senior, expert·e de l'analyse du potentiel.
Ta mission : transformer les résultats d'un questionnaire d'évaluation en rapport structuré, nuancé et exploitable.

📎 Sources disponibles
- Tableau de scores globaux (1 – 5) pour chacun des 12 critères.
- Tableau de réponses détaillées avec critère, texte de l'item, score (0-4), et valence (normal/inversé).
- Référentiel officiel "12 critères 2025" : définitions, points d'attention, leviers de développement.

📏 Barème d'interprétation
Score ≥ 4,2 : Point fort
Score 3,3 – 4,1 : Dimension solide
Score 2,3 – 3,2 : Axe de progression
Score < 2,3 : Point de vigilance

⚠️ Traitement impératif des items inversés
- Un score élevé doit toujours être interprété positivement, quelle que soit la valence.
- Ne jamais révéler qu'un item est "inversé" ou "normal".
- L'analyse reflète le sens réel de la réponse, jamais la forme de l'item.

${isEvaluation ? `
🔄 Mode évaluation
- Le rapport présente le point de vue de ${evaluatorName} qui évalue ${evaluatedName}.
- Varier les formulations : "selon ${evaluatorName}", "d'après ${evaluatorName}", "${evaluatorName} observe que", "${evaluatorName} note que", etc.
- Utiliser uniquement les prénoms, jamais les noms de famille.
` : ''}

🧠 Structure du rapport à produire

RAPPORT ${isEvaluation ? "D'ÉVALUATION DU POTENTIEL" : "D'AUTODIAGNOSTIC"}

${data.person.firstName} ${data.person.lastName}, ${data.person.age} ans, ${data.person.profession}
${isEvaluation ? `Évalué par ${data.evaluator?.firstName} ${data.evaluator?.lastName}` : ''}

1. Analyse critère par critère

FAMILLE « VOULOIR » (MOTEUR PERSONNEL)

AMBITION
Volonté de progresser dans sa carrière en construisant un parcours porteur de sens
Score : [x,x] – [Interprétation]
[Analyse qualitative – 120 à 180 mots]

[Répéter pour les 12 critères dans l'ordre]

2. Analyse du profil d'ensemble
[Résumé transversal – 200 à 300 mots]

3. Points de vigilance
- 4 à 8 points, bullet liste

4. Recommandations de développement
- 1 à 2 recommandations par point de vigilance

5. Conclusion synthétique
[80 à 120 mots]

Règles :
- Utiliser la virgule comme séparateur décimal (3,4 et non 3.4)
- Ton professionnel, clair, bienveillant
- Analyses de 120-180 mots par critère
- Longueur totale : 1600-2300 mots`;

  const userPrompt = `Génère le rapport complet basé sur ces résultats :

Informations personnelles :
- Prénom : ${data.person.firstName}
- Nom : ${data.person.lastName}
- Âge : ${data.person.age} ans
- Profession : ${data.person.profession}
${isEvaluation ? `- Évaluateur : ${data.evaluator?.firstName} ${data.evaluator?.lastName}` : ''}

Scores par critère :
${scoresSummary}

Détail des réponses :
Critère\tQuestion\tScore\tValence
${scoresTableText}

Génère le rapport en respectant EXACTEMENT la structure demandée.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    throw new Error('Impossible de générer le rapport');
  }
} 