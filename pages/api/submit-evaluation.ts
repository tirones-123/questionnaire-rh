import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import ExcelJS from 'exceljs';
import { sections, responseOptions } from '../../data/questions';
import { calculateScores, generateScoresTable } from '../../utils/scoreCalculator';
import { generateReportContent } from '../../utils/reportGenerator';
import { generateRadarChart, generateSortedBarChart, generateFamilyBarChart } from '../../utils/chartGenerator';
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

    // PREMIER EMAIL : Envoyer immédiatement l'Excel
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

    // Répondre IMMÉDIATEMENT au client pour libérer l'interface
    res.status(200).json({ 
      success: true, 
      message: 'Évaluation envoyée avec succès. Le rapport détaillé sera envoyé par email dans quelques minutes.' 
    });

    // GÉNÉRATION DU RAPPORT EN ARRIÈRE-PLAN (fire and forget)
    // Cette partie s'exécute après la réponse au client
    (async () => {
      try {
        console.log('Starting background report generation...');
        
        // Extraire prénom et nom de l'évaluateur depuis l'email si possible
        const evaluatorFirstName = evaluationInfo.evaluatorEmail.split('@')[0].split('.')[0] || 'L\'évaluateur';
        const evaluatorLastName = evaluationInfo.evaluatorEmail.split('@')[0].split('.')[1] || '';

        // Générer le contenu du rapport avec OpenAI
        const reportContent = await generateReportContent({
          type: 'evaluation',
          person: {
            firstName: evaluationInfo.evaluatedPerson.firstName,
            lastName: evaluationInfo.evaluatedPerson.lastName,
            age: evaluationInfo.evaluatedPerson.ageRange.split('-')[0], // Prendre le début de la tranche
            profession: evaluationInfo.evaluatedPerson.position
          },
          evaluator: {
            firstName: evaluatorFirstName,
            lastName: evaluatorLastName
          },
          scores,
          scoresTable
        });

        // Générer les graphiques
        const radarChart = generateRadarChart(scores);
        const sortedChart = generateSortedBarChart(scores);
        const familyChart = generateFamilyBarChart(scores);

        // Générer le document Word
        const wordBuffer = await generateWordDocument({
          type: 'evaluation',
          person: {
            firstName: evaluationInfo.evaluatedPerson.firstName,
            lastName: evaluationInfo.evaluatedPerson.lastName,
            age: evaluationInfo.evaluatedPerson.ageRange.split('-')[0],
            profession: evaluationInfo.evaluatedPerson.position
          },
          evaluator: {
            firstName: evaluatorFirstName,
            lastName: evaluatorLastName
          },
          reportContent,
          charts: {
            radar: radarChart,
            sorted: sortedChart,
            family: familyChart
          }
        });

        const wordFileName = `Rapport_Evaluation_${evaluationInfo.evaluatedPerson.firstName}_${evaluationInfo.evaluatedPerson.lastName}_${new Date().toISOString().split('T')[0]}.docx`;

        // SECOND EMAIL : Envoyer le rapport Word
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: 'luc.marsal@auramanagement.fr',
          subject: `Rapport d'évaluation - ${evaluationInfo.evaluatedPerson.firstName} ${evaluationInfo.evaluatedPerson.lastName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1d4e89; color: white; padding: 20px; text-align: center;">
                <h1>Rapport d'évaluation du potentiel</h1>
              </div>
              
              <div style="padding: 20px; background-color: #f8fafc;">
                <h2>Rapport généré pour :</h2>
                <p><strong>Personne évaluée :</strong> ${evaluationInfo.evaluatedPerson.firstName} ${evaluationInfo.evaluatedPerson.lastName}</p>
                <p><strong>Évaluateur :</strong> ${evaluationInfo.evaluatorEmail}</p>
                <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                
                <div style="background-color: #e6f3ff; border: 1px solid #1d4e89; padding: 15px; border-radius: 5px; margin-top: 20px;">
                  <p><strong>📄 Document Word joint</strong></p>
                  <p>Le rapport complet d'évaluation du potentiel avec graphiques et recommandations personnalisées.</p>
                </div>
              </div>
              
              <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                <p>Email généré automatiquement par le système d'évaluation QAP</p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: wordFileName,
              content: wordBuffer,
              contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }
          ]
        });
        
        console.log('Background report sent successfully');
      } catch (error) {
        console.error('Erreur lors de la génération du rapport en arrière-plan:', error);
        
        // Envoyer un email d'erreur si la génération échoue
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: 'luc.marsal@auramanagement.fr',
            subject: `ERREUR - Rapport non généré - ${evaluationInfo.evaluatedPerson.firstName} ${evaluationInfo.evaluatedPerson.lastName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
                  <h1>Erreur de génération du rapport</h1>
                </div>
                
                <div style="padding: 20px; background-color: #f8fafc;">
                  <p>Une erreur s'est produite lors de la génération du rapport d'évaluation pour :</p>
                  <p><strong>Personne évaluée :</strong> ${evaluationInfo.evaluatedPerson.firstName} ${evaluationInfo.evaluatedPerson.lastName}</p>
                  <p><strong>Évaluateur :</strong> ${evaluationInfo.evaluatorEmail}</p>
                  <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                  
                  <p><strong>Détails de l'erreur :</strong></p>
                  <pre style="background-color: #f3f4f6; padding: 10px; overflow: auto;">${error instanceof Error ? error.message : 'Erreur inconnue'}</pre>
                  
                  <p>Les réponses ont bien été enregistrées dans le fichier Excel envoyé précédemment.</p>
                </div>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email d\'erreur:', emailError);
        }
      }
    })().catch(err => {
      // Catch any unhandled errors to prevent crashes
      console.error('Unhandled error in background task:', err);
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'évaluation:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'envoi de l\'évaluation',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 