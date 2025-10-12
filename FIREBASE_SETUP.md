# Configuration Firebase pour GitHub Pages

## ⚠️ Problème
L'erreur `Firebase: Error (auth/invalid-api-key)` apparaît sur GitHub Pages car les variables d'environnement ne sont pas configurées.

## 🔧 Solution en 3 étapes

### Étape 1 : Ajouter les secrets GitHub

1. **Allez sur votre dépôt GitHub** : https://github.com/Liendaar/Dragonbane-Character-Sheets-Manager
2. **Cliquez sur "Settings"** (en haut à droite)
3. **Dans le menu de gauche** : "Secrets and variables" → "Actions"
4. **Cliquez sur "New repository secret"**

Ajoutez ces 7 secrets **un par un** :

| Nom du secret | Valeur |
|---------------|--------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyBy8_tbrP8N37ki7L7nvb2e5a6E1ixmJA0` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `dragonbane-character-sheet.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `dragonbane-character-sheet` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `dragonbane-character-sheet.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `495188862487` |
| `VITE_FIREBASE_APP_ID` | `1:495188862487:web:c34a4653130fdb35051e52` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-NMQJX3JWZP` |

### Étape 2 : Pousser les modifications

Les fichiers de workflow GitHub Actions ont été mis à jour. Vous devez maintenant :

```bash
git add .github/workflows/deploy.yml .github/workflows/github-pages.yml
git commit -m "fix: Configure Firebase environment variables for GitHub Pages"
git push
```

### Étape 3 : Vérifier le déploiement

1. Allez dans l'onglet **"Actions"** de votre dépôt GitHub
2. Attendez que le workflow se termine (cercle vert ✓)
3. Testez votre site : https://liendaar.github.io/Dragonbane-Character-Sheets-Manager/

## ✅ Vérification

Si tout fonctionne correctement :
- ✓ Pas d'erreur `auth/invalid-api-key`
- ✓ La page de connexion s'affiche
- ✓ Vous pouvez vous connecter avec votre compte

## 🆘 En cas de problème

Si l'erreur persiste :
1. Vérifiez que tous les secrets sont bien ajoutés dans GitHub
2. Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs
3. Re-déclenchez le workflow manuellement dans l'onglet "Actions"

## 📝 Notes

- Les secrets GitHub ne sont **jamais** visibles après leur création (sécurité)
- Si vous devez les modifier, vous devrez les supprimer et les recréer
- Ces variables sont uniquement utilisées lors du build sur GitHub Actions
- Votre fichier `.env` local reste nécessaire pour le développement

