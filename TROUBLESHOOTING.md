# Guide de Dépannage - Problème de Génération du Rapport

## 🔍 Diagnostic du Problème

Vos logs montrent que l'appel OpenAI ne répond jamais :
```
Calling OpenAI API...
[Plus rien après]
```

## 🧪 Test de la Configuration

### 1. Vérifiez vos variables d'environnement

Après le déploiement, visitez :
```
https://votre-app.vercel.app/api/check-env
```

Cela vous montrera :
- Si la clé OpenAI existe
- La longueur de la clé
- Si elle a le bon format (sk-...)
- Si SMTP est configuré

### 2. Vérifiez dans Vercel Dashboard

1. Allez dans **Vercel Dashboard** > **Settings** > **Environment Variables**
2. Trouvez `OPENAI_API_KEY`
3. **VÉRIFIEZ ABSOLUMENT** que les 3 cases sont cochées :
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   
   **C'est le problème le plus courant !**

## 🔧 Solutions

### Problème 1 : Clé API non liée au projet (LE PLUS COURANT)

**Symptômes :**
- `/api/check-env` montre "openaiKeyExists: false"
- Les logs montrent "OpenAI API Key exists: false"

**Solution :**
1. Dans Vercel Dashboard > Settings > Environment Variables
2. Trouvez `OPENAI_API_KEY`
3. Cliquez sur les 3 points (...) > Edit
4. **COCHEZ LES 3 CASES** :
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Save
6. **Redéployez** : Settings > Git > Redeploy

### Problème 2 : Clé API invalide

**Symptômes :**
- Erreur 401 dans les logs
- `/api/check-env` montre que la clé existe mais format invalide

**Solution :**
1. Vérifiez sur https://platform.openai.com/api-keys
2. Créez une nouvelle clé si nécessaire
3. Assurez-vous qu'elle commence par "sk-"
4. Mettez à jour dans Vercel

### Problème 3 : Timeout réseau

**Symptômes :**
- L'appel OpenAI ne répond jamais
- Pas d'erreur explicite

**Solutions possibles :**
- Le code utilise maintenant un timeout de 50 secondes
- Si le problème persiste, contactez le support Vercel

## 📊 Test Local de votre Clé

```javascript
// test-local.js
const apiKey = 'sk-votre-clé-ici';

fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello' }],
    max_tokens: 10
  })
})
.then(res => res.json())
.then(data => console.log('✅ Réponse:', data))
.catch(err => console.error('❌ Erreur:', err));
```

## 🚨 Actions Immédiates

1. **Visitez** `/api/check-env` pour voir la configuration
2. **Vérifiez** que les 3 environnements sont cochés dans Vercel
3. **Redéployez** après toute modification
4. **Testez** à nouveau l'envoi du questionnaire

## 💡 Si Rien ne Fonctionne

Pour désactiver temporairement la génération du rapport :
1. Commentez les lignes 204-306 dans `pages/api/submit-questionnaire.ts`
2. Vous recevrez uniquement l'Excel
3. Générez les rapports manuellement en attendant 

## Erreurs fréquentes et solutions

### 1. Les modules ne peuvent pas être trouvés

**Erreur typique:** `Cannot find module`

**Solution:**
```bash
npm install
```

### 2. Variables d'environnement manquantes

**Solution:** Créer un fichier `.env.local` avec toutes les variables nécessaires (voir `env.example`)

### 3. Erreur de timeout sur Vercel

**Solution:** Augmenter la durée maximale dans `vercel.json`:
```json
{
  "functions": {
    "pages/api/submit-questionnaire.ts": {
      "maxDuration": 300
    }
  }
}
```

### 4. Problèmes avec Sharp sur Vercel

**Solution:** Ajouter la configuration Sharp dans `vercel.json`:
```json
{
  "build": {
    "env": {
      "SHARP_IGNORE_GLOBAL_LIBVIPS": "1"
    }
  }
}
```

## Logs sur Vercel et exécution en arrière-plan

### Problème : Les logs n'apparaissent pas après l'envoi de la réponse HTTP

Sur Vercel (et la plupart des plateformes serverless), une fois que vous envoyez la réponse HTTP avec `res.status(200).json(...)`, la fonction peut être terminée immédiatement. Le code "fire and forget" ne s'exécute pas.

### Solution appliquée : Exécution synchrone

Au lieu d'utiliser le pattern asynchrone :
```javascript
// ❌ Ne fonctionne pas sur Vercel
res.status(200).json({ success: true });

// Ce code ne s'exécutera pas
(async () => {
  // Génération du rapport...
})();
```

Nous utilisons maintenant une approche synchrone :
```javascript
// ✅ Fonctionne sur Vercel
// 1. Envoyer le premier email
await sendFirstEmail();

// 2. Générer le rapport (avec logs visibles)
console.log('Generating report...');
const report = await generateReport();

// 3. Envoyer le deuxième email
await sendSecondEmail(report);

// 4. PUIS répondre au client
res.status(200).json({ success: true });
```

### Modifications récentes pour le debug

1. **Logs détaillés ajoutés à chaque étape :**
   - Après l'appel OpenAI
   - Pour chaque génération de graphique
   - Avant/après la génération Word
   - Avant/après l'envoi d'email

2. **Version sans images pour tester :**
   - `wordGeneratorWithoutSharp.ts` créé pour éviter les problèmes avec Sharp
   - Génère des placeholders texte au lieu des images

3. **Endpoint de test des dépendances :**
   - `/api/test-dependencies` pour vérifier que toutes les librairies fonctionnent

### Pour débugger

1. **Vérifier les logs Vercel :**
   ```bash
   vercel logs --follow
   ```

2. **Tester l'endpoint de dépendances :**
   ```
   GET /api/test-dependencies
   ```

3. **Vérifier les timeouts :**
   - L'interface utilisateur peut timeout après 30-60 secondes
   - Le serveur a 5 minutes (300s) pour traiter la requête

### Prochaines étapes si le problème persiste

1. **Utiliser une queue externe** (Redis, AWS SQS, etc.) pour la génération asynchrone
2. **Séparer en deux endpoints** : un pour sauvegarder, un pour générer le rapport
3. **Utiliser les Edge Functions** de Vercel qui ont un comportement différent 