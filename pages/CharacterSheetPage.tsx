import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCharacter, updateCharacter } from '../services/characterService';
import { createNewCharacter } from '../types';
import type { CharacterSheet, Weapon, WeaponShield, Skill } from '../types';
import { SKILLS_LIST, WEAPON_SKILLS_LIST, ATTRIBUTES_ORDER, CONDITIONS_ORDER, CONDITION_LABELS } from '../types';

// Debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-[#fdfbf5]/50 border border-[#d3c9b8] rounded-md shadow-sm p-3 ${className}`}>
        <h2 className="font-title text-center text-sm font-bold bg-[#2D7A73] text-white py-1 rounded-sm -mt-6 mx-auto w-4/5 shadow-md">{title}</h2>
        <div className="mt-4">{children}</div>
    </div>
);

const LabeledInput: React.FC<{ label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }> = ({ label, value, onChange, className }) => (
    <div className={`flex items-center ${className}`}>
        <label className="text-xs font-bold text-gray-600 mr-2 w-1/3">{label}</label>
        <input type="text" value={value} onChange={onChange} className="bg-transparent border-b border-gray-400 w-2/3 focus:outline-none focus:border-[#2D7A73] text-sm" />
    </div>
);

const AttributeCircle: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; condition: boolean; onConditionChange: () => void; conditionLabel: string }> = ({ label, value, onChange, condition, onConditionChange, conditionLabel }) => (
    <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 border-4 border-[#2D7A73] rounded-full flex items-center justify-center bg-white shadow-inner">
            <span className="absolute -top-3 text-xs font-bold font-title text-[#2D7A73] bg-[#FBF3E5] px-1">{label}</span>
            <input type="number" value={value} onChange={onChange} className="w-10 text-center text-xl font-bold text-gray-800 bg-transparent focus:outline-none" />
        </div>
        <div onClick={onConditionChange} className={`cursor-pointer text-xs mt-1 px-2 py-0.5 rounded-full border ${condition ? 'bg-red-600 text-white border-red-700' : 'bg-gray-200 text-gray-600 border-gray-300'}`}>
            {conditionLabel}
        </div>
    </div>
);

const SkillInput: React.FC<{ 
    label: string; 
    stat: string; 
    checked: boolean; 
    value: number; 
    onCheckChange: (checked: boolean) => void;
    onValueChange: (value: number) => void; 
}> = ({ label, stat, checked, value, onCheckChange, onValueChange }) => (
    <div className="flex items-center space-x-2 text-sm">
        <div 
            onClick={() => onCheckChange(!checked)} 
            className={`cursor-pointer w-4 h-4 border-2 border-gray-500 transform rotate-45 flex items-center justify-center ${checked ? 'bg-gray-700' : 'bg-transparent'}`}
        >
            <div className="w-2 h-2"></div>
        </div>
        <span className="flex-grow">{label}</span>
        <span className="text-xs text-gray-500">({stat.toUpperCase()})</span>
        <input 
            type="number" 
            value={value} 
            onChange={e => onValueChange(parseInt(e.target.value) || 0)} 
            className="w-12 text-center text-sm border border-gray-400 rounded focus:outline-none focus:border-[#2D7A73]"
            min="0"
        />
    </div>
);

const SecondarySkillRow: React.FC<{ 
    skill: Skill; 
    index: number; 
    onUpdate: (index: number, skill: Skill) => void; 
    onRemove: (index: number) => void; 
}> = ({ skill, index, onUpdate, onRemove }) => {
    
    return (
        <div className="flex items-center space-x-2 text-sm mb-2">
            <div 
                onClick={() => onUpdate(index, { ...skill, checked: !skill.checked })} 
                className={`cursor-pointer w-4 h-4 border-2 border-gray-500 transform rotate-45 flex items-center justify-center ${skill.checked ? 'bg-gray-700' : 'bg-transparent'}`}
            >
                <div className="w-2 h-2"></div>
            </div>
            <input 
                type="text" 
                value={skill.name} 
                onChange={e => onUpdate(index, { ...skill, name: e.target.value })}
                placeholder="Nom de la compétence"
                className="flex-1 bg-transparent border-b border-gray-400 focus:outline-none focus:border-[#2D7A73] text-sm"
            />
            <select 
                value={skill.attribute} 
                onChange={e => onUpdate(index, { ...skill, attribute: e.target.value })}
                className="bg-transparent border border-gray-400 rounded text-sm focus:outline-none focus:border-[#2D7A73]"
            >
                {ATTRIBUTES_ORDER.map(attr => (
                    <option key={attr} value={attr}>{attr.toUpperCase()}</option>
                ))}
            </select>
            <input 
                type="number" 
                value={skill.value} 
                onChange={e => onUpdate(index, { ...skill, value: parseInt(e.target.value) || 0 })}
                className="w-12 text-center text-sm border border-gray-400 rounded focus:outline-none focus:border-[#2D7A73]"
                min="0"
            />
            <button 
                onClick={() => onRemove(index)}
                className="text-red-600 hover:text-red-800 text-sm font-bold"
            >
                ×
            </button>
        </div>
    );
};

const WeaponShieldRow: React.FC<{ 
    weapon: WeaponShield; 
    index: number; 
    onUpdate: (index: number, weapon: WeaponShield) => void; 
    onRemove: (index: number) => void; 
}> = ({ weapon, index, onUpdate, onRemove }) => {
    return (
        <div className="grid grid-cols-6 gap-2 text-sm mb-2 items-center">
            <input 
                type="text" 
                value={weapon.name} 
                onChange={e => onUpdate(index, { ...weapon, name: e.target.value })}
                placeholder="Arme/Bouclier"
                className="bg-transparent border-b border-gray-400 focus:outline-none focus:border-[#2D7A73] text-sm"
            />
            <input 
                type="text" 
                value={weapon.grip} 
                onChange={e => onUpdate(index, { ...weapon, grip: e.target.value })}
                placeholder="Prise"
                className="bg-transparent border-b border-gray-400 focus:outline-none focus:border-[#2D7A73] text-sm"
            />
            <input 
                type="text" 
                value={weapon.range} 
                onChange={e => onUpdate(index, { ...weapon, range: e.target.value })}
                placeholder="Portée"
                className="bg-transparent border-b border-gray-400 focus:outline-none focus:border-[#2D7A73] text-sm"
            />
            <input 
                type="text" 
                value={weapon.damage} 
                onChange={e => onUpdate(index, { ...weapon, damage: e.target.value })}
                placeholder="Dégâts"
                className="bg-transparent border-b border-gray-400 focus:outline-none focus:border-[#2D7A73] text-sm"
            />
            <input 
                type="text" 
                value={weapon.durability} 
                onChange={e => onUpdate(index, { ...weapon, durability: e.target.value })}
                placeholder="Solidité"
                className="bg-transparent border-b border-gray-400 focus:outline-none focus:border-[#2D7A73] text-sm"
            />
            <div className="flex items-center space-x-1">
                <input 
                    type="text" 
                    value={weapon.traits} 
                    onChange={e => onUpdate(index, { ...weapon, traits: e.target.value })}
                    placeholder="Traits"
                    className="flex-1 bg-transparent border-b border-gray-400 focus:outline-none focus:border-[#2D7A73] text-sm"
                />
                <button 
                    onClick={() => onRemove(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-bold ml-1"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

const ArmorSection: React.FC<{
    title: string;
    name: string;
    armorRating: number;
    baneOptions: string[];
    defaultBanes: string[];
    onNameChange: (value: string) => void;
    onRatingChange: (value: number) => void;
    onBaneToggle: (bane: string) => void;
}> = ({ title, name, armorRating, baneOptions, defaultBanes, onNameChange, onRatingChange, onBaneToggle }) => (
    <div className="bg-[#fdfbf5] border-2 border-[#d3c9b8] rounded-lg p-4 shadow-md">
        <h3 className="font-title text-center text-lg font-bold text-[#2D7A73] mb-3">{title}</h3>
        <input 
            type="text" 
            value={name} 
            onChange={e => onNameChange(e.target.value)}
            placeholder={`Nom du ${title.toLowerCase()}`}
            className="w-full bg-transparent border-b-2 border-gray-400 focus:outline-none focus:border-[#2D7A73] text-center font-bold mb-3"
        />
        <div className="mb-3">
            <label className="block text-xs font-bold text-gray-600 mb-1">INDICE D'ARMURE</label>
            <input 
                type="number" 
                value={armorRating} 
                onChange={e => onRatingChange(parseInt(e.target.value) || 0)}
                className="w-full text-center text-xl font-bold border-2 border-gray-400 rounded focus:outline-none focus:border-[#2D7A73]"
                min="0"
            />
        </div>
        <div>
            <div className="text-xs font-bold text-gray-600 mb-2">FLÉAU SUR :</div>
            <div className="space-y-1">
                {baneOptions.map(bane => (
                    <div key={bane} className="flex items-center space-x-2">
                        <div 
                            onClick={() => onBaneToggle(bane)}
                            className={`cursor-pointer w-4 h-4 border-2 border-gray-500 transform rotate-45 flex items-center justify-center ${defaultBanes.includes(bane) ? 'bg-gray-700' : 'bg-transparent'}`}
                        >
                            <div className="w-2 h-2"></div>
                        </div>
                        <span className="text-xs">{bane}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const PointTracker: React.FC<{ label: string; current: number; max: number; onCurrentChange: (val: number) => void; onMaxChange: (val: number) => void; color: string; }> = ({ label, current, max, onCurrentChange, onMaxChange, color }) => (
    <div className={`p-2 border-4 rounded-md shadow-inner bg-white/30`} style={{ borderColor: color }}>
        <h3 className="text-center font-bold font-title text-sm" style={{ color }}>{label}</h3>
        <div className="flex items-center justify-center my-2">
            <input type="number" value={current} onChange={e => onCurrentChange(parseInt(e.target.value) || 0)} className="w-10 h-10 text-xl text-center font-bold border-2 rounded bg-white" />
            <span className="mx-2 text-xl">/</span>
            <input type="number" value={max} onChange={e => onMaxChange(parseInt(e.target.value) || 0)} className="w-10 h-10 text-xl text-center font-bold border-2 rounded bg-white" />
        </div>
        <div className="grid grid-cols-10 gap-1 mt-2">
            {/* FIX: Using `[...new Array(max)]` can cause a "Spread types may only be created from object types" error. `Array.from()` is a safer way to create an array to iterate over and guards against negative lengths. */}
            {Array.from({ length: Math.max(0, max) }).map((_, i) => (
                <div key={i} onClick={() => onCurrentChange(i + 1)} className={`w-3 h-3 rounded-full border border-gray-400 cursor-pointer ${i < current ? 'bg-current' : 'bg-white'}`} style={{ color }}></div>
            ))}
        </div>
    </div>
);


const CharacterSheetPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [character, setCharacter] = useState<CharacterSheet | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const debouncedCharacter = useDebounce(character, 1000);

    const updateField = <K extends keyof CharacterSheet, V extends CharacterSheet[K]>(field: K, value: V) => {
        setCharacter(prev => prev ? { ...prev, [field]: value } : null);
    };

    const updateNestedField = <K1 extends keyof CharacterSheet, K2 extends keyof CharacterSheet[K1]>(key1: K1, key2: K2, value: CharacterSheet[K1][K2]) => {
      // FIX: Cast `prev[key1]` to object to resolve "Spread types may only be created from object types."
      // The generic type for `prev[key1]` could be a primitive, which cannot be spread.
      // This is safe because this function is only ever called with keys for object properties.
      setCharacter(prev => {
        if (!prev) return null;
        
        const updated = { ...prev, [key1]: { ...(prev[key1] as object), [key2]: value } };
        
        // Auto-adjust vitals max when attributes change
        if (key1 === 'attributes') {
          const attrName = key2 as keyof typeof prev.attributes;
          if (attrName === 'con') {
            // Update health max when CON changes
            updated.vitals = {
              ...updated.vitals,
              health: {
                ...updated.vitals.health,
                max: value as number
              }
            };
          } else if (attrName === 'vol') {
            // Update willpower max when VOL changes
            updated.vitals = {
              ...updated.vitals,
              willpower: {
                ...updated.vitals.willpower,
                max: value as number
              }
            };
          }
        }
        
        return updated;
      });
    }

    // Migration function for existing characters
    const migrateCharacterData = (charData: CharacterSheet): CharacterSheet => {
        // Migrate skills from boolean/number to SkillData
        const migratedSkills = Object.keys(SKILLS_LIST).reduce((acc, skill) => {
            const currentValue = charData.skills[skill];
            if (typeof currentValue === 'boolean') {
                acc[skill] = { checked: currentValue, value: currentValue ? 1 : 0 };
            } else if (typeof currentValue === 'number') {
                acc[skill] = { checked: currentValue > 0, value: currentValue };
            } else if (currentValue && typeof currentValue === 'object' && 'checked' in currentValue) {
                acc[skill] = currentValue;
            } else {
                acc[skill] = { checked: false, value: 0 };
            }
            return acc;
        }, {} as Record<string, any>);

        // Migrate weapon skills from boolean/number to SkillData
        const migratedWeaponSkills = Object.keys(WEAPON_SKILLS_LIST).reduce((acc, skill) => {
            const currentValue = charData.weaponSkills[skill];
            if (typeof currentValue === 'boolean') {
                acc[skill] = { checked: currentValue, value: currentValue ? 1 : 0 };
            } else if (typeof currentValue === 'number') {
                acc[skill] = { checked: currentValue > 0, value: currentValue };
            } else if (currentValue && typeof currentValue === 'object' && 'checked' in currentValue) {
                acc[skill] = currentValue;
            } else {
                acc[skill] = { checked: false, value: 0 };
            }
            return acc;
        }, {} as Record<string, any>);

        // Migrate secondary skills from string array to Skill array
        const migratedSecondarySkills = Array.isArray(charData.secondarySkills) 
            ? charData.secondarySkills.map(skill => {
                if (typeof skill === 'string') {
                    return { name: skill, value: 0, attribute: 'agi', checked: false };
                } else if (skill && typeof skill === 'object') {
                    return { ...skill, checked: skill.checked ?? false };
                }
                return { name: '', value: 0, attribute: 'agi', checked: false };
              })
            : [];

        return {
            ...charData,
            skills: migratedSkills,
            weaponSkills: migratedWeaponSkills,
            secondarySkills: migratedSecondarySkills,
            weaponsShields: charData.weaponsShields || [],
            grimoire: charData.grimoire || [],
            armor: {
                ...charData.armor,
                armorRating: charData.armor.armorRating ?? 0
            },
            helmet: {
                ...charData.helmet,
                armorRating: charData.helmet.armorRating ?? 0
            },
            vitals: {
                willpower: { 
                    current: charData.vitals.willpower.current, 
                    max: charData.attributes.vol 
                },
                health: { 
                    current: charData.vitals.health.current, 
                    max: charData.attributes.con 
                }
            }
        };
    };

    useEffect(() => {
        const fetchCharacter = async () => {
            if (id) {
                setLoading(true);
                const charData = await getCharacter(id);
                if (charData) {
                    const migratedChar = migrateCharacterData(charData);
                    setCharacter(migratedChar);
                } else {
                    setCharacter({ ...createNewCharacter(''), id });
                }
                setLoading(false);
            }
        };
        fetchCharacter();
    }, [id]);

    useEffect(() => {
        const saveCharacter = async () => {
            if (debouncedCharacter && id) {
                setSaving(true);
                // Exclude id and userId from update payload
                const { id: charId, userId, ...dataToSave } = debouncedCharacter;
                await updateCharacter(id, dataToSave);
                setSaving(false);
            }
        };
        saveCharacter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedCharacter]);


    if (loading || !character) {
        return <div className="text-center p-10">Loading Character...</div>;
    }
    
    // Utilisation des constantes définies dans types.ts pour garantir un ordre fixe

    return (
      <div className="p-2 md:p-4 bg-[#FBF3E5] min-h-screen">
          <div className="max-w-4xl mx-auto space-y-3">
              <header className="flex justify-between items-center mb-4">
                  <Link to="/" className="text-[#2D7A73] hover:underline">&larr; Back to Dashboard</Link>
                  <div className="flex items-center space-x-4">
                      <Link 
                          to={`/grimoire/${id}`} 
                          className="bg-[#2D7A73] hover:bg-[#25635d] text-white px-4 py-2 rounded font-bold transition-colors"
                      >
                          📖 Grimoire
                      </Link>
                      <div className="text-sm text-gray-500">{saving ? 'Saving...' : 'Saved'}</div>
                  </div>
              </header>
              {/* Top Section */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-3 space-y-1">
                      <LabeledInput label="JOUEUR" value={character.player} onChange={e => updateField('player', e.target.value)} />
                      <div className="flex space-x-4">
                          <LabeledInput label="FAMILLE" value={character.family} onChange={e => updateField('family', e.target.value)} className="w-2/3"/>
                          <LabeledInput label="ÂGE" value={character.age} onChange={e => updateField('age', e.target.value)} className="w-1/3"/>
                      </div>
                      <LabeledInput label="PROFESSION" value={character.profession} onChange={e => updateField('profession', e.target.value)} />
                      <LabeledInput label="FAIBLESSE" value={character.weakness} onChange={e => updateField('weakness', e.target.value)} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                       <h1 className="text-5xl font-extrabold text-red-700 text-center font-title">DRAGON BANE</h1>
                       <div className="bg-[#e4d9c6] border border-[#c3b6a2] rounded p-2 text-center shadow-inner">
                          <input type="text" value={character.name} onChange={e => updateField('name', e.target.value)} placeholder="NOM" className="font-title text-xl font-bold bg-transparent text-center w-full focus:outline-none" />
                       </div>
                  </div>
                  <div className="md:col-span-5">
                      <textarea value={character.appearance} onChange={e => updateField('appearance', e.target.value)} placeholder="APPARENCE" rows={3} className="bg-transparent border-t border-b border-gray-400 w-full focus:outline-none focus:border-[#2D7A73] text-sm p-1"></textarea>
                  </div>
              </div>

              {/* Attributes Section */}
              <div className="p-4 bg-gradient-to-b from-[#2D7A73] to-[#25635d] rounded-lg shadow-lg">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {ATTRIBUTES_ORDER.map((attr, index) => (
                          <AttributeCircle 
                              key={attr} 
                              label={attr.toUpperCase()}
                              value={character.attributes[attr as keyof typeof character.attributes]}
                              onChange={e => updateNestedField('attributes', attr as keyof typeof character.attributes, parseInt(e.target.value) || 0)}
                              condition={character.conditions[CONDITIONS_ORDER[index] as keyof typeof character.conditions]}
                              onConditionChange={() => updateNestedField('conditions', CONDITIONS_ORDER[index] as keyof typeof character.conditions, !character.conditions[CONDITIONS_ORDER[index] as keyof typeof character.conditions])}
                              conditionLabel={CONDITION_LABELS[index]}
                          />
                      ))}
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <LabeledInput label="BON. DÉGÂTS FOR" value={character.damageBonus.for} onChange={e => updateNestedField('damageBonus', 'for', e.target.value)} />
                  <LabeledInput label="BON. DÉGÂTS AGI" value={character.damageBonus.agi} onChange={e => updateNestedField('damageBonus', 'agi', e.target.value)} />
                  <LabeledInput label="DÉPLACEMENT" value={character.movement} onChange={e => updateField('movement', e.target.value)} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Abilities & Money */}
                <div className="space-y-3">
                    <Section title="CAPACITÉS">
                        <div className="space-y-1">
                            {character.abilities.map((ability, i) => <input key={i} type="text" value={ability} onChange={e => {const newAbilities = [...character.abilities]; newAbilities[i] = e.target.value; updateField('abilities', newAbilities); }} className="bg-transparent border-b border-gray-400 w-full focus:outline-none focus:border-[#2D7A73] text-sm"/>)}
                        </div>
                    </Section>
                    <Section title="MONEY">
                        <LabeledInput label="OR" value={character.money.or} onChange={e => updateNestedField('money', 'or', parseInt(e.target.value) || 0)} />
                        <LabeledInput label="ARGENT" value={character.money.argent} onChange={e => updateNestedField('money', 'argent', parseInt(e.target.value) || 0)} />
                        <LabeledInput label="CUIVRE" value={character.money.cuivre} onChange={e => updateNestedField('money', 'cuivre', parseInt(e.target.value) || 0)} />
                    </Section>
                </div>

                {/* Skills */}
                <Section title="COMPÉTENCES" className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                        <div>
                          {Object.entries(SKILLS_LIST).map(([skill, stat]) => {
                              const skillData = character.skills[skill] || { checked: false, value: 0 };
                              return (
                                  <SkillInput 
                                      key={skill} 
                                      label={skill} 
                                      stat={stat} 
                                      checked={skillData.checked}
                                      value={skillData.value} 
                                      onCheckChange={(checked) => updateNestedField('skills', skill, { ...skillData, checked })}
                                      onValueChange={(value) => updateNestedField('skills', skill, { ...skillData, value })}
                                  />
                              );
                          })}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm mb-1">COMPÉTENCES D'ARME</h3>
                          {Object.entries(WEAPON_SKILLS_LIST).map(([skill, stat]) => {
                              const skillData = character.weaponSkills[skill] || { checked: false, value: 0 };
                              return (
                                  <SkillInput 
                                      key={skill} 
                                      label={skill} 
                                      stat={stat} 
                                      checked={skillData.checked}
                                      value={skillData.value} 
                                      onCheckChange={(checked) => updateNestedField('weaponSkills', skill, { ...skillData, checked })}
                                      onValueChange={(value) => updateNestedField('weaponSkills', skill, { ...skillData, value })}
                                  />
                              );
                          })}
                          <h3 className="font-bold text-sm mt-4 mb-1">COMPÉTENCES SECONDAIRES</h3>
                          <div className="space-y-1">
                            {character.secondarySkills.map((skill, i) => (
                                <SecondarySkillRow 
                                    key={i}
                                    skill={skill} 
                                    index={i} 
                                    onUpdate={(index, updatedSkill) => {
                                        const newSkills = [...character.secondarySkills];
                                        newSkills[index] = updatedSkill;
                                        updateField('secondarySkills', newSkills);
                                    }}
                                    onRemove={(index) => {
                                        const newSkills = character.secondarySkills.filter((_, i) => i !== index);
                                        updateField('secondarySkills', newSkills);
                                    }}
                                />
                            ))}
                            <button 
                                onClick={() => {
                                    const newSkills = [...character.secondarySkills, { name: '', value: 0, attribute: 'agi', checked: false }];
                                    updateField('secondarySkills', newSkills);
                                }}
                                className="text-[#2D7A73] hover:text-[#25635d] text-sm font-bold border border-[#2D7A73] rounded px-2 py-1 hover:bg-[#2D7A73] hover:text-white transition-colors"
                            >
                                + Ajouter une compétence
                            </button>
                          </div>
                        </div>
                    </div>
                </Section>
              </div>

              {/* Weapons & Shields Section */}
              <Section title="ARMES & BOUCLIERS">
                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-2 text-xs font-bold text-gray-600 mb-2">
                    <div>ARME/BOUCLIER</div>
                    <div>PRISE</div>
                    <div>PORTÉE</div>
                    <div>DÉGÂTS</div>
                    <div>SOLIDITÉ</div>
                    <div>TRAITS</div>
                  </div>
                  {character.weaponsShields.map((weapon, i) => (
                      <WeaponShieldRow 
                          key={i}
                          weapon={weapon} 
                          index={i} 
                          onUpdate={(index, updatedWeapon) => {
                              const newWeapons = [...character.weaponsShields];
                              newWeapons[index] = updatedWeapon;
                              updateField('weaponsShields', newWeapons);
                          }}
                          onRemove={(index) => {
                              const newWeapons = character.weaponsShields.filter((_, i) => i !== index);
                              updateField('weaponsShields', newWeapons);
                          }}
                      />
                  ))}
                  <button 
                      onClick={() => {
                          const newWeapons = [...character.weaponsShields, { name: '', grip: '', range: '', damage: '', durability: '', traits: '' }];
                          updateField('weaponsShields', newWeapons);
                      }}
                      className="text-[#2D7A73] hover:text-[#25635d] text-sm font-bold border border-[#2D7A73] rounded px-2 py-1 hover:bg-[#2D7A73] hover:text-white transition-colors"
                  >
                      + Ajouter une arme/bouclier
                  </button>
                </div>
              </Section>

              {/* Protection Equipment Section */}
              <Section title="ÉQUIPEMENT DE PROTECTION">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Armor */}
                    <ArmorSection 
                        title="ARMURE"
                        name={character.armor.name}
                        armorRating={character.armor.armorRating}
                        baneOptions={['ACROBATIE', 'DISCRÉTION', 'ESQUIVE']}
                        defaultBanes={character.armor.bane}
                        onNameChange={(value) => updateNestedField('armor', 'name', value)}
                        onRatingChange={(value) => updateNestedField('armor', 'armorRating', value)}
                        onBaneToggle={(bane) => {
                            const newBanes = character.armor.bane.includes(bane)
                                ? character.armor.bane.filter(b => b !== bane)
                                : [...character.armor.bane, bane];
                            updateNestedField('armor', 'bane', newBanes);
                        }}
                    />
                    {/* Helmet */}
                    <ArmorSection 
                        title="HEAUME"
                        name={character.helmet.name}
                        armorRating={character.helmet.armorRating}
                        baneOptions={['ATTAQUES À DISTANCE', 'INTUITION']}
                        defaultBanes={character.helmet.bane}
                        onNameChange={(value) => updateNestedField('helmet', 'name', value)}
                        onRatingChange={(value) => updateNestedField('helmet', 'armorRating', value)}
                        onBaneToggle={(bane) => {
                            const newBanes = character.helmet.bane.includes(bane)
                                ? character.helmet.bane.filter(b => b !== bane)
                                : [...character.helmet.bane, bane];
                            updateNestedField('helmet', 'bane', newBanes);
                        }}
                    />
                </div>
              </Section>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Inventory */}
                <Section title="INVENTAIRE" className="md:col-span-2">
                    <LabeledInput label="LIMITE D'ENCOMBREMENT" value={character.encumbranceLimit} onChange={e => updateField('encumbranceLimit', e.target.value)} />
                    <div className="mt-4 space-y-1">
                        {character.inventory.map((item, i) => (
                             <div key={i} className="flex items-center">
                                <span className="text-sm font-bold mr-2">{i+1}.</span>
                                <input type="text" value={item} onChange={e => {const newInv = [...character.inventory]; newInv[i] = e.target.value; updateField('inventory', newInv); }} className="bg-transparent border-b border-gray-400 w-full focus:outline-none focus:border-[#2D7A73] text-sm"/>
                             </div>
                        ))}
                        <input type="text" value={character.souvenir} onChange={e => updateField('souvenir', e.target.value)} placeholder="SOUVENIR" className="bg-transparent border-b border-gray-400 w-full focus:outline-none focus:border-[#2D7A73] text-sm mt-2"/>
                        <textarea value={character.tinyItems} onChange={e => updateField('tinyItems', e.target.value)} placeholder="OBJETS MINUSCULES" rows={3} className="bg-transparent border border-gray-400 w-full focus:outline-none focus:border-[#2D7A73] text-sm mt-2 p-1 rounded-sm"></textarea>
                    </div>
                </Section>
                 {/* Vitals */}
                <div className="space-y-3">
                    <PointTracker label="POINTS DE VOLONTÉ (PV)" current={character.vitals.willpower.current} max={character.vitals.willpower.max} onCurrentChange={val => updateNestedField('vitals', 'willpower', {...character.vitals.willpower, current: val})} onMaxChange={val => updateNestedField('vitals', 'willpower', {...character.vitals.willpower, max: val})} color="#2D7A73" />
                    <PointTracker label="POINTS DE SANTÉ (PS)" current={character.vitals.health.current} max={character.vitals.health.max} onCurrentChange={val => updateNestedField('vitals', 'health', {...character.vitals.health, current: val})} onMaxChange={val => updateNestedField('vitals', 'health', {...character.vitals.health, max: val})} color="#C53030" />
                </div>
            </div>

          </div>
      </div>
    );
};

export default CharacterSheetPage;