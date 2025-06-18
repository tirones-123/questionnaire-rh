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

## Gestion des caractères français dans les graphiques

### Problème résolu

Les graphiques générés affichent maintenant correctement les caractères français :
- **Résilience** (au lieu de Resilience)
- **Décision** (au lieu de Decision)
- **Sens du résultat** (au lieu de Sens du resultat)
- **Esprit d'équipe** (au lieu de Esprit d equipe)
- **Vision globale des compétences** (avec tous les accents)

### Solution technique

Le système utilise un encodage en entités HTML dans les SVG :
- `é` → `&#233;`
- `è` → `&#232;`
- `ê` → `&#234;`
- `'` → `&#39;`
- etc.

### Test du système

Pour vérifier que les accents fonctionnent :

```bash
curl http://localhost:3000/api/test-accents
```

### Fallback système

1. **Méthode principale** : SVG avec entités HTML (via `chartGeneratorImproved.ts`)
2. **Fallback automatique** : Sharp si erreur (via `chartGenerator.ts`)

### Canvas (optionnel)

Le système peut utiliser Canvas pour une qualité optimale :

```bash
# Installation Canvas (optionnelle)
npm install canvas@^2.11.2

# Prérequis système sur macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

Si Canvas est disponible, il sera utilisé automatiquement.

## Structure du questionnaire