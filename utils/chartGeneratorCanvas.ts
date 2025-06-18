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

// Générer le graphique radar avec Canvas
export async function generateRadarChartCanvas(scores: { [key: string]: ScoreDetails }): Promise<Buffer> {
  const { createCanvas } = await import('canvas');
  
  const families = {
    "VOULOIR": ["Ambition", "Initiative", "Résilience"],
    "PENSER": ["Vision", "Recul", "Pertinence"],
    "AGIR": ["Organisation", "Décision", "Sens du résultat"],
    "ENSEMBLE": ["Communication", "Esprit d'équipe", "Leadership"]
  };
  
  // Ordre fixe
  const orderedCriteria = [...families.VOULOIR, ...families.PENSER, ...families.AGIR, ...families.ENSEMBLE];
  
  const data: ChartData[] = [];
  orderedCriteria.forEach(critere => {
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
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fond blanc
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 280;
  
  const numVars = data.length;
  const angleStep = (2 * Math.PI) / numVars;
  
  // Grille radiale
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (i / 5) * radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
  
  ctx.setLineDash([]);
  
  // Lignes radiales
  for (let i = 0; i < numVars; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  
  // Barres polaires
  data.forEach((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const barRadius = (d.score / 5) * radius;
    
    ctx.fillStyle = familyColors[d.famille];
    ctx.globalAlpha = 0.8;
    
    // Créer un secteur (approximation avec un polygone)
    const angleWidth = angleStep * 0.8; // 80% de la largeur disponible
    const startAngle = angle - angleWidth / 2;
    const endAngle = angle + angleWidth / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, barRadius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    
    // Contour blanc
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  
  // Labels et valeurs
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'black';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  data.forEach((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    
    // Position du label
    const labelR = radius + 40;
    const labelX = centerX + labelR * Math.cos(angle);
    const labelY = centerY + labelR * Math.sin(angle);
    
    // Position de la valeur
    const valueR = (d.score / 5) * radius + 20;
    const valueX = centerX + valueR * Math.cos(angle);
    const valueY = centerY + valueR * Math.sin(angle);
    
    // Label du critère (avec accents!)
    ctx.fillText(d.critere, labelX, labelY);
    
    // Valeur
    ctx.font = '12px Arial';
    ctx.fillText(d.score.toFixed(1), valueX, valueY);
    ctx.font = 'bold 14px Arial';
  });
  
  // Titre
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Vision globale des compétences', centerX, 40);
  
  return canvas.toBuffer('image/png');
}

// Générer l'histogramme horizontal trié
export async function generateSortedBarChartCanvas(scores: { [key: string]: ScoreDetails }): Promise<Buffer> {
  const { createCanvas } = await import('canvas');
  
  const data: ChartData[] = Object.values(scores).map(s => ({
    critere: s.critere,
    score: s.noteSur5,
    famille: s.famille
  })).sort((a, b) => b.score - a.score);
  
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fond blanc
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  
  const margin = { top: 60, right: 100, bottom: 40, left: 180 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const barHeight = chartHeight / data.length - 5;
  
  // Titre
  ctx.fillStyle = 'black';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Forces et axes de progression – Triés par score', width / 2, margin.top / 2);
  
  // Grille verticale
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  
  for (let i = 0; i <= 5; i++) {
    const x = margin.left + (i / 5) * chartWidth;
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, height - margin.bottom);
    ctx.stroke();
    
    // Labels de l'axe X
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(i.toString(), x, height - margin.bottom + 20);
  }
  
  ctx.setLineDash([]);
  
  // Barres
  data.forEach((d, i) => {
    const y = margin.top + i * (barHeight + 5);
    const barWidth = (d.score / 5) * chartWidth;
    
    // Barre
    ctx.fillStyle = familyColors[d.famille];
    ctx.globalAlpha = 0.8;
    ctx.fillRect(margin.left, y, barWidth, barHeight);
    
    // Label du critère (avec accents!)
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.critere, margin.left - 10, y + barHeight / 2);
    
    // Valeur
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(d.score.toFixed(1), margin.left + barWidth + 10, y + barHeight / 2);
  });
  
  // Label de l'axe X
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Score (1-5)', width / 2, height - 10);
  
  return canvas.toBuffer('image/png');
}

// Générer l'histogramme par famille
export async function generateFamilyBarChartCanvas(scores: { [key: string]: ScoreDetails }): Promise<Buffer> {
  const { createCanvas } = await import('canvas');
  
  const families = {
    "VOULOIR": ["Ambition", "Initiative", "Résilience"],
    "PENSER": ["Vision", "Recul", "Pertinence"],
    "AGIR": ["Organisation", "Décision", "Sens du résultat"],
    "ENSEMBLE": ["Communication", "Esprit d'équipe", "Leadership"]
  };
  
  const data: ChartData[] = [];
  Object.entries(families).forEach(([family, criteria]) => {
    criteria.forEach(critere => {
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
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fond blanc
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  
  const margin = { top: 60, right: 100, bottom: 40, left: 200 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const barHeight = chartHeight / data.length - 5;
  
  // Titre
  ctx.fillStyle = 'black';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Forces par famille de compétences', width / 2, margin.top / 2);
  
  // Grille verticale (similaire aux autres)
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  
  for (let i = 0; i <= 5; i++) {
    const x = margin.left + (i / 5) * chartWidth;
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, height - margin.bottom);
    ctx.stroke();
    
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(i.toString(), x, height - margin.bottom + 20);
  }
  
  ctx.setLineDash([]);
  
  // Barres et labels de famille
  let currentFamily = '';
  data.forEach((d, i) => {
    const y = margin.top + i * (barHeight + 5);
    const barWidth = (d.score / 5) * chartWidth;
    
    // Label de famille (vertical)
    if (d.famille !== currentFamily) {
      currentFamily = d.famille;
      const familyData = data.filter(item => item.famille === d.famille);
      const familyStartIdx = data.findIndex(item => item.famille === d.famille);
      const familyCenterY = margin.top + (familyStartIdx + familyData.length / 2 - 0.5) * (barHeight + 5);
      
      ctx.save();
      ctx.translate(30, familyCenterY);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = familyColors[d.famille];
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(d.famille, 0, 0);
      ctx.restore();
    }
    
    // Barre
    ctx.fillStyle = familyColors[d.famille];
    ctx.globalAlpha = 0.8;
    ctx.fillRect(margin.left, y, barWidth, barHeight);
    
    // Label du critère (avec accents!)
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.critere, margin.left - 10, y + barHeight / 2);
    
    // Valeur
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(d.score.toFixed(1), margin.left + barWidth + 10, y + barHeight / 2);
  });
  
  // Label de l'axe X
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Score (1-5)', width / 2, height - 10);
  
  return canvas.toBuffer('image/png');
} 