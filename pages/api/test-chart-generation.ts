import { NextApiRequest, NextApiResponse } from 'next';
import { calculateScores, generateScoresTable } from '../../utils/scoreCalculator';
import { generateRadarChart, generateSortedBarChart, generateFamilyBarChart } from '../../utils/chartGenerator';
import { generateWordDocument } from '../../utils/wordGenerator';
import fs from 'fs';

interface UserInfo {
  firstName: string;
  lastName: string;
  age: string;
  profession: string;
  email: string;
}

interface RequestBody {
  userInfo: UserInfo;
  responses: { [key: string]: string };
}

// Contenu de rapport statique pour les tests
function generateMockReportContent(userInfo: UserInfo): string {
  return `RAPPORT D'AUTODIAGNOSTIC

${userInfo.firstName} ${userInfo.lastName}, ${userInfo.age} ans, ${userInfo.profession}

1. Analyse critère par critère

FAMILLE « VOULOIR » (MOTEUR PERSONNEL)

AMBITION
Volonté de progresser dans sa carrière en construisant un parcours porteur de sens
Score : 4,0 – Point fort
L'analyse de ce critère révèle une ambition structurée et cohérente. On observe une volonté affirmée de progression professionnelle, accompagnée d'une capacité à se projeter dans l'avenir avec réalisme. Cette ambition constitue un véritable moteur dans le développement de carrière.

INITIATIVE
Besoin de prendre des initiatives et d'impulser des projets
Score : 3,5 – Dimension solide
Ce profil démontre une propension marquée à agir avec autonomie. L'énergie interne est manifeste, permettant d'initier des projets sans attendre de sollicitation externe. Cette posture constitue un atout précieux dans des environnements en évolution.

RÉSILIENCE
Persévérance face aux tensions psychologiques et physiologiques
Score : 3,8 – Dimension solide
La capacité à maintenir ses efforts sur la durée est bien présente. Il s'agit d'une robustesse qui permet de tenir le cap même dans des contextes exigeants, avec une remarquable force de continuité.

FAMILLE « PENSER » (INTELLIGENCE DES SITUATIONS)

VISION
Intuition pour imaginer l'avenir, anticiper et innover
Score : 3,2 – Axe de progression
Cette dimension présente un potentiel de développement intéressant. La capacité à anticiper les évolutions pourrait être renforcée par une approche plus systématique de la veille et de la prospective.

RECUL
Capacité d'analyse objective et synthétique avec distance critique
Score : 3,7 – Dimension solide
Le sens du recul s'exprime par une aptitude à analyser les situations complexes avec objectivité. Cette faculté de prise de hauteur renforce la crédibilité dans les processus de pilotage.

PERTINENCE
Compréhension instantanée, diagnostic rapide par intuition
Score : 3,4 – Dimension solide
La capacité à formuler des diagnostics pertinents dans des contextes mouvants est présente. Le sens critique est développé, permettant de repérer les signaux importants.

FAMILLE « AGIR » (EFFICACITÉ DANS L'ACTION)

ORGANISATION
Structuration du travail pour l'efficacité collective et individuelle
Score : 2,8 – Axe de progression
Cette dimension mériterait d'être renforcée. Une approche plus méthodique dans la structuration des activités pourrait améliorer significativement l'efficacité globale.

DÉCISION
Aptitude à trancher vite en contexte incertain
Score : 3,1 – Axe de progression
La capacité à prendre des décisions rapides en situation d'incertitude présente des marges de progression. Un travail sur la confiance en ses intuitions pourrait être bénéfique.

SENS DU RÉSULTAT
Attention aux résultats concrets, pragmatisme
Score : 3,9 – Dimension solide
L'attention portée aux résultats concrets est manifeste. Cette posture pragmatique permet une exécution fluide et fiable des projets.

FAMILLE « ENSEMBLE » (POSTURE RELATIONNELLE)

COMMUNICATION
Écoute et dialogue ouvert, authentique
Score : 4,1 – Point fort
La communication se distingue par sa qualité, sa clarté et son authenticité. Cette posture constitue un socle robuste pour toute fonction où la relation humaine est centrale.

ESPRIT D'ÉQUIPE
Inscription de l'action dans un projet collectif, cohésion
Score : 3,6 – Dimension solide
L'esprit d'équipe se manifeste dans la manière de coopérer et de soutenir les collègues. Cette orientation collaborative favorise la dynamique collective.

LEADERSHIP
Capacité à mobiliser un groupe, charisme et entraînement
Score : 3,3 – Dimension solide
Le leadership présente un potentiel intéressant, avec une capacité à entraîner l'adhésion. Cette posture permet de piloter des équipes en créant de la cohésion.

2. Analyse du profil d'ensemble

Ce profil présente un équilibre intéressant entre les différentes dimensions évaluées. Les points forts se situent principalement dans les domaines relationnels et motivationnels, créant une base solide pour le développement professionnel.

3. Points de vigilance

- Développer une approche plus méthodique dans l'organisation du travail
- Renforcer la capacité de prise de décision en contexte incertain
- Améliorer la vision prospective et l'anticipation des évolutions

4. Recommandations de développement

- Organisation : mettre en place des outils de planification et de suivi plus structurés
- Décision : s'entraîner à la prise de décision rapide dans des situations simulées
- Vision : développer une veille active et des méthodes de prospective

5. Conclusion synthétique

Ce profil révèle un potentiel solide, particulièrement dans les dimensions relationnelles et motivationnelles. Les axes de progression identifiés offrent des leviers de développement concrets pour optimiser l'efficacité opérationnelle.`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userInfo, responses }: RequestBody = req.body;

    if (!userInfo || !responses) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    console.log('🧪 Test de génération des graphiques...');

    // Calculer les scores
    console.log('📊 Calcul des scores...');
    const scores = calculateScores(responses);
    const scoresTable = generateScoresTable(scores);
    console.log('✅ Scores calculés:', Object.keys(scores).length, 'critères');

    // Générer les graphiques
    console.log('🎨 Génération des graphiques SVG...');
    let radarChart: string;
    let sortedChart: string;
    let familyChart: string;
    
    try {
      radarChart = generateRadarChart(scores);
      console.log('✅ Graphique radar généré, taille:', radarChart.length, 'caractères');
      
      sortedChart = generateSortedBarChart(scores);
      console.log('✅ Graphique trié généré, taille:', sortedChart.length, 'caractères');
      
      familyChart = generateFamilyBarChart(scores);
      console.log('✅ Graphique par famille généré, taille:', familyChart.length, 'caractères');
      
      // Sauvegarder les SVG pour inspection
      fs.writeFileSync('test-output-radar.svg', radarChart);
      fs.writeFileSync('test-output-sorted.svg', sortedChart);
      fs.writeFileSync('test-output-family.svg', familyChart);
      console.log('📁 SVG sauvegardés dans les fichiers test-output-*.svg');
      
    } catch (chartError) {
      console.error('❌ Erreur de génération des graphiques:', chartError);
      return res.status(500).json({ 
        error: 'Erreur lors de la génération des graphiques',
        details: chartError instanceof Error ? chartError.message : 'Erreur inconnue'
      });
    }

    // Générer le contenu du rapport (version mock pour éviter OpenAI)
    console.log('📝 Génération du contenu du rapport (version test)...');
    const reportContent = generateMockReportContent(userInfo);
    console.log('✅ Contenu du rapport généré, taille:', reportContent.length, 'caractères');

    // Générer le document Word
    console.log('📄 Génération du document Word...');
    let wordBuffer: Buffer;
    try {
      wordBuffer = await generateWordDocument({
        type: 'autodiagnostic',
        person: userInfo,
        reportContent,
        charts: {
          radar: radarChart,
          sorted: sortedChart,
          family: familyChart
        }
      });
      console.log('✅ Document Word généré, taille:', wordBuffer.length, 'bytes');
      
      // Sauvegarder le document Word
      fs.writeFileSync('test-output-rapport.docx', wordBuffer);
      console.log('📁 Document Word sauvegardé: test-output-rapport.docx');
      
    } catch (wordError) {
      console.error('❌ Erreur de génération du document Word:', wordError);
      return res.status(500).json({ 
        error: 'Erreur lors de la génération du document Word',
        details: wordError instanceof Error ? wordError.message : 'Erreur inconnue'
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Test de génération réussi !',
      results: {
        scoresCount: Object.keys(scores).length,
        reportContentLength: reportContent.length,
        chartSizes: {
          radar: radarChart.length,
          sorted: sortedChart.length,
          family: familyChart.length
        },
        wordDocumentSize: wordBuffer.length,
        outputFiles: [
          'test-output-radar.svg',
          'test-output-sorted.svg', 
          'test-output-family.svg',
          'test-output-rapport.docx'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors du test',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 