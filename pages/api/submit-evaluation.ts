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

    // GÉNÉRATION DU RAPPORT - En mode synchrone
    try {
      console.log('Starting report generation process...');
      
      // Extraire prénom et nom de l'évaluateur depuis l'email si possible
      const evaluatorFirstName = evaluationInfo.evaluatorEmail.split('@')[0].split('.')[0] || 'L\'évaluateur';
      const evaluatorLastName = evaluationInfo.evaluatorEmail.split('@')[0].split('.')[1] || '';

      // Générer le contenu du rapport avec OpenAI
      console.log('Calling OpenAI for report generation...');
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
      console.log('Report content generated successfully');
      console.log('Report content length:', reportContent.length);

      // Générer les graphiques
      console.log('Starting chart generation...');
      let radarChart: string;
      let sortedChart: string;
      let familyChart: string;
      
      try {
        // Utiliser les nouvelles fonctions améliorées avec entités HTML
        const { generateRadarChartImproved, generateSortedBarChartImproved, generateFamilyBarChartImproved } = await import('../../utils/chartGeneratorImproved');
        
        radarChart = generateRadarChartImproved(scores);
        console.log('Radar chart SVG generated with improved encoding, length:', radarChart.length);
      } catch (chartError) {
        console.error('Error generating radar chart:', chartError);
        throw chartError;
      }
      
      try {
        const { generateSortedBarChartImproved } = await import('../../utils/chartGeneratorImproved');
        sortedChart = generateSortedBarChartImproved(scores);
        console.log('Sorted chart SVG generated with improved encoding, length:', sortedChart.length);
      } catch (chartError) {
        console.error('Error generating sorted chart:', chartError);
        throw chartError;
      }
      
      try {
        const { generateFamilyBarChartImproved } = await import('../../utils/chartGeneratorImproved');
        familyChart = generateFamilyBarChartImproved(scores);
        console.log('Family chart SVG generated with improved encoding, length:', familyChart.length);
      } catch (chartError) {
        console.error('Error generating family chart:', chartError);
        throw chartError;
      }

      // Générer le document Word
      console.log('Starting Word document generation...');
      let wordBuffer: Buffer;
      try {
        // Essayer d'abord Canvas (meilleure gestion des accents)
        try {
          const { generateWordDocumentWithCanvas } = await import('../../utils/wordGeneratorWithCanvas');
          console.log('Using Canvas generator (with proper French accents)');
          
          wordBuffer = await generateWordDocumentWithCanvas({
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
            scores // Passer les scores pour générer les graphiques
          });
          console.log('Word document generated successfully with Canvas, buffer size:', wordBuffer.length);
        } catch (canvasError) {
          console.warn('Canvas generation failed, falling back to Sharp:', canvasError);
          
          // Fallback vers Sharp
          wordBuffer = await generateWordDocument({
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
          console.log('Word document generated successfully with Sharp fallback, buffer size:', wordBuffer.length);
        }
      } catch (wordError) {
        console.error('Error generating Word document:', wordError);
        console.error('Error stack:', wordError instanceof Error ? wordError.stack : 'No stack');
        throw wordError;
      }

      const wordFileName = `Rapport_Evaluation_${evaluationInfo.evaluatedPerson.firstName}_${evaluationInfo.evaluatedPerson.lastName}_${new Date().toISOString().split('T')[0]}.docx`;

      // SECOND EMAIL : Envoyer le rapport Word
      console.log('Preparing to send report email...');
      console.log('Email to:', 'luc.marsal@auramanagement.fr');
      console.log('Attachment filename:', wordFileName);
      console.log('Attachment size:', wordBuffer.length, 'bytes');
      
      try {
        const emailResult = await transporter.sendMail({
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
        
        console.log('Email sent successfully:', emailResult.messageId);
        console.log('Report generation and sending completed successfully');
        
        // Répondre au client
        res.status(200).json({ 
          success: true, 
          message: 'Évaluation et rapport envoyés avec succès.' 
        });
        
      } catch (emailError) {
        console.error('Error sending report email:', emailError);
        console.error('Email error details:', emailError instanceof Error ? emailError.stack : 'No stack');
        throw emailError;
      }
      
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
      
      // Envoyer un email d'erreur
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
      
      // Répondre au client avec l'erreur
      res.status(500).json({ 
        error: 'L\'évaluation a été enregistrée mais une erreur est survenue lors de la génération du rapport.',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'évaluation:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'envoi de l\'évaluation',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 