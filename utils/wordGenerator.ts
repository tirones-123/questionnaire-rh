import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, PageBreak, Packer } from 'docx';
import { svgToBase64 } from './chartGenerator';

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

// Convertir SVG en PNG via sharp (à installer)
async function svgToPng(svg: string): Promise<Buffer> {
  // Pour l'instant, on va garder le SVG
  // Dans une version complète, on utiliserait sharp ou un service de conversion
  return Buffer.from(svg);
}

export async function generateWordDocument(data: WordReportData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Parser le contenu du rapport
  const lines = data.reportContent.split('\n');
  let chartPositions = {
    family: -1,
    radar: -1,
    sorted: -1
  };

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
      const sectionNumber = parseInt(line[0]);
      
      children.push(
        new Paragraph({
          text: line,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 480, after: 240 },
        })
      );

      // Marquer les positions pour les graphiques
      if (sectionNumber === 1) {
        // Le graphique family ira après la fin de la section 1
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().match(/^2\.\s/)) {
          j++;
        }
        chartPositions.family = children.length + (j - i - 1);
      } else if (sectionNumber === 2) {
        // Le graphique radar ira après la fin de la section 2
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().match(/^3\.\s/)) {
          j++;
        }
        chartPositions.radar = children.length + (j - i - 1);
      } else if (sectionNumber === 3) {
        // Le graphique sorted ira après la fin de la section 3
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().match(/^4\.\s/)) {
          j++;
        }
        chartPositions.sorted = children.length + (j - i - 1);
      }
      
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
  const buffer = await Packer.toBuffer(doc);
  return buffer;
} 