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
  
  const labels: string[] = [];
  const familyData: { [key: string]: number[] } = {
    'VOULOIR': [],
    'PENSER': [],
    'AGIR': [],
    'ENSEMBLE': []
  };
  
  // Créer les labels et préparer les données par famille
  order.forEach(critere => {
    if (scores[critere]) {
      labels.push(critere);
      const famille = criteriaToFamily[critere];
      
      // Pour chaque famille, ajouter le score du critère ou 0 si ce n'est pas sa famille
      Object.keys(familyData).forEach(fam => {
        if (fam === famille) {
          familyData[fam].push(scores[critere].noteSur5);
        } else {
          familyData[fam].push(0);
        }
      });
    }
  });

  // Créer les datasets pour chaque famille
  const datasets = Object.keys(familyData).map(famille => ({
    label: famille,
    data: familyData[famille],
    backgroundColor: familyColors[famille] + '40', // Transparence 40
    borderColor: familyColors[famille],
    borderWidth: 2,
    pointBackgroundColor: familyColors[famille],
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    pointRadius: 4
  }));

  const chartConfig = {
    type: 'radar',
    data: {
      labels: labels,
      datasets: datasets
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
        display: true,
        position: 'bottom'
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
        text: 'Forces et axes de progression',
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