/**
 * @file spellService.ts
 * @description This service manages spell data for the application.
 * It follows a Firestore-first approach: it tries to fetch spell data from Firebase,
 * and if the data is not present, it initializes it from a local JSON file (`spells.json`).
 * All spells are stored within a single document in the 'spells' collection for efficiency.
 */

import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { SpellSchool } from '../types';
import spellsData from '../spells.json';

const SPELLS_COLLECTION = 'spells';
const SPELLS_DOC_ID = 'all_spells';

/**
 * A service object for managing spell data.
 */
export const spellService = {
    /**
     * Initializes the spell data in Firestore.
     * It checks if the spell document already exists. If not, it creates it and
     * populates it with the spell data from the local `spells.json` file.
     * @returns {Promise<void>}
     */
    async initializeSpells(): Promise<void> {
        try {
            const spellsRef = doc(db, SPELLS_COLLECTION, SPELLS_DOC_ID);
            const spellsDoc = await getDoc(spellsRef);
            
            // If the spells document doesn't exist in Firestore, initialize it.
            if (!spellsDoc.exists()) {
                await setDoc(spellsRef, { ecoles: spellsData.ecoles });
                console.log('Spells initialized in Firebase');
            }
        } catch (error)_ {
            console.error('Error during spell initialization:', error);
        }
    },

    /**
     * Retrieves all spell schools and their spells.
     * It first attempts to fetch the data from the single document in Firestore.
     * If the document doesn't exist or if there's an error, it falls back to returning
     * the spell data directly from the imported `spells.json` file.
     * @returns {Promise<SpellSchool[]>} An array of spell schools.
     */
    async getAllSpells(): Promise<SpellSchool[]> {
        try {
            const spellsRef = doc(db, SPELLS_COLLECTION, SPELLS_DOC_ID);
            const spellsDoc = await getDoc(spellsRef);
            
            if (spellsDoc.exists()) {
                const data = spellsDoc.data();
                return data.ecoles as SpellSchool[];
            }
            
            // If no spells are found in Firebase, return the local JSON data as a fallback.
            return spellsData.ecoles as SpellSchool[];
        } catch (error) {
            console.error('Error fetching spells:', error);
            // Fallback to local JSON data in case of an error.
            return spellsData.ecoles as SpellSchool[];
        }
    },

    /**
     * A synchronous fallback method to get spell data directly from the local JSON file.
     * @returns {SpellSchool[]} An array of spell schools from `spells.json`.
     */
    getLocalSpells(): SpellSchool[] {
        return spellsData.ecoles as SpellSchool[];
    }
};

