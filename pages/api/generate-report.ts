import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { generateReportContent } from '../../utils/reportGenerator';
import { generateWordDocument } from '../../utils/wordGenerator';

interface ReportData {
  type: 'autodiagnostic' | 'evaluation';
  userInfo?: {
    firstName: string;
    lastName: string;
    age: string;
    profession: string;
    email: string;
  };
  evaluationInfo?: {
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
  };
  scores: { [key: string]: any };
  scoresTable: Array<{
    critere: string;
    question: string;
    score: number;
    sens: string;
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const reportData: ReportData = req.body;
    
    console.log('Background report generation started');
    console.log('Report type:', reportData.type);
    
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

    try {
      // Générer le contenu du rapport avec OpenAI
      console.log('Calling OpenAI for report generation...');
      let reportContent: string;
      
      if (reportData.type === 'autodiagnostic') {
        reportContent = await generateReportContent({
          type: 'autodiagnostic',
          person: reportData.userInfo!,
          scores: reportData.scores,
          scoresTable: reportData.scoresTable
        });
      } else {
        // Extraire prénom et nom de l'évaluateur depuis l'email si possible
        const evaluatorFirstName = reportData.evaluationInfo!.evaluatorEmail.split('@')[0].split('.')[0] || 'L\'évaluateur';
        const evaluatorLastName = reportData.evaluationInfo!.evaluatorEmail.split('@')[0].split('.')[1] || '';
        
        reportContent = await generateReportContent({
          type: 'evaluation',
          person: {
            firstName: reportData.evaluationInfo!.evaluatedPerson.firstName,
            lastName: reportData.evaluationInfo!.evaluatedPerson.lastName,
            age: reportData.evaluationInfo!.evaluatedPerson.ageRange.split('-')[0],
            profession: reportData.evaluationInfo!.evaluatedPerson.position
          },
          evaluator: {
            firstName: evaluatorFirstName,
            lastName: evaluatorLastName
          },
          scores: reportData.scores,
          scoresTable: reportData.scoresTable
        });
      }
      
      console.log('Report content generated successfully');
      console.log('Report content length:', reportContent.length);

      // Générer le document Word
      console.log('Starting Word document generation...');
      let wordBuffer: Buffer;
      
      if (reportData.type === 'autodiagnostic') {
        wordBuffer = await generateWordDocument({
          type: 'autodiagnostic',
          person: reportData.userInfo!,
          reportContent,
          scores: reportData.scores
        });
      } else {
        const evaluatorFirstName = reportData.evaluationInfo!.evaluatorEmail.split('@')[0].split('.')[0] || 'L\'évaluateur';
        const evaluatorLastName = reportData.evaluationInfo!.evaluatorEmail.split('@')[0].split('.')[1] || '';
        
        wordBuffer = await generateWordDocument({
          type: 'evaluation',
          person: {
            firstName: reportData.evaluationInfo!.evaluatedPerson.firstName,
            lastName: reportData.evaluationInfo!.evaluatedPerson.lastName,
            age: reportData.evaluationInfo!.evaluatedPerson.ageRange.split('-')[0],
            profession: reportData.evaluationInfo!.evaluatedPerson.position
          },
          evaluator: {
            firstName: evaluatorFirstName,
            lastName: evaluatorLastName
          },
          reportContent,
          scores: reportData.scores
        });
      }
      
      console.log('Word document generated successfully, buffer size:', wordBuffer.length);

      // Préparer le nom du fichier et l'email
      let wordFileName: string;
      let subject: string;
      let personName: string;
      
      if (reportData.type === 'autodiagnostic') {
        wordFileName = `Rapport_Autodiagnostic_${reportData.userInfo!.firstName}_${reportData.userInfo!.lastName}_${new Date().toISOString().split('T')[0]}.docx`;
        subject = `Rapport d'analyse - ${reportData.userInfo!.firstName} ${reportData.userInfo!.lastName}`;
        personName = `${reportData.userInfo!.firstName} ${reportData.userInfo!.lastName}`;
      } else {
        wordFileName = `Rapport_Evaluation_${reportData.evaluationInfo!.evaluatedPerson.firstName}_${reportData.evaluationInfo!.evaluatedPerson.lastName}_${new Date().toISOString().split('T')[0]}.docx`;
        subject = `Rapport d'évaluation - ${reportData.evaluationInfo!.evaluatedPerson.firstName} ${reportData.evaluationInfo!.evaluatedPerson.lastName}`;
        personName = `${reportData.evaluationInfo!.evaluatedPerson.firstName} ${reportData.evaluationInfo!.evaluatedPerson.lastName}`;
      }

      // Envoyer le rapport Word
      console.log('Preparing to send report email...');
      console.log('Email to:', 'luc.marsal@auramanagement.fr');
      console.log('Attachment filename:', wordFileName);
      console.log('Attachment size:', wordBuffer.length, 'bytes');
      
      const emailResult = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: 'luc.marsal@auramanagement.fr',
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1d4e89; color: white; padding: 20px; text-align: center;">
              <h1>Rapport ${reportData.type === 'autodiagnostic' ? 'd\'analyse' : 'd\'évaluation'} du potentiel</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f8fafc;">
              <h2>Rapport généré pour :</h2>
              <p><strong>${reportData.type === 'autodiagnostic' ? 'Participant' : 'Personne évaluée'} :</strong> ${personName}</p>
              ${reportData.type === 'evaluation' ? `<p><strong>Évaluateur :</strong> ${reportData.evaluationInfo!.evaluatorEmail}</p>` : ''}
              <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              
              <div style="background-color: #e6f3ff; border: 1px solid #1d4e89; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p><strong>📄 Document Word joint</strong></p>
                <p>Le rapport complet d'${reportData.type === 'autodiagnostic' ? 'analyse' : 'évaluation'} du potentiel avec graphiques et recommandations personnalisées.</p>
              </div>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>Email généré automatiquement par le système ${reportData.type === 'autodiagnostic' ? 'de questionnaire RH' : 'd\'évaluation QAP'}</p>
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
      console.log('Background report generation completed successfully');
      
      // Répondre au client (même si personne n'écoute)
      res.status(200).json({ 
        success: true, 
        message: 'Rapport généré et envoyé avec succès.' 
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
      
      // Envoyer un email d'erreur
      try {
        const personName = reportData.type === 'autodiagnostic' 
          ? `${reportData.userInfo!.firstName} ${reportData.userInfo!.lastName}`
          : `${reportData.evaluationInfo!.evaluatedPerson.firstName} ${reportData.evaluationInfo!.evaluatedPerson.lastName}`;
        
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: 'luc.marsal@auramanagement.fr',
          subject: `ERREUR - Rapport non généré - ${personName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
                <h1>Erreur de génération du rapport</h1>
              </div>
              
              <div style="padding: 20px; background-color: #f8fafc;">
                <p>Une erreur s'est produite lors de la génération du rapport pour :</p>
                <p><strong>${reportData.type === 'autodiagnostic' ? 'Participant' : 'Personne évaluée'} :</strong> ${personName}</p>
                ${reportData.type === 'evaluation' ? `<p><strong>Évaluateur :</strong> ${reportData.evaluationInfo!.evaluatorEmail}</p>` : ''}
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
      
      // Répondre avec l'erreur
      res.status(500).json({ 
        error: 'Erreur lors de la génération du rapport en arrière-plan.',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }

  } catch (error) {
    console.error('Erreur lors du traitement de la génération de rapport:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la génération de rapport',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 