# 🎯 Script d'Auto-Soumission de Questionnaires RH

Ce script permet d'automatiser la soumission de questionnaires sur votre application RH déployée sur Vercel. Il est conçu pour tester votre application avec des données réalistes ou pour des démonstrations.

## 🚀 Installation

```bash
# Le script utilise uniquement les modules Node.js natifs
# Aucune installation de dépendances nécessaire
```

## 📋 Utilisation de base

### Soumettre un questionnaire simple

```bash
node auto-submit-questionnaire.js
```

### Mode test (sans envoi réel)

```bash
node auto-submit-questionnaire.js --dry-run
```

### Afficher l'aide

```bash
node auto-submit-questionnaire.js --help
```

## 🎚️ Options avancées

### Soumettre plusieurs questionnaires

```bash
# Soumettre 3 questionnaires
node auto-submit-questionnaire.js --count 3

# Soumettre 5 questionnaires avec différents profils
node auto-submit-questionnaire.js --count 5 --profiles average,high_performer,conservative
```

### Profils de réponses disponibles

Le script propose 4 profils de réponses avec des distributions différentes :

- **`high_performer`** : Performant élevé (favorise les réponses positives)
- **`average`** : Profil équilibré (distribution normale)
- **`conservative`** : Profil conservateur (favorise les réponses neutres)
- **`low_confidence`** : Confiance faible (favorise les réponses négatives)

```bash
# Utiliser un profil spécifique
node auto-submit-questionnaire.js --profile high_performer

# Lister tous les profils disponibles
node auto-submit-questionnaire.js --list-profiles
```

### Mode verbose

```bash
# Afficher un échantillon des réponses générées
node auto-submit-questionnaire.js --verbose --dry-run
```

## 📊 Exemples d'utilisation

### Test rapide

```bash
# Test d'un questionnaire sans l'envoyer
node auto-submit-questionnaire.js --dry-run --verbose
```

### Génération de données de test

```bash
# Créer 10 questionnaires avec des profils variés
node auto-submit-questionnaire.js --count 10 --profiles average,high_performer,conservative,low_confidence
```

### Démonstration client

```bash
# Soumettre 3 questionnaires performants pour la démo
node auto-submit-questionnaire.js --count 3 --profile high_performer
```

## 👥 Utilisateurs de test

Le script utilise 4 profils d'utilisateurs fictifs :

1. **Marie Dupont** - Manager Commercial, 35 ans
2. **Jean Martin** - Directeur Marketing, 42 ans  
3. **Sophie Bernard** - Chef de Projet IT, 28 ans
4. **Pierre Durand** - Responsable RH, 38 ans

Pour éviter les doublons lors de soumissions multiples, le script modifie automatiquement les emails et prénoms.

## 📈 Fonctionnalités

### ✅ Ce que le script fait :

- Génère automatiquement 72 réponses cohérentes selon le profil choisi
- Utilise des données utilisateur réalistes
- Respecte la structure exacte de votre API
- Inclut une pause entre les soumissions pour éviter la surcharge
- Fournit un rapport détaillé des succès/échecs
- Mode test pour validation sans envoi

### 🎯 Avantages :

- **Temps gagné** : Plus besoin de remplir manuellement 72 questions
- **Tests réalistes** : Différents profils de réponses pour tester divers cas de figure
- **Démonstrations** : Générer rapidement des rapports pour présenter l'application
- **Débogage** : Identifier les problèmes d'API ou de génération de rapports
- **Charge testing** : Tester la capacité du système avec plusieurs soumissions

## ⚙️ Configuration

### URL de l'application

Le script est configuré pour votre URL Vercel :
```javascript
const BASE_URL = 'https://questionnaire-rh-git-main-maximemarsal18-gmailcoms-projects.vercel.app';
```

Pour changer l'URL (par exemple pour tester en local) :
```bash
# Modifier la constante BASE_URL dans le script
# ou créer une variable d'environnement
export QUESTIONNAIRE_URL="http://localhost:3000"
```

## 🔧 Personnalisation

### Ajouter de nouveaux utilisateurs de test

Modifiez le tableau `testUsers` dans le script :
```javascript
const testUsers = [
  {
    firstName: 'Votre',
    lastName: 'Utilisateur',
    age: '30',
    profession: 'Votre Profession',
    email: 'votre.email@example.com'
  }
  // ... autres utilisateurs
];
```

### Créer de nouveaux profils de réponses

Ajoutez des profils dans `responseProfiles` :
```javascript
const responseProfiles = {
  'votre_profil': {
    name: 'Description du profil',
    weights: { a: 0.3, b: 0.3, c: 0.2, d: 0.1, e: 0.1 }
  }
};
```

## 🚨 Bonnes pratiques

1. **Utilisez `--dry-run`** pour tester avant la soumission réelle
2. **Limitez le nombre** de soumissions simultanées pour éviter la surcharge
3. **Variez les profils** pour obtenir des données de test diversifiées
4. **Vérifiez les emails** générés pour éviter le spam dans votre boîte

## 📝 Logs et debugging

Le script fournit des logs détaillés :
- ✅ Succès de génération et soumission
- ❌ Erreurs avec codes de statut
- 📊 Statistiques finales
- 🔄 Progression en temps réel

## 🔒 Sécurité

- Les emails utilisés sont fictifs (@example.com)
- Le script ne stocke aucune donnée localement
- Les requêtes utilisent HTTPS uniquement
- Mode dry-run pour les tests sans impact

---

## 🎪 Cas d'usage recommandés

### Pour le développement
```bash
node auto-submit-questionnaire.js --dry-run --verbose
```

### Pour les tests
```bash
node auto-submit-questionnaire.js --count 5 --profiles average,high_performer
```

### Pour les démonstrations
```bash
node auto-submit-questionnaire.js --count 3 --profile high_performer
```

### Pour le debugging
```bash
node auto-submit-questionnaire.js --count 1 --verbose
```

---

**🎯 Ce script vous fait économiser des heures de saisie manuelle et vous permet de tester votre application avec des données réalistes en quelques secondes !** 