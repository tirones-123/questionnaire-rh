# Configuration du Favicon

## 📁 Où placer votre favicon

Placez vos fichiers favicon directement dans le dossier `/public/` (à la racine, pas dans images) :

```
public/
├── favicon.ico          # Favicon principal (obligatoire)
├── apple-touch-icon.png # Icône iOS (optionnel)
├── favicon-16x16.png    # Petite taille (optionnel)
├── favicon-32x32.png    # Taille standard (optionnel)
└── favicon-192x192.png  # PWA/Android (optionnel)
```

## 🎯 Fichiers recommandés

### 1. **favicon.ico** (obligatoire)
- **Format** : ICO
- **Taille** : 16x16, 32x32, 48x48 pixels (multi-tailles dans un fichier)
- **Nom** : Exactement `favicon.ico`

### 2. **apple-touch-icon.png** (pour iOS)
- **Format** : PNG
- **Taille** : 180x180 pixels
- **Nom** : Exactement `apple-touch-icon.png`

### 3. **Autres tailles** (optionnel)
- `favicon-16x16.png` (16x16)
- `favicon-32x32.png` (32x32) 
- `favicon-192x192.png` (192x192 pour Android)

## 🔧 Comment Next.js gère les favicons

Next.js détecte automatiquement ces fichiers dans `/public/` :

- ✅ `favicon.ico` → Affiché automatiquement
- ✅ `apple-touch-icon.png` → Détecté pour iOS
- ✅ Autres PNG → Disponibles via `/favicon-32x32.png`

## 📱 Configuration dans _document.tsx (optionnel)

Si vous voulez plus de contrôle, créez `pages/_document.tsx` :

```tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="theme-color" content="#1d4e89" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

## 🛠️ Outils pour créer un favicon

### Générateurs en ligne :
- **Favicon.io** : https://favicon.io/
- **RealFaviconGenerator** : https://realfavicongenerator.net/
- **Favicon Generator** : https://www.favicon-generator.org/

### À partir de votre logo :
1. Utilisez votre logo en format PNG/SVG
2. Générez toutes les tailles nécessaires
3. Téléchargez et placez dans `/public/`

## ✅ Test rapide

Après avoir ajouté `favicon.ico` dans `/public/` :
1. Redémarrez votre serveur de développement
2. Allez sur votre site
3. L'icône apparaît dans l'onglet du navigateur ! 🎉

---

**Note** : Le favicon peut prendre quelques minutes à apparaître à cause du cache du navigateur. 