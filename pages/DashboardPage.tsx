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
        <div className="min-h-screen bg-[#FBF3E5] p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8 pb-4 border-b-2 border-[#8B4513]/30">
                    <div>
                        <h1 className="text-4xl font-title text-[#8B4513]">Dragonbane</h1>
                        <p className="text-[#4A5568]">Welcome, {user?.displayName || user?.email}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="bg-transparent hover:bg-[#2D7A73]/20 text-[#2D7A73] font-semibold py-2 px-4 border border-[#2D7A73] rounded shadow transition-colors duration-200"
                    >
                        Sign Out
                    </button>
                </header>

                <main>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-title text-[#2D3748]">Your Characters</h2>
                        <button
                            onClick={handleCreateCharacter}
                            className="bg-[#2D7A73] hover:bg-[#2C5282] text-white font-bold py-2 px-6 rounded shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            + Create New
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-center text-gray-500">Loading characters...</p>
                    ) : characters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {characters.map((char) => (
                                <div key={char.id} className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-300 flex flex-col justify-between hover:shadow-xl transition-shadow duration-200">
                                    <div>
                                        <h3 className="text-xl font-bold font-title text-[#2D3748]">{char.name || 'Unnamed Character'}</h3>
                                        <p className="text-gray-600 mb-4">{char.profession || 'No profession'}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <button onClick={() => navigate(`/character/${char.id}`)} className="text-sm bg-[#2D7A73] text-white py-1 px-3 rounded hover:bg-[#2C5282] transition-colors">
                                            Open
                                        </button>
                                         <button onClick={() => handleDeleteCharacter(char.id)} className="text-sm bg-red-600 text-white py-1 px-3 rounded hover:bg-red-800 transition-colors">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-white/50 rounded-lg border-2 border-dashed border-gray-300">
                            <p className="text-gray-500">You haven't created any characters yet.</p>
                            <p className="text-gray-500 mt-2">Click "Create New" to get started!</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;