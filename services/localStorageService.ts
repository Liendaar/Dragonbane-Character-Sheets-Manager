import type { CharacterSheet } from '../types';

const STORAGE_KEY = 'dragonbane_characters';

// Service de stockage local pour le développement
export const localCharacterService = {
    createCharacter: async (characterData: Omit<CharacterSheet, 'id'>): Promise<string> => {
        const characters = getStoredCharacters();
        const newId = Date.now().toString();
        const newCharacter = { ...characterData, id: newId };
        characters.push(newCharacter);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
        return newId;
    },

    getUserCharacters: async (userId: string): Promise<CharacterSheet[]> => {
        const characters = getStoredCharacters();
        return characters.filter(char => char.userId === userId);
    },

    getCharacter: async (characterId: string): Promise<CharacterSheet | null> => {
        const characters = getStoredCharacters();
        return characters.find(char => char.id === characterId) || null;
    },

    updateCharacter: async (characterId: string, data: Partial<CharacterSheet>): Promise<void> => {
        const characters = getStoredCharacters();
        const index = characters.findIndex(char => char.id === characterId);
        if (index !== -1) {
            characters[index] = { ...characters[index], ...data };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
        }
    },

    deleteCharacter: async (characterId: string): Promise<void> => {
        const characters = getStoredCharacters();
        const filteredCharacters = characters.filter(char => char.id !== characterId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCharacters));
    }
};

function getStoredCharacters(): CharacterSheet[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}
