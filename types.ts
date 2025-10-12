
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Skill {
  name: string;
  value: number;
  attribute: string;
}

export interface SkillData {
  checked: boolean;
  value: number;
}

export interface CharacterSheet {
  id: string;
  userId: string;
  name: string;
  player: string;
  family: string;
  age: string;
  profession: string;
  weakness: string;
  appearance: string;
  attributes: {
    for: number;
    con: number;
    agi: number;
    int: number;
    vol: number;
    cha: number;
  };
  conditions: {
    exhausted: boolean;
    sick: boolean;
    stunned: boolean;
    furious: boolean;
    scared: boolean;
    discouraged: boolean;
  };
  damageBonus: {
    for: string;
    agi: string;
  };
  movement: string;
  encumbranceLimit: string;
  abilities: string[];
  skills: Record<string, SkillData>;
  weaponSkills: Record<string, SkillData>;
  secondarySkills: Skill[];
  inventory: string[];
  souvenir: string;
  tinyItems: string;
  money: {
    or: number;
    argent: number;
    cuivre: number;
  };
  armor: {
    name: string;
    bane: string[];
  };
  helmet: {
    name: string;
    bane: string[];
  };
  weapons: Weapon[];
  weaponsShields: WeaponShield[];
  vitals: {
    willpower: { current: number; max: number; };
    health: { current: number; max: number; };
  };
  deathRolls: {
    successes: number;
    failures: number;
  };
  rest: {
    round: boolean;
    period: boolean;
  };
}

export interface Weapon {
  name: string;
  grip: string;
  range: string;
  damage: string;
  durability: string;
  traits: string;
}

export interface WeaponShield {
  name: string;
  grip: string;
  range: string;
  damage: string;
  durability: string;
  traits: string;
}

export const SKILLS_LIST = {
    'Acrobatie': 'agi', 'Artisanat': 'for', 'Bluff': 'cha', 'Chasse et pêche': 'agi', 'Con. des bêtes': 'int',
    'Dextérité': 'agi', 'Discrétion': 'agi', 'Équitation': 'agi', 'Esquive': 'agi', 'Intuition': 'int',
    'Langues': 'int', 'Marchandage': 'cha', 'Mythes et légendes': 'int', 'Natation': 'agi', 'Navigation': 'int',
    'Perception': 'int', 'Persuasion': 'cha', 'Représentation': 'cha', 'Soins': 'int', 'Survie': 'int',
};

export const WEAPON_SKILLS_LIST = {
    'Arbalètes': 'agi', 'Arcs': 'agi', 'Bagarre': 'for', 'Bâtons': 'agi', 'Couteaux': 'agi', 'Épées': 'for',
    'Frondes': 'agi', 'Haches': 'for', 'Lances': 'for', 'Marteaux': 'for',
};

export const ATTRIBUTES_ORDER = ['for', 'con', 'agi', 'int', 'vol', 'cha'] as const;
export const CONDITIONS_ORDER = ['exhausted', 'sick', 'stunned', 'furious', 'scared', 'discouraged'] as const;
export const CONDITION_LABELS = ['Épuisé', 'Malade', 'Étourdi', 'Furieux', 'Effrayé', 'Découragé'] as const;

export const createNewCharacter = (userId: string): Omit<CharacterSheet, 'id'> => {
    const attributes = { for: 10, con: 10, agi: 10, int: 10, vol: 10, cha: 10 };
    return {
        userId,
        name: '',
        player: '',
        family: '',
        age: '',
        profession: '',
        weakness: '',
        appearance: '',
        attributes,
        conditions: { exhausted: false, sick: false, stunned: false, furious: false, scared: false, discouraged: false },
        damageBonus: { for: '', agi: '' },
        movement: '',
        encumbranceLimit: '',
        abilities: ['', '', '', '', ''],
        skills: Object.keys(SKILLS_LIST).reduce((acc, skill) => ({ ...acc, [skill]: { checked: false, value: 0 } }), {}),
        weaponSkills: Object.keys(WEAPON_SKILLS_LIST).reduce((acc, skill) => ({ ...acc, [skill]: { checked: false, value: 0 } }), {}),
        secondarySkills: [],
        inventory: Array(10).fill(''),
        souvenir: '',
        tinyItems: '',
        money: { or: 0, argent: 0, cuivre: 0 },
        armor: { name: '', bane: ['ACROBATIE', 'DISCRÉTION', 'ESQUIVE'] },
        helmet: { name: '', bane: ['ATTAQUES À DISTANCE', 'INTUITION'] },
        weapons: [
          { name: '', grip: '', range: '', damage: '', durability: '', traits: '' },
          { name: '', grip: '', range: '', damage: '', durability: '', traits: '' },
        ],
        weaponsShields: [],
        vitals: { 
            willpower: { current: attributes.vol, max: attributes.vol }, 
            health: { current: attributes.con, max: attributes.con } 
        },
        deathRolls: { successes: 0, failures: 0 },
        rest: { round: false, period: false },
    };
};
