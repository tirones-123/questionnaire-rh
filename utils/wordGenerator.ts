import { Document, Paragraph, TextRun, AlignmentType, ImageRun, Packer, Header, Footer, convertInchesToTwip, BorderStyle, SectionType } from 'docx';
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

// Constantes pour la mise en page selon les spécifications
const FONTS = {
  DEFAULT: 'Avenir Book',
  FALLBACK: 'Arial' // Fallback si Avenir n'est pas disponible
};

const SIZES = {
  N1: 36, // 18pt = 36 half-points
  N1_BIS: 36, // 18pt = 36 half-points  
  N2: 22, // 11pt = 22 half-points
  N3: 22, // 11pt = 22 half-points
  N4: 22, // 11pt = 22 half-points
  BODY: 22 // 11pt = 22 half-points
};

const SPACING = {
  N1: { before: 0, after: 0 },
  N1_BIS: { before: 0, after: 100 }, // 5pt = 100 twips
  N2: { before: 100, after: 100 }, // 5pt = 100 twips  
  N3: { before: 240, after: 240 }, // 12pt = 240 twips
  N4: { before: 0, after: 0 },
  N4_DESC: { before: 0, after: 0 },
  N4_SCORE: { before: 0, after: 0 },
  BODY: { before: 0, after: 0 }
};

export async function generateWordDocument(data: WordReportData): Promise<Buffer> {
  console.log('Starting Word document generation...');
  console.log('Report type:', data.type);
  console.log('Person:', data.person.firstName, data.person.lastName);
  console.log('Report content length:', data.reportContent.length);
  
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

  // Parser le contenu structuré
  const structuredContent = parseReportContent(data.reportContent);
  
  // Créer les paragraphes selon les spécifications
  const paragraphs = createFormattedParagraphs(structuredContent, chartBuffers);

  // Créer l'en-tête avec logo (page 1 uniquement)
  const firstPageHeader = logoBuffer ? new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: {
              width: 80,
              height: 60,
            },
          }),
        ],
        alignment: AlignmentType.LEFT,
      }),
    ],
  }) : undefined;

  // Créer le pied de page avec logo (à partir de la page 2)
  const defaultFooter = logoBuffer ? new Footer({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: {
              width: 40,
              height: 30,
            },
          }),
        ],
        alignment: AlignmentType.LEFT,
      }),
    ],
  }) : undefined;

  // Créer le document Word avec les spécifications exactes
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            // Format A4 avec marges 2,5 cm
            margin: {
              top: convertInchesToTwip(0.98), // 2,5 cm ≈ 0,98 inches
              right: convertInchesToTwip(0.98),
              bottom: convertInchesToTwip(0.98),
              left: convertInchesToTwip(0.98),
            },
          },
        },
        headers: firstPageHeader ? {
          default: firstPageHeader,
        } : undefined,
        footers: defaultFooter ? {
          default: defaultFooter,
        } : undefined,
        children: paragraphs,
      },
    ],
  });

  // Générer le buffer
  console.log('Generating Word document buffer...');
  const buffer = await Packer.toBuffer(doc);
  console.log('Word document generated successfully, size:', buffer.length);
  
  return buffer;
}

interface StructuredContent {
  title: string;
  identity: string;
  sections: {
    number: number;
    title: string;
    content: {
      families?: {
        name: string;
        criteria: {
          name: string;
          definition: string;
          score: string;
          analysis: string;
        }[];
      }[];
      text?: string;
      bulletPoints?: string[];
    };
  }[];
}

function parseReportContent(content: string): StructuredContent {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  const result: StructuredContent = {
    title: '',
    identity: '',
    sections: []
  };

  let currentSection: any = null;
  let currentFamily: any = null;
  let currentCriterion: any = null;
  let currentText = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Titre principal
    if (line.startsWith('RAPPORT')) {
      result.title = line;
      continue;
    }
    
    // Identité (ligne après le titre contenant prénom/nom)
    if (i < 5 && (line.includes(',') || line.includes('ans'))) {
      result.identity = line;
      continue;
    }
    
    // Sections numérotées
    if (/^[1-5]\.\s/.test(line)) {
      // Sauvegarder le texte en cours si nécessaire
      if (currentSection && currentText) {
        if (!currentSection.content.text) currentSection.content.text = '';
        currentSection.content.text += currentText.trim() + '\n';
        currentText = '';
      }
      
      currentSection = {
        number: parseInt(line[0]),
        title: line,
        content: {}
      };
      result.sections.push(currentSection);
      currentFamily = null;
      currentCriterion = null;
      continue;
    }
    
    // Familles
    if (line.startsWith('FAMILLE')) {
      if (!currentSection.content.families) {
        currentSection.content.families = [];
      }
      currentFamily = {
        name: line,
        criteria: []
      };
      currentSection.content.families.push(currentFamily);
      currentCriterion = null;
      continue;
    }
    
    // Critères (lignes tout en majuscules, mais pas les familles)
    if (line === line.toUpperCase() && line.length > 3 && 
        !line.includes('RAPPORT') && !line.startsWith('FAMILLE') && 
        !line.startsWith('Score :') && currentFamily) {
      
      // Vérifier si la ligne suivante est la définition (pas en majuscules)
      if (i + 1 < lines.length && lines[i + 1] !== lines[i + 1].toUpperCase()) {
        currentCriterion = {
          name: line,
          definition: '',
          score: '',
          analysis: ''
        };
        currentFamily.criteria.push(currentCriterion);
        continue;
      }
    }
    
    // Définition du critère (ligne après le nom du critère)
    if (currentCriterion && !currentCriterion.definition && 
        line !== line.toUpperCase() && !line.startsWith('Score :')) {
      currentCriterion.definition = line;
      continue;
    }
    
    // Score
    if (line.startsWith('Score :') && currentCriterion) {
      currentCriterion.score = line;
      continue;
    }
    
    // Points de vigilance (lignes commençant par -)
    if (line.startsWith('- ')) {
      if (!currentSection.content.bulletPoints) {
        currentSection.content.bulletPoints = [];
      }
      currentSection.content.bulletPoints.push(line);
      continue;
    }
    
    // Analyse ou texte normal
    if (currentCriterion && currentCriterion.score && !currentCriterion.analysis) {
      currentCriterion.analysis = line;
    } else {
      currentText += line + '\n';
    }
  }
  
  // Sauvegarder le dernier texte
  if (currentSection && currentText) {
    if (!currentSection.content.text) currentSection.content.text = '';
    currentSection.content.text += currentText.trim() + '\n';
  }
  
  return result;
}

function createFormattedParagraphs(content: StructuredContent, chartBuffers: { [key: string]: Buffer }): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  // N1 - Titre principal (centré, 18pt, gras, majuscules)
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: content.title,
        font: FONTS.DEFAULT,
        size: SIZES.N1,
        bold: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: SPACING.N1,
  }));
  
  // N1-bis - Identité (centré, 18pt, gras)
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: content.identity,
        font: FONTS.DEFAULT,
        size: SIZES.N1_BIS,
        bold: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: SPACING.N1_BIS,
  }));
  
  // Sections
  for (const section of content.sections) {
    // N2 - Sections numérotées (justifié, 11pt, gras)
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: section.title,
          font: FONTS.DEFAULT,
          size: SIZES.N2,
          bold: true,
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: SPACING.N2,
    }));
    
    // Contenu de la section
    if (section.content.families) {
      // Section 1 avec familles et critères
      for (const family of section.content.families) {
        // N3 - Famille (justifié, 11pt, gras)
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: family.name,
              font: FONTS.DEFAULT,
              size: SIZES.N3,
              bold: true,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: SPACING.N3,
        }));
        
        // Critères
        for (const criterion of family.criteria) {
          // N4 - Critère (justifié, 11pt, gras, majuscules)
          paragraphs.push(new Paragraph({
            children: [
              new TextRun({
                text: criterion.name,
                font: FONTS.DEFAULT,
                size: SIZES.N4,
                bold: true,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: SPACING.N4,
          }));
          
          // N4-desc - Définition (justifié, 11pt, italique)
          if (criterion.definition) {
            paragraphs.push(new Paragraph({
              children: [
                new TextRun({
                  text: criterion.definition,
                  font: FONTS.DEFAULT,
                  size: SIZES.BODY,
                  italics: true,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: SPACING.N4_DESC,
            }));
          }
          
          // N4-score - Score (justifié, 11pt, gras)
          if (criterion.score) {
            paragraphs.push(new Paragraph({
              children: [
                new TextRun({
                  text: criterion.score,
                  font: FONTS.DEFAULT,
                  size: SIZES.BODY,
                  bold: true,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: SPACING.N4_SCORE,
            }));
          }
          
          // Corps - Analyse (justifié, 11pt, romain)
          if (criterion.analysis) {
            paragraphs.push(new Paragraph({
              children: [
                new TextRun({
                  text: criterion.analysis,
                  font: FONTS.DEFAULT,
                  size: SIZES.BODY,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: SPACING.BODY,
            }));
          }
        }
      }
      
      // Insérer graphique famille à la fin de la section 1
      if (section.number === 1 && chartBuffers.family) {
        paragraphs.push(new Paragraph({
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
        }));
      }
    }
    
    // Texte normal pour les autres sections
    if (section.content.text) {
      const textParagraphs = section.content.text.split('\n')
        .filter(line => line.trim())
        .map(line => new Paragraph({
          children: [
            new TextRun({
              text: line.trim(),
              font: FONTS.DEFAULT,
              size: SIZES.BODY,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: SPACING.BODY,
        }));
      paragraphs.push(...textParagraphs);
    }
    
    // Points de vigilance
    if (section.content.bulletPoints) {
      for (const point of section.content.bulletPoints) {
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: point,
              font: FONTS.DEFAULT,
              size: SIZES.BODY,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: SPACING.BODY,
        }));
      }
    }
    
    // Insérer graphiques aux bons endroits
    if (section.number === 2 && chartBuffers.radar) {
      paragraphs.push(new Paragraph({
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
      }));
    }
    
    if (section.number === 3 && chartBuffers.sorted) {
      paragraphs.push(new Paragraph({
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
      }));
    }
  }
  
  return paragraphs;
} 