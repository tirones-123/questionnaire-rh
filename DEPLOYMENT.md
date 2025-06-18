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