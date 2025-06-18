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

// Convertir SVG en buffer pour docx
function svgToBuffer(svg: string): Buffer {
  return Buffer.from(svg, 'utf-8');
}

export async function generateWordDocumentWithSVG(data: WordReportData): Promise<Buffer> {
  console.log('Generating Word document with SVG images...');
  const children: Paragraph[] = [];

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
      
      // Insérer les graphiques SVG à la fin des sections précédentes
      if (currentSection === 2 && inSection1) {
        // Pour l'instant, on met juste un placeholder car les SVG dans docx peuvent être complexes
        children.push(
          new Paragraph({
            text: '[Graphique : Forces par famille de compétences - Voir le PDF joint pour la visualisation complète]',
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new TextRun({
                text: '[Graphique : Forces par famille de compétences - Voir le PDF joint pour la visualisation complète]',
                italics: true,
                color: '666666',
              }),
            ],
          })
        );
      } else if (currentSection === 3 && inSection2) {
        children.push(
          new Paragraph({
            text: '[Graphique : Vision globale des compétences - Voir le PDF joint pour la visualisation complète]',
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new TextRun({
                text: '[Graphique : Vision globale des compétences - Voir le PDF joint pour la visualisation complète]',
                italics: true,
                color: '666666',
              }),
            ],
          })
        );
      } else if (currentSection === 4 && inSection3) {
        children.push(
          new Paragraph({
            text: '[Graphique : Forces et axes de progression - Voir le PDF joint pour la visualisation complète]',
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new TextRun({
                text: '[Graphique : Forces et axes de progression - Voir le PDF joint pour la visualisation complète]',
                italics: true,
                color: '666666',
              }),
            ],
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

  // Ajouter le dernier graphique si on était dans la section 3
  if (inSection3) {
    children.push(
      new Paragraph({
        text: '[Graphique : Forces et axes de progression - Voir le PDF joint pour la visualisation complète]',
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 },
        children: [
          new TextRun({
            text: '[Graphique : Forces et axes de progression - Voir le PDF joint pour la visualisation complète]',
            italics: true,
            color: '666666',
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
        heading3: {
          run: {
            font: 'Avenir',
            size: 24,
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 240,
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
  console.log('Packing Word document with SVG placeholders...');
  const buffer = await Packer.toBuffer(doc);
  console.log('Word document packed successfully, buffer size:', buffer.length);
  
  // Note: Pour une vraie intégration SVG, il faudrait créer un PDF séparé ou utiliser une autre approche
  console.log('Note: Les graphiques SVG nécessitent une conversion PDF pour une visualisation complète');
  
  return buffer;
} 