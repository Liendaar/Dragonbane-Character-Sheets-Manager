# Mise à jour des règles Firestore

Pour que les capacités héroïques fonctionnent correctement, vous devez mettre à jour les règles Firestore dans la console Firebase.

## Règles Firestore à ajouter

Allez dans la console Firebase → Firestore Database → Rules et ajoutez ces règles :

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
    // Only the admin (UZi9aEfsVJdOoDTfM1Xu55ifrFM2) can write
    match /spells/{spellId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == "UZi9aEfsVJdOoDTfM1Xu55ifrFM2";
    }
    
    // Abilities - all authenticated users can read
    // Only the admin (UZi9aEfsVJdOoDTfM1Xu55ifrFM2) can write
    match /abilities/{abilityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == "UZi9aEfsVJdOoDTfM1Xu55ifrFM2";
    }
  }
}
```

## Initialisation des capacités

Les capacités seront automatiquement initialisées dans Firestore depuis le fichier `skills.json` lors du premier chargement de la page Capacités.

Si vous souhaitez les initialiser manuellement, vous pouvez :

1. Ouvrir la console du navigateur (F12)
2. Aller sur la page Capacités d'un personnage
3. Les capacités seront chargées depuis `skills.json` et stockées dans Firestore

## Structure des données

### Collection `abilities`

Chaque document représente une capacité héroïque :

```json
{
  "capacite": "ASSASSIN",
  "prerequis": "Couteaux 12",
  "pv": 3,
  "description": "Votre attaque surprise inflige 1D8 points de dégâts supplémentaires..."
}
```

Le document ID est le nom de la capacité (champ `capacite`).

