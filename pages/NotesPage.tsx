import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCharacter, updateCharacter } from '../services/characterService';
import type { CharacterSheet, Note, NoteSection } from '../types';

type SortMode = 'custom' | 'createdAt' | 'updatedAt';

const NotesPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [character, setCharacter] = useState<CharacterSheet | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const [sortMode, setSortMode] = useState<SortMode>('custom');
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCharacter = async () => {
            if (id) {
                setLoading(true);
                const charData = await getCharacter(id);
                if (charData) {
                    // Migrate old characters without noteSections
                    if (!charData.noteSections || charData.noteSections.length === 0) {
                        charData.noteSections = [
                            {
                                id: 'general',
                                name: 'Général',
                                notes: [],
                                customOrder: 0
                            }
                        ];
                    }
                    setCharacter(charData);
                    setActiveSection(charData.noteSections[0].id);
                }
                setLoading(false);
            }
        };
        fetchCharacter();
    }, [id]);

    const saveCharacter = async (updatedChar: CharacterSheet) => {
        if (id) {
            setSaving(true);
            const { id: charId, userId, ...dataToSave } = updatedChar;
            await updateCharacter(id, dataToSave);
            setSaving(false);
        }
    };

    const addSection = () => {
        if (!character) return;
        const newSection: NoteSection = {
            id: `section-${Date.now()}`,
            name: 'Nouvelle Section',
            notes: [],
            customOrder: character.noteSections?.length || 0
        };
        const updatedChar = {
            ...character,
            noteSections: [...(character.noteSections || []), newSection]
        };
        setCharacter(updatedChar);
        setActiveSection(newSection.id);
        saveCharacter(updatedChar);
    };

    const renameSection = (sectionId: string, newName: string) => {
        if (!character || !character.noteSections) return;
        const updatedSections = character.noteSections.map(section =>
            section.id === sectionId ? { ...section, name: newName } : section
        );
        const updatedChar = { ...character, noteSections: updatedSections };
        setCharacter(updatedChar);
        saveCharacter(updatedChar);
    };

    const deleteSection = (sectionId: string) => {
        if (!character || !character.noteSections) return;
        if (character.noteSections.length === 1) {
            alert("Vous devez conserver au moins une section.");
            return;
        }
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette section et toutes ses notes ?")) return;
        
        const updatedSections = character.noteSections.filter(s => s.id !== sectionId);
        const updatedChar = { ...character, noteSections: updatedSections };
        setCharacter(updatedChar);
        if (activeSection === sectionId) {
            setActiveSection(updatedSections[0].id);
        }
        saveCharacter(updatedChar);
    };

    const moveSectionLeft = (sectionId: string) => {
        if (!character || !character.noteSections) return;
        const sections = [...character.noteSections].sort((a, b) => a.customOrder - b.customOrder);
        const index = sections.findIndex(s => s.id === sectionId);
        if (index <= 0) return;
        
        [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
        sections.forEach((section, i) => section.customOrder = i);
        
        const updatedChar = { ...character, noteSections: sections };
        setCharacter(updatedChar);
        saveCharacter(updatedChar);
    };

    const moveSectionRight = (sectionId: string) => {
        if (!character || !character.noteSections) return;
        const sections = [...character.noteSections].sort((a, b) => a.customOrder - b.customOrder);
        const index = sections.findIndex(s => s.id === sectionId);
        if (index >= sections.length - 1) return;
        
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
        sections.forEach((section, i) => section.customOrder = i);
        
        const updatedChar = { ...character, noteSections: sections };
        setCharacter(updatedChar);
        saveCharacter(updatedChar);
    };

    const addNote = (sectionId: string) => {
        if (!character || !character.noteSections) return;
        const section = character.noteSections.find(s => s.id === sectionId);
        if (!section) return;

        const now = Date.now();
        const newNote: Note = {
            id: `note-${now}`,
            title: 'Nouvelle note',
            content: '',
            createdAt: now,
            updatedAt: now,
            customOrder: section.notes.length
        };

        const updatedSections = character.noteSections.map(s =>
            s.id === sectionId ? { ...s, notes: [...s.notes, newNote] } : s
        );
        const updatedChar = { ...character, noteSections: updatedSections };
        setCharacter(updatedChar);
        setEditingNoteId(newNote.id);
        saveCharacter(updatedChar);
    };

    const updateNote = (sectionId: string, noteId: string, updates: Partial<Note>) => {
        if (!character || !character.noteSections) return;
        const updatedSections = character.noteSections.map(section => {
            if (section.id === sectionId) {
                const updatedNotes = section.notes.map(note =>
                    note.id === noteId ? { ...note, ...updates, updatedAt: Date.now() } : note
                );
                return { ...section, notes: updatedNotes };
            }
            return section;
        });
        const updatedChar = { ...character, noteSections: updatedSections };
        setCharacter(updatedChar);
        saveCharacter(updatedChar);
    };

    const deleteNote = (sectionId: string, noteId: string) => {
        if (!character || !character.noteSections) return;
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) return;

        const updatedSections = character.noteSections.map(section =>
            section.id === sectionId
                ? { ...section, notes: section.notes.filter(n => n.id !== noteId) }
                : section
        );
        const updatedChar = { ...character, noteSections: updatedSections };
        setCharacter(updatedChar);
        saveCharacter(updatedChar);
    };

    const moveNoteUp = (sectionId: string, noteId: string) => {
        if (!character || !character.noteSections) return;
        const section = character.noteSections.find(s => s.id === sectionId);
        if (!section) return;

        const notes = [...section.notes].sort((a, b) => a.customOrder - b.customOrder);
        const index = notes.findIndex(n => n.id === noteId);
        if (index <= 0) return;

        [notes[index - 1], notes[index]] = [notes[index], notes[index - 1]];
        notes.forEach((note, i) => note.customOrder = i);

        const updatedSections = character.noteSections.map(s =>
            s.id === sectionId ? { ...s, notes } : s
        );
        const updatedChar = { ...character, noteSections: updatedSections };
        setCharacter(updatedChar);
        saveCharacter(updatedChar);
    };

    const moveNoteDown = (sectionId: string, noteId: string) => {
        if (!character || !character.noteSections) return;
        const section = character.noteSections.find(s => s.id === sectionId);
        if (!section) return;

        const notes = [...section.notes].sort((a, b) => a.customOrder - b.customOrder);
        const index = notes.findIndex(n => n.id === noteId);
        if (index >= notes.length - 1) return;

        [notes[index], notes[index + 1]] = [notes[index + 1], notes[index]];
        notes.forEach((note, i) => note.customOrder = i);

        const updatedSections = character.noteSections.map(s =>
            s.id === sectionId ? { ...s, notes } : s
        );
        const updatedChar = { ...character, noteSections: updatedSections };
        setCharacter(updatedChar);
        saveCharacter(updatedChar);
    };

    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSortedNotes = (notes: Note[]): Note[] => {
        const notesCopy = [...notes];
        switch (sortMode) {
            case 'createdAt':
                return notesCopy.sort((a, b) => b.createdAt - a.createdAt);
            case 'updatedAt':
                return notesCopy.sort((a, b) => b.updatedAt - a.updatedAt);
            case 'custom':
            default:
                return notesCopy.sort((a, b) => a.customOrder - b.customOrder);
        }
    };

    if (loading || !character) {
        return <div className="text-center p-10 text-gray-200">Chargement...</div>;
    }

    const sections = [...(character.noteSections || [])].sort((a, b) => a.customOrder - b.customOrder);
    const currentSection = sections.find(s => s.id === activeSection);

    return (
        <div className="p-2 md:p-4 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-4">
                    <Link to={`/character/${id}`} className="text-[#4ade80] hover:underline">
                        &larr; Retour à la fiche
                    </Link>
                    <div className="text-sm text-gray-400">{saving ? 'Sauvegarde...' : 'Sauvegardé'}</div>
                </header>

                <div className="bg-[#2a2a2a]/70 border border-[#404040] rounded-lg shadow-lg p-4">
                    <h1 className="font-title text-2xl font-bold text-[#4ade80] mb-4 text-center">
                        Notes - {character.name}
                    </h1>

                    {/* Section Tabs */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                        {sections.map((section, index) => (
                            <motion.div 
                                key={section.id} 
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-1 flex-shrink-0"
                            >
                                {editingSectionId === section.id ? (
                                    <input
                                        type="text"
                                        value={section.name}
                                        onChange={e => renameSection(section.id, e.target.value)}
                                        onBlur={() => setEditingSectionId(null)}
                                        onKeyDown={e => e.key === 'Enter' && setEditingSectionId(null)}
                                        autoFocus
                                        className="bg-[#1a1a1a] border border-[#2D7A73] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none min-w-[120px]"
                                    />
                                ) : (
                                    <button
                                        onClick={() => setActiveSection(section.id)}
                                        className={`px-4 py-2 rounded-t text-sm font-bold transition-all duration-300 ${
                                            activeSection === section.id
                                                ? 'bg-[#2D7A73] text-white'
                                                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
                                        }`}
                                    >
                                        {section.name}
                                    </button>
                                )}
                                {activeSection === section.id && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setEditingSectionId(section.id)}
                                            className="w-6 h-6 flex items-center justify-center bg-[#404040] hover:bg-[#505050] text-white rounded text-xs"
                                            title="Renommer"
                                        >
                                            ✎
                                        </button>
                                        {index > 0 && (
                                            <button
                                                onClick={() => moveSectionLeft(section.id)}
                                                className="w-6 h-6 flex items-center justify-center bg-[#404040] hover:bg-[#505050] text-white rounded text-xs"
                                                title="Déplacer à gauche"
                                            >
                                                ←
                                            </button>
                                        )}
                                        {index < sections.length - 1 && (
                                            <button
                                                onClick={() => moveSectionRight(section.id)}
                                                className="w-6 h-6 flex items-center justify-center bg-[#404040] hover:bg-[#505050] text-white rounded text-xs"
                                                title="Déplacer à droite"
                                            >
                                                →
                                            </button>
                                        )}
                                        {sections.length > 1 && (
                                            <button
                                                onClick={() => deleteSection(section.id)}
                                                className="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                                title="Supprimer la section"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        <button
                            onClick={addSection}
                            className="px-4 py-2 bg-[#2D7A73] hover:bg-[#3d9a8a] text-white rounded text-sm font-bold transition-colors flex-shrink-0"
                        >
                            + Section
                        </button>
                    </div>

                    {/* Sort Controls */}
                    {currentSection && currentSection.notes.length > 0 && (
                        <div className="flex items-center gap-2 mb-4 bg-[#1a1a1a] border border-[#404040] rounded p-2">
                            <span className="text-xs font-bold text-gray-400">Trier par :</span>
                            <button
                                onClick={() => setSortMode('custom')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                    sortMode === 'custom'
                                        ? 'bg-[#2D7A73] text-white'
                                        : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#404040]'
                                }`}
                            >
                                Ordre personnalisé
                            </button>
                            <button
                                onClick={() => setSortMode('createdAt')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                    sortMode === 'createdAt'
                                        ? 'bg-[#2D7A73] text-white'
                                        : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#404040]'
                                }`}
                            >
                                Date de création
                            </button>
                            <button
                                onClick={() => setSortMode('updatedAt')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                    sortMode === 'updatedAt'
                                        ? 'bg-[#2D7A73] text-white'
                                        : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#404040]'
                                }`}
                            >
                                Dernière modification
                            </button>
                        </div>
                    )}

                    {/* Notes List */}
                    {currentSection && (
                        <div className="space-y-4">
                            {getSortedNotes(currentSection.notes).map((note, index) => (
                                <motion.div
                                    key={note.id}
                                    layout
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-[#1a1a1a] border border-[#404040] rounded-lg p-4 hover:border-[#2D7A73] transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <input
                                            type="text"
                                            value={note.title}
                                            onChange={e => updateNote(currentSection.id, note.id, { title: e.target.value })}
                                            className="flex-1 bg-transparent border-b border-gray-600 text-lg font-bold text-gray-200 focus:outline-none focus:border-[#2D7A73] mr-2"
                                            placeholder="Titre de la note"
                                        />
                                        <div className="flex gap-1 flex-shrink-0">
                                            {sortMode === 'custom' && index > 0 && (
                                                <button
                                                    onClick={() => moveNoteUp(currentSection.id, note.id)}
                                                    className="w-6 h-6 flex items-center justify-center bg-[#404040] hover:bg-[#505050] text-white rounded text-xs"
                                                    title="Déplacer vers le haut"
                                                >
                                                    ↑
                                                </button>
                                            )}
                                            {sortMode === 'custom' && index < currentSection.notes.length - 1 && (
                                                <button
                                                    onClick={() => moveNoteDown(currentSection.id, note.id)}
                                                    className="w-6 h-6 flex items-center justify-center bg-[#404040] hover:bg-[#505050] text-white rounded text-xs"
                                                    title="Déplacer vers le bas"
                                                >
                                                    ↓
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNote(currentSection.id, note.id)}
                                                className="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                                title="Supprimer"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        value={note.content}
                                        onChange={e => updateNote(currentSection.id, note.id, { content: e.target.value })}
                                        className="w-full bg-[#2a2a2a] border border-gray-600 rounded p-3 text-sm text-gray-200 focus:outline-none focus:border-[#2D7A73] min-h-[100px] resize-y"
                                        placeholder="Contenu de la note..."
                                    />
                                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                        <span>Créé : {formatDate(note.createdAt)}</span>
                                        <span>Modifié : {formatDate(note.updatedAt)}</span>
                                    </div>
                                </motion.div>
                            ))}

                            <button
                                onClick={() => addNote(currentSection.id)}
                                className="w-full py-3 bg-[#2D7A73] hover:bg-[#3d9a8a] text-white rounded font-bold transition-colors"
                            >
                                + Ajouter une note
                            </button>

                            {currentSection.notes.length === 0 && (
                                <div className="text-center py-10 text-gray-500 italic">
                                    Aucune note dans cette section. Cliquez sur "Ajouter une note" pour commencer.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotesPage;

