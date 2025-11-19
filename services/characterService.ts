/**
 * @file characterService.ts
 * @description This service manages character data, interacting with Firebase as the primary data source
 * and falling back to local storage if Firebase is unavailable.
 */

import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { localCharacterService } from './localStorageService';
import type { CharacterSheet } from '../types';

const charactersCollection = collection(db, 'characters');

/**
 * Checks if the Firebase database is available and initialized.
 * If not, it logs a warning and returns false, triggering the fallback to local storage.
 * @returns {boolean} True if Firebase is available, false otherwise.
 */
const isFirebaseAvailable = (): boolean => {
    try {
        return !!db && !!charactersCollection;
    } catch (error) {
        console.warn('Firebase not available, using local storage:', error);
        return false;
    }
};

/**
 * Creates a new character sheet.
 * It first tries to create the character in Firebase. If that fails or is unavailable,
 * it falls back to creating the character in local storage.
 * @param {Omit<CharacterSheet, 'id'>} characterData - The character data to save, without the 'id'.
 * @returns {Promise<string>} The ID of the newly created character.
 */
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

/**
 * Retrieves all character sheets associated with a specific user ID.
 * It first tries to fetch characters from Firebase. If that fails or is unavailable,
 * it falls back to fetching from local storage.
 * @param {string} userId - The ID of the user whose characters to retrieve.
 * @returns {Promise<CharacterSheet[]>} A list of the user's character sheets.
 */
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

/**
 * Retrieves a single character sheet by its ID.
 * It first tries to fetch the character from Firebase. If that fails or is unavailable,
 * it falls back to fetching from local storage.
 * @param {string} characterId - The ID of the character to retrieve.
 * @returns {Promise<CharacterSheet | null>} The character sheet object, or null if not found.
 */
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

/**
 * Updates a character sheet with new data.
 * It first tries to update the character in Firebase. If that fails or is unavailable,
 * it falls back to updating the character in local storage.
 * @param {string} characterId - The ID of the character to update.
 * @param {Partial<CharacterSheet>} data - An object containing the fields to update.
 * @returns {Promise<void>}
 */
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

/**
 * Deletes a character sheet.
 * It first tries to delete the character from Firebase. If that fails or is unavailable,
 * it falls back to deleting the character from local storage.
 * @param {string} characterId - The ID of the character to delete.
 * @returns {Promise<void>}
 */
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
