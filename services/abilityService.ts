/**
 * @file abilityService.ts
 * @description This service manages heroic abilities, fetching them from Firestore and
 * initializing the collection from a local JSON file if needed.
 */

import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import abilitiesData from '../skills.json';

export interface HeroicAbility {
    capacite: string;
    prerequis: string;
    pv: string | number;
    description: string;
}

/**
 * Retrieves all heroic abilities.
 * It first tries to fetch abilities from the 'abilities' collection in Firestore.
 * If the collection is empty, it calls `initializeAbilities` to populate it from `skills.json`.
 * If there's an error fetching from Firestore, it falls back to returning the data directly from the imported JSON.
 * @returns {Promise<HeroicAbility[]>} A list of all heroic abilities.
 */
export const getAllAbilities = async (): Promise<HeroicAbility[]> => {
    try {
        const abilitiesCol = collection(db, 'abilities');
        const abilitiesSnapshot = await getDocs(abilitiesCol);
        
        if (abilitiesSnapshot.empty) {
            // If no abilities in Firestore, initialize from JSON
            await initializeAbilities();
            return abilitiesData.capacites_heroiques;
        }
        
        return abilitiesSnapshot.docs.map(doc => doc.data() as HeroicAbility);
    } catch (error) {
        console.error('Error fetching abilities:', error);
        // Fallback to JSON data
        return abilitiesData.capacites_heroiques;
    }
};

/**
 * Initializes the 'abilities' collection in Firestore from the `skills.json` file.
 * This function is typically called once when the database is empty to perform the initial data seeding.
 * It iterates through the heroic abilities in the JSON and creates a new document for each one in Firestore.
 * @returns {Promise<void>}
 */
export const initializeAbilities = async (): Promise<void> => {
    try {
        const abilitiesCol = collection(db, 'abilities');
        
        for (const ability of abilitiesData.capacites_heroiques) {
            const abilityDoc = doc(abilitiesCol, ability.capacite);
            await setDoc(abilityDoc, ability);
        }
        
        console.log('Abilities initialized in Firestore');
    } catch (error) {
        console.error('Error initializing abilities:', error);
    }
};

