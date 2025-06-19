# Documentation - Génération des graphiques

## Vue d'ensemble

La génération des graphiques dans ce projet utilise **QuickChart.io**, un service gratuit de génération de graphiques qui fonctionne parfaitement sur tous les environnements, y compris les environnements serverless comme Vercel.

## Pourquoi QuickChart ?

### Problèmes résolus :
- ❌ **Problème avec Sharp/SVG** : Les environnements serverless n'ont pas accès aux polices système, ce qui causait l'affichage de crochets (□□□) à la place du texte
- ❌ **Fontconfig error** : Erreur système impossible à résoudre sur Vercel
- ❌ **Complexité** : Conversion SVG → PNG compliquée et fragile

### Avantages de QuickChart :
- ✅ **Fonctionne partout** : Service externe, pas de dépendance système
- ✅ **Simple** : API REST qui retourne directement des PNG
- ✅ **Gratuit** : Jusqu'à des milliers de graphiques par mois
- ✅ **Fiable** : Service mature et stable
- ✅ **Rapide** : Génération instantanée

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Calcul des      │────▶│ QuickChart       │────▶│ Images PNG      │
│ scores          │     │ Generator        │     │ dans Word       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Fichiers principaux :

1. **`utils/quickchartGenerator.ts`**
   - Génère les 3 types de graphiques via l'API QuickChart
   - Retourne des buffers PNG prêts à être intégrés dans Word

2. **`utils/wordGenerator.ts`**
   - Reçoit les scores
   - Appelle QuickChart pour générer les graphiques
   - Intègre les PNG dans le document Word

3. **`utils/chartGenerator.ts`**
   - Contient uniquement les types et constantes partagés
   - Les anciennes fonctions SVG ont été supprimées

## Types de graphiques

### 1. Graphique Radar (Vision globale)
- **Fonction** : `generateRadarChartBuffer()`
- **Dimensions** : 600x600 px
- **Position** : Fin de la section 2

### 2. Graphique Barres Triées
- **Fonction** : `generateSortedBarChartBuffer()`
- **Dimensions** : 600x400 px
- **Position** : Fin de la section 3

### 3. Graphique par Famille
- **Fonction** : `generateFamilyBarChartBuffer()`
- **Dimensions** : 600x400 px
- **Position** : Fin de la section 1

## Utilisation

```typescript
// Dans l'API
const scores = calculateScores(responses);
const wordBuffer = await generateWordDocument({
  type: 'autodiagnostic',
  person: userInfo,
  reportContent,
  scores // Les graphiques sont générés automatiquement
});
```

## Personnalisation

Pour modifier l'apparence des graphiques, éditez les configurations dans `quickchartGenerator.ts` :

```typescript
const chartConfig = {
  type: 'radar',
  data: { ... },
  options: {
    title: {
      display: true,
      text: 'Titre du graphique',
      fontSize: 18
    },
    // Autres options Chart.js
  }
};
```

## Limites et considérations

- **Quota gratuit** : QuickChart offre un quota généreux mais limité
- **Connexion internet** : Nécessite une connexion pour générer les graphiques
- **Personnalisation** : Limitée aux options de Chart.js
- **Performance** : Dépend de la vitesse de l'API QuickChart

## Dépannage

### Les graphiques ne s'affichent pas
1. Vérifier la connexion internet
2. Vérifier les logs de la console pour les erreurs QuickChart
3. Tester l'URL QuickChart directement dans le navigateur

### Erreur de génération
- QuickChart peut être temporairement indisponible
- Vérifier le format des données envoyées
- Les graphiques sont optionnels, le rapport sera généré sans eux en cas d'erreur

## Migration depuis l'ancienne méthode

L'ancienne méthode utilisait :
- SVG générés localement
- Conversion avec Sharp
- Polices système

Cette approche a été complètement remplacée par QuickChart pour garantir la compatibilité avec tous les environnements. 