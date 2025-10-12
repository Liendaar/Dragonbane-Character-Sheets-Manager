import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();

    const handleSignOut = async () => {
        await auth.signOut();
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <Link to="/" className="text-[#4ade80] hover:underline">
                        &larr; Retour au Dashboard
                    </Link>
                </header>

                <div className="bg-[#2a2a2a]/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 p-8">
                    <h1 className="text-3xl font-bold font-title text-[#4ade80] mb-6">Mon Profil</h1>
                    
                    <div className="space-y-6">
                        {/* User Info Section */}
                        <div className="border-b border-gray-700 pb-6">
                            <h2 className="text-xl font-bold text-gray-200 mb-4">Informations du compte</h2>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-bold text-gray-400">Email</label>
                                    <p className="text-gray-200 mt-1">{user?.email || 'Non disponible'}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-bold text-gray-400">Nom d'affichage</label>
                                    <p className="text-gray-200 mt-1">{user?.displayName || 'Non défini'}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-bold text-gray-400">ID Utilisateur</label>
                                    <p className="text-gray-200 mt-1 text-xs font-mono break-all">{user?.uid || 'Non disponible'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-200 mb-4">Actions</h2>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors"
                                >
                                    Se déconnecter
                                </button>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="bg-[#1a1a1a] border border-gray-700 rounded p-4">
                            <p className="text-sm text-gray-400">
                                <strong className="text-gray-300">Note :</strong> Les fonctionnalités de modification du profil 
                                (changement de nom, mot de passe, etc.) peuvent être ajoutées ultérieurement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

