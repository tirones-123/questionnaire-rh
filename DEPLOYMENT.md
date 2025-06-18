# Guide de Déploiement sur Vercel

## Prérequis

1. Compte Vercel
2. Compte OpenAI avec clé API
3. Serveur SMTP configuré (Gmail ou autre)
4. Repository GitHub avec le code

## Étapes de déploiement

### 1. Déployer sur Vercel

```bash
# Si vous utilisez Vercel CLI
vercel

# Ou via l'interface web
# 1. Allez sur https://vercel.com
# 2. Importez votre repository GitHub
# 3. Sélectionnez le framework "Next.js"
# 4. Déployez
```

### 2. Configurer les variables d'environnement

**IMPORTANT : Les variables doivent être liées au projet spécifique !**

#### Via l'interface Vercel :

1. Allez dans **Project Settings** > **Environment Variables**
2. Ajoutez ces variables :

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
OPENAI_API_KEY=sk-...votre-clé-openai
```

3. **TRÈS IMPORTANT** : Assurez-vous que dans la colonne "Environments", les cases **Production**, **Preview** et **Development** sont cochées

#### Via Vercel CLI :

```bash
# Pour chaque variable
vercel env add OPENAI_API_KEY
# Entrez la valeur quand demandé
# Sélectionnez tous les environnements (Production, Preview, Development)
```

### 3. Vérifier le lien des variables

1. Dans Vercel Dashboard, allez dans **Settings** > **Environment Variables**
2. Vérifiez que chaque variable a bien :
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
3. Si une variable n'est pas liée, cliquez sur les trois points (...) > **Edit** > Cochez tous les environnements

### 4. Redéployer après configuration

```bash
# Forcer un redéploiement
vercel --prod --force

# Ou via l'interface
# Settings > Git > Redeploy
```

## Problèmes courants et solutions

### Erreur "OPENAI_API_KEY environment variable is missing"

**Cause** : La variable est créée mais pas liée au projet

**Solution** :
1. Vérifiez dans Environment Variables que la variable est bien liée (colonnes environnements cochées)
2. Si non liée, éditez et cochez tous les environnements
3. Redéployez le projet

### Timeout Error (504)

**Cause** : La génération du rapport prend plus de 60 secondes

**Solution déjà implémentée** :
- Le système envoie maintenant en 2 emails séparés
- Email 1 : Excel immédiat
- Email 2 : Rapport Word différé

### Erreur SMTP

**Pour Gmail** :
1. Activez la validation en deux étapes
2. Créez un mot de passe d'application
3. Utilisez ce mot de passe dans SMTP_PASS

## Surveillance et logs

### Vérifier les logs en temps réel

```bash
vercel logs --follow
```

### Vérifier les fonctions

Dans Vercel Dashboard :
- **Functions** > Voir les invocations
- **Functions** > Voir les erreurs

## Checklist de déploiement

- [ ] Code pushé sur GitHub
- [ ] Projet importé dans Vercel
- [ ] Variables d'environnement configurées
- [ ] **Variables liées au projet (très important !)**
- [ ] Redéploiement effectué
- [ ] Test d'envoi réussi
- [ ] Réception des 2 emails confirmée

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Vercel
2. Vérifiez que toutes les variables sont bien liées
3. Testez avec un questionnaire court d'abord
4. Contactez le support avec les logs d'erreur 

## Tests de fonctionnement

### 1. Test des dépendances
Visitez : `https://votre-app.vercel.app/api/test-dependencies`

Vous devriez voir :
- nodemailer: OK
- exceljs: OK
- docx: OK
- sharp: OK ou ERROR (voir ci-dessous)
- openai: OK

### 2. Test spécifique de Sharp
Visitez : `https://votre-app.vercel.app/api/test-sharp`

Si Sharp ne fonctionne pas sur Vercel, le rapport sera généré sans images.

### 3. Test complet avec un questionnaire

1. Remplissez un questionnaire sur `/`
2. Vérifiez les logs Vercel : `vercel logs --follow`
3. Vous devriez recevoir 2 emails :
   - Email 1 : Immédiat avec Excel
   - Email 2 : Après 30-60 secondes avec le rapport Word

## Changements récents (Décembre 2024)

### Architecture modifiée

**Avant :** Exécution asynchrone (fire-and-forget)
- Problème : Les logs n'apparaissaient pas sur Vercel
- Le code après `res.json()` ne s'exécutait pas

**Maintenant :** Exécution synchrone
1. Envoi du premier email (Excel)
2. Génération du rapport (OpenAI + graphiques + Word)
3. Envoi du deuxième email (Word)
4. PUIS réponse au client

### Impact
- L'utilisateur attend 1-2 minutes pour la confirmation
- Tous les logs sont visibles
- Les deux emails sont envoyés de manière fiable

### Si Sharp pose problème

Le système détecte automatiquement si Sharp fonctionne. Si non :
- Le rapport Word est généré sans images
- Des placeholders texte remplacent les graphiques
- Les graphiques peuvent être ajoutés manuellement

### Logs attendus

```
First email sent successfully
Starting report generation process...
Calling OpenAI for report generation...
Report content generated successfully
Report content length: [nombre]
Starting chart generation...
Radar chart SVG generated, length: [nombre]
Sorted chart SVG generated, length: [nombre]
Family chart SVG generated, length: [nombre]
Starting Word document generation...
Converting charts to PNG... (si Sharp fonctionne)
Word document generated successfully, buffer size: [nombre]
Preparing to send report email...
Email sent successfully: [messageId]
Report generation and sending completed successfully
```

## En cas de problème

1. **Timeout côté client**
   - Normal si > 30 secondes
   - Vérifiez les logs Vercel
   - Les emails devraient quand même partir

2. **Sharp ne fonctionne pas**
   - Le rapport sera généré sans images
   - Testez avec `/api/test-sharp`

3. **Erreur OpenAI**
   - Vérifiez la clé API
   - Vérifiez les limites de taux

4. **Emails non reçus**
   - Vérifiez les spams
   - Vérifiez les logs d'erreur
   - Testez les credentials SMTP 

## Installation des dépendances

### Canvas (pour les graphiques avec accents français)

Canvas est utilisé pour générer des graphiques PNG de haute qualité avec support natif des caractères UTF-8.

**Installation locale :**
```bash
npm install canvas @types/canvas
```

**Installation sur Vercel :**
Canvas nécessite des librairies système. Ajoutez à votre `vercel.json` :

```json
{
  "functions": {
    "pages/api/*.ts": {
      "maxDuration": 60
    }
  },
  "build": {
    "env": {
      "CANVAS_PREBUILT": "1"
    }
  }
}
```

**Si Canvas ne fonctionne pas sur Vercel :**
Le système utilise automatiquement Sharp comme fallback.

## Variables d'environnement requises 