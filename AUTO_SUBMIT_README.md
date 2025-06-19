# Script de Soumission Automatique du Questionnaire RH

Ce script Node.js permet de soumettre automatiquement le questionnaire RH sans passer par l'interface web.

## 🚀 Installation rapide

### 1. Installer Node.js
Si Node.js n'est pas installé sur votre système :
- Téléchargez depuis [nodejs.org](https://nodejs.org/)
- Ou utilisez homebrew sur macOS : `brew install node`

### 2. Installer la dépendance
```bash
npm install node-fetch
```

### 3. Lancer le script
```bash
node auto-submit-questionnaire.js
```

## 📋 Modes d'utilisation

### Mode Autodiagnostic (défaut)
Soumet un questionnaire en mode autodiagnostic :
```bash
node auto-submit-questionnaire.js
# ou
node auto-submit-questionnaire.js auto
```

### Mode Évaluation
Soumet une évaluation d'un collaborateur :
```bash
node auto-submit-questionnaire.js evaluation
```

### Mode Combiné
Lance les deux modes successivement :
```bash
node auto-submit-questionnaire.js both
```

### Aide
Affiche l'aide détaillée :
```bash
node auto-submit-questionnaire.js help
```

## ⚙️ Configuration

### Modifier l'URL cible
Dans le fichier `auto-submit-questionnaire.js`, ligne 6 :
```javascript
const BASE_URL = 'https://votre-nouvelle-url.vercel.app';
```

### Personnaliser les informations utilisateur
Modifiez l'objet `userInfo` dans le script (lignes 9-15) :
```javascript
const userInfo = {
  firstName: 'Votre Prénom',
  lastName: 'Votre Nom',
  age: '35',
  profession: 'Votre Profession',
  email: 'votre-email@example.com'
};
```

### Personnaliser les réponses
Par défaut, le script génère des réponses aléaoires. Pour des réponses spécifiques, modifiez la fonction `generateResponses()`.

## 📊 Exemple de sortie

```
🔧 Script de soumission automatique du questionnaire RH
═══════════════════════════════════════════════════════════
🚀 Début de la soumission automatique du questionnaire...
📍 URL cible: https://questionnaire-rh-git-main-maximemarsal18-gmailcoms-projects.vercel.app
✅ Génération de 72 réponses automatiques
📋 Échantillon des réponses générées:
   1-1: b
   1-2: a
   1-3: c
   1-4: d
   1-5: e
   ...
👤 Informations utilisateur:
   Nom: Test Utilisateur
   Âge: 30 ans
   Profession: Développeur
   Email: test@example.com
📤 Envoi de la requête...
✅ SUCCESS! Questionnaire soumis avec succès
📧 Questionnaire et rapport envoyés avec succès.
📊 Statistiques des réponses:
   A (Tout à fait d'accord): 15
   B (D'accord): 14
   C (Neutre): 16
   D (Pas d'accord): 13
   E (Pas d'accord du tout): 14

🏁 Script terminé
```

## 🎯 Fonctionnalités

### Autodiagnostic
- ✅ Remplit automatiquement les informations utilisateur
- ✅ Génère 72 réponses automatiques (8 sections × 9 questions)
- ✅ Soumet via l'API `/api/submit-questionnaire`
- ✅ Affiche les statistiques des réponses générées

### Évaluation
- ✅ Génère des informations d'évaluation réalistes
- ✅ Même système de génération de réponses
- ✅ Soumet via l'API `/api/submit-evaluation`
- ✅ Gère la relation évaluateur/évalué

### Gestion d'erreurs
- ✅ Vérification des dépendances
- ✅ Gestion des erreurs réseau
- ✅ Messages d'erreur détaillés
- ✅ Codes de sortie appropriés

## 🔧 Dépannage

### Erreur "node-fetch not found"
```bash
npm install node-fetch
```

### Erreur de connexion
- Vérifiez votre connexion internet
- Vérifiez que l'URL du site est accessible
- Vérifiez que l'API est fonctionnelle

### Permission denied (macOS/Linux)
```bash
chmod +x auto-submit-questionnaire.js
./auto-submit-questionnaire.js
```

## 📝 Structure des données

### Réponses générées
Le script génère automatiquement des réponses pour les 72 questions :
- Format : `"1-1": "a"` (section-question: réponse)
- Réponses possibles : a, b, c, d, e
- Répartition aléatoire équilibrée

### Informations utilisateur (Autodiagnostic)
```javascript
{
  firstName: string,
  lastName: string,
  age: string,
  profession: string,
  email: string
}
```

### Informations d'évaluation
```javascript
{
  evaluatedPerson: {
    firstName: string,
    lastName: string,
    position: string,
    ageRange: string
  },
  evaluator: {
    relationship: string,
    hierarchyLevel: string
  },
  evaluatorEmail: string
}
```

## 🎛️ Utilisation avancée

### Script en tant que module
```javascript
const { submitQuestionnaire, submitEvaluation } = require('./auto-submit-questionnaire.js');

// Utilisation programmatique
await submitQuestionnaire();
await submitEvaluation();
```

### Personnalisation des réponses
```javascript
function generateCustomResponses() {
  const responses = {};
  
  // Exemple : réponses positives pour la première section
  for (let questionId = 1; questionId <= 9; questionId++) {
    responses[`1-${questionId}`] = 'a'; // Tout à fait d'accord
  }
  
  // Réponses aléaoires pour les autres sections
  for (let sectionId = 2; sectionId <= 8; sectionId++) {
    for (let questionId = 1; questionId <= 9; questionId++) {
      const options = ['a', 'b', 'c', 'd', 'e'];
      responses[`${sectionId}-${questionId}`] = options[Math.floor(Math.random() * options.length)];
    }
  }
  
  return responses;
}
```

## ⚠️ Avertissements

- Ce script est conçu pour des tests et démonstrations
- Utilisez des données de test, pas de vraies informations personnelles
- Respectez les limites d'usage de l'API
- Le script génère des emails automatiques - utilisez avec modération

## 📞 Support

En cas de problème :
1. Vérifiez les prérequis (Node.js, dépendances)
2. Consultez les messages d'erreur détaillés
3. Testez manuellement l'API via votre navigateur
4. Vérifiez la configuration réseau/firewall 