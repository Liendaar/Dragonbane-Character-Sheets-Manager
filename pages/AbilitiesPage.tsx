import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCharacter, updateCharacter } from '../services/characterService';
import { getAllAbilities, HeroicAbility } from '../services/abilityService';
import type { CharacterSheet, Ability } from '../types';

const AbilityCard: React.FC<{
    ability: Ability;
    onRemove: () => void;
    onUpdate: (updated: Ability) => void;
    isCustom: boolean;
}> = ({ ability, onRemove, onUpdate, isCustom }) => {
    const [isEditing, setIsEditing] = useState(isCustom && !ability.name);

    return (
        <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-4 shadow-md">
            <div className="flex justify-between items-start mb-2">
                {isEditing ? (
                    <input
                        type="text"
                        value={ability.name}
                        onChange={(e) => onUpdate({ ...ability, name: e.target.value })}
                        placeholder="Nom de la capacité"
                        className="flex-1 bg-[#1a1a1a] border border-[#404040] rounded px-2 py-1 text-[#4ade80] font-bold focus:outline-none focus:border-[#2D7A73]"
                    />
                ) : (
                    <h3 className="text-lg font-bold text-[#4ade80]">{ability.name}</h3>
                )}
                <div className="flex gap-2 ml-2">
                    {isCustom && (
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-blue-400 hover:text-blue-600 font-bold"
                            title={isEditing ? "Terminer l'édition" : "Éditer"}
                        >
                            {isEditing ? '✓' : '✎'}
                        </button>
                    )}
                    <button
                        onClick={onRemove}
                        className="text-red-500 hover:text-red-700 font-bold"
                    >
                        ✕
                    </button>
                </div>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
                {isEditing ? (
                    <div>
                        <label className="font-bold text-gray-400 block mb-1">Coût PV :</label>
                        <input
                            type="text"
                            value={ability.pv}
                            onChange={(e) => onUpdate({ ...ability, pv: e.target.value })}
                            placeholder="Ex: 3"
                            className="w-full bg-[#1a1a1a] border border-[#404040] rounded px-2 py-1 text-[#2D7A73] focus:outline-none focus:border-[#2D7A73]"
                        />
                    </div>
                ) : (
                    ability.pv && (
                        <div>
                            <span className="font-bold text-gray-400">Coût PV : </span>
                            <span className="text-[#2D7A73]">{ability.pv}</span>
                        </div>
                    )
                )}
                {isEditing ? (
                    <div>
                        <label className="font-bold text-gray-400 block mb-1">Description :</label>
                        <textarea
                            value={ability.description}
                            onChange={(e) => onUpdate({ ...ability, description: e.target.value })}
                            placeholder="Description de la capacité..."
                            rows={4}
                            className="w-full bg-[#1a1a1a] border border-[#404040] rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-[#2D7A73] resize-none"
                        />
                    </div>
                ) : (
                    ability.description && (
                        <div>
                            <p className="text-gray-300 leading-relaxed">{ability.description}</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

const AbilitiesPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [character, setCharacter] = useState<CharacterSheet | null>(null);
    const [allAbilities, setAllAbilities] = useState<HeroicAbility[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAbility, setSelectedAbility] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                const [charData, abilities] = await Promise.all([
                    getCharacter(id),
                    getAllAbilities()
                ]);
                
                if (charData) {
                    setCharacter(charData);
                }
                setAllAbilities(abilities);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const addAbility = async () => {
        if (!character || !selectedAbility) return;

        const abilityToAdd = allAbilities.find(a => a.capacite === selectedAbility);
        if (!abilityToAdd) return;

        const newAbility: Ability = {
            name: abilityToAdd.capacite,
            description: abilityToAdd.description,
            pv: abilityToAdd.pv.toString()
        };

        // Check if ability already exists
        if (character.abilities.some(a => a.name === newAbility.name)) {
            alert('Cette capacité est déjà dans votre liste !');
            return;
        }

        const updatedAbilities = [...character.abilities, newAbility];
        const updatedCharacter = { ...character, abilities: updatedAbilities };
        
        setCharacter(updatedCharacter);
        await updateCharacter(id!, { abilities: updatedAbilities });
        setSelectedAbility('');
    };

    const addCustomAbility = async () => {
        if (!character) return;

        const newAbility: Ability = {
            name: '',
            description: '',
            pv: ''
        };

        const updatedAbilities = [...character.abilities, newAbility];
        const updatedCharacter = { ...character, abilities: updatedAbilities };
        
        setCharacter(updatedCharacter);
        await updateCharacter(id!, { abilities: updatedAbilities });
    };

    const removeAbility = async (index: number) => {
        if (!character) return;

        const updatedAbilities = character.abilities.filter((_, i) => i !== index);
        const updatedCharacter = { ...character, abilities: updatedAbilities };
        
        setCharacter(updatedCharacter);
        await updateCharacter(id!, { abilities: updatedAbilities });
    };

    const updateAbility = async (index: number, updatedAbility: Ability) => {
        if (!character) return;

        const updatedAbilities = [...character.abilities];
        updatedAbilities[index] = updatedAbility;
        const updatedCharacter = { ...character, abilities: updatedAbilities };
        
        setCharacter(updatedCharacter);
        await updateCharacter(id!, { abilities: updatedAbilities });
    };

    if (loading || !character) {
        return <div className="text-center p-10 text-gray-200">Chargement...</div>;
    }

    const filteredAbilities = allAbilities.filter(ability =>
        ability.capacite.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ability.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <Link to={`/character/${id}`} className="text-[#4ade80] hover:underline">
                        &larr; Retour à la fiche
                    </Link>
                    <h1 className="text-3xl font-bold text-[#4ade80] font-title">Capacités Héroïques</h1>
                    <div className="w-32"></div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Character abilities */}
                    <div>
                        <div className="bg-[#2a2a2a]/70 border border-[#404040] rounded-lg p-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-200 mb-2">Mes Capacités</h2>
                            <p className="text-sm text-gray-400">
                                {character.abilities.length} capacité(s)
                            </p>
                        </div>

                        <div className="space-y-4">
                            {character.abilities.length === 0 ? (
                                <div className="bg-[#2a2a2a]/50 border border-[#404040] rounded-lg p-8 text-center text-gray-400">
                                    Aucune capacité pour le moment.
                                    <br />
                                    Ajoutez-en une depuis la liste ci-contre !
                                </div>
                            ) : (
                                character.abilities.map((ability, index) => {
                                    // Une capacité est personnalisée si elle n'existe pas dans la liste commune
                                    const isCustom = !allAbilities.some(a => a.capacite === ability.name);
                                    
                                    return (
                                        <AbilityCard
                                            key={index}
                                            ability={ability}
                                            onRemove={() => removeAbility(index)}
                                            onUpdate={(updated) => updateAbility(index, updated)}
                                            isCustom={isCustom}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right: Add abilities */}
                    <div>
                        <div className="bg-[#2a2a2a]/70 border border-[#404040] rounded-lg p-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-200 mb-4">Ajouter une Capacité</h2>
                            
                            {/* Search */}
                            <input
                                type="text"
                                placeholder="Rechercher une capacité..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#404040] rounded px-3 py-2 text-gray-200 mb-4 focus:outline-none focus:border-[#2D7A73]"
                            />

                            {/* Select ability */}
                            <select
                                value={selectedAbility}
                                onChange={(e) => setSelectedAbility(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#404040] rounded px-3 py-2 text-gray-200 mb-2 focus:outline-none focus:border-[#2D7A73]"
                            >
                                <option value="">-- Choisir une capacité --</option>
                                {filteredAbilities.map((ability) => (
                                    <option key={ability.capacite} value={ability.capacite}>
                                        {ability.capacite} (PV: {ability.pv})
                                    </option>
                                ))}
                            </select>

                            {selectedAbility && (
                                <div className="bg-[#1a1a1a] border border-[#404040] rounded p-3 mb-2 text-sm text-gray-300">
                                    {allAbilities.find(a => a.capacite === selectedAbility)?.description}
                                </div>
                            )}

                            <button
                                onClick={addAbility}
                                disabled={!selectedAbility}
                                className="w-full bg-[#2D7A73] hover:bg-[#3d9a8a] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-bold transition-colors mb-4"
                            >
                                Ajouter cette capacité
                            </button>

                            <div className="border-t border-[#404040] pt-4">
                                <button
                                    onClick={addCustomAbility}
                                    className="w-full bg-[#404040] hover:bg-[#505050] text-white px-4 py-2 rounded font-bold transition-colors"
                                >
                                    + Créer une capacité personnalisée
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Pour une capacité qui n'est pas dans la liste
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AbilitiesPage;

