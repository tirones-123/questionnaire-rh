import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, PageBreak, Packer } from 'docx';
import { svgToBase64 } from './chartGenerator';
import sharp from 'sharp';

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

// Convertir SVG en PNG via sharp
async function svgToPng(svg: string, width: number = 800, height: number = 600): Promise<Buffer> {
  try {
    return await sharp(Buffer.from(svg))
      .resize(width, height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();
  } catch (error) {
    console.error('Erreur lors de la conversion SVG vers PNG:', error);
    throw error;
  }
}

export async function generateWordDocument(data: WordReportData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Convertir les graphiques SVG en PNG
  let chartBuffers: { [key: string]: Buffer } = {};
  try {
    chartBuffers.family = await svgToPng(data.charts.family, 600, 450);
    chartBuffers.radar = await svgToPng(data.charts.radar, 600, 600);
    chartBuffers.sorted = await svgToPng(data.charts.sorted, 600, 450);
  } catch (error) {
    console.error('Erreur lors de la conversion des graphiques:', error);
    // Continuer sans les graphiques si erreur
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
      if (currentSection === 2 && inSection1 && chartBuffers.family) {
        // Insérer le graphique des familles à la fin de la section 1
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: chartBuffers.family,
                transformation: {
                  width: 450,
                  height: 338,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
          })
        );
      } else if (currentSection === 3 && inSection2 && chartBuffers.radar) {
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
      } else if (currentSection === 4 && inSection3 && chartBuffers.sorted) {
        // Insérer le graphique trié à la fin de la section 3
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: chartBuffers.sorted,
                transformation: {
                  width: 450,
                  height: 338,
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
  if (inSection3 && chartBuffers.sorted) {
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: chartBuffers.sorted,
            transformation: {
              width: 450,
              height: 338,
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 },
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