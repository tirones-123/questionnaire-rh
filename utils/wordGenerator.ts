import { Document, Paragraph, TextRun, AlignmentType, ImageRun, Packer, Header, Footer, convertInchesToTwip, ShadingType, PageNumber, PageBreak } from 'docx';
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
  
  // Debug : afficher les premières lignes du rapport
  const debugLines = data.reportContent.split('\n').slice(0, 10);
  console.log('First 10 lines of report content:');
  debugLines.forEach((line, index) => {
    console.log(`Line ${index}: "${line}"`);
  });
  
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
  let chartInserted = {
    family: false,
    radar: false,
    sorted: false
  };
  let skipNextLine = false;
  let lastWasTitle = false;
  let lastWasCriterion = false;
  let isFirstSection = true;

  console.log('Starting to parse report content...');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Gestion des lignes vides
    if (!line) {
      continue;
    }
    
    if (skipNextLine) {
      skipNextLine = false;
      continue;
    }

    // Log pour debug - uniquement les lignes importantes
    if (line.startsWith('RAPPORT') || line.match(/^[1-5]\./) || line.startsWith('FAMILLE') || line.startsWith('Score :')) {
      console.log(`Processing line ${i}: "${line.substring(0, Math.min(80, line.length))}..."`);
    }

    // Titre principal et identité sur fond gris
    if (line.toUpperCase().startsWith('RAPPORT')) {
      console.log(`Found report title: "${line}"`);
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
            color: 'DDDDDD',
            fill: 'DDDDDD',
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
            spacing: { before: 0, after: 400 },
            shading: {
              type: ShadingType.SOLID,
              color: 'DDDDDD',
              fill: 'DDDDDD',
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
      console.log(`Found section: "${line}"`);
      const newSection = parseInt(line[0]);
      
      // Insérer les graphiques à la fin de la section précédente
      if (currentSection === 1 && chartBuffers.family && newSection > 1 && !chartInserted.family) {
        console.log('Inserting family chart at end of section 1');
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
        chartInserted.family = true;
      } else if (currentSection === 2 && chartBuffers.radar && newSection > 2 && !chartInserted.radar) {
        console.log('Inserting radar chart at end of section 2');
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
        chartInserted.radar = true;
      } else if (currentSection === 3 && chartBuffers.sorted && newSection > 3 && !chartInserted.sorted) {
        console.log('Inserting sorted chart at end of section 3');
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
        chartInserted.sorted = true;
      }
      
      currentSection = newSection;
      
      console.log(`Adding section title: "${line}"`);
      
      // Ajouter le titre de section aligné à gauche sans fond gris
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: 'Avenir Book',
              size: 22, // 11pt comme le texte normal
              bold: true,
            }),
          ],
          alignment: AlignmentType.LEFT, // Aligné à gauche
          spacing: { before: 300, after: 200 },
        })
      );
      lastWasCriterion = false;
      continue;
    }

    // Familles en majuscules avec fond gris
    if (line.startsWith('FAMILLE')) {
      console.log(`Found family: "${line}"`);
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
          spacing: { before: 360, after: 200 },
          shading: {
            type: ShadingType.SOLID,
            color: 'DDDDDD',
            fill: 'DDDDDD',
          },
        })
      );
      lastWasCriterion = false;
      continue;
    }

    // Nom du critère en majuscules
    if (line === line.toUpperCase() && line.length > 3 && 
        !line.includes('RAPPORT') && !line.includes('FAMILLE') && 
        !line.startsWith('Score :') && !line.match(/^[1-5]\./)) {
      
      console.log(`Found criterion: ${line}`);
      
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
          spacing: { before: 200, after: 0 },
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
            spacing: { before: 0, after: 40 },
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
          spacing: { before: 0, after: 60 },
        })
      );
      lastWasCriterion = false;
      continue;
    }

    // Points de vigilance (lignes commençant par -)
    if (line.startsWith('- ')) {
      // Extraire le contenu après le tiret
      const content = line.substring(2).trim();
      
      // Vérifier si le contenu contient du gras (format **texte**)
      const boldPattern = /\*\*(.*?)\*\*/g;
      const textRuns: TextRun[] = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldPattern.exec(content)) !== null) {
        // Ajouter le texte avant le gras
        if (match.index > lastIndex) {
          textRuns.push(new TextRun({
            text: content.substring(lastIndex, match.index),
            font: 'Avenir Book',
            size: 22,
          }));
        }
        
        // Ajouter le texte en gras
        textRuns.push(new TextRun({
          text: match[1],
          font: 'Avenir Book',
          size: 22,
          bold: true,
        }));
        
        lastIndex = match.index + match[0].length;
      }
      
      // Ajouter le texte restant après le dernier gras
      if (lastIndex < content.length) {
        textRuns.push(new TextRun({
          text: content.substring(lastIndex),
          font: 'Avenir Book',
          size: 22,
        }));
      }
      
      // Si aucun gras n'a été trouvé, créer un TextRun simple
      if (textRuns.length === 0) {
        textRuns.push(new TextRun({
          text: content,
          font: 'Avenir Book',
          size: 22,
        }));
      }
      
      // Ajouter la puce au début
      textRuns.unshift(new TextRun({
        text: '• ',
        font: 'Avenir Book',
        size: 22,
      }));
      
      children.push(
        new Paragraph({
          children: textRuns,
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 60, after: 60 },
          indent: { left: 360 }, // Indentation pour la puce
        })
      );
      lastWasCriterion = false;
      continue;
    }

    // Paragraphe normal (peut aussi contenir du formatage gras)
    {
      const boldPattern = /\*\*(.*?)\*\*/g;
      const textRuns: TextRun[] = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldPattern.exec(line)) !== null) {
        // Ajouter le texte avant le gras
        if (match.index > lastIndex) {
          textRuns.push(new TextRun({
            text: line.substring(lastIndex, match.index),
            font: 'Avenir Book',
            size: 22,
          }));
        }
        
        // Ajouter le texte en gras
        textRuns.push(new TextRun({
          text: match[1],
          font: 'Avenir Book',
          size: 22,
          bold: true,
        }));
        
        lastIndex = match.index + match[0].length;
      }
      
      // Ajouter le texte restant après le dernier gras
      if (lastIndex < line.length) {
        textRuns.push(new TextRun({
          text: line.substring(lastIndex),
          font: 'Avenir Book',
          size: 22,
        }));
      }
      
      // Si aucun gras n'a été trouvé, créer un TextRun simple
      if (textRuns.length === 0) {
        textRuns.push(new TextRun({
          text: line,
          font: 'Avenir Book',
          size: 22,
        }));
      }
      
      children.push(
        new Paragraph({
          children: textRuns,
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 40 },
        })
      );
    }
    lastWasCriterion = false;
  }

  // Insérer les graphiques restants à la fin du document
  console.log(`End of document parsing. Current section: ${currentSection}`);
  
  // Insérer le graphique de la section 1 si on ne l'a pas déjà fait
  if (currentSection >= 1 && chartBuffers.family && !chartInserted.family) {
    console.log('Inserting family chart at end of section 1/document');
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
    chartInserted.family = true;
  }
  
  // Insérer le graphique de la section 2 si on ne l'a pas déjà fait
  if (currentSection >= 2 && chartBuffers.radar && !chartInserted.radar) {
    console.log('Inserting radar chart at end of section 2/document');
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
    chartInserted.radar = true;
  }
  
  // Insérer le graphique de la section 3 si on ne l'a pas déjà fait
  if (currentSection >= 3 && chartBuffers.sorted && !chartInserted.sorted) {
    console.log('Inserting sorted chart at end of section 3/document');
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
    chartInserted.sorted = true;
  }

  // Créer l'en-tête avec logo (première page uniquement)
  const firstPageHeader = logoBuffer ? new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: {
              width: 104,
              height: 40,
            },
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 200 },
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
            children: [PageNumber.CURRENT],
            font: 'Avenir Book',
            size: 20, // 10pt
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 60 },
      }),
      // Logo en dessous de la numérotation
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: {
              width: 52,
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
            children: [PageNumber.CURRENT],
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
          titlePage: true,
        },
        headers: {
          first: firstPageHeader || new Header({ children: [] }),
          default: new Header({ children: [] }),
        },
        footers: {
          first: new Footer({ children: [] }),
          default: defaultFooter || new Footer({ children: [] }),
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