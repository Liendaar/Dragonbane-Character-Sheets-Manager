# Guide : Mise à jour des règles Firebase

## 📋 Étapes à suivre

### 1. Accéder à la console Firebase

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionnez votre projet "dragonbane-character-sheet"
3. Dans le menu de gauche, cliquez sur **"Firestore Database"**
4. Cliquez sur l'onglet **"Règles"** (Rules)

### 2. Remplacer les règles

Copiez-collez les règles suivantes dans l'éditeur :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Characters - only owner can read/write
    match /characters/{characterId} {
      allow read, write: if request.auth != null && 
                         request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Spells - all authenticated users can read
    match /spells/{spellId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    // Abilities - all authenticated users can read
    match /abilities/{abilityId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

### 3. Publier les règles

1. Cliquez sur le bouton **"Publier"** (Publish) en haut à droite
2. Attendez la confirmation "Règles publiées avec succès"

## ✅ Vérification

Les règles permettent maintenant :

- ✅ **Characters** : Chaque utilisateur peut lire/écrire uniquement ses propres personnages
- ✅ **Spells** : Tous les utilisateurs authentifiés peuvent lire les sorts (mais pas les modifier)
- ✅ **Abilities** : Tous les utilisateurs authentifiés peuvent lire les capacités (mais pas les modifier)

## 🔄 Initialisation automatique

Lors de la première visite de la page Capacités :
- Les capacités du fichier `skills.json` seront automatiquement copiées dans Firestore
- Cela ne se produira qu'une seule fois
- Ensuite, toutes les requêtes utiliseront Firestore

## ⚠️ Important

Si vous voyez des erreurs de permissions dans la console du navigateur, vérifiez que :
1. Les règles ont bien été publiées
2. Vous êtes connecté avec un compte utilisateur
3. Vous avez rafraîchi la page après la publication des règles

