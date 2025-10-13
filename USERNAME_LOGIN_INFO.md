# Connexion avec nom d'utilisateur - Information importante

## Limitation de Firebase Authentication

Firebase Authentication ne supporte pas nativement la connexion avec un nom d'utilisateur. Les méthodes de connexion disponibles sont :
- Email + Mot de passe
- Fournisseurs OAuth (Google, Facebook, etc.)
- Téléphone
- Anonyme

## Solution actuelle

Dans la page de profil (`ProfilePage.tsx`), les utilisateurs peuvent :
1. ✅ **Modifier leur nom d'affichage** - Ce nom sera visible dans l'application
2. ✅ **Modifier leur email** - L'email reste la méthode de connexion
3. ✅ **Modifier leur mot de passe** - Pour les comptes créés avec email/password
4. ✅ **Indication spéciale pour les comptes Google** - Message clair indiquant que le mot de passe est géré par Google

## Solution alternative pour connexion par nom d'utilisateur

Si vous souhaitez vraiment permettre la connexion par nom d'utilisateur, vous devrez :

### Option 1 : Mapping nom d'utilisateur → email (Simple)
1. Créer une collection Firestore `usernames` :
   ```
   {
     "username": "john_doe",
     "email": "john@example.com"
   }
   ```
2. Lors de la connexion, si l'utilisateur entre un nom d'utilisateur :
   - Rechercher l'email correspondant dans Firestore
   - Utiliser cet email pour la connexion Firebase

### Option 2 : Custom Authentication (Complexe)
1. Créer un backend avec Firebase Admin SDK
2. Implémenter un système de tokens personnalisés
3. Gérer les noms d'utilisateur côté serveur

## Recommandation

Pour la plupart des applications, l'**Option 1** est suffisante et facile à implémenter. L'email reste la méthode de connexion principale, mais l'interface utilisateur peut accepter un nom d'utilisateur qui sera automatiquement converti en email en arrière-plan.

## Règles Firestore à ajouter (pour Option 1)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... règles existantes ...
    
    // Usernames collection - read by all, write only on creation
    match /usernames/{username} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                    request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Usernames are immutable
    }
  }
}
```

## Implémentation future

Si vous souhaitez implémenter la connexion par nom d'utilisateur (Option 1), faites-le moi savoir et je pourrai :
1. Créer un service `usernameService.ts`
2. Modifier `LoginPage.tsx` pour accepter nom d'utilisateur ou email
3. Ajouter la validation de nom d'utilisateur unique lors de l'inscription
4. Mettre à jour les règles Firestore

