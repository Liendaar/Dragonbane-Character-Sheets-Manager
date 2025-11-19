/**
 * @file localStorageService.ts
 * @description This service provides a complete fallback for character data management using the browser's Local Storage.
 * It is used when Firebase is unavailable, allowing for offline or development mode functionality.
 * All data is stored under a single key (`dragonbane_characters`) as a JSON array.
 */

import type { CharacterSheet } from '../types';

const STORAGE_KEY = 'dragonbane_characters';

/**
 * A service object that mimics the Firebase service's API for character management,
 * but uses local storage as the data source.
 */
export const localCharacterService = {
    /**
     * Creates a new character and saves it to local storage.
     * @param {Omit<CharacterSheet, 'id'>} characterData - The character data to save.
     * @returns {Promise<string>} The ID of the newly created character (a timestamp).
     */
    createCharacter: async (characterData: Omit<CharacterSheet, 'id'>): Promise<string> => {
        const characters = getStoredCharacters();
        const newId = Date.now().toString();
        const newCharacter = { ...characterData, id: newId };
        characters.push(newCharacter);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
        return newId;
    },

    /**
     * Retrieves all characters for a specific user from local storage.
     * @param {string} userId - The ID of the user whose characters to retrieve.
     * @returns {Promise<CharacterSheet[]>} A list of the user's characters.
     */
    getUserCharacters: async (userId: string): Promise<CharacterSheet[]> => {
        const characters = getStoredCharacters();
        return characters.filter(char => char.userId === userId);
    },

    /**
     * Retrieves a single character by its ID from local storage.
     * @param {string} characterId - The ID of the character to retrieve.
     * @returns {Promise<CharacterSheet | null>} The character object, or null if not found.
     */
    getCharacter: async (characterId: string): Promise<CharacterSheet | null> => {
        const characters = getStoredCharacters();
        return characters.find(char => char.id === characterId) || null;
    },

    /**
     * Updates a character's data in local storage.
     * @param {string} characterId - The ID of the character to update.
     * @param {Partial<CharacterSheet>} data - An object with the fields to update.
     * @returns {Promise<void>}
     */
    updateCharacter: async (characterId: string, data: Partial<CharacterSheet>): Promise<void> => {
        const characters = getStoredCharacters();
        const index = characters.findIndex(char => char.id === characterId);
        if (index !== -1) {
            characters[index] = { ...characters[index], ...data };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
        }
    },

    /**
     * Deletes a character from local storage.
     * @param {string} characterId - The ID of the character to delete.
     * @returns {Promise<void>}
     */
    deleteCharacter: async (characterId: string): Promise<void> => {
        const characters = getStoredCharacters();
        const filteredCharacters = characters.filter(char => char.id !== characterId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCharacters));
    }
};

/**
 * A helper function to safely retrieve and parse the character list from local storage.
 * It handles cases where the storage is empty or the data is corrupted.
 * @returns {CharacterSheet[]} The array of characters from local storage, or an empty array if none are found.
 */
function getStoredCharacters(): CharacterSheet[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}
