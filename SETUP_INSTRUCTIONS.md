# Instructions pour résoudre les erreurs de développement

## Problèmes résolus

✅ **Tailwind CSS CDN** : Remplacé par une installation locale avec PostCSS
✅ **Configuration Vite** : Corrigée pour utiliser le serveur de développement Vite
✅ **Variables d'environnement** : Configurées pour Firebase

## Étapes à suivre

### 1. Installer les dépendances
```bash
npm install
```

### 2. Créer le fichier .env
Créez un fichier `.env` à la racine du projet avec :
```env
VITE_FIREBASE_API_KEY="AIzaSyBy8_tbrP8N37ki7L7nvb2e5a6E1ixmJA0"
VITE_FIREBASE_AUTH_DOMAIN="dragonbane-character-sheet.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="dragonbane-character-sheet"
VITE_FIREBASE_STORAGE_BUCKET="dragonbane-character-sheet.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="495188862487"
VITE_FIREBASE_APP_ID="1:495188862487:web:c34a4653130fdb35051e52"
VITE_FIREBASE_MEASUREMENT_ID="G-NMQJX3JWZP"
```

### 3. Démarrer le serveur de développement
```bash
npm run dev
```

## Changements effectués

- ✅ Supprimé le CDN Tailwind CSS de `index.html`
- ✅ Ajouté les dépendances Tailwind CSS dans `package.json`
- ✅ Créé `tailwind.config.js` et `postcss.config.js`
- ✅ Créé `src/index.css` avec les directives Tailwind
- ✅ Modifié `index.tsx` pour importer le CSS
- ✅ Corrigé le chemin du script dans `index.html` (`/index.tsx` au lieu de `./index.tsx`)
- ✅ Ajouté les règles `.env*` au `.gitignore`

## Important

**N'utilisez plus Live Server ou un serveur de développement basique !** 
Utilisez uniquement `npm run dev` qui lance le serveur Vite avec la configuration appropriée.
