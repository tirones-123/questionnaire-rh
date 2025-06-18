import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, Packer } from 'docx';

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

export async function generateWordDocumentWithoutImages(data: WordReportData): Promise<Buffer> {
  console.log('Generating Word document without images...');
  const children: Paragraph[] = [];

  // Parser le contenu du rapport
  const lines = data.reportContent.split('\n');
  let currentSection = 0;

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
      
      // Insérer des espaces réservés pour les graphiques
      if (currentSection === 2) {
        children.push(
          new Paragraph({
            text: '[Graphique : Forces par famille de compétences]',
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new TextRun({
                text: '[Graphique : Forces par famille de compétences]',
                italics: true,
                color: '666666',
              }),
            ],
          })
        );
      } else if (currentSection === 3) {
        children.push(
          new Paragraph({
            text: '[Graphique : Vision globale des compétences]',
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new TextRun({
                text: '[Graphique : Vision globale des compétences]',
                italics: true,
                color: '666666',
              }),
            ],
          })
        );
      } else if (currentSection === 4) {
        children.push(
          new Paragraph({
            text: '[Graphique : Forces et axes de progression]',
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new TextRun({
                text: '[Graphique : Forces et axes de progression]',
                italics: true,
                color: '666666',
              }),
            ],
          })
        );
      }
      
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
              italics: true,
            }),
          ],
        })
      );
      continue;
    }

    // Listes à puces
    if (line.startsWith('- ')) {
      children.push(
        new Paragraph({
          text: line.substring(2),
          bullet: {
            level: 0,
          },
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: line.substring(2),
              font: 'Avenir',
              size: 22,
            }),
          ],
        })
      );
      continue;
    }

    // Paragraphes normaux
    children.push(
      new Paragraph({
        text: line,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: line,
            font: 'Avenir',
            size: 22,
          }),
        ],
      })
    );
  }

  // Créer le document avec les styles
  const doc = new Document({
    styles: {
      default: {
        heading1: {
          run: {
            font: 'Avenir',
            size: 32,
            bold: true,
          },
          paragraph: {
            spacing: {
              after: 240,
            },
          },
        },
        heading2: {
          run: {
            font: 'Avenir',
            size: 28,
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 360,
              after: 120,
            },
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: 'Avenir',
            size: 22,
          },
          paragraph: {
            spacing: {
              line: 360,
              after: 120,
            },
          },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children: children,
    }],
  });

  // Générer le document
  console.log('Packing Word document without images...');
  const buffer = await Packer.toBuffer(doc);
  console.log('Word document packed successfully (without images), buffer size:', buffer.length);
  return buffer;
} 