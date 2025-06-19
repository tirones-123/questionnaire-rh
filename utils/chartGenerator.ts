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

// Générer une URL QuickChart pour le graphique radar
export async function generateRadarChartURL(scores: { [key: string]: ScoreDetails }): Promise<string> {
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
    const originalCritere = Object.keys(criteriaMapping).find(key => criteriaMapping[key] === critere) || critere;
    if (scores[originalCritere] || scores[critere]) {
      const scoreData = scores[originalCritere] || scores[critere];
      data.push({
        critere: critere.replace(/é/g, 'e').replace(/è/g, 'e').replace(/'/g, ''),
        score: scoreData.noteSur5,
        famille: scoreData.famille
      });
    }
  });

  const chartConfig = {
    type: 'radar',
    data: {
      labels: data.map(d => d.critere),
      datasets: [{
        label: 'Competences',
        data: data.map(d => d.score),
        backgroundColor: 'rgba(74, 144, 226, 0.3)',
        borderColor: 'rgba(74, 144, 226, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(74, 144, 226, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Vision globale des competences',
          font: { size: 16 }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
  return `https://quickchart.io/chart?c=${encodedConfig}&width=600&height=600&format=png`;
}

// Générer une URL QuickChart pour le graphique trié
export async function generateSortedBarChartURL(scores: { [key: string]: ScoreDetails }): Promise<string> {
  const data: ChartData[] = Object.values(scores).map(s => ({
    critere: s.critere.replace(/é/g, 'e').replace(/è/g, 'e').replace(/'/g, ''),
    score: s.noteSur5,
    famille: s.famille
  })).sort((a, b) => b.score - a.score);

  const chartConfig = {
    type: 'bar',
    data: {
      labels: data.map(d => d.critere),
      datasets: [{
        label: 'Score',
        data: data.map(d => d.score),
        backgroundColor: data.map(d => familyColors[d.famille]),
        borderWidth: 0
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        title: {
          display: true,
          text: 'Forces et axes de progression',
          font: { size: 16 }
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          min: 0,
          max: 5
        }
      }
    }
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
  return `https://quickchart.io/chart?c=${encodedConfig}&width=600&height=400&format=png`;
}

// Générer une URL QuickChart pour le graphique par famille
export async function generateFamilyBarChartURL(scores: { [key: string]: ScoreDetails }): Promise<string> {
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
          critere: critere.replace(/é/g, 'e').replace(/è/g, 'e').replace(/'/g, ''),
          score: scoreData.noteSur5,
          famille: family
        });
      }
    });
  });

  const chartConfig = {
    type: 'bar',
    data: {
      labels: data.map(d => d.critere),
      datasets: [{
        label: 'Score',
        data: data.map(d => d.score),
        backgroundColor: data.map(d => familyColors[d.famille]),
        borderWidth: 0
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        title: {
          display: true,
          text: 'Forces par famille de competences',
          font: { size: 16 }
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          min: 0,
          max: 5
        }
      }
    }
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
  return `https://quickchart.io/chart?c=${encodedConfig}&width=600&height=400&format=png`;
}

// GARDER LES ANCIENNES FONCTIONS pour compatibilité mais les marquer comme deprecated
// Générer le graphique radar SANS TEXTE (plus robuste)
export function generateRadarChart(scores: { [key: string]: ScoreDetails }): string {
  console.warn('generateRadarChart is deprecated, use generateRadarChartURL instead');
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
  const radius = 250;
  
  // SVG minimal sans texte
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Cercles de grille
  for (let i = 1; i <= 5; i++) {
    const r = (i / 5) * radius;
    svg += `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="#e0e0e0" stroke-width="1"/>`;
  }
  
  svg += '</svg>';
  return svg;
}

// Version simplifiée pour compatibilité
export function generateSortedBarChart(scores: { [key: string]: ScoreDetails }): string {
  console.warn('generateSortedBarChart is deprecated, use generateSortedBarChartURL instead');
  return '<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="white"/></svg>';
}

export function generateFamilyBarChart(scores: { [key: string]: ScoreDetails }): string {
  console.warn('generateFamilyBarChart is deprecated, use generateFamilyBarChartURL instead');
  return '<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="white"/></svg>';
}

// Convertir SVG en base64 pour l'inclure dans le document Word
export function svgToBase64(svg: string): string {
  const buffer = Buffer.from(svg, 'utf-8');
  return buffer.toString('base64');
} 