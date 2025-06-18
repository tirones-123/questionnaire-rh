# Questionnaire RH - Application Web

Application web pour faire passer un questionnaire RH de 72 questions au format Échelle de Likert 5 points, répartie en 8 sections de 9 questions chacune.

## Fonctionnalités

- ✅ Page d'accueil avec saisie Prénom/Nom
- ✅ 8 sections de questionnaire avec tableau Likert
- ✅ Sauvegarde automatique de la progression (localStorage)
- ✅ Validation des réponses avant passage à la section suivante
- ✅ Export automatique en Excel et envoi par email
- ✅ **Génération automatique du rapport d'analyse avec GPT-4o**
- ✅ **Graphiques de visualisation des résultats (radar, barres)**
- ✅ **Document Word formaté avec analyses et recommandations**
- ✅ Design responsive et accessible (WCAG AA)
- ✅ Compatible Vercel pour déploiement facile

## Technologies utilisées

- **Next.js 14** - Framework React avec rendu côté serveur
- **TypeScript** - Typage statique
- **ExcelJS** - Génération de fichiers Excel
- **Docx** - Génération de documents Word
- **OpenAI API** - Analyse et génération de contenu avec GPT-4o
- **Nodemailer** - Envoi d'emails
- **CSS moderne** - Styles responsives sans framework

## Installation

### 1. Cloner le repository

```bash
git clone <votre-repo>
cd questionnaire-rh
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copiez le fichier `env.example` vers `.env.local` :

```bash
cp env.example .env.local
```

Éditez `.env.local` avec vos paramètres :

```env
# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM=votre-email@gmail.com

# Configuration OpenAI
OPENAI_API_KEY=sk-votre-cle-api-openai
```

#### Configuration Gmail

1. Activez l'authentification à 2 facteurs sur votre compte Gmail
2. Générez un "Mot de passe d'application" :
   - Allez dans Paramètres Google → Sécurité → Authentification à 2 facteurs → Mots de passe d'application
   - Sélectionnez "Autre" et donnez un nom (ex: "Questionnaire RH")
   - Utilisez le mot de passe généré dans `SMTP_PASS`

#### Configuration OpenAI

1. Créez un compte sur [OpenAI Platform](https://platform.openai.com)
2. Générez une clé API dans les paramètres
3. Assurez-vous d'avoir des crédits disponibles pour GPT-4o

### 4. Lancer en développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Déploiement sur Vercel

### 1. Via l'interface Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre compte GitHub/GitLab
3. Importez votre repository
4. Ajoutez les variables d'environnement dans l'onglet "Environment Variables"
5. Déployez

### 2. Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ajouter les variables d'environnement
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add SMTP_FROM
vercel env add OPENAI_API_KEY

# Redéployer avec les nouvelles variables
vercel --prod
```

## Structure du projet

```
questionnaire-rh/
├── data/
│   └── questions.ts          # Questions du questionnaire
├── utils/
│   ├── scoreCalculator.ts    # Calcul des scores par critère
│   ├── reportGenerator.ts    # Génération du rapport avec OpenAI
│   ├── chartGenerator.ts     # Génération des graphiques
│   └── wordGenerator.ts      # Création du document Word
├── pages/
│   ├── api/
│   │   ├── submit-questionnaire.ts  # API autodiagnostic
│   │   └── submit-evaluation.ts     # API évaluation
│   ├── questionnaire/
│   │   └── [section].tsx     # Pages de questionnaire dynamiques
│   ├── _app.tsx              # Configuration App
│   ├── index.tsx             # Page d'accueil autodiagnostic
│   ├── evaluation.tsx        # Page d'accueil évaluation
│   └── complete.tsx          # Page de fin
├── styles/
│   └── globals.css           # Styles globaux
├── package.json
├── next.config.js
├── tsconfig.json
├── vercel.json               # Configuration Vercel
├── env.example               # Exemple variables d'environnement
└── README.md
```

## Fonctionnement

### 1. Page d'accueil
- Saisie obligatoire du prénom et nom
- Détection automatique d'une session en cours
- Option "Reprendre" ou "Recommencer"
- Deux modes : autodiagnostic ou évaluation d'un tiers

### 2. Questionnaire
- 8 sections de 9 questions chacune
- Tableau Likert avec 5 options de réponse
- Sauvegarde automatique à chaque clic
- Validation obligatoire de toutes les questions avant passage à la section suivante
- Barre de progression
- Navigation précédent/suivant

### 3. Analyse automatique
- **Calcul des scores** sur 12 critères de potentiel
- **Analyse par l'IA** : GPT-4o génère une analyse personnalisée
- **Identification** des points forts et axes de progression
- **Recommandations** concrètes et actionnables

### 4. Documents générés

#### Fichier Excel
- Feuille 1 : Toutes les réponses détaillées
- Feuille 2 : Scores par critère (sur 5)
- Format professionnel avec mise en forme

#### Rapport Word
- **Analyse critère par critère** (12 critères répartis en 4 familles)
- **Graphique radar** : vision globale des compétences
- **Graphique en barres** : forces triées par score
- **Graphique par famille** : vue d'ensemble structurée
- **Points de vigilance** et recommandations personnalisées
- **Mise en forme professionnelle** avec police Avenir

### 5. Envoi automatique
- Email envoyé à l'adresse configurée
- Deux pièces jointes : Excel + Word
- Temps de traitement : environ 30-45 secondes

## Les 12 critères analysés

### Famille "VOULOIR" (Forces motrices)
- **Ambition** : Volonté de progresser dans sa carrière
- **Initiative** : Dynamisme et prise d'initiatives
- **Résilience** : Persévérance face aux difficultés

### Famille "PENSER" (Intelligence des situations)
- **Vision** : Intuition et capacité à imaginer l'avenir
- **Recul** : Analyse objective et synthétique
- **Pertinence** : Compréhension instantanée des situations

### Famille "AGIR" (Capacités de réalisation)
- **Organisation** : Structuration efficace du travail
- **Décision** : Capacité à trancher rapidement
- **Sens du résultat** : Attention aux résultats concrets

### Famille "ENSEMBLE" (Aptitudes relationnelles)
- **Communication** : Écoute et dialogue ouvert
- **Esprit d'équipe** : Inscription dans un projet collectif
- **Leadership** : Capacité à mobiliser un groupe

## Sécurité et confidentialité

- ❌ **Aucune base de données** - Pas de stockage serveur
- ✅ **Stockage local uniquement** - Les réponses restent dans le navigateur
- ✅ **Nettoyage automatique** - Données supprimées après envoi réussi
- ✅ **Envoi sécurisé** - Email chiffré avec pièces jointes

## Support

Pour toute question technique :
1. Vérifiez que toutes les variables d'environnement sont correctement configurées
2. Consultez les logs Vercel en cas d'erreur de déploiement
3. Vérifiez vos crédits OpenAI si le rapport ne se génère pas
4. Testez l'envoi d'email avec vos paramètres SMTP

## Personnalisation

### Modifier les questions
Éditez le fichier `data/questions.ts` pour adapter les questions à vos besoins.

### Changer l'email de destination
Modifiez la ligne dans `pages/api/submit-questionnaire.ts` et `pages/api/submit-evaluation.ts` :
```typescript
to: 'votre-nouvelle-adresse@exemple.com',
```

### Personnaliser le design
Les styles sont dans `styles/globals.css`. La palette de couleurs principale utilise :
- Bleu principal : `#1d4e89`
- Fond : `#ffffff`
- Bordures : `#e5e7eb`

### Adapter l'analyse
Le prompt d'analyse est dans `utils/reportGenerator.ts`. Vous pouvez le modifier pour adapter le style et le contenu des rapports générés.

## Génération automatique du rapport

Le système génère automatiquement un rapport Word complet comprenant :
- **Analyse détaillée** des 12 critères de potentiel
- **Graphiques visuels** (radar, barres triées, barres par famille)
- **Points de vigilance** et **recommandations de développement**
- **Format professionnel** avec police Avenir

Le rapport est généré par GPT-4 (OpenAI) et envoyé par email avec le fichier Excel des réponses.

## Architecture de l'envoi en deux temps

Pour éviter les problèmes de timeout (>60 secondes) sur Vercel, le système envoie les résultats en deux emails :

1. **Email immédiat** (< 5 secondes) :
   - Fichier Excel avec toutes les réponses
   - Scores calculés par critère
   - Confirmation de réception

2. **Email différé** (quelques minutes après) :
   - Rapport Word complet avec analyse GPT-4
   - Graphiques SVG intégrés
   - Si erreur : email d'alerte avec détails

Cette approche garantit que l'utilisateur reçoit toujours au minimum ses données, même si la génération du rapport échoue.

## Configuration

// ... existing code ... 