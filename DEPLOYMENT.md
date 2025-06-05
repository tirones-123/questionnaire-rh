# Guide de déploiement rapide

## Pré-requis
- Compte Vercel (gratuit)
- Repository Git (GitHub, GitLab, etc.)
- Compte email avec SMTP activé

## Étapes de déploiement

### 1. Pusher le code sur Git
```bash
git init
git add .
git commit -m "Initial commit - Questionnaire RH"
git remote add origin https://github.com/votre-username/questionnaire-rh.git
git push -u origin main
```

### 2. Déployer sur Vercel

#### Option A : Interface web
1. Allez sur https://vercel.com
2. Cliquez "Import Project"
3. Sélectionnez votre repository
4. Ajoutez les variables d'environnement :
   - `SMTP_HOST`: smtp.gmail.com
   - `SMTP_PORT`: 587
   - `SMTP_USER`: votre-email@gmail.com
   - `SMTP_PASS`: votre-mot-de-passe-app
   - `SMTP_FROM`: votre-email@gmail.com
5. Cliquez "Deploy"

#### Option B : CLI
```bash
npm i -g vercel
vercel login
vercel
# Suivez les instructions
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add SMTP_FROM
vercel --prod
```

### 3. Configuration Gmail
1. Activez l'authentification à 2 facteurs
2. Générez un mot de passe d'application :
   - Google Account → Sécurité → Authentification à 2 facteurs
   - Mots de passe d'application → Sélectionner app et appareil
   - Générer un mot de passe
3. Utilisez ce mot de passe dans `SMTP_PASS`

### 4. Test
- Accédez à l'URL Vercel générée
- Testez le questionnaire complet
- Vérifiez la réception de l'email Excel

## Dépannage

### Email non reçu
- Vérifiez les variables d'environnement
- Consultez les logs Vercel : Functions → submit-questionnaire
- Testez avec un autre service SMTP (SendGrid, Mailgun)

### Erreur de build
- Vérifiez que toutes les dépendances sont installées
- `npm run build` en local pour reproduire

### Performance
- Le questionnaire est optimisé pour être léger
- Temps de chargement < 2s typiquement
- Responsive sur tous appareils

## URL finale
Votre questionnaire sera accessible à : `https://votre-projet.vercel.app` 