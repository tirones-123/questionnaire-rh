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
    console.log(`Converting SVG to PNG (${width}x${height}), SVG length: ${svg.length}`);
    
    // Nettoyer le SVG pour Sharp et environnements serverless
    const cleanSvg = svg
      .replace(/encoding="UTF-8"/g, '')
      .replace(/\s+/g, ' ')
      .replace(/font-family="[^"]*"/g, 'font-family="Arial, sans-serif"') // Forcer Arial
      .trim();
    
    // Créer un buffer depuis le SVG nettoyé
    const svgBuffer = Buffer.from(cleanSvg, 'utf-8');
    
    // Configuration optimisée pour environnements serverless
    const buffer = await sharp(svgBuffer, {
      density: 150, // Réduire la densité pour éviter les problèmes de mémoire
    })
      .resize(width, height, { 
        fit: 'inside', 
        withoutEnlargement: false,
        background: { r: 255, g: 255, b: 255, alpha: 1 } 
      })
      .png({ 
        quality: 80, // Réduire la qualité pour des fichiers plus légers
        compressionLevel: 9,
        progressive: false, // Éviter les problèmes sur serverless
        force: true // Forcer le format PNG
      })
      .toBuffer();
      
    console.log(`PNG conversion successful, buffer size: ${buffer.length}`);
    return buffer;
  } catch (error) {
    console.error('Erreur lors de la conversion SVG vers PNG:', error);
    console.error('SVG content (first 500 chars):', svg.substring(0, 500));
    
    // Créer une image de fallback simple SANS polices complexes
    return createSimpleFallbackImage(width, height, 'Graphique');
  }
}

// Créer une image de fallback ultra-simple
async function createSimpleFallbackImage(width: number, height: number, text: string): Promise<Buffer> {
  try {
    // SVG ultra-simple sans polices externes
    const fallbackSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
      <text x="${width/2}" y="${height/2}" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial" font-size="16" fill="#6c757d">${text}</text>
    </svg>`;
    
    return await sharp(Buffer.from(fallbackSvg), { density: 72 })
      .png({ quality: 50, force: true })
      .toBuffer();
  } catch (error) {
    console.error('Impossible de créer l\'image de fallback:', error);
    
    // Dernier recours : créer un rectangle coloré simple
    return await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 248, g: 249, b: 250, alpha: 1 }
      }
    })
    .png()
    .toBuffer();
  }
}

export async function generateWordDocument(data: WordReportData): Promise<Buffer> {
  console.log('Starting Word document generation...');
  console.log('Report type:', data.type);
  console.log('Person:', data.person.firstName, data.person.lastName);
  console.log('Report content length:', data.reportContent.length);
  
  const children: Paragraph[] = [];

  // Convertir les graphiques SVG en PNG avec dimensions optimisées
  let chartBuffers: { [key: string]: Buffer } = {};
  try {
    console.log('Converting charts to PNG...');
    
    // Convertir chaque graphique avec une taille appropriée
    chartBuffers.family = await svgToPng(data.charts.family, 600, 400);
    console.log('Family chart converted');
    
    chartBuffers.radar = await svgToPng(data.charts.radar, 600, 600);
    console.log('Radar chart converted'); 
    
    chartBuffers.sorted = await svgToPng(data.charts.sorted, 600, 400);
    console.log('Sorted chart converted');
    
    console.log('All charts converted successfully');
  } catch (error) {
    console.error('Erreur lors de la conversion des graphiques:', error);
    console.error('Error details:', error instanceof Error ? error.stack : 'No stack');
    
    // Créer des images de fallback
    try {
      chartBuffers.family = await createSimpleFallbackImage(600, 400, 'Graphique par famille');
      chartBuffers.radar = await createSimpleFallbackImage(600, 600, 'Graphique radar');
      chartBuffers.sorted = await createSimpleFallbackImage(600, 400, 'Graphique trié');
    } catch (fallbackError) {
      console.error('Impossible de créer les images de fallback:', fallbackError);
    }
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
      if (currentSection === 2 && inSection1 && chartBuffers.family && chartBuffers.family.length > 0) {
        // Insérer le graphique des familles à la fin de la section 1
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
      } else if (currentSection === 3 && inSection2 && chartBuffers.radar && chartBuffers.radar.length > 0) {
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
      } else if (currentSection === 4 && inSection3 && chartBuffers.sorted && chartBuffers.sorted.length > 0) {
        // Insérer le graphique trié à la fin de la section 3
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