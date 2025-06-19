# Questionnaire RH - Analyse du Potentiel

Application web permettant l'évaluation du potentiel professionnel à travers un questionnaire de 72 questions.

## 🎯 Fonctionnalités

### Modes d'utilisation
- **Autodiagnostic** : Auto-évaluation de son propre potentiel
- **Évaluation** : Évaluation du potentiel d'un collaborateur

### Processus automatisé
1. **Questionnaire en ligne** : 72 questions réparties en 8 sections
2. **Calcul automatique** : Évaluation de 12 critères de potentiel
3. **Génération de rapports** : 
   - Fichier Excel avec données brutes
   - Rapport Word personnalisé avec analyse GPT-4 et graphiques
4. **Envoi par email** : Architecture à deux emails pour éviter les timeouts

### 12 Critères évalués
Répartis en 4 familles :
- **VOULOIR** : Ambition, Initiative, Résilience
- **PENSER** : Vision, Recul, Pertinence  
- **AGIR** : Organisation, Décision, Sens du résultat
- **ENSEMBLE** : Communication, Esprit d'équipe, Leadership

## 📧 Architecture Email (Nouveau!)

Pour contourner la limite de 60 secondes de Vercel, le système envoie **deux emails séparés** :

### Email 1 (Immédiat)
- Envoyé instantanément après la soumission
- Contient le fichier Excel avec :
  - Réponses complètes aux 72 questions
  - Scores calculés par critère
  - Informations du participant/évalué

### Email 2 (Différé)
- Envoyé quelques minutes après
- Contient le rapport Word complet avec :
  - Analyse personnalisée GPT-4
  - 3 graphiques (radar, barres triées, barres par famille)
  - Recommandations de développement
  - Format professionnel avec police Avenir

Si le second email n'arrive pas dans les 10 minutes, un email d'erreur est envoyé avec les détails du problème.

## 🛠 Stack Technique

- **Framework** : Next.js 14
- **Language** : TypeScript
- **Déploiement** : Vercel
- **IA** : OpenAI GPT-4
- **Email** : Nodemailer
- **Documents** : ExcelJS + docx
- **Graphiques** : SVG générés en code + Sharp pour conversion PNG

## 📝 Variables d'environnement

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
OPENAI_API_KEY=sk-...
```

## 🚀 Installation locale

```bash
# Cloner le repository
git clone https://github.com/votre-username/questionnaire-rh.git

# Installer les dépendances
npm install

# Créer le fichier .env.local avec les variables ci-dessus

# Lancer en développement
npm run dev
```

## 📌 Points d'attention

- La génération du rapport Word nécessite une clé API OpenAI valide
- Le timeout de Vercel (60s) est contourné par l'architecture à deux emails
- Les graphiques sont générés en SVG puis convertis en PNG via Sharp
- L'interface est optimisée pour desktop et mobile

## 🔧 Dépannage

Voir [TROUBLESHOOTING.md](TROUBLESHOOTING.md) pour les problèmes courants.

## 📄 Documentation

- [Guide de déploiement](DEPLOYMENT.md)
- [Architecture technique](docs/architecture.md)
- [Format des rapports](docs/rapports.md)

### Technologies utilisées

- Next.js
- TypeScript 
- React
- Node.js
- Nodemailer (envoi d'emails)
- ExcelJS (génération Excel)
- Docx (génération Word)
- OpenAI API (analyse IA)
- QuickChart (génération de graphiques)

## Architecture

### Génération des graphiques

Les graphiques sont générés via **QuickChart.io**, un service externe qui garantit la compatibilité avec tous les environnements d'hébergement, y compris Vercel. Cette approche résout les problèmes de polices rencontrés avec les environnements serverless.

Pour plus de détails, consultez [CHARTS_DOCUMENTATION.md](./CHARTS_DOCUMENTATION.md).