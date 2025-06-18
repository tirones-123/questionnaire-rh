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

// Fonction pour encoder les caractères spéciaux en entités HTML
function encodeForSVG(text: string): string {
  return text
    .replace(/à/g, '&#224;')
    .replace(/â/g, '&#226;')
    .replace(/ä/g, '&#228;')
    .replace(/é/g, '&#233;')
    .replace(/è/g, '&#232;')
    .replace(/ê/g, '&#234;')
    .replace(/ë/g, '&#235;')
    .replace(/î/g, '&#238;')
    .replace(/ï/g, '&#239;')
    .replace(/ô/g, '&#244;')
    .replace(/ö/g, '&#246;')
    .replace(/ù/g, '&#249;')
    .replace(/û/g, '&#251;')
    .replace(/ü/g, '&#252;')
    .replace(/ÿ/g, '&#255;')
    .replace(/ç/g, '&#231;')
    .replace(/'/g, '&#39;')
    .replace(/À/g, '&#192;')
    .replace(/Â/g, '&#194;')
    .replace(/Ä/g, '&#196;')
    .replace(/É/g, '&#201;')
    .replace(/È/g, '&#200;')
    .replace(/Ê/g, '&#202;')
    .replace(/Ë/g, '&#203;')
    .replace(/Î/g, '&#206;')
    .replace(/Ï/g, '&#207;')
    .replace(/Ô/g, '&#212;')
    .replace(/Ö/g, '&#214;')
    .replace(/Ù/g, '&#217;')
    .replace(/Û/g, '&#219;')
    .replace(/Ü/g, '&#220;')
    .replace(/Ç/g, '&#199;')
    .replace(/–/g, '&#8211;'); // tiret cadratin
}

// Générer le graphique radar (vision globale des compétences)
export function generateRadarChartImproved(scores: { [key: string]: ScoreDetails }): string {
  const data: ChartData[] = [];
  const order = [
    'Ambition', 'Initiative', 'Résilience',  // VOULOIR
    'Vision', 'Recul', 'Pertinence',        // PENSER
    'Organisation', 'Décision', 'Sens du résultat',  // AGIR
    'Communication', 'Esprit d\'équipe', 'Leadership'  // ENSEMBLE
  ];
  
  order.forEach(critere => {
    if (scores[critere]) {
      data.push({
        critere,
        score: scores[critere].noteSur5,
        famille: scores[critere].famille
      });
    }
  });
  
  const width = 800;
  const height = 800;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 300;
  
  const angleStep = (2 * Math.PI) / data.length;
  
  // Créer les coordonnées pour chaque point
  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (d.score / 5) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y, data: d, angle };
  });
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <style type="text/css">
      <![CDATA[
        .chart-text { font-family: Arial, sans-serif; }
        .chart-title { font-size: 20px; font-weight: bold; }
        .chart-label { font-size: 14px; font-weight: bold; }
        .chart-value { font-size: 12px; }
      ]]>
    </style>
  </defs>`;
  
  // Fond blanc
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Cercles de grille
  for (let i = 1; i <= 5; i++) {
    const r = (i / 5) * radius;
    svg += `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="2,2"/>`;
  }
  
  // Lignes radiales
  data.forEach((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    svg += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="#e0e0e0" stroke-width="1"/>`;
  });
  
  // Dessiner les barres polaires
  points.forEach((point, i) => {
    const nextAngle = (i + 1) * angleStep - Math.PI / 2;
    const path = `M ${centerX} ${centerY} L ${point.x} ${point.y} A ${(point.data.score / 5) * radius} ${(point.data.score / 5) * radius} 0 0 1 ${centerX + (point.data.score / 5) * radius * Math.cos(nextAngle)} ${centerY + (point.data.score / 5) * radius * Math.sin(nextAngle)} Z`;
    svg += `<path d="${path}" fill="${familyColors[point.data.famille]}" fill-opacity="0.8" stroke="white" stroke-width="2"/>`;
  });
  
  // Ajouter les valeurs et labels
  points.forEach((point, i) => {
    const angle = point.angle;
    const labelR = radius + 30;
    const labelX = centerX + labelR * Math.cos(angle);
    const labelY = centerY + labelR * Math.sin(angle);
    
    // Position de la valeur (au bout de la barre)
    const valueR = (point.data.score / 5) * radius + 15;
    const valueX = centerX + valueR * Math.cos(angle);
    const valueY = centerY + valueR * Math.sin(angle);
    
    // Label du critère (avec entités HTML pour les accents)
    svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" class="chart-text chart-label">${encodeForSVG(point.data.critere)}</text>`;
    
    // Valeur
    svg += `<text x="${valueX}" y="${valueY}" text-anchor="middle" dominant-baseline="middle" class="chart-text chart-value" fill="black">${point.data.score.toFixed(1)}</text>`;
  });
  
  // Titre
  svg += `<text x="${centerX}" y="40" text-anchor="middle" class="chart-text chart-title">${encodeForSVG('Vision globale des compétences')}</text>`;
  
  svg += '</svg>';
  
  return svg;
}

// Générer l'histogramme horizontal trié par score
export function generateSortedBarChartImproved(scores: { [key: string]: ScoreDetails }): string {
  const data: ChartData[] = Object.values(scores).map(s => ({
    critere: s.critere,
    score: s.noteSur5,
    famille: s.famille
  })).sort((a, b) => b.score - a.score);
  
  const width = 800;
  const height = 600;
  const margin = { top: 60, right: 100, bottom: 40, left: 150 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const barHeight = chartHeight / data.length - 5;
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css">
      <![CDATA[
        .chart-text { font-family: Arial, sans-serif; }
        .chart-title { font-size: 20px; font-weight: bold; }
        .chart-label { font-size: 14px; }
        .chart-value { font-size: 14px; font-weight: bold; }
        .chart-axis { font-size: 12px; }
      ]]>
    </style>
  </defs>`;
  
  // Fond blanc
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Titre
  svg += `<text x="${width / 2}" y="${margin.top / 2}" text-anchor="middle" class="chart-text chart-title">${encodeForSVG('Forces et axes de progression – Triés par score')}</text>`;
  
  // Grille verticale
  for (let i = 0; i <= 5; i++) {
    const x = margin.left + (i / 5) * chartWidth;
    svg += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="2,2"/>`;
    svg += `<text x="${x}" y="${height - margin.bottom + 20}" text-anchor="middle" class="chart-text chart-axis">${i}</text>`;
  }
  
  // Barres et labels
  data.forEach((d, i) => {
    const y = margin.top + i * (barHeight + 5);
    const barWidth = (d.score / 5) * chartWidth;
    
    // Barre
    svg += `<rect x="${margin.left}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${familyColors[d.famille]}" fill-opacity="0.8"/>`;
    
    // Label du critère (avec entités HTML)
    svg += `<text x="${margin.left - 10}" y="${y + barHeight / 2}" text-anchor="end" dominant-baseline="middle" class="chart-text chart-label">${encodeForSVG(d.critere)}</text>`;
    
    // Valeur
    svg += `<text x="${margin.left + barWidth + 10}" y="${y + barHeight / 2}" text-anchor="start" dominant-baseline="middle" class="chart-text chart-value">${d.score.toFixed(1)}</text>`;
  });
  
  // Label de l'axe X
  svg += `<text x="${width / 2}" y="${height - 10}" text-anchor="middle" class="chart-text chart-label">Score (1-5)</text>`;
  
  svg += '</svg>';
  
  return svg;
}

// Générer l'histogramme par famille
export function generateFamilyBarChartImproved(scores: { [key: string]: ScoreDetails }): string {
  // Ordonner les critères par famille
  const families = ['VOULOIR', 'PENSER', 'AGIR', 'ENSEMBLE'];
  const criteriaByFamily: { [key: string]: string[] } = {
    'VOULOIR': ['Ambition', 'Initiative', 'Résilience'],
    'PENSER': ['Vision', 'Recul', 'Pertinence'],
    'AGIR': ['Organisation', 'Décision', 'Sens du résultat'],
    'ENSEMBLE': ['Communication', 'Esprit d\'équipe', 'Leadership']
  };
  
  const data: ChartData[] = [];
  families.forEach(family => {
    criteriaByFamily[family].forEach(critere => {
      if (scores[critere]) {
        data.push({
          critere,
          score: scores[critere].noteSur5,
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
  const barHeight = chartHeight / data.length - 5;
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css">
      <![CDATA[
        .chart-text { font-family: Arial, sans-serif; }
        .chart-title { font-size: 20px; font-weight: bold; }
        .chart-label { font-size: 14px; }
        .chart-value { font-size: 14px; font-weight: bold; }
        .chart-family { font-size: 14px; font-weight: bold; }
        .chart-axis { font-size: 12px; }
      ]]>
    </style>
  </defs>`;
  
  // Fond blanc
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Titre
  svg += `<text x="${width / 2}" y="${margin.top / 2}" text-anchor="middle" class="chart-text chart-title">${encodeForSVG('Forces par famille de compétences')}</text>`;
  
  // Grille verticale
  for (let i = 0; i <= 5; i++) {
    const x = margin.left + (i / 5) * chartWidth;
    svg += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="2,2"/>`;
    svg += `<text x="${x}" y="${height - margin.bottom + 20}" text-anchor="middle" class="chart-text chart-axis">${i}</text>`;
  }
  
  // Barres et labels
  let currentFamily = '';
  
  data.forEach((d, i) => {
    const y = margin.top + i * (barHeight + 5);
    const barWidth = (d.score / 5) * chartWidth;
    
    // Si nouvelle famille, ajouter le label de famille
    if (d.famille !== currentFamily) {
      currentFamily = d.famille;
      const familyStartY = y;
      const familyCount = data.filter(item => item.famille === d.famille).length;
      const familyCenterY = familyStartY + (familyCount * (barHeight + 5)) / 2 - 2.5;
      
      // Label de famille (vertical)
      svg += `<text x="30" y="${familyCenterY}" text-anchor="middle" class="chart-text chart-family" fill="${familyColors[d.famille]}" transform="rotate(-90, 30, ${familyCenterY})">${d.famille}</text>`;
    }
    
    // Barre
    svg += `<rect x="${margin.left}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${familyColors[d.famille]}" fill-opacity="0.8"/>`;
    
    // Label du critère (avec entités HTML)
    svg += `<text x="${margin.left - 10}" y="${y + barHeight / 2}" text-anchor="end" dominant-baseline="middle" class="chart-text chart-label">${encodeForSVG(d.critere)}</text>`;
    
    // Valeur
    svg += `<text x="${margin.left + barWidth + 10}" y="${y + barHeight / 2}" text-anchor="start" dominant-baseline="middle" class="chart-text chart-value">${d.score.toFixed(1)}</text>`;
  });
  
  // Label de l'axe X
  svg += `<text x="${width / 2}" y="${height - 10}" text-anchor="middle" class="chart-text chart-label">Score (1-5)</text>`;
  
  svg += '</svg>';
  
  return svg;
} 