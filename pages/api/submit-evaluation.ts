import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import ExcelJS from 'exceljs';
import { sections, responseOptions } from '../../data/questions';
import { calculateScores, generateScoresTable } from '../../utils/scoreCalculator';
import { generateReportContent } from '../../utils/reportGenerator';
// Les graphiques sont maintenant générés par QuickChart dans wordGenerator
import { generateWordDocument } from '../../utils/wordGenerator';

interface EvaluatedPersonInfo {
  firstName: string;
  lastName: string;
  position: string;
  ageRange: string;
}

interface EvaluatorInfo {
  relationship: string;
  hierarchyLevel?: string;
}

interface EvaluationInfo {
  evaluatedPerson: EvaluatedPersonInfo;
  evaluator: EvaluatorInfo;
  evaluatorEmail: string;
}

interface RequestBody {
  evaluationInfo: EvaluationInfo;
  responses: { [key: string]: string };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { evaluationInfo, responses }: RequestBody = req.body;

    if (!evaluationInfo || !responses) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Calculer les scores
    const scores = calculateScores(responses);
    const scoresTable = generateScoresTable(scores);

    // Créer le fichier Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Évaluation QAP');

    // En-têtes
    worksheet.columns = [
      { header: 'Numéro', key: 'numero', width: 10 },
      { header: 'Question', key: 'question', width: 80 },
      { header: 'Réponse', key: 'reponse', width: 30 }
    ];

    // Style des en-têtes
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1D4E89' }
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Informations de l'évaluation
    worksheet.addRow(['INFORMATIONS ÉVALUATION', '', '']);
    worksheet.addRow(['', '', '']);
    
    // Personne évaluée
    worksheet.addRow(['PERSONNE ÉVALUÉE', '', '']);
    worksheet.addRow(['Prénom', evaluationInfo.evaluatedPerson.firstName, '']);
    worksheet.addRow(['Nom', evaluationInfo.evaluatedPerson.lastName, '']);
    worksheet.addRow(['Poste actuel', evaluationInfo.evaluatedPerson.position, '']);
    worksheet.addRow(['Tranche d\'âge', evaluationInfo.evaluatedPerson.ageRange, '']);
    worksheet.addRow(['', '', '']);
    
    // Évaluateur
    worksheet.addRow(['ÉVALUATEUR', '', '']);
    worksheet.addRow(['Email', evaluationInfo.evaluatorEmail, '']);
    worksheet.addRow(['Relation', evaluationInfo.evaluator.relationship, '']);
    if (evaluationInfo.evaluator.hierarchyLevel) {
      worksheet.addRow(['Niveau hiérarchique', evaluationInfo.evaluator.hierarchyLevel, '']);
    }
    worksheet.addRow(['Date d\'évaluation', new Date().toLocaleDateString('fr-FR'), '']);
    worksheet.addRow(['', '', '']); // Ligne vide

    // Ajouter une nouvelle ligne d'en-têtes pour les réponses
    const headerRow = worksheet.addRow(['Numéro', 'Question', 'Réponse']);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1D4E89' }
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Mapping des réponses pour l'Excel - seulement les lettres
    const excelResponseMapping: { [key: string]: string } = {
      'a': 'a',
      'b': 'b', 
      'c': 'c',
      'd': 'd',
      'e': 'e'
    };

    // Ajouter les réponses
    for (const section of sections) {
      for (const question of section.questions) {
        const responseKey = `${section.id}-${question.id}`;
        const responseValue = responses[responseKey];
        
        if (responseValue) {
          const responseText = excelResponseMapping[responseValue] || responseValue;
          
          worksheet.addRow([
            question.id,
            question.text,
            responseText
          ]);
        }
      }
    }

    // Ajouter une feuille avec les scores par catégorie
    const scoresWorksheet = workbook.addWorksheet('Scores par catégorie');
    scoresWorksheet.columns = [
      { header: 'Critères', key: 'critere', width: 20 },
      { header: 'Score Total', key: 'scoreTotal', width: 15 },
      { header: 'Note sur 5', key: 'noteSur5', width: 15 }
    ];

    // Style des en-têtes
    scoresWorksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1D4E89' }
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Ajouter les scores
    Object.values(scores).forEach(score => {
      scoresWorksheet.addRow({
        critere: score.critere,
        scoreTotal: score.scoreTotal,
        noteSur5: score.noteSur5
      });
    });

    // Créer le buffer Excel
    const excelBuffer = await workbook.xlsx.writeBuffer();

    // Configuration de l'email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const excelFileName = `Evaluation_QAP_${evaluationInfo.evaluatedPerson.firstName}_${evaluationInfo.evaluatedPerson.lastName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Construire le texte de la relation hiérarchique
    let relationshipText = evaluationInfo.evaluator.relationship;
    if (evaluationInfo.evaluator.hierarchyLevel) {
      relationshipText += ` (${evaluationInfo.evaluator.hierarchyLevel})`;
    }

    // Envoyer le premier email avec Excel
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: 'luc.marsal@auramanagement.fr',
      subject: `Nouvelle évaluation QAP - ${evaluationInfo.evaluatedPerson.firstName} ${evaluationInfo.evaluatedPerson.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1d4e89; color: white; padding: 20px; text-align: center;">
            <h1>Nouvelle évaluation QAP reçue</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc;">
            <h2>Personne évaluée</h2>
            <p><strong>Prénom :</strong> ${evaluationInfo.evaluatedPerson.firstName}</p>
            <p><strong>Nom :</strong> ${evaluationInfo.evaluatedPerson.lastName}</p>
            <p><strong>Poste actuel :</strong> ${evaluationInfo.evaluatedPerson.position}</p>
            <p><strong>Tranche d'âge :</strong> ${evaluationInfo.evaluatedPerson.ageRange}</p>
            
            <h2>Évaluateur</h2>
            <p><strong>Email :</strong> ${evaluationInfo.evaluatorEmail}</p>
            <p><strong>Relation avec la personne évaluée :</strong> ${relationshipText}</p>
            <p><strong>Date d'évaluation :</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            
            <h2>Résumé</h2>
            <p>L'évaluation complète de 72 questions a été remplie.</p>
            <p><strong>Réponses par section :</strong></p>
            <ul>
              ${sections.map(section => {
                const sectionResponses = Object.keys(responses).filter(key => key.startsWith(`${section.id}-`));
                return `<li>${section.title}: ${sectionResponses.length}/9 questions</li>`;
              }).join('')}
            </ul>
            
            <div style="background-color: #fff4e6; border: 1px solid #ffd700; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <p><strong>📊 Document Excel joint</strong></p>
              <p><strong>📝 Le rapport d'analyse détaillé sera envoyé dans un second email</strong> (génération en cours...)</p>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Email généré automatiquement par le système d'évaluation QAP</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: excelFileName,
          content: excelBuffer as Buffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    });

    console.log('First email sent successfully');

    // NOUVEAU : Répondre immédiatement à l'utilisateur
    res.status(200).json({ 
      success: true, 
      message: 'Évaluation reçue avec succès. Le rapport d\'analyse sera envoyé par email dans quelques minutes.' 
    });

    // NOUVEAU : Déclencher la génération du rapport en arrière-plan
    console.log('Triggering background report generation...');
    
    // Déclencher l'API de génération de rapport en arrière-plan
    const reportData = {
      type: 'evaluation',
      evaluationInfo,
      scores,
      scoresTable
    };

    // Appel API interne asynchrone (fire and forget)
    try {
      // DEBUG : Afficher tous les headers pour comprendre le problème
      console.log('DEBUG - Request headers for URL construction:', {
        'x-forwarded-proto': req.headers['x-forwarded-proto'],
        'x-forwarded-host': req.headers['x-forwarded-host'],
        'host': req.headers.host,
        'origin': req.headers.origin,
        'referer': req.headers.referer
      });

      // Construction robuste de l'URL
      let baseUrl: string;
      
      // 1. Vérifier si on est sur Vercel avec x-forwarded-host
      if (req.headers['x-forwarded-host']) {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        baseUrl = `${protocol}://${req.headers['x-forwarded-host']}`;
        console.log('Using x-forwarded-host for baseUrl');
      }
      // 2. Fallback avec host normal
      else if (req.headers.host) {
        const protocol = req.headers['x-forwarded-proto'] || 
                        (req.headers.host.includes('localhost') ? 'http' : 'https');
        baseUrl = `${protocol}://${req.headers.host}`;
        console.log('Using host header for baseUrl');
      }
      // 3. Hardcoded fallback pour production Vercel
      else {
        baseUrl = 'https://questionnaire-rh-git-main-maximemarsal18-gmailcoms-projects.vercel.app';
        console.log('Using hardcoded fallback for baseUrl');
      }
      
      console.log('Final baseUrl:', baseUrl);
      const fullApiUrl = `${baseUrl}/api/generate-report`;
      console.log('Full API URL for background call:', fullApiUrl);
      
      // Déclencher l'API de génération de rapport avec plus de debugging
      const startTime = Date.now();
      fetch(fullApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'evaluation-internal-call'
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
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          type: error.constructor.name
        });
      });
      
      console.log('Background report generation request initiated');
    } catch (error) {
      console.error('Failed to trigger background report generation:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    }

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'évaluation:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'envoi de l\'évaluation',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 