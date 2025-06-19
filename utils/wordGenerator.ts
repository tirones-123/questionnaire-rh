import { Document, Paragraph, TextRun, AlignmentType, ImageRun, Packer, Header, Footer, convertInchesToTwip, ShadingType } from 'docx';
import { generateRadarChartBuffer, generateSortedBarChartBuffer, generateFamilyBarChartBuffer } from './quickchartGenerator';
import fs from 'fs';
import path from 'path';

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
  scores: { [key: string]: any };
}

export async function generateWordDocument(data: WordReportData): Promise<Buffer> {
  console.log('Starting Word document generation...');
  console.log('Report type:', data.type);
  console.log('Person:', data.person.firstName, data.person.lastName);
  console.log('Report content length:', data.reportContent.length);
  
  const children: Paragraph[] = [];
  
  // Générer les graphiques avec QuickChart
  let chartBuffers: { [key: string]: Buffer } = {};
  
  try {
    console.log('Generating charts with QuickChart...');
    
    chartBuffers.family = await generateFamilyBarChartBuffer(data.scores);
    console.log('Family chart generated with QuickChart');
    
    chartBuffers.radar = await generateRadarChartBuffer(data.scores);
    console.log('Radar chart generated with QuickChart'); 
    
    chartBuffers.sorted = await generateSortedBarChartBuffer(data.scores);
    console.log('Sorted chart generated with QuickChart');
    
    console.log('All charts generated successfully');
  } catch (error) {
    console.error('Erreur lors de la génération des graphiques:', error);
  }

  // Charger le logo
  let logoBuffer: Buffer | null = null;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo-noir.png');
    logoBuffer = fs.readFileSync(logoPath);
    console.log('Logo loaded successfully');
  } catch (error) {
    console.error('Erreur lors du chargement du logo:', error);
  }

  // Parser le contenu du rapport
  const lines = data.reportContent.split('\n');
  let currentSection = 0;
  let inSection1 = false;
  let inSection2 = false;
  let inSection3 = false;
  let skipNextLine = false;
  let lastWasTitle = false;
  let lastWasCriterion = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    if (skipNextLine) {
      skipNextLine = false;
      continue;
    }

    // Titre principal et identité sur fond gris
    if (line.startsWith('RAPPORT')) {
      // Créer le titre sur fond gris
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: 'Avenir Book',
              size: 36, // 18pt
              bold: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          shading: {
            type: ShadingType.SOLID,
            color: 'DDDDDD', // Fond gris clair
          },
        })
      );
      
      // Créer l'identité sur fond gris (ligne suivante)
      if (i + 1 < lines.length) {
        const identityLine = lines[i + 1].trim();
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: identityLine,
                font: 'Avenir Book',
                size: 36, // 18pt
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 100 }, // 5pt après
            shading: {
              type: ShadingType.SOLID,
              color: 'DDDDDD', // Fond gris clair
            },
          })
        );
        skipNextLine = true;
      }
      
      lastWasTitle = true;
      continue;
    }

    // Ne pas traiter l'identité séparément si on vient de traiter le titre
    if (lastWasTitle && (line.includes(data.person.firstName) || line.includes('ans'))) {
      lastWasTitle = false;
      continue;
    }

    // Sections numérotées
    if (/^[1-5]\.\s/.test(line)) {
      currentSection = parseInt(line[0]);
      
      // Insérer les graphiques à la fin des sections précédentes
      if (currentSection === 2 && inSection1 && chartBuffers.family) {
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
      } else if (currentSection === 3 && inSection2 && chartBuffers.radar) {
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
          children: [
            new TextRun({
              text: line,
              font: 'Avenir Book',
              size: 22, // 11pt
              bold: true,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 100, after: 100 }, // 5pt
        })
      );
      lastWasCriterion = false;
      continue;
    }

    // Familles en majuscules
    if (line.startsWith('FAMILLE')) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: 'Avenir Book',
              size: 22, // 11pt
              bold: true,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 240, after: 240 }, // 12pt
        })
      );
      lastWasCriterion = false;
      continue;
    }

    // Nom du critère en majuscules (mais pas la définition)
    if (line === line.toUpperCase() && line.length > 3 && 
        !line.includes('RAPPORT') && !line.includes('FAMILLE') && !line.startsWith('Score :')) {
      
      // Vérifier si la ligne suivante est la définition (en italique)
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const isDefinition = nextLine && nextLine !== nextLine.toUpperCase() && !nextLine.startsWith('Score :');
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: 'Avenir Book',
              size: 22, // 11pt
              bold: true,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 0 },
        })
      );
      
      // Si la ligne suivante est la définition, l'ajouter en italique
      if (isDefinition) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: nextLine,
                font: 'Avenir Book',
                size: 22, // 11pt
                italics: true,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 0, after: 0 },
          })
        );
        skipNextLine = true;
      }
      
      lastWasCriterion = true;
      continue;
    }

    // Score : x,x - Interprétation
    if (line.startsWith('Score :')) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: 'Avenir Book',
              size: 22, // 11pt
              bold: true,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 0 },
        })
      );
      lastWasCriterion = false;
      continue;
    }

    // Points de vigilance (lignes commençant par -)
    if (line.startsWith('- ')) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: 'Avenir Book',
              size: 22, // 11pt
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 0 },
        })
      );
      lastWasCriterion = false;
      continue;
    }

    // Paragraphe normal
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            font: 'Avenir Book',
            size: 22, // 11pt
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0 },
      })
    );
    lastWasCriterion = false;
  }

  // Insérer le dernier graphique si nécessaire
  if (inSection3 && chartBuffers.sorted) {
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

  // Créer l'en-tête avec logo (première page uniquement)
  const firstPageHeader = logoBuffer ? new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: {
              width: 104, // 875/336 ≈ 2.6:1
              height: 40,
            },
          }),
        ],
        alignment: AlignmentType.LEFT,
      }),
    ],
  }) : undefined;

  // Créer le pied de page avec numérotation et logo (à partir de la page 2)
  const defaultFooter = logoBuffer ? new Footer({
    children: [
      // Numérotation de page en bas à gauche
      new Paragraph({
        children: [
          new TextRun({
            text: "Page ",
            font: 'Avenir Book',
            size: 20, // 10pt
          }),
          new TextRun({
            children: ["PAGE_NUMBER"],
            font: 'Avenir Book',
            size: 20, // 10pt
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 60 }, // Petit espacement avant le logo
      }),
      // Logo en dessous de la numérotation
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: {
              width: 52, // Ratio 2.6:1
              height: 20,
            },
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0 },
      }),
    ],
  }) : new Footer({
    children: [
      // Numérotation seule si pas de logo
      new Paragraph({
        children: [
          new TextRun({
            text: "Page ",
            font: 'Avenir Book',
            size: 20, // 10pt
          }),
          new TextRun({
            children: ["PAGE_NUMBER"],
            font: 'Avenir Book',
            size: 20, // 10pt
          }),
        ],
        alignment: AlignmentType.LEFT,
      }),
    ],
  });

  // Créer le document Word
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.98), // 2,5 cm
              right: convertInchesToTwip(0.98),
              bottom: convertInchesToTwip(0.98),
              left: convertInchesToTwip(0.98),
            },
          },
          titlePage: true, // Active la différenciation première page
        },
        headers: {
          first: firstPageHeader || new Header({ children: [] }), // En-tête première page
          default: new Header({ children: [] }), // Pas d'en-tête sur les autres pages
        },
        footers: {
          first: new Footer({ children: [] }), // Pas de pied de page première page
          default: defaultFooter || new Footer({ children: [] }), // Pied de page autres pages
        },
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