import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { SpellSchool } from '../types';
import spellsData from '../spells.json';

const SPELLS_COLLECTION = 'spells';
const SPELLS_DOC_ID = 'all_spells';

// Service pour gérer les sorts dans Firebase
export const spellService = {
    // Initialiser Firebase avec les sorts du JSON
    async initializeSpells(): Promise<void> {
        try {
            const spellsRef = doc(db, SPELLS_COLLECTION, SPELLS_DOC_ID);
            const spellsDoc = await getDoc(spellsRef);
            
            // Si les sorts n'existent pas encore dans Firebase, les initialiser
            if (!spellsDoc.exists()) {
                await setDoc(spellsRef, { ecoles: spellsData.ecoles });
                console.log('Sorts initialisés dans Firebase');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des sorts:', error);
        }
    },

    // Récupérer tous les sorts depuis Firebase
    async getAllSpells(): Promise<SpellSchool[]> {
        try {
            const spellsRef = doc(db, SPELLS_COLLECTION, SPELLS_DOC_ID);
            const spellsDoc = await getDoc(spellsRef);
            
            if (spellsDoc.exists()) {
                const data = spellsDoc.data();
                return data.ecoles as SpellSchool[];
            }
            
            // Si pas de sorts dans Firebase, retourner les sorts du JSON
            return spellsData.ecoles as SpellSchool[];
        } catch (error) {
            console.error('Erreur lors de la récupération des sorts:', error);
            // Fallback sur les sorts locaux
            return spellsData.ecoles as SpellSchool[];
        }
    },

    // Récupérer les sorts locaux (fallback)
    getLocalSpells(): SpellSchool[] {
        return spellsData.ecoles as SpellSchool[];
    }
};

