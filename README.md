# Questionnaire RH - Application Web

Application web pour faire passer un questionnaire RH de 72 questions au format Échelle de Likert 5 points, répartie en 8 sections de 9 questions chacune.

## Fonctionnalités

- ✅ Page d'accueil avec saisie Prénom/Nom
- ✅ 8 sections de questionnaire avec tableau Likert
- ✅ Sauvegarde automatique de la progression (localStorage)
- ✅ Validation des réponses avant passage à la section suivante
- ✅ Export automatique en Excel et envoi par email
- ✅ Design responsive et accessible (WCAG AA)
- ✅ Compatible Vercel pour déploiement facile

## Technologies utilisées

- **Next.js 14** - Framework React avec rendu côté serveur
- **TypeScript** - Typage statique
- **ExcelJS** - Génération de fichiers Excel
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

Éditez `.env.local` avec vos paramètres SMTP :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM=votre-email@gmail.com
```

#### Configuration Gmail

1. Activez l'authentification à 2 facteurs sur votre compte Gmail
2. Générez un "Mot de passe d'application" :
   - Allez dans Paramètres Google → Sécurité → Authentification à 2 facteurs → Mots de passe d'application
   - Sélectionnez "Autre" et donnez un nom (ex: "Questionnaire RH")
   - Utilisez le mot de passe généré dans `SMTP_PASS`

#### Alternatives SMTP

**SendGrid :**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre-clé-api-sendgrid
```

**Outlook/Hotmail :**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe
```

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

# Redéployer avec les nouvelles variables
vercel --prod
```

## Structure du projet

```
questionnaire-rh/
├── data/
│   └── questions.ts          # Questions du questionnaire
├── pages/
│   ├── api/
│   │   └── submit-questionnaire.ts  # API envoi email + Excel
│   ├── questionnaire/
│   │   └── [section].tsx     # Pages de questionnaire dynamiques
│   ├── _app.tsx              # Configuration App
│   ├── index.tsx             # Page d'accueil
│   └── complete.tsx          # Page de fin
├── styles/
│   └── globals.css           # Styles globaux
├── package.json
├── next.config.js
├── tsconfig.json
├── env.example               # Exemple variables d'environnement
└── README.md
```

## Fonctionnement

### 1. Page d'accueil
- Saisie obligatoire du prénom et nom
- Détection automatique d'une session en cours
- Option "Reprendre" ou "Recommencer"

### 2. Questionnaire
- 8 sections de 9 questions chacune
- Tableau Likert avec 5 options de réponse
- Sauvegarde automatique à chaque clic
- Validation obligatoire de toutes les questions avant passage à la section suivante
- Barre de progression
- Navigation précédent/suivant

### 3. Finalisation
- Page de confirmation après la 8e section
- Bouton d'envoi par email
- Génération automatique d'un fichier Excel
- Envoi à l'adresse configurée : `luc.marsal@auramanagement.fr`

### 4. Format Excel
Le fichier Excel généré contient :
- Informations du participant (prénom, nom, date)
- Liste des 72 questions avec réponses
- Format : | Numéro | Question | Réponse |

## Sécurité et confidentialité

- ❌ **Aucune base de données** - Pas de stockage serveur
- ✅ **Stockage local uniquement** - Les réponses restent dans le navigateur
- ✅ **Nettoyage automatique** - Données supprimées après envoi réussi
- ✅ **Envoi sécurisé** - Email chiffré avec pièce jointe Excel

## Support

Pour toute question technique :
1. Vérifiez que toutes les variables d'environnement sont correctement configurées
2. Consultez les logs Vercel en cas d'erreur de déploiement
3. Testez l'envoi d'email avec vos paramètres SMTP

## Personnalisation

### Modifier les questions
Éditez le fichier `data/questions.ts` pour adapter les questions à vos besoins.

### Changer l'email de destination
Modifiez la ligne dans `pages/api/submit-questionnaire.ts` :
```typescript
to: 'votre-nouvelle-adresse@exemple.com',
```

### Personnaliser le design
Les styles sont dans `styles/globals.css`. La palette de couleurs principale utilise :
- Bleu principal : `#1d4e89`
- Fond : `#ffffff`
- Bordures : `#e5e7eb` 