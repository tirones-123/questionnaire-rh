import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import ExcelJS from 'exceljs';
import { sections, responseOptions } from '../../data/questions';
import { calculateScores, generateScoresTable } from '../../utils/scoreCalculator';
import { generateReportContent } from '../../utils/reportGenerator';
// Les graphiques sont maintenant générés par QuickChart dans wordGenerator
import { generateWordDocument } from '../../utils/wordGenerator';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userInfo, responses }: RequestBody = req.body;

    if (!userInfo || !responses) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Calculer les scores
    const scores = calculateScores(responses);
    const scoresTable = generateScoresTable(scores);

    // Créer le fichier Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Réponses Questionnaire RH');

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

    // Informations utilisateur
    worksheet.addRow(['Informations', '', '']);
    worksheet.addRow(['Prénom', userInfo.firstName, '']);
    worksheet.addRow(['Nom', userInfo.lastName, '']);
    worksheet.addRow(['Âge', userInfo.age, '']);
    worksheet.addRow(['Profession', userInfo.profession, '']);
    worksheet.addRow(['Email', userInfo.email, '']);
    worksheet.addRow(['Date de completion', new Date().toLocaleDateString('fr-FR'), '']);
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

    const excelFileName = `Questionnaire_RH_${userInfo.firstName}_${userInfo.lastName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Envoyer le premier email avec Excel
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: 'luc.marsal@auramanagement.fr',
      subject: `Nouveau questionnaire RH - ${userInfo.firstName} ${userInfo.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1d4e89; color: white; padding: 20px; text-align: center;">
            <h1>Nouveau questionnaire RH reçu</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc;">
            <h2>Informations du participant</h2>
            <p><strong>Prénom :</strong> ${userInfo.firstName}</p>
            <p><strong>Nom :</strong> ${userInfo.lastName}</p>
            <p><strong>Âge :</strong> ${userInfo.age} ans</p>
            <p><strong>Profession :</strong> ${userInfo.profession}</p>
            <p><strong>Email :</strong> ${userInfo.email}</p>
            <p><strong>Date de completion :</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            
            <h2>Résumé</h2>
            <p>Le questionnaire complet de 72 questions a été rempli.</p>
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
            <p>Email généré automatiquement par le système de questionnaire RH</p>
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
      message: 'Questionnaire reçu avec succès. Le rapport d\'analyse sera envoyé par email dans quelques minutes.' 
    });

    // NOUVEAU : Déclencher la génération du rapport en arrière-plan
    console.log('Triggering background report generation...');
    
    // Déclencher l'API de génération de rapport en arrière-plan
    const reportData = {
      type: 'autodiagnostic',
      userInfo,
      scores,
      scoresTable
    };

    // Appel API interne asynchrone (fire and forget)
    try {
      // Construire l'URL de base
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers.host;
      const baseUrl = `${protocol}://${host}`;
      
      // Déclencher l'API de génération de rapport
      fetch(`${baseUrl}/api/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      }).catch(error => {
        console.error('Error triggering background report generation:', error);
      });
      
      console.log('Background report generation triggered successfully');
    } catch (error) {
      console.error('Failed to trigger background report generation:', error);
    }

  } catch (error) {
    console.error('Erreur lors de l\'envoi du questionnaire:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'envoi du questionnaire',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 