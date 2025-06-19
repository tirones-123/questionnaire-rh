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
  let isFirstSection = true;
  let inBulletSection = false; // Pour savoir si on est dans une section avec bullets

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Log spécifique pour AMBITION
    if (line === 'AMBITION' || line.includes('AMBITION')) {
      console.log(`[DEBUG AMBITION] Found AMBITION at line ${i}: "${line}"`);
      if (i + 1 < lines.length) console.log(`[DEBUG AMBITION] Next line: "${lines[i + 1].trim()}"`);
      if (i + 2 < lines.length) console.log(`[DEBUG AMBITION] Line +2: "${lines[i + 2].trim()}"`);
      if (i + 3 < lines.length) console.log(`[DEBUG AMBITION] Line +3: "${lines[i + 3].trim()}"`);
    }
    
    // Gestion des lignes vides
    if (!line) {
      // Ne pas ignorer les lignes vides car elles peuvent être importantes pour la structure
      continue;
    }
    
    if (skipNextLine) {
      console.log(`[DEBUG] Skipping line ${i}: "${line.substring(0, Math.min(50, line.length))}..."`);
      skipNextLine = false;
      continue;
    }

    // Log pour debug
    if (line.length > 0) {
      console.log(`Processing line ${i}: "${line.substring(0, Math.min(50, line.length))}..."`);
    }

    // Titre principal et identité sur fond gris
    if (line.startsWith('RAPPORT') || line.toUpperCase().startsWith('RAPPORT') || /^\d\.\s*RAPPORT/i.test(line)) {
      // Supprimer l'éventuelle numérotation "1. " pour l'affichage
      const cleanedTitle = line.replace(/^\d\.\s*/, '').trim();
      console.log(`Found main title: "${line}"`);
      
      // Créer le titre sur fond gris
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cleanedTitle,
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
        console.log(`Found identity line: "${identityLine}"`);
        
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
      
      // Réinitialiser le flag des sections avec bullets
      inBulletSection = false;
      
      // Insérer les graphiques à la fin de la section précédente
      if (currentSection === 1 && chartBuffers.family && newSection > 1) {
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
      } else if (currentSection === 2 && chartBuffers.radar && newSection > 2) {
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
      } else if (currentSection === 3 && chartBuffers.sorted && newSection > 3) {
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
      }
      
      currentSection = newSection;
      inSection1 = (currentSection === 1);
      inSection2 = (currentSection === 2);
      inSection3 = (currentSection === 3);
      
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
        console.log(`Found definition for ${line}: "${nextLine}"`);
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
        // Incrémenter i pour passer la ligne de définition
        i++;
      }
      
      lastWasCriterion = true;
      continue;
    }

    // Score : x,x - Interprétation
    if (line.startsWith('Score :')) {
      console.log(`Found score line: "${line}"`);
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
      // Ajouter directement la description située juste après la ligne "Score :" si elle existe
      const descriptionLine = (i + 1 < lines.length) ? lines[i + 1].trim() : '';
      if (descriptionLine && !descriptionLine.startsWith('• ') && !descriptionLine.startsWith('FAMILLE') && !descriptionLine.match(/^[1-5]\./) && !descriptionLine.startsWith('Score :')) {
        console.log(`Adding inline description for score at line ${i + 1}: "${descriptionLine.substring(0, Math.min(80, descriptionLine.length))}..."`);
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: descriptionLine,
                font: 'Avenir Book',
                size: 22, // 11pt
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 0, after: 40 },
          })
        );
        // Sauter la ligne de description dans la boucle
        i++;
      }
      // Important : réinitialiser skipNextLine
      skipNextLine = false;
      continue;
    }

    // Points de vigilance et recommandations (lignes commençant par •)
    if (line.startsWith('• ')) {
      console.log(`Found bullet point: "${line}"`);
      
      // Vérifier si c'est un titre (contient des parenthèses ou deux-points)
      const isTitle = line.includes('(') && line.includes(')') || line.includes(' : ');
      
      if (isTitle) {
        // C'est un titre de point de vigilance ou recommandation
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                font: 'Avenir Book',
                size: 22, // 11pt
                bold: true, // En gras pour les titres
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 120, after: 40 }, // Plus d'espace avant, moins après
            indent: {
              left: 240, // Indentation pour les bullets
            },
          })
        );
        inBulletSection = true; // On est dans une section avec bullets
      } else {
        // C'est un point normal
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
            spacing: { before: 60, after: 60 },
            indent: {
              left: 240, // Indentation pour les bullets
            },
          })
        );
      }
      lastWasCriterion = false;
      continue;
    }

    // Ancien traitement des tirets (pour compatibilité)
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
          spacing: { before: 60, after: 60 },
        })
      );
      lastWasCriterion = false;
      continue;
    }

    // Paragraphe normal
    console.log(`Processing normal paragraph at line ${i}: "${line.substring(0, Math.min(80, line.length))}..."`);
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
        spacing: { before: 0, after: 40 },
        // Indenter si on est dans une section avec bullets (points de vigilance ou recommandations)
        ...(inBulletSection && !line.startsWith('1.') && !line.startsWith('2.') && 
            !line.startsWith('3.') && !line.startsWith('4.') && !line.startsWith('5.') 
            ? { indent: { left: 240 } } : {}),
      })
    );
    
    lastWasCriterion = false;
  }

  // Insérer les graphiques restants à la fin du document
  if (currentSection === 1 && chartBuffers.family) {
    console.log('Inserting family chart at end of document (section 1)');
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
  } else if (currentSection === 2 && chartBuffers.radar) {
    console.log('Inserting radar chart at end of document (section 2)');
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
  } else if (currentSection === 3 && chartBuffers.sorted) {
    console.log('Inserting sorted chart at end of document (section 3)');
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