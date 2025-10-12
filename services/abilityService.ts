import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import abilitiesData from '../skills.json';

export interface HeroicAbility {
    capacite: string;
    prerequis: string;
    pv: string | number;
    description: string;
}

// Get all abilities from Firestore
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

// Initialize abilities in Firestore from JSON
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

