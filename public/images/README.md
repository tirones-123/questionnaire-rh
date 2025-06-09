# Dossier Images

## Logo de l'application

Pour ajouter votre logo à l'application QAP :

### 1. Ajouter votre fichier logo
Placez votre fichier logo dans ce dossier `/public/images/` avec un de ces noms :
- `logo.png`
- `logo.jpg` 
- `logo.svg`
- `logo.webp`

### 2. Formats recommandés
- **PNG** : Pour un logo avec transparence
- **SVG** : Pour une qualité parfaite à toutes les tailles (recommandé)
- **JPG** : Pour une photo/logo sans transparence

### 3. Dimensions recommandées
- **Largeur** : 150-200px pour l'affichage standard
- **Hauteur** : 50-80px pour l'affichage standard
- **Ratio** : Le logo sera automatiquement redimensionné

### 4. Où le logo apparaîtra
Le logo sera affiché :
- En haut des pages d'accueil (autodiagnostic et évaluation)
- Dans l'en-tête du questionnaire
- Sur la page de finalisation

### 5. Exemple d'utilisation dans le code
```jsx
// Le logo sera affiché comme ceci :
<img 
  src="/images/logo.png" 
  alt="Logo" 
  style={{ height: '60px', marginBottom: '1rem' }}
/>
```

---

**Note** : Après avoir ajouté votre logo, l'application le détectera automatiquement et l'affichera dans l'interface. 