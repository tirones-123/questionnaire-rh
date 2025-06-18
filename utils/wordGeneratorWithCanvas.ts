import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, PageBreak, Packer } from 'docx';
import { generateRadarChartCanvas, generateSortedBarChartCanvas, generateFamilyBarChartCanvas } from './chartGeneratorCanvas';

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
  scores: any; // Les scores pour générer les graphiques
}

export async function generateWordDocumentWithCanvas(data: WordReportData): Promise<Buffer> {
  console.log('Generating Word document with Canvas charts...');
  const children: Paragraph[] = [];

  // Générer les graphiques avec Canvas (gestion native des accents)
  let chartBuffers: { [key: string]: Buffer } = {};
  try {
    console.log('Generating charts with Canvas (native UTF-8 support)...');
    chartBuffers.family = await generateFamilyBarChartCanvas(data.scores);
    console.log('Family chart generated with Canvas');
    chartBuffers.radar = await generateRadarChartCanvas(data.scores);
    console.log('Radar chart generated with Canvas');
    chartBuffers.sorted = await generateSortedBarChartCanvas(data.scores);
    console.log('Sorted chart generated with Canvas');
    console.log('All charts generated successfully with Canvas');
  } catch (error) {
    console.error('Erreur lors de la génération des graphiques avec Canvas:', error);
    console.error('Error details:', error instanceof Error ? error.stack : 'No stack');
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
  console.log('Creating Word document with', children.length, 'paragraphs...');
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
  console.log('Packing Word document...');
  const buffer = await Packer.toBuffer(doc);
  console.log('Word document packed successfully, final buffer size:', buffer.length);
  return buffer;
} 