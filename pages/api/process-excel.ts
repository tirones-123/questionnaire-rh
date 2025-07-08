import { NextApiRequest, NextApiResponse } from 'next';
import ExcelJS from 'exceljs';
import { calculateScores, generateScoresTable } from '../../utils/scoreCalculator';
import { sections } from '../../data/questions';

interface ProcessExcelRequest {
  fileName: string;
  fileData: string; // base64
}

interface UserInfo {
  firstName: string;
  lastName: string;
  age: string;
  profession: string;
  email: string;
}

interface EvaluationInfo {
  evaluatedPerson: {
    firstName: string;
    lastName: string;
    position: string;
    ageRange: string;
  };
  evaluator: {
    relationship: string;
    hierarchyLevel?: string;
  };
  evaluatorEmail: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, fileData }: ProcessExcelRequest = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Nom de fichier et données manquants' });
    }

    console.log('Processing Excel file:', fileName);

    // Convertir base64 en Buffer
    const buffer = Buffer.from(fileData, 'base64');

    // Créer un workbook ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    // Obtenir la première feuille
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
      return res.status(400).json({ error: 'Impossible de lire la feuille Excel' });
    }

    console.log('Worksheet name:', worksheet.name);

    // Détecter le type de fichier (autodiagnostic ou évaluation)
    const worksheetName = worksheet.name;
    const isEvaluation = worksheetName.includes('Évaluation QAP') || worksheetName.includes('Evaluation QAP');
    
    console.log('File type detected:', isEvaluation ? 'evaluation' : 'autodiagnostic');

    // Extraire les informations utilisateur
    let userInfo: UserInfo | null = null;
    let evaluationInfo: EvaluationInfo | null = null;

    if (isEvaluation) {
      // Traiter un fichier d'évaluation
      evaluationInfo = await extractEvaluationInfo(worksheet);
      console.log('Evaluation info extracted:', evaluationInfo);
    } else {
      // Traiter un fichier d'autodiagnostic
      userInfo = await extractUserInfo(worksheet);
      console.log('User info extracted:', userInfo);
    }

    // Extraire les réponses
    const responses = await extractResponses(worksheet);
    console.log('Responses extracted:', Object.keys(responses).length, 'responses');

    // Extraire la question ouverte
    const openQuestion = await extractOpenQuestion(worksheet);
    console.log('Open question extracted:', openQuestion ? 'yes' : 'no');

    // Validation des données
    if (!isEvaluation && !userInfo) {
      return res.status(400).json({ error: 'Impossible d\'extraire les informations utilisateur' });
    }

    if (isEvaluation && !evaluationInfo) {
      return res.status(400).json({ error: 'Impossible d\'extraire les informations d\'évaluation' });
    }

    if (Object.keys(responses).length === 0) {
      return res.status(400).json({ error: 'Aucune réponse trouvée dans le fichier' });
    }

    // Calculer les scores
    const scores = calculateScores(responses);
    const scoresTable = generateScoresTable(scores);

    console.log('Scores calculated successfully');

    // Répondre immédiatement au client
    res.status(200).json({ 
      success: true, 
      message: 'Fichier traité avec succès. Le rapport sera envoyé par email dans quelques minutes.',
      type: isEvaluation ? 'evaluation' : 'autodiagnostic',
      responsesCount: Object.keys(responses).length
    });

    // Déclencher la génération du rapport en arrière-plan
    console.log('Triggering background report generation...');
    
    try {
      // Construction de l'URL pour l'API de génération de rapport
      const protocol = req.headers['x-forwarded-proto'] || 
                     (req.headers.host?.includes('localhost') ? 'http' : 'https');
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const baseUrl = `${protocol}://${host}`;
      const apiUrl = `${baseUrl}/api/generate-report`;

      console.log('API URL for background call:', apiUrl);

      const reportData = isEvaluation ? {
        type: 'evaluation',
        evaluationInfo,
        scores,
        scoresTable,
        openQuestion
      } : {
        type: 'autodiagnostic',
        userInfo,
        scores,
        scoresTable,
        openQuestion
      };

      // Déclencher l'API de génération de rapport
      const startTime = Date.now();
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'excel-upload-internal-call'
        },
        body: JSON.stringify(reportData),
      }).then(response => {
        const duration = Date.now() - startTime;
        console.log(`Background API call completed in ${duration}ms`);
        console.log('Background API response status:', response.status);
        
        if (!response.ok) {
          console.error('Background API failed with status:', response.status);
          return response.text().then(text => {
            console.error('Background API error response:', text);
          });
        } else {
          console.log('Background API call successful!');
        }
      }).catch(error => {
        const duration = Date.now() - startTime;
        console.error(`Background API call failed after ${duration}ms:`, error);
      });

    } catch (error) {
      console.error('Failed to trigger background report generation:', error);
    }

  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({ 
      error: 'Erreur lors du traitement du fichier Excel',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}

async function extractUserInfo(worksheet: ExcelJS.Worksheet): Promise<UserInfo | null> {
  try {
    const userInfo: Partial<UserInfo> = {};

    // Parcourir les lignes pour trouver les informations utilisateur
    worksheet.eachRow((row, rowNumber) => {
      const cellA = row.getCell(1).text;
      const cellB = row.getCell(2).text;

      if (cellA === 'Prénom' && cellB) {
        userInfo.firstName = cellB;
      } else if (cellA === 'Nom' && cellB) {
        userInfo.lastName = cellB;
      } else if (cellA === 'Âge' && cellB) {
        userInfo.age = cellB;
      } else if (cellA === 'Profession' && cellB) {
        userInfo.profession = cellB;
      } else if (cellA === 'Email' && cellB) {
        userInfo.email = cellB;
      }
    });

    // Vérifier que toutes les informations nécessaires sont présentes
    if (userInfo.firstName && userInfo.lastName && userInfo.age && userInfo.profession) {
      return {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        age: userInfo.age,
        profession: userInfo.profession,
        email: userInfo.email || 'non-renseigné'
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting user info:', error);
    return null;
  }
}

async function extractEvaluationInfo(worksheet: ExcelJS.Worksheet): Promise<EvaluationInfo | null> {
  try {
    const evaluationInfo: Partial<EvaluationInfo> = {
      evaluatedPerson: {} as any,
      evaluator: {} as any
    };

    // Parcourir les lignes pour trouver les informations d'évaluation
    worksheet.eachRow((row, rowNumber) => {
      const cellA = row.getCell(1).text;
      const cellB = row.getCell(2).text;

      // Informations de la personne évaluée
      if (cellA === 'Prénom' && cellB) {
        evaluationInfo.evaluatedPerson!.firstName = cellB;
      } else if (cellA === 'Nom' && cellB) {
        evaluationInfo.evaluatedPerson!.lastName = cellB;
      } else if (cellA === 'Poste actuel' && cellB) {
        evaluationInfo.evaluatedPerson!.position = cellB;
      } else if (cellA === 'Tranche d\'âge' && cellB) {
        evaluationInfo.evaluatedPerson!.ageRange = cellB;
      }
      // Informations de l'évaluateur
      else if (cellA === 'Email' && cellB) {
        evaluationInfo.evaluatorEmail = cellB;
      } else if (cellA === 'Relation' && cellB) {
        evaluationInfo.evaluator!.relationship = cellB;
      } else if (cellA === 'Niveau hiérarchique' && cellB) {
        evaluationInfo.evaluator!.hierarchyLevel = cellB;
      }
    });

    // Vérifier que toutes les informations nécessaires sont présentes
    if (evaluationInfo.evaluatedPerson?.firstName && 
        evaluationInfo.evaluatedPerson?.lastName &&
        evaluationInfo.evaluatedPerson?.position &&
        evaluationInfo.evaluatedPerson?.ageRange &&
        evaluationInfo.evaluatorEmail &&
        evaluationInfo.evaluator?.relationship) {
      
      return evaluationInfo as EvaluationInfo;
    }

    return null;
  } catch (error) {
    console.error('Error extracting evaluation info:', error);
    return null;
  }
}

async function extractResponses(worksheet: ExcelJS.Worksheet): Promise<{ [key: string]: string }> {
  try {
    const responses: { [key: string]: string } = {};

    // Trouver la ligne d'en-tête des réponses
    let headerRowNumber = 0;
    worksheet.eachRow((row, rowNumber) => {
      const cellA = row.getCell(1).text;
      const cellB = row.getCell(2).text;
      const cellC = row.getCell(3).text;
      
      if (cellA === 'Numéro' && cellB === 'Question' && cellC === 'Réponse') {
        headerRowNumber = rowNumber;
      }
    });

    if (headerRowNumber === 0) {
      throw new Error('En-tête des réponses non trouvé');
    }

    console.log('Response header found at row:', headerRowNumber);

    // Extraire les réponses à partir de la ligne suivante
    for (let rowNumber = headerRowNumber + 1; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const questionNumber = row.getCell(1).text;
      const questionText = row.getCell(2).text;
      const responseText = row.getCell(3).text;

      // Vérifier que la ligne contient bien une réponse
      if (questionNumber && responseText && /^[1-9]\d*$/.test(questionNumber)) {
        const questionId = parseInt(questionNumber);
        
        // Trouver la section correspondante à la question
        const section = sections.find(s => 
          s.questions.some(q => q.id === questionId)
        );

        if (section) {
          const responseKey = `${section.id}-${questionId}`;
          responses[responseKey] = responseText.toLowerCase();
          console.log(`Question ${questionId} -> Section ${section.id}: ${responseText}`);
        }
      }
    }

    return responses;
  } catch (error) {
    console.error('Error extracting responses:', error);
    return {};
  }
}

async function extractOpenQuestion(worksheet: ExcelJS.Worksheet): Promise<string | null> {
  try {
    let openQuestionResponse = null;

    // Parcourir les lignes pour trouver la question complémentaire
    worksheet.eachRow((row, rowNumber) => {
      const cellA = row.getCell(1).text;
      const cellB = row.getCell(2).text;

      // Chercher la réponse à la question complémentaire
      if (cellA === 'Réponse' && cellB && cellB.trim()) {
        // Vérifier si la ligne précédente contient la question complémentaire
        const prevRow = worksheet.getRow(rowNumber - 1);
        const prevCellB = prevRow.getCell(2).text;
        
        if (prevCellB && prevCellB.includes('interrogations souhaitez-vous clarifier')) {
          openQuestionResponse = cellB.trim();
        }
      }
    });

    return openQuestionResponse;
  } catch (error) {
    console.error('Error extracting open question:', error);
    return null;
  }
} 