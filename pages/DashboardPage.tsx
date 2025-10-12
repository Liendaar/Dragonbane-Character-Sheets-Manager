import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { createNewCharacter } from '../types';
import type { CharacterSheet } from '../types';
import { createCharacter, getUserCharacters, deleteCharacter } from '../services/characterService';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [characters, setCharacters] = useState<CharacterSheet[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCharacters = useCallback(async () => {
        if (user) {
            setLoading(true);
            const userCharacters = await getUserCharacters(user.uid);
            setCharacters(userCharacters);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCharacters();
    }, [fetchCharacters]);

    const handleSignOut = async () => {
        await auth.signOut();
        // The navigate call is removed because the AuthContext will trigger a re-render
        // of the App component, which will automatically show the LoginPage.
        // This avoids the programmatic navigation error in sandboxed environments.
    };

    const handleCreateCharacter = async () => {
        if (user) {
            const newCharData = createNewCharacter(user.uid);
            const newCharId = await createCharacter(newCharData);
            navigate(`/character/${newCharId}`);
        }
    };

    const handleDeleteCharacter = async (id: string) => {
        if(window.confirm('Are you sure you want to delete this character?')) {
            await deleteCharacter(id);
            fetchCharacters();
        }
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8 pb-4 border-b-2 border-[#4ade80]/30">
                    <div className="flex items-center space-x-4">
                        <img src="/Dragonbane-Character-Sheets-Manager/logo.png" alt="Dragonbane" className="h-16 w-auto object-contain" />
                        <div>
                            <p className="text-[#d1d5db]">Welcome, {user?.displayName || user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="bg-transparent hover:bg-[#2D7A73]/30 text-[#4ade80] font-semibold py-2 px-4 border border-[#2D7A73] rounded shadow transition-colors duration-200"
                    >
                        Sign Out
                    </button>
                </header>

                <main>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-title text-[#e5e5e5]">Your Characters</h2>
                        <button
                            onClick={handleCreateCharacter}
                            className="bg-[#2D7A73] hover:bg-[#3d9a8a] text-white font-bold py-2 px-6 rounded shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            + Create New
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-center text-gray-400">Loading characters...</p>
                    ) : characters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {characters.map((char) => (
                                <div key={char.id} className="bg-[#2a2a2a]/80 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700 flex flex-col justify-between hover:shadow-xl hover:border-[#2D7A73] transition-all duration-200">
                                    <div>
                                        <h3 className="text-xl font-bold font-title text-[#e5e5e5]">{char.name || 'Unnamed Character'}</h3>
                                        <p className="text-gray-400 mb-4">{char.profession || 'No profession'}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <button onClick={() => navigate(`/character/${char.id}`)} className="text-sm bg-[#2D7A73] text-white py-1 px-3 rounded hover:bg-[#3d9a8a] transition-colors">
                                            Open
                                        </button>
                                         <button onClick={() => handleDeleteCharacter(char.id)} className="text-sm bg-red-700 text-white py-1 px-3 rounded hover:bg-red-800 transition-colors">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-[#2a2a2a]/50 rounded-lg border-2 border-dashed border-gray-700">
                            <p className="text-gray-400">You haven't created any characters yet.</p>
                            <p className="text-gray-400 mt-2">Click "Create New" to get started!</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;