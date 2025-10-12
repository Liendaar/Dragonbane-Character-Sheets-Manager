# 🐉 Logo Dragonbane - Prêt à utiliser !

## ✅ Images fournies

Vous avez reçu 4 versions du logo :
1. **16x16** - Favicon très petite
2. **32x32** - Favicon standard  
3. **128x128** - Favicon haute résolution
4. **512x512** - Logo complet pour réseaux sociaux

## 📋 Instructions pour ajouter votre logo Dragonbane

## Fichiers nécessaires

Vous devez placer ces fichiers dans le dossier `public/` :

### 1. **logo.png** 
- L'image complète du dragon avec parchemin
- Utilisé pour : Apple Touch Icon, Open Graph, réseaux sociaux
- Taille recommandée : 512x512px ou plus

### 2. **favicon.png**
- Version plus petite pour l'onglet du navigateur
- Taille recommandée : 32x32px ou 64x64px
- Peut être la même image que logo.png (redimensionnée automatiquement)

## Comment procéder

### Méthode simple (rapide)
1. Sauvegardez votre image du dragon dans `public/logo.png`
2. Copiez cette même image et renommez-la `public/favicon.png`
3. Rechargez votre navigateur

### Méthode optimisée (recommandée)
1. Sauvegardez votre image du dragon dans `public/logo.png`
2. Allez sur https://favicon.io/favicon-converter/
3. Uploadez votre `logo.png`
4. Téléchargez le pack généré
5. Placez les fichiers dans `public/` :
   - `favicon.ico` (pour anciens navigateurs)
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`

## Vérification

Après avoir ajouté les fichiers, vérifiez que ces fichiers existent :
- ✅ `public/logo.png`
- ✅ `public/favicon.png`

Le HTML est déjà configuré pour utiliser ces fichiers !

## Structure actuelle du dossier public

```
public/
├── 404.html
├── favicon.png          ← À ajouter
├── logo.png            ← À ajouter
├── vite.svg
└── LOGO_INSTRUCTIONS.md (ce fichier)
```

## Configuration HTML (déjà fait ✅)

Le fichier `index.html` contient déjà :

```html
<link rel="icon" type="image/png" href="./favicon.png" />
<link rel="apple-touch-icon" href="./logo.png" />
<meta property="og:image" content="./logo.png" />
```

Vous n'avez rien d'autre à faire côté code !

