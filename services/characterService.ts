
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { localCharacterService } from './localStorageService';
import type { CharacterSheet } from '../types';

const charactersCollection = collection(db, 'characters');

// Fonction pour détecter si Firebase est disponible
const isFirebaseAvailable = (): boolean => {
    try {
        return !!db && !!charactersCollection;
    } catch (error) {
        console.warn('Firebase not available, using local storage:', error);
        return false;
    }
};

export const createCharacter = async (characterData: Omit<CharacterSheet, 'id'>): Promise<string> => {
    if (isFirebaseAvailable()) {
        try {
            const docRef = await addDoc(charactersCollection, characterData);
            return docRef.id;
        } catch (error) {
            console.warn('Firebase error, falling back to local storage:', error);
            return localCharacterService.createCharacter(characterData);
        }
    }
    return localCharacterService.createCharacter(characterData);
};

export const getUserCharacters = async (userId: string): Promise<CharacterSheet[]> => {
    if (isFirebaseAvailable()) {
        try {
            const q = query(charactersCollection, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CharacterSheet));
        } catch (error) {
            console.warn('Firebase error, falling back to local storage:', error);
            return localCharacterService.getUserCharacters(userId);
        }
    }
    return localCharacterService.getUserCharacters(userId);
};

export const getCharacter = async (characterId: string): Promise<CharacterSheet | null> => {
    if (isFirebaseAvailable()) {
        try {
            const docRef = doc(db, 'characters', characterId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as CharacterSheet;
            }
            return null;
        } catch (error) {
            console.warn('Firebase error, falling back to local storage:', error);
            return localCharacterService.getCharacter(characterId);
        }
    }
    return localCharacterService.getCharacter(characterId);
};

export const updateCharacter = async (characterId: string, data: Partial<CharacterSheet>): Promise<void> => {
    if (isFirebaseAvailable()) {
        try {
            const docRef = doc(db, 'characters', characterId);
            await updateDoc(docRef, data);
        } catch (error) {
            console.warn('Firebase error, falling back to local storage:', error);
            return localCharacterService.updateCharacter(characterId, data);
        }
    } else {
        return localCharacterService.updateCharacter(characterId, data);
    }
};

export const deleteCharacter = async (characterId: string): Promise<void> => {
    if (isFirebaseAvailable()) {
        try {
            const docRef = doc(db, 'characters', characterId);
            await deleteDoc(docRef);
        } catch (error) {
            console.warn('Firebase error, falling back to local storage:', error);
            return localCharacterService.deleteCharacter(characterId);
        }
    } else {
        return localCharacterService.deleteCharacter(characterId);
    }
};
