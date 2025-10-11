
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { CharacterSheet } from '../types';

const charactersCollection = collection(db, 'characters');

export const createCharacter = async (characterData: Omit<CharacterSheet, 'id'>): Promise<string> => {
    const docRef = await addDoc(charactersCollection, characterData);
    return docRef.id;
};

export const getUserCharacters = async (userId: string): Promise<CharacterSheet[]> => {
    const q = query(charactersCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CharacterSheet));
};

export const getCharacter = async (characterId: string): Promise<CharacterSheet | null> => {
    const docRef = doc(db, 'characters', characterId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CharacterSheet;
    }
    return null;
};

export const updateCharacter = async (characterId: string, data: Partial<CharacterSheet>): Promise<void> => {
    const docRef = doc(db, 'characters', characterId);
    await updateDoc(docRef, data);
};

export const deleteCharacter = async (characterId: string): Promise<void> => {
    const docRef = doc(db, 'characters', characterId);
    await deleteDoc(docRef);
};
