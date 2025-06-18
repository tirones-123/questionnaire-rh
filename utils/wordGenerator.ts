import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, PageBreak, Packer } from 'docx';

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
  charts: {
    radar: string;      // SVG string
    sorted: string;     // SVG string
    family: string;     // SVG string
  };
}

// Convertir SVG directement en base64 pour Word (sans Sharp)
function svgToBase64ForWord(svg: string): Buffer {
  try {
    console.log(`Converting SVG directly to base64, SVG length: ${svg.length}`);
    
    // Nettoyer le SVG pour Word
    const cleanSvg = svg
      .replace(/\s+/g, ' ')
      .trim();
    
    // Word peut accepter les SVG directement en base64
    const base64 = Buffer.from(cleanSvg, 'utf-8').toString('base64');
    return Buffer.from(base64, 'base64');
  } catch (error) {
    console.error('Erreur lors de la conversion SVG:', error);
    // Fallback : créer une image de remplacement simple
    return createFallbackImage();
  }
}

// Créer une image de fallback très simple (1x1 pixel transparent)
function createFallbackImage(): Buffer {
  // PNG 1x1 transparent en base64
  const transparentPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  return Buffer.from(transparentPng, 'base64');
}

// Créer un graphique de remplacement en texte
function createTextChart(chartType: string, data: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `[${chartType}]`,
          font: 'Avenir',
          size: 24,
          bold: true,
          color: '1d4e89',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 240 },
    })
  );
  
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Graphique non disponible - Contactez le support technique',
          font: 'Avenir',
          size: 16,
          italics: true,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    })
  );
  
  return paragraphs;
}

export async function generateWordDocument(data: WordReportData): Promise<Buffer> {
  console.log('Starting Word document generation WITHOUT Sharp conversion...');
  console.log('Report type:', data.type);
  console.log('Person:', data.person.firstName, data.person.lastName);
  console.log('Report content length:', data.reportContent.length);
  
  const children: Paragraph[] = [];

  // Version sans conversion PNG - on va insérer des textes de remplacement
  console.log('Using text-based charts instead of images for better compatibility...');

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
      
      // Insérer les graphiques en mode texte à la fin des sections précédentes
      if (currentSection === 2 && inSection1) {
        // Graphique des familles à la fin de la section 1
        children.push(...createTextChart('Graphique par famille de compétences', null));
      } else if (currentSection === 3 && inSection2) {
        // Graphique radar à la fin de la section 2
        children.push(...createTextChart('Radar des compétences', null));
      } else if (currentSection === 4 && inSection3) {
        // Graphique trié à la fin de la section 3
        children.push(...createTextChart('Compétences triées par score', null));
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

  // Ajouter une note sur les graphiques à la fin
  children.push(
    new Paragraph({
      text: '',
      spacing: { before: 480 },
    })
  );
  
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Note technique : Les graphiques seront transmis séparément par email.',
          font: 'Avenir',
          size: 16,
          italics: true,
          color: '888888',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    })
  );

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