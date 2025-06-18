# Guide de Dépannage - Problème de Génération du Rapport

## 🔍 Diagnostic du Problème

Vos logs montrent que l'appel OpenAI ne répond jamais :
```
Calling OpenAI API...
[Plus rien après]
```

## 🧪 Test de l'API OpenAI

### 1. Testez votre endpoint de diagnostic

Après le déploiement, visitez :
```
https://votre-app.vercel.app/api/test-openai
```

Cela vous dira si :
- ✅ La clé API est présente
- ✅ La clé a le bon format (sk-...)
- ✅ OpenAI répond correctement

### 2. Vérifiez les logs de ce test

Dans Vercel Dashboard > Functions > test-openai

## 🔧 Solutions Possibles

### Problème 1 : Clé API non liée au projet

**Symptômes :**
- L'endpoint de test retourne "OpenAI API key not configured"
- Les logs montrent "OpenAI API Key exists: false"

**Solution :**
1. Dans Vercel Dashboard > Settings > Environment Variables
2. Trouvez `OPENAI_API_KEY`
3. Cliquez sur les 3 points (...) > Edit
4. **IMPORTANT** : Cochez les 3 cases :
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Save
6. Redéployez : Settings > Git > Redeploy

### Problème 2 : Clé API invalide ou expirée

**Symptômes :**
- Erreur 401 dans les logs
- Message "Incorrect API key provided"

**Solution :**
1. Allez sur https://platform.openai.com/api-keys
2. Vérifiez que votre clé est active
3. Si besoin, créez une nouvelle clé
4. Mettez à jour dans Vercel

### Problème 3 : Limite de crédit dépassée

**Symptômes :**
- Erreur 429 ou "insufficient_quota"
- L'API fonctionne en local mais pas sur Vercel

**Solution :**
1. Vérifiez votre usage : https://platform.openai.com/usage
2. Vérifiez vos limites : https://platform.openai.com/account/limits
3. Ajoutez du crédit si nécessaire

### Problème 4 : Timeout réseau sur Vercel

**Symptômes :**
- L'appel OpenAI ne répond jamais
- Pas d'erreur, juste un silence

**Solution temporaire mise en place :**
- Changé de gpt-4o à gpt-3.5-turbo (plus rapide)
- Retiré l'AbortController qui peut causer des problèmes

## 📊 Vérification des Variables d'Environnement

Exécutez ce script localement pour vérifier votre clé :

```javascript
// test-openai.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: 'votre-clé-ici'
});

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 10
    });
    console.log('✅ API fonctionne:', completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

test();
```

## 🚀 Actions Recommandées

1. **Immédiatement** : Testez `/api/test-openai` après le déploiement
2. **Si erreur de clé** : Vérifiez le lien projet dans Vercel
3. **Si timeout** : Le code utilise maintenant gpt-3.5-turbo qui est plus rapide
4. **Si toujours bloqué** : Contactez-moi avec les logs du test

## 💡 Alternative Temporaire

Si OpenAI reste bloqué, vous pouvez :
1. Désactiver temporairement la génération du rapport
2. N'envoyer que l'Excel
3. Générer les rapports manuellement en attendant

Pour désactiver, commentez la génération du rapport dans `submit-questionnaire.ts` ligne ~204. 