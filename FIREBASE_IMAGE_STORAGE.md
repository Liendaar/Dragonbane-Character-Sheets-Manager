# Stockage des Images de Portrait

## Configuration Actuelle

Les portraits de personnages sont actuellement stockés **en base64 directement dans Firestore** avec les autres données du personnage.

### Avantages de cette approche :
- ✅ **Simplicité** : Pas besoin de configurer Firebase Storage
- ✅ **Atomicité** : L'image est sauvegardée avec le personnage en une seule opération
- ✅ **Synchronisation** : Pas de problème de synchronisation entre Storage et Firestore
- ✅ **Fallback** : Fonctionne aussi avec le localStorage en mode hors ligne

### Limites :
- ⚠️ **Taille** : Firestore a une limite de 1 MB par document
- ⚠️ **Performance** : Les grandes images augmentent la taille des requêtes

## Recommandations

Pour des portraits de personnages, cette approche est **suffisante** si :
- Les images sont compressées/redimensionnées avant upload
- La taille reste raisonnable (< 500 KB recommandé)

## Migration vers Firebase Storage (optionnel)

Si vous souhaitez utiliser Firebase Storage pour les images :

1. **Activer Firebase Storage** dans la console Firebase

2. **Ajouter Firebase Storage au projet** :
```typescript
// services/firebase.ts
import { getStorage } from "firebase/storage";
export const storage = getStorage(app);
```

3. **Créer un service d'upload** :
```typescript
// services/imageService.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export const uploadPortrait = async (userId: string, characterId: string, file: File): Promise<string> => {
  const storageRef = ref(storage, `portraits/${userId}/${characterId}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const deletePortrait = async (userId: string, characterId: string): Promise<void> => {
  const storageRef = ref(storage, `portraits/${userId}/${characterId}`);
  await deleteObject(storageRef);
};
```

4. **Modifier CharacterSheetPage.tsx** pour utiliser ces fonctions au lieu de FileReader

5. **Configurer les règles de sécurité Storage** :
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portraits/{userId}/{characterId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Optimisation des Images

Pour optimiser les portraits avant upload, vous pouvez ajouter une compression :

```typescript
const compressImage = (file: File, maxWidth: number = 400): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
```

