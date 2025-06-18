import { ScoreDetails } from './scoreCalculator';

export interface ChartData {
  critere: string;
  score: number;
  famille: string;
}

const familyColors: { [key: string]: string } = {
  'VOULOIR': '#f47c20',  // orange
  'PENSER': '#1f77b4',   // bleu
  'AGIR': '#7f7f7f',     // gris
  'ENSEMBLE': '#2ca02c'  // vert
};

// Police simple intégrée en base64 (minimal subset d'Arial)
const EMBEDDED_FONT_BASE64 = "data:font/woff2;base64,d09GMgABAAAAAA+gAAoAAAAAFdgAAA9TAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhYbIBwaBmAAgTIIVAmBQhEICooyiWULYAABNgIkAzAEIAWDHAeFGgyCahvHzb4oDrIxOTJi/38TcCOj2aJV6vZmd7dbKYQgBOEHIWPHDkVh2zZtsW2LFdu2bdu2bdu2bdu2bdu27f6dm5nZ2Z2de2+e537POc89533n/d/nvPd7z3sAAADqAECAAEAAAKADABQBAAAAVgEAoAoAFQBAAigAAAAqAFQEAACoAAAAaABQBQAAqAlAOQAAqAAA5QBQCwC0AkBjAGgLgI4A0AUAXQGgOwD0BIBeANAbAPoCQD8A6A8AAwBgIAAMBoBhADAcAEYAwEgAGAUAowFgDACMBYBxADAeACYAwEQAmAQAkwFgCgBMBYBpADADAGYCwCwAmA0AcwBgLgDMA4D5ALAAABYCwCIAWAwASwBgKQAsA4DlALACAFYCwCoAWA0AawBgLQCsA4D1ALABADYCwCYA2AwAWwBgKwBsA4DtALADAHYCwC4A2A0AewBgLwDsA4D9AHAAAJYDwCEAOAwARwDgKAAcA4DjAHACAE4CwCkAOA0AZwDgLACcA4DzAHABAC4CwCUAuAwAVwDgKgBcA4DrAHADAG4CwC0AuA0AdwDgLgDcA4D7APAAABYCwEMAeAQAjwHgCQA8BYBnAPAcAF4AwEsAeAUArwHgDQC8BYB3APAeAD4AwEcA+AQAnwHgCwB8BYBvAPAdAH4AwE8A+AUAvwHgDwD8BYC/EIBfCMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgF8EwC8C4BcB8IsA+EUA/CIAfhEAvwiAXwTALwLgFwHwiwD4RQD8IgB+EQC/CIBfBMAvAuAXAfCLAPhFAPwiAH4RAL8IgL8=";

// Génération SVG avec police embarquée
function createSVGHeader(width: number, height: number): string {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <defs>
      <style>
        <![CDATA[
          @font-face {
            font-family: 'ChartFont';
            src: url('${EMBEDDED_FONT_BASE64}') format('woff2');
            font-weight: normal;
            font-style: normal;
          }
          .chart-title { font-family: 'ChartFont', Arial, sans-serif; font-size: 18px; font-weight: bold; fill: #333; }
          .chart-label { font-family: 'ChartFont', Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #333; }
          .chart-value { font-family: 'ChartFont', Arial, sans-serif; font-size: 11px; font-weight: bold; fill: #000; }
          .chart-axis { font-family: 'ChartFont', Arial, sans-serif; font-size: 11px; fill: #666; }
        ]]>
      </style>
    </defs>`;
}

// Version simplifiée sans police pour plus de robustesse
function createSimpleSVGHeader(width: number, height: number): string {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`;
}

// Générer le graphique radar SANS TEXTE (plus robuste)
export function generateRadarChart(scores: { [key: string]: ScoreDetails }): string {
  const data: ChartData[] = [];
  const order = [
    'Ambition', 'Initiative', 'Resilience',
    'Vision', 'Recul', 'Pertinence',
    'Organisation', 'Decision', 'Sens du resultat',
    'Communication', "Esprit d'equipe", 'Leadership'
  ];
  
  const criteriaMapping: { [key: string]: string } = {
    'Résilience': 'Resilience',
    'Décision': 'Decision', 
    'Sens du résultat': 'Sens du resultat',
    'Esprit d\'équipe': 'Esprit d equipe'
  };
  
  order.forEach(critere => {
    // Chercher d'abord avec le nom mappé, puis avec le nom original
    const originalCritere = Object.keys(criteriaMapping).find(key => criteriaMapping[key] === critere) || critere;
    if (scores[originalCritere] || scores[critere]) {
      const scoreData = scores[originalCritere] || scores[critere];
      data.push({
        critere: critere,
        score: scoreData.noteSur5,
        famille: scoreData.famille
      });
    }
  });
  
  const width = 800;
  const height = 800;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 250; // Réduire pour laisser de la place aux légendes
  
  const angleStep = (2 * Math.PI) / data.length;
  
  // Créer les coordonnées pour chaque point
  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (d.score / 5) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y, data: d, angle };
  });
  
  let svg = createSimpleSVGHeader(width, height);
  
  // Fond blanc
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Titre simple
  svg += `<rect x="250" y="15" width="300" height="25" fill="#f0f0f0" stroke="#ccc"/>`;
  svg += `<text x="${centerX}" y="32" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Radar des competences</text>`;
  
  // Cercles de grille avec valeurs
  for (let i = 1; i <= 5; i++) {
    const r = (i / 5) * radius;
    svg += `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="#e0e0e0" stroke-width="1" opacity="0.7"/>`;
    // Ajouter la valeur du cercle
    svg += `<text x="${centerX + r + 5}" y="${centerY + 3}" font-family="Arial" font-size="10" fill="#666">${i}</text>`;
  }
  
  // Lignes radiales
  data.forEach((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    svg += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="#e0e0e0" stroke-width="1" opacity="0.7"/>`;
  });
  
  // Dessiner la forme du radar (polygone plein)
  let pathData = 'M ';
  points.forEach((point, i) => {
    pathData += `${point.x} ${point.y}`;
    if (i < points.length - 1) pathData += ' L ';
  });
  pathData += ' Z';
  
  svg += `<path d="${pathData}" fill="#4a90e2" fill-opacity="0.3" stroke="#4a90e2" stroke-width="2"/>`;
  
  // Ajouter les points
  points.forEach((point) => {
    svg += `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#4a90e2" stroke="white" stroke-width="2"/>`;
  });
  
  // Légende en bas avec couleurs par famille
  let legendY = height - 100;
  let legendX = 50;
  
  // Grouper par famille pour la légende
  const familyData: { [key: string]: ChartData[] } = {};
  data.forEach(d => {
    if (!familyData[d.famille]) familyData[d.famille] = [];
    familyData[d.famille].push(d);
  });
  
  Object.entries(familyData).forEach(([famille, items], familyIndex) => {
    // Titre de famille
    svg += `<rect x="${legendX}" y="${legendY}" width="12" height="12" fill="${familyColors[famille]}"/>`;
    svg += `<text x="${legendX + 20}" y="${legendY + 9}" font-family="Arial" font-size="12" font-weight="bold" fill="#333">${famille}</text>`;
    legendY += 20;
    
    // Items de la famille
    items.forEach(item => {
      svg += `<text x="${legendX + 10}" y="${legendY + 9}" font-family="Arial" font-size="10" fill="#666">${item.critere}: ${item.score.toFixed(1)}</text>`;
      legendY += 15;
    });
    legendY += 5;
  });
  
  svg += '</svg>';
  
  return svg;
}

// Générer l'histogramme horizontal trié par score SIMPLIFIÉ
export function generateSortedBarChart(scores: { [key: string]: ScoreDetails }): string {
  const data: ChartData[] = Object.values(scores).map(s => ({
    critere: s.critere.replace(/'/g, "'").replace(/è/g, 'e').replace(/é/g, 'e').replace(/ê/g, 'e'),
    score: s.noteSur5,
    famille: s.famille
  })).sort((a, b) => b.score - a.score);
  
  const width = 800;
  const height = 600;
  const margin = { top: 60, right: 100, bottom: 40, left: 160 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const barHeight = Math.max(20, (chartHeight / data.length) - 5);
  
  let svg = createSimpleSVGHeader(width, height);
  
  // Fond blanc
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Titre avec fond
  svg += `<rect x="200" y="15" width="400" height="25" fill="#f0f0f0" stroke="#ccc"/>`;
  svg += `<text x="${width / 2}" y="32" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Competences triees par score</text>`;
  
  // Grille verticale avec valeurs
  for (let i = 0; i <= 5; i++) {
    const x = margin.left + (i / 5) * chartWidth;
    svg += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}" stroke="#e0e0e0" stroke-width="1" opacity="0.7"/>`;
    svg += `<text x="${x}" y="${height - margin.bottom + 15}" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">${i}</text>`;
  }
  
  // Barres et labels
  data.forEach((d, i) => {
    const y = margin.top + i * (barHeight + 5);
    const barWidth = (d.score / 5) * chartWidth;
    
    // Barre
    svg += `<rect x="${margin.left}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${familyColors[d.famille]}" fill-opacity="0.8"/>`;
    
    // Label du critère avec fond
    const textWidth = d.critere.length * 6;
    svg += `<rect x="${margin.left - textWidth - 15}" y="${y}" width="${textWidth + 10}" height="${barHeight}" fill="white" fill-opacity="0.9"/>`;
    svg += `<text x="${margin.left - 10}" y="${y + barHeight / 2 + 3}" text-anchor="end" font-family="Arial" font-size="11" fill="#333">${d.critere}</text>`;
    
    // Valeur
    svg += `<text x="${margin.left + barWidth + 5}" y="${y + barHeight / 2 + 3}" text-anchor="start" font-family="Arial" font-size="11" font-weight="bold" fill="#333">${d.score.toFixed(1)}</text>`;
  });
  
  svg += '</svg>';
  
  return svg;
}

// Générer l'histogramme par famille SIMPLIFIÉ
export function generateFamilyBarChart(scores: { [key: string]: ScoreDetails }): string {
  // Ordonner les critères par famille
  const families = ['VOULOIR', 'PENSER', 'AGIR', 'ENSEMBLE'];
  const criteriaByFamily: { [key: string]: string[] } = {
    'VOULOIR': ['Ambition', 'Initiative', 'Résilience'],
    'PENSER': ['Vision', 'Recul', 'Pertinence'],
    'AGIR': ['Organisation', 'Décision', 'Sens du résultat'],
    'ENSEMBLE': ['Communication', "Esprit d'équipe", 'Leadership']
  };
  
  const data: ChartData[] = [];
  families.forEach(family => {
    criteriaByFamily[family].forEach(critere => {
      if (scores[critere]) {
        const scoreData = scores[critere];
        data.push({
          critere: critere.replace(/'/g, "'").replace(/è/g, 'e').replace(/é/g, 'e').replace(/ê/g, 'e'),
          score: scoreData.noteSur5,
          famille: family
        });
      }
    });
  });
  
  const width = 800;
  const height = 600;
  const margin = { top: 60, right: 100, bottom: 40, left: 200 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const barHeight = Math.max(20, (chartHeight / data.length) - 5);
  
  let svg = createSimpleSVGHeader(width, height);
  
  // Fond blanc
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Titre avec fond
  svg += `<rect x="200" y="15" width="400" height="25" fill="#f0f0f0" stroke="#ccc"/>`;
  svg += `<text x="${width / 2}" y="32" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Competences par famille</text>`;
  
  // Grille verticale
  for (let i = 0; i <= 5; i++) {
    const x = margin.left + (i / 5) * chartWidth;
    svg += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}" stroke="#e0e0e0" stroke-width="1" opacity="0.7"/>`;
    svg += `<text x="${x}" y="${height - margin.bottom + 15}" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">${i}</text>`;
  }
  
  // Barres et labels par famille
  let currentFamily = '';
  data.forEach((d, i) => {
    const y = margin.top + i * (barHeight + 5);
    const barWidth = (d.score / 5) * chartWidth;
    
    // Si nouvelle famille, ajouter le label de famille
    if (d.famille !== currentFamily) {
      currentFamily = d.famille;
      const familyStartY = y;
      const familyCount = data.filter(item => item.famille === d.famille).length;
      const familyCenterY = familyStartY + (familyCount * (barHeight + 5)) / 2;
      
      // Label de famille avec fond coloré
      svg += `<rect x="10" y="${familyCenterY - 30}" width="80" height="60" fill="${familyColors[d.famille]}" fill-opacity="0.2" stroke="${familyColors[d.famille]}"/>`;
      svg += `<text x="50" y="${familyCenterY + 3}" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="${familyColors[d.famille]}">${d.famille}</text>`;
    }
    
    // Barre
    svg += `<rect x="${margin.left}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${familyColors[d.famille]}" fill-opacity="0.8"/>`;
    
    // Label du critère avec fond
    const textWidth = d.critere.length * 6;
    svg += `<rect x="${margin.left - textWidth - 15}" y="${y}" width="${textWidth + 10}" height="${barHeight}" fill="white" fill-opacity="0.9"/>`;
    svg += `<text x="${margin.left - 10}" y="${y + barHeight / 2 + 3}" text-anchor="end" font-family="Arial" font-size="11" fill="#333">${d.critere}</text>`;
    
    // Valeur
    svg += `<text x="${margin.left + barWidth + 5}" y="${y + barHeight / 2 + 3}" text-anchor="start" font-family="Arial" font-size="11" font-weight="bold" fill="#333">${d.score.toFixed(1)}</text>`;
  });
  
  svg += '</svg>';
  
  return svg;
}

// Convertir SVG en base64 pour l'inclure dans le document Word
export function svgToBase64(svg: string): string {
  const buffer = Buffer.from(svg, 'utf-8');
  return buffer.toString('base64');
} 