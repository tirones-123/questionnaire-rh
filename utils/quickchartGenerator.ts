import { ScoreDetails } from './scoreCalculator';

const familyColors: { [key: string]: string } = {
  'VOULOIR': '#f47c20',  // orange
  'PENSER': '#1f77b4',   // bleu
  'AGIR': '#7f7f7f',     // gris
  'ENSEMBLE': '#2ca02c'  // vert
};

// Télécharger une image depuis une URL
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Générer le graphique radar avec QuickChart
export async function generateRadarChartBuffer(scores: { [key: string]: ScoreDetails }): Promise<Buffer> {
  const order = [
    'Ambition', 'Initiative', 'Résilience',
    'Vision', 'Recul', 'Pertinence',
    'Organisation', 'Décision', 'Sens du résultat',
    'Communication', "Esprit d'équipe", 'Leadership'
  ];
  
  // Mapping des critères vers leurs familles
  const criteriaToFamily: { [key: string]: string } = {
    'Ambition': 'VOULOIR',
    'Initiative': 'VOULOIR', 
    'Résilience': 'VOULOIR',
    'Vision': 'PENSER',
    'Recul': 'PENSER',
    'Pertinence': 'PENSER',
    'Organisation': 'AGIR',
    'Décision': 'AGIR',
    'Sens du résultat': 'AGIR',
    'Communication': 'ENSEMBLE',
    "Esprit d'équipe": 'ENSEMBLE',
    'Leadership': 'ENSEMBLE'
  };
  
  const data: number[] = [];
  const labels: string[] = [];
  const colors: string[] = [];
  
  order.forEach(critere => {
    if (scores[critere]) {
      data.push(scores[critere].noteSur5);
      labels.push(critere);
      colors.push(familyColors[criteriaToFamily[critere]]);
    }
  });

  const chartConfig = {
    type: 'polarArea',
    data: {
      labels: labels,
      datasets: [{
        label: 'Compétences',
        data: data,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Vision globale des compétences',
        fontSize: 18
      },
      scale: {
        ticks: {
          min: 0,
          max: 5,
          stepSize: 1
        }
      },
      legend: {
        display: false
      },
      maintainAspectRatio: true
    }
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
  const url = `https://quickchart.io/chart?c=${encodedConfig}&width=600&height=600&format=png`;
  
  return await downloadImage(url);
}

// Générer le graphique trié avec QuickChart
export async function generateSortedBarChartBuffer(scores: { [key: string]: ScoreDetails }): Promise<Buffer> {
  const sortedScores = Object.values(scores).sort((a, b) => b.noteSur5 - a.noteSur5);
  
  const chartConfig = {
    type: 'horizontalBar',
    data: {
      labels: sortedScores.map(s => s.critere),
      datasets: [{
        label: 'Score',
        data: sortedScores.map(s => s.noteSur5),
        backgroundColor: sortedScores.map(s => familyColors[s.famille] || '#999'),
        borderWidth: 0
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Forces et axes de progression - Triés par score',
        fontSize: 18
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          ticks: {
            min: 0,
            max: 5
          }
        }]
      }
    }
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
  const url = `https://quickchart.io/chart?c=${encodedConfig}&width=600&height=400&format=png`;
  
  return await downloadImage(url);
}

// Générer le graphique par famille avec QuickChart
export async function generateFamilyBarChartBuffer(scores: { [key: string]: ScoreDetails }): Promise<Buffer> {
  const families = ['VOULOIR', 'PENSER', 'AGIR', 'ENSEMBLE'];
  const criteriaByFamily: { [key: string]: string[] } = {
    'VOULOIR': ['Ambition', 'Initiative', 'Résilience'],
    'PENSER': ['Vision', 'Recul', 'Pertinence'],
    'AGIR': ['Organisation', 'Décision', 'Sens du résultat'],
    'ENSEMBLE': ['Communication', "Esprit d'équipe", 'Leadership']
  };
  
  const labels: string[] = [];
  const data: number[] = [];
  const colors: string[] = [];
  
  families.forEach(family => {
    criteriaByFamily[family].forEach(critere => {
      if (scores[critere]) {
        labels.push(critere);
        data.push(scores[critere].noteSur5);
        colors.push(familyColors[family]);
      }
    });
  });

  const chartConfig = {
    type: 'horizontalBar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Score',
        data: data,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Forces par famille de compétences',
        fontSize: 18
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          ticks: {
            min: 0,
            max: 5
          }
        }]
      }
    }
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
  const url = `https://quickchart.io/chart?c=${encodedConfig}&width=600&height=400&format=png`;
  
  return await downloadImage(url);
} 