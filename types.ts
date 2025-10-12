
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Skill {
  name: string;
  value: number;
  attribute: string;
  checked: boolean;
}

export interface SkillData {
  checked: boolean;
  value: number;
}

export interface Spell {
  nom: string;
  rang: string | number;
  ecole: string;
  condition_prealable: string | null;
  prerequis: string | null;
  temps_incantation: string | null;
  portee: string | null;
  duree: string | null;
  description: string;
}

export interface KnownSpell extends Spell {
  memorized: boolean;
}

export interface SpellSchool {
  nom: string;
  sorts: Spell[];
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
  portrait?: string;
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
  abilities: Ability[];
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
    armorRating: number;
    bane: string[];
  };
  helmet: {
    name: string;
    armorRating: number;
    bane: string[];
  };
  weapons: Weapon[];
  weaponsShields: WeaponShield[];
  grimoire: KnownSpell[];
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

export interface Ability {
  name: string;
  description: string;
  pv: string;
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

export const getMemorizedSpellLimit = (intelligence: number): number => {
    if (intelligence <= 5) return 3;
    if (intelligence <= 8) return 4;
    if (intelligence <= 12) return 5;
    if (intelligence <= 15) return 6;
    return 7;
};

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
        portrait: '',
        attributes,
        conditions: { exhausted: false, sick: false, stunned: false, furious: false, scared: false, discouraged: false },
        damageBonus: { for: '', agi: '' },
        movement: '',
        encumbranceLimit: '',
        abilities: [],
        skills: Object.keys(SKILLS_LIST).reduce((acc, skill) => ({ ...acc, [skill]: { checked: false, value: 0 } }), {}),
        weaponSkills: Object.keys(WEAPON_SKILLS_LIST).reduce((acc, skill) => ({ ...acc, [skill]: { checked: false, value: 0 } }), {}),
        secondarySkills: [],
        inventory: Array(10).fill(''),
        souvenir: '',
        tinyItems: '',
        money: { or: 0, argent: 0, cuivre: 0 },
        armor: { name: '', armorRating: 0, bane: [] },
        helmet: { name: '', armorRating: 0, bane: [] },
        weapons: [
          { name: '', grip: '', range: '', damage: '', durability: '', traits: '' },
          { name: '', grip: '', range: '', damage: '', durability: '', traits: '' },
        ],
        weaponsShields: [],
        grimoire: [],
        vitals: { 
            willpower: { current: attributes.vol, max: attributes.vol }, 
            health: { current: attributes.con, max: attributes.con } 
        },
        deathRolls: { successes: 0, failures: 0 },
        rest: { round: false, period: false },
    };
};
