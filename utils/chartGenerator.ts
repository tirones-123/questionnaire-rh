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

// Génération SVG plus robuste pour environnements serverless
function createSVGHeader(width: number, height: number): string {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <defs>
      <style>
        <![CDATA[
          .chart-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 18px; font-weight: bold; fill: #333; }
          .chart-label { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #333; }
          .chart-value { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 11px; font-weight: bold; fill: #000; }
          .chart-axis { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 11px; fill: #666; }
        ]]>
      </style>
    </defs>`;
}

// Générer le graphique radar (vision globale des compétences)
export function generateRadarChart(scores: { [key: string]: ScoreDetails }): string {
  const data: ChartData[] = [];
  const order = [
    'Ambition', 'Initiative', 'Résilience',
    'Vision', 'Recul', 'Pertinence',
    'Organisation', 'Décision', 'Sens du résultat',
    'Communication', "Esprit d'équipe", 'Leadership'
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
        critere: critere.replace(/'/g, "'").replace(/è/g, 'e').replace(/é/g, 'e'), // Simplifier les caractères
        score: scoreData.noteSur5,
        famille: scoreData.famille
      });
    }
  });
  
  const width = 800;
  const height = 800;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 280;
  
  const angleStep = (2 * Math.PI) / data.length;
  
  // Créer les coordonnées pour chaque point
  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (d.score / 5) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y, data: d, angle };
  });
  
  let svg = createSVGHeader(width, height);
  
  // Fond blanc
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Cercles de grille
  for (let i = 1; i <= 5; i++) {
    const r = (i / 5) * radius;
    svg += `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="#e0e0e0" stroke-width="1" opacity="0.5"/>`;
  }
  
  // Lignes radiales
  data.forEach((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    svg += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="#e0e0e0" stroke-width="1" opacity="0.5"/>`;
  });
  
  // Dessiner les barres comme des triangles depuis le centre
  points.forEach((point, i) => {
    const angle1 = i * angleStep - Math.PI / 2;
    const angle2 = ((i + 1) % data.length) * angleStep - Math.PI / 2;
    const r = (point.data.score / 5) * radius;
    
    // Points du triangle
    const x1 = centerX + r * Math.cos(angle1);
    const y1 = centerY + r * Math.sin(angle1);
    const x2 = centerX + r * Math.cos(angle2);
    const y2 = centerY + r * Math.sin(angle2);
    
    // Dessiner le secteur
    const largeArcFlag = angleStep > Math.PI ? 1 : 0;
    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    svg += `<path d="${path}" fill="${familyColors[point.data.famille]}" fill-opacity="0.7" stroke="white" stroke-width="2"/>`;
  });
  
  // Ajouter les valeurs et labels
  points.forEach((point, i) => {
    const angle = point.angle;
    const labelR = radius + 50;
    const labelX = centerX + labelR * Math.cos(angle);
    const labelY = centerY + labelR * Math.sin(angle);
    
    // Position de la valeur (au bout de la barre)
    const valueR = (point.data.score / 5) * radius + 20;
    const valueX = centerX + valueR * Math.cos(angle);
    const valueY = centerY + valueR * Math.sin(angle);
    
    // Label du critère
    svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" class="chart-label">${point.data.critere}</text>`;
    
    // Valeur
    svg += `<text x="${valueX}" y="${valueY}" text-anchor="middle" dominant-baseline="middle" class="chart-value">${point.data.score.toFixed(1)}</text>`;
  });
  
  // Titre
  svg += `<text x="${centerX}" y="30" text-anchor="middle" class="chart-title">Vision globale des competences</text>`;
  
  svg += '</svg>';
  
  return svg;
}

// Générer l'histogramme horizontal trié par score
export function generateSortedBarChart(scores: { [key: string]: ScoreDetails }): string {
  const data: ChartData[] = Object.values(scores).map(s => ({
    critere: s.critere.replace(/'/g, "'").replace(/è/g, 'e').replace(/é/g, 'e'),
    score: s.noteSur5,
    famille: s.famille
  })).sort((a, b) => b.score - a.score);
  
  const width = 800;
  const height = 600;
  const margin = { top: 60, right: 100, bottom: 40, left: 160 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const barHeight = Math.max(20, (chartHeight / data.length) - 5);
  
  let svg = createSVGHeader(width, height);
  
  // Fond blanc
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Titre
  svg += `<text x="${width / 2}" y="30" text-anchor="middle" class="chart-title">Forces et axes de progression - Tries par score</text>`;
  
  // Grille verticale
  for (let i = 0; i <= 5; i++) {
    const x = margin.left + (i / 5) * chartWidth;
    svg += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}" stroke="#e0e0e0" stroke-width="1" opacity="0.5"/>`;
    svg += `<text x="${x}" y="${height - margin.bottom + 20}" text-anchor="middle" class="chart-axis">${i}</text>`;
  }
  
  // Barres et labels
  data.forEach((d, i) => {
    const y = margin.top + i * (barHeight + 5);
    const barWidth = (d.score / 5) * chartWidth;
    
    // Barre
    svg += `<rect x="${margin.left}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${familyColors[d.famille]}" fill-opacity="0.8"/>`;
    
    // Label du critère
    svg += `<text x="${margin.left - 10}" y="${y + barHeight / 2}" text-anchor="end" dominant-baseline="middle" class="chart-label">${d.critere}</text>`;
    
    // Valeur
    svg += `<text x="${margin.left + barWidth + 10}" y="${y + barHeight / 2}" text-anchor="start" dominant-baseline="middle" class="chart-value">${d.score.toFixed(1)}</text>`;
  });
  
  // Label de l'axe X
  svg += `<text x="${width / 2}" y="${height - 10}" text-anchor="middle" class="chart-axis">Score (1-5)</text>`;
  
  svg += '</svg>';
  
  return svg;
}

// Générer l'histogramme par famille
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
          critere: critere.replace(/'/g, "'").replace(/è/g, 'e').replace(/é/g, 'e'),
          score: scoreData.noteSur5,
          famille: family
        });
      }
    });
  });
  
  const width = 800;
  const height = 600;
  const margin = { top: 60, right: 100, bottom: 40, left: 220 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const barHeight = Math.max(20, (chartHeight / data.length) - 5);
  
  let svg = createSVGHeader(width, height);
  
  // Fond blanc
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Titre
  svg += `<text x="${width / 2}" y="30" text-anchor="middle" class="chart-title">Forces par famille de competences</text>`;
  
  // Grille verticale
  for (let i = 0; i <= 5; i++) {
    const x = margin.left + (i / 5) * chartWidth;
    svg += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}" stroke="#e0e0e0" stroke-width="1" opacity="0.5"/>`;
    svg += `<text x="${x}" y="${height - margin.bottom + 20}" text-anchor="middle" class="chart-axis">${i}</text>`;
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
      svg += `<text x="40" y="${familyCenterY}" text-anchor="middle" class="chart-label" fill="${familyColors[d.famille]}" transform="rotate(-90, 40, ${familyCenterY})">${d.famille}</text>`;
    }
    
    // Barre
    svg += `<rect x="${margin.left}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${familyColors[d.famille]}" fill-opacity="0.8"/>`;
    
    // Label du critère
    svg += `<text x="${margin.left - 10}" y="${y + barHeight / 2}" text-anchor="end" dominant-baseline="middle" class="chart-label">${d.critere}</text>`;
    
    // Valeur
    svg += `<text x="${margin.left + barWidth + 10}" y="${y + barHeight / 2}" text-anchor="start" dominant-baseline="middle" class="chart-value">${d.score.toFixed(1)}</text>`;
  });
  
  // Label de l'axe X
  svg += `<text x="${width / 2}" y="${height - 10}" text-anchor="middle" class="chart-axis">Score (1-5)</text>`;
  
  svg += '</svg>';
  
  return svg;
}

// Convertir SVG en base64 pour l'inclure dans le document Word
export function svgToBase64(svg: string): string {
  const buffer = Buffer.from(svg, 'utf-8');
  return buffer.toString('base64');
} 