import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCharacter, updateCharacter } from '../services/characterService';
import { spellService } from '../services/spellService';
import type { CharacterSheet, KnownSpell, Spell, SpellSchool } from '../types';
import { getMemorizedSpellLimit } from '../types';

const SpellCard: React.FC<{ 
    spell: KnownSpell; 
    onToggleMemorized: () => void;
    onRemove: () => void;
}> = ({ spell, onToggleMemorized, onRemove }) => {
    const isCantrip = spell.rang === 'Tour de magie' || spell.rang === 0;
    
    return (
        <div className="bg-[#fdfbf5] border-2 border-[#d3c9b8] rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-title text-lg font-bold text-[#2D7A73]">{spell.nom}</h3>
                        <span className="text-xs bg-[#2D7A73] text-white px-2 py-0.5 rounded-full">
                            {spell.rang === 'Tour de magie' ? 'Tour de magie' : `Rang ${spell.rang}`}
                        </span>
                    </div>
                    <p className="text-xs text-gray-600 italic">{spell.ecole}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div 
                        onClick={onToggleMemorized}
                        className={`cursor-pointer w-5 h-5 border-2 border-gray-500 rounded flex items-center justify-center ${spell.memorized || isCantrip ? 'bg-[#2D7A73]' : 'bg-transparent'}`}
                    >
                        {(spell.memorized || isCantrip) && <span className="text-white text-xs">✓</span>}
                    </div>
                    <button 
                        onClick={onRemove}
                        className="text-red-600 hover:text-red-800 text-sm font-bold"
                        title="Supprimer ce sort"
                    >
                        ×
                    </button>
                </div>
            </div>
            
            <div className="space-y-1 text-sm mb-2">
                {spell.condition_prealable && (
                    <div><span className="font-bold">Prérequis:</span> {spell.condition_prealable}</div>
                )}
                {spell.prerequis && (
                    <div><span className="font-bold">Composantes:</span> {spell.prerequis}</div>
                )}
                {spell.temps_incantation && (
                    <div><span className="font-bold">Temps d'incantation:</span> {spell.temps_incantation}</div>
                )}
                {spell.portee && (
                    <div><span className="font-bold">Portée:</span> {spell.portee}</div>
                )}
                {spell.duree && (
                    <div><span className="font-bold">Durée:</span> {spell.duree}</div>
                )}
            </div>
            
            <p className="text-sm text-gray-700 border-t border-gray-300 pt-2">
                {spell.description}
            </p>
            
            {isCantrip && (
                <div className="mt-2 text-xs text-[#2D7A73] italic">
                    Les tours de magie sont toujours mémorisés
                </div>
            )}
        </div>
    );
};

const GrimoirePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [character, setCharacter] = useState<CharacterSheet | null>(null);
    const [availableSpells, setAvailableSpells] = useState<SpellSchool[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSpellSelector, setShowSpellSelector] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<string>('');

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                setLoading(true);
                const charData = await getCharacter(id);
                setCharacter(charData);
                
                // Charger les sorts disponibles
                const spells = await spellService.getAllSpells();
                setAvailableSpells(spells);
                
                // Initialiser Firebase avec les sorts si nécessaire
                await spellService.initializeSpells();
                
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const saveGrimoire = async (grimoire: KnownSpell[]) => {
        if (id && character) {
            const { id: charId, userId, ...dataToSave } = { ...character, grimoire };
            await updateCharacter(id, dataToSave);
            setCharacter({ ...character, grimoire });
        }
    };

    const addSpell = (spell: Spell) => {
        if (character) {
            const newSpell: KnownSpell = { ...spell, memorized: false };
            const newGrimoire = [...character.grimoire, newSpell];
            saveGrimoire(newGrimoire);
            setShowSpellSelector(false);
        }
    };

    const removeSpell = (index: number) => {
        if (character) {
            const newGrimoire = character.grimoire.filter((_, i) => i !== index);
            saveGrimoire(newGrimoire);
        }
    };

    const toggleMemorized = (index: number) => {
        if (character) {
            const newGrimoire = [...character.grimoire];
            newGrimoire[index] = { ...newGrimoire[index], memorized: !newGrimoire[index].memorized };
            saveGrimoire(newGrimoire);
        }
    };

    if (loading || !character) {
        return <div className="text-center p-10">Chargement du grimoire...</div>;
    }

    const memorizedCount = character.grimoire.filter(spell => {
        const isCantrip = spell.rang === 'Tour de magie' || spell.rang === 0;
        return spell.memorized && !isCantrip;
    }).length;

    const memorizedLimit = getMemorizedSpellLimit(character.attributes.int);
    const isOverLimit = memorizedCount > memorizedLimit;

    return (
        <div className="p-2 md:p-4 bg-[#FBF3E5] min-h-screen">
            <div className="max-w-6xl mx-auto space-y-4">
                <header className="flex justify-between items-center mb-4">
                    <Link to={`/character/${id}`} className="text-[#2D7A73] hover:underline">&larr; Retour à la fiche</Link>
                    <h1 className="text-3xl font-title font-bold text-[#2D7A73]">Grimoire de {character.name || 'Personnage'}</h1>
                </header>

                {/* Compteur de sorts mémorisés */}
                <div className={`bg-white border-2 ${isOverLimit ? 'border-red-500' : 'border-[#2D7A73]'} rounded-lg p-4 text-center`}>
                    <div className="text-sm text-gray-600">Sorts mémorisés (hors tours de magie)</div>
                    <div className={`text-3xl font-bold ${isOverLimit ? 'text-red-600' : 'text-[#2D7A73]'}`}>
                        {memorizedCount} / {memorizedLimit}
                    </div>
                    {isOverLimit && (
                        <div className="text-xs text-red-600 mt-1">
                            Attention : Vous avez dépassé votre limite de sorts mémorisés (INT: {character.attributes.int})
                        </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                        Basé sur INT: {character.attributes.int}
                    </div>
                </div>

                {/* Bouton d'ajout de sort */}
                <button
                    onClick={() => setShowSpellSelector(!showSpellSelector)}
                    className="w-full bg-[#2D7A73] hover:bg-[#25635d] text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    {showSpellSelector ? 'Fermer la liste' : '+ Ajouter un sort'}
                </button>

                {/* Sélecteur de sorts */}
                {showSpellSelector && (
                    <div className="bg-white border-2 border-[#2D7A73] rounded-lg p-4">
                        <h2 className="font-title text-xl font-bold text-[#2D7A73] mb-4">Sélectionner un sort</h2>
                        
                        {/* Sélecteur d'école */}
                        <select 
                            value={selectedSchool} 
                            onChange={(e) => setSelectedSchool(e.target.value)}
                            className="w-full p-2 border border-gray-400 rounded mb-4"
                        >
                            <option value="">-- Sélectionner une école de magie --</option>
                            {availableSpells.map((school, i) => (
                                <option key={i} value={school.nom}>{school.nom}</option>
                            ))}
                        </select>

                        {/* Liste des sorts de l'école sélectionnée */}
                        {selectedSchool && (
                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {availableSpells
                                    .find(school => school.nom === selectedSchool)
                                    ?.sorts.filter(spell => !character.grimoire.some(known => known.nom === spell.nom))
                                    .map((spell, i) => (
                                        <div 
                                            key={i}
                                            onClick={() => addSpell(spell)}
                                            className="p-3 border border-gray-300 rounded hover:bg-[#f0f0f0] cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold">{spell.nom}</div>
                                                    <div className="text-xs text-gray-600">
                                                        {spell.rang === 'Tour de magie' ? 'Tour de magie' : `Rang ${spell.rang}`} - {spell.ecole}
                                                    </div>
                                                </div>
                                                <button className="text-[#2D7A73] text-sm">Ajouter</button>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1">{spell.description}</p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Grimoire - Liste des sorts connus */}
                <div>
                    {character.grimoire.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            <h2 className="font-title text-2xl font-bold text-[#2D7A73] mb-4">Sorts connus (0)</h2>
                            Aucun sort dans le grimoire. Cliquez sur "Ajouter un sort" pour commencer.
                        </div>
                    ) : (
                        <>
                            {/* Tours de magie */}
                            {(() => {
                                const cantrips = character.grimoire.filter(spell => 
                                    spell.rang === 'Tour de magie' || spell.rang === 0
                                );
                                
                                if (cantrips.length === 0) return null;
                                
                                return (
                                    <div className="mb-8">
                                        <h2 className="font-title text-2xl font-bold text-[#2D7A73] mb-4 border-b-2 border-[#2D7A73] pb-2">
                                            Tours de magie ({cantrips.length})
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {cantrips.map((spell) => {
                                                const index = character.grimoire.indexOf(spell);
                                                return (
                                                    <SpellCard 
                                                        key={index}
                                                        spell={spell}
                                                        onToggleMemorized={() => toggleMemorized(index)}
                                                        onRemove={() => removeSpell(index)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Sorts par école */}
                            {(() => {
                                const regularSpells = character.grimoire.filter(spell => 
                                    spell.rang !== 'Tour de magie' && spell.rang !== 0
                                );
                                
                                if (regularSpells.length === 0) return null;
                                
                                // Grouper par école
                                const spellsBySchool: Record<string, KnownSpell[]> = {};
                                regularSpells.forEach(spell => {
                                    if (!spellsBySchool[spell.ecole]) {
                                        spellsBySchool[spell.ecole] = [];
                                    }
                                    spellsBySchool[spell.ecole].push(spell);
                                });
                                
                                // Trier les sorts dans chaque école par rang
                                Object.keys(spellsBySchool).forEach(school => {
                                    spellsBySchool[school].sort((a, b) => {
                                        const rankA = typeof a.rang === 'number' ? a.rang : parseInt(a.rang) || 0;
                                        const rankB = typeof b.rang === 'number' ? b.rang : parseInt(b.rang) || 0;
                                        return rankA - rankB;
                                    });
                                });
                                
                                return (
                                    <div className="space-y-8">
                                        {Object.entries(spellsBySchool).sort(([a], [b]) => a.localeCompare(b)).map(([school, spells]) => (
                                            <div key={school} className="border-2 border-[#2D7A73] rounded-lg p-4 bg-white/50">
                                                <h2 className="font-title text-2xl font-bold text-[#2D7A73] mb-4">
                                                    {school} ({spells.length})
                                                </h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {spells.map((spell) => {
                                                        const index = character.grimoire.indexOf(spell);
                                                        return (
                                                            <SpellCard 
                                                                key={index}
                                                                spell={spell}
                                                                onToggleMemorized={() => toggleMemorized(index)}
                                                                onRemove={() => removeSpell(index)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrimoirePage;

