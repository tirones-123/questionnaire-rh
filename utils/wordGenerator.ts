import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, PageBreak, Packer } from 'docx';
import { generateRadarChartBuffer, generateSortedBarChartBuffer, generateFamilyBarChartBuffer } from './quickchartGenerator';

interface WordReportData {
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
  reportContent: string;
  charts?: {
    radar: string;      // SVG string - maintenant optionnel car on utilise QuickChart
    sorted: string;     // SVG string - maintenant optionnel car on utilise QuickChart
    family: string;     // SVG string - maintenant optionnel car on utilise QuickChart
  };
  scores?: { [key: string]: any }; // Pour passer les scores directement
}

export async function generateWordDocument(data: WordReportData): Promise<Buffer> {
  console.log('Starting Word document generation...');
  console.log('Report type:', data.type);
  console.log('Person:', data.person.firstName, data.person.lastName);
  console.log('Report content length:', data.reportContent.length);
  
  const children: Paragraph[] = [];

  // Générer les graphiques avec QuickChart si les scores sont fournis
  let chartBuffers: { [key: string]: Buffer } = {};
  
  try {
    console.log('Generating charts with QuickChart...');
    
    if (data.scores) {
      // Utiliser QuickChart pour générer les graphiques
      chartBuffers.family = await generateFamilyBarChartBuffer(data.scores);
      console.log('Family chart generated with QuickChart');
      
      chartBuffers.radar = await generateRadarChartBuffer(data.scores);
      console.log('Radar chart generated with QuickChart'); 
      
      chartBuffers.sorted = await generateSortedBarChartBuffer(data.scores);
      console.log('Sorted chart generated with QuickChart');
    } else {
      console.warn('No scores provided, charts will not be generated');
    }
    
    console.log('All charts generated successfully');
  } catch (error) {
    console.error('Erreur lors de la génération des graphiques:', error);
    // Continuer sans graphiques en cas d'erreur
  }

  // Parser le contenu du rapport
  const lines = data.reportContent.split('\n');
  let currentSection = 0;
  let inSection1 = false;
  let inSection2 = false;
  let inSection3 = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    // Titre principal
    if (line.startsWith('RAPPORT')) {
      children.push(
        new Paragraph({
          text: line,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        })
      );
      continue;
    }

    // Sous-titre avec nom et infos
    if (line.includes(data.person.firstName) && line.includes(data.person.lastName) && i < 5) {
      children.push(
        new Paragraph({
          text: line,
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
          children: [
            new TextRun({
              text: line,
              font: 'Avenir',
              size: 26,
              bold: true,
            }),
          ],
        })
      );
      continue;
    }

    // Sections numérotées
    if (/^[1-5]\.\s/.test(line)) {
      currentSection = parseInt(line[0]);
      
      // Insérer les graphiques à la fin des sections précédentes
      if (currentSection === 2 && inSection1 && chartBuffers.family && chartBuffers.family.length > 0) {
        // Insérer le graphique des familles à la fin de la section 1
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: chartBuffers.family,
                transformation: {
                  width: 450,
                  height: 300,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
          })
        );
      } else if (currentSection === 3 && inSection2 && chartBuffers.radar && chartBuffers.radar.length > 0) {
        // Insérer le graphique radar à la fin de la section 2
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: chartBuffers.radar,
                transformation: {
                  width: 450,
                  height: 450,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
          })
        );
      } else if (currentSection === 4 && inSection3 && chartBuffers.sorted && chartBuffers.sorted.length > 0) {
        // Insérer le graphique trié à la fin de la section 3
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: chartBuffers.sorted,
                transformation: {
                  width: 450,
                  height: 300,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
          })
        );
      }
      
      inSection1 = (currentSection === 1);
      inSection2 = (currentSection === 2);
      inSection3 = (currentSection === 3);
      
      children.push(
        new Paragraph({
          text: line,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 480, after: 240 },
        })
      );
      continue;
    }

    // Familles en majuscules
    if (line.startsWith('FAMILLE')) {
      children.push(
        new Paragraph({
          text: line,
          spacing: { before: 360, after: 180 },
          children: [
            new TextRun({
              text: line,
              font: 'Avenir',
              size: 24,
              bold: true,
              color: '1d4e89',
            }),
          ],
        })
      );
      continue;
    }

    // Nom du critère en majuscules
    if (line === line.toUpperCase() && line.length > 3 && !line.includes('RAPPORT') && !line.includes('FAMILLE')) {
      children.push(
        new Paragraph({
          text: line,
          spacing: { before: 240, after: 60 },
          children: [
            new TextRun({
              text: line,
              font: 'Avenir',
              size: 22,
              bold: true,
            }),
          ],
        })
      );
      continue;
    }

    // Score : x,x - Interprétation
    if (line.startsWith('Score :')) {
      children.push(
        new Paragraph({
          text: line,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: line,
              font: 'Avenir',
              size: 20,
              bold: true,
              color: '666666',
            }),
          ],
        })
      );
      continue;
    }

    // Définition courte sous le nom du critère
    if (i > 0 && lines[i-1].trim() === lines[i-1].trim().toUpperCase() && 
        lines[i-1].trim().length > 3 && !lines[i-1].includes('RAPPORT') && 
        !lines[i-1].includes('FAMILLE') && !lines[i-1].includes('Score :')) {
      children.push(
        new Paragraph({
          text: line,
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: line,
              font: 'Avenir',
              size: 18,
              italics: true,
              color: '333333',
            }),
          ],
        })
      );
      continue;
    }

    // Points de vigilance (lignes commençant par -)
    if (line.startsWith('- ')) {
      children.push(
        new Paragraph({
          text: line,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: line,
              font: 'Avenir',
              size: 20,
            }),
          ],
        })
      );
      continue;
    }

    // Paragraphe normal
    children.push(
      new Paragraph({
        text: line,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: line,
            font: 'Avenir',
            size: 20,
          }),
        ],
      })
    );
  }

  // Créer le document Word
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  // Générer le buffer
  console.log('Generating Word document buffer...');
  const buffer = await Packer.toBuffer(doc);
  console.log('Word document generated successfully, size:', buffer.length);
  
  return buffer;
} 