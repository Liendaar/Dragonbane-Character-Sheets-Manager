import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    
    // Check if user signed in with Google
    const isGoogleUser = user?.providerData?.some(provider => provider.providerId === 'google.com') || false;
    
    // Form states
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // UI states
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleUpdateDisplayName = async () => {
        if (!user || !displayName.trim()) {
            showMessage('error', 'Le nom d\'affichage ne peut pas être vide.');
            return;
        }

        setLoading(true);
        try {
            await updateProfile(user, { displayName: displayName.trim() });
            showMessage('success', 'Nom d\'affichage mis à jour avec succès !');
            setIsEditingName(false);
        } catch (error: any) {
            showMessage('error', `Erreur : ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!user || !email.trim()) {
            showMessage('error', 'L\'adresse email ne peut pas être vide.');
            return;
        }

        if (!currentPassword && !isGoogleUser) {
            showMessage('error', 'Veuillez entrer votre mot de passe actuel pour confirmer.');
            return;
        }

        setLoading(true);
        try {
            // Reauthenticate before changing email (required by Firebase)
            if (!isGoogleUser && user.email) {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
            }

            await updateEmail(user, email.trim());
            showMessage('success', 'Adresse email mise à jour avec succès !');
            setIsEditingEmail(false);
            setCurrentPassword('');
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                showMessage('error', 'Pour des raisons de sécurité, veuillez vous reconnecter avant de changer votre email.');
            } else if (error.code === 'auth/wrong-password') {
                showMessage('error', 'Mot de passe incorrect.');
            } else if (error.code === 'auth/email-already-in-use') {
                showMessage('error', 'Cette adresse email est déjà utilisée par un autre compte.');
            } else {
                showMessage('error', `Erreur : ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!user) return;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage('error', 'Veuillez remplir tous les champs.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('error', 'Les nouveaux mots de passe ne correspondent pas.');
            return;
        }

        if (newPassword.length < 6) {
            showMessage('error', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setLoading(true);
        try {
            // Reauthenticate before changing password (required by Firebase)
            if (user.email) {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
            }

            await updatePassword(user, newPassword);
            showMessage('success', 'Mot de passe mis à jour avec succès !');
            setIsEditingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                showMessage('error', 'Pour des raisons de sécurité, veuillez vous reconnecter avant de changer votre mot de passe.');
            } else if (error.code === 'auth/wrong-password') {
                showMessage('error', 'Mot de passe actuel incorrect.');
            } else {
                showMessage('error', `Erreur : ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await auth.signOut();
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-400">Veuillez vous connecter pour accéder à votre profil.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <Link to="/" className="text-[#4ade80] hover:underline flex items-center gap-2">
                        <span>&larr;</span>
                        <span>Retour au Dashboard</span>
                    </Link>
                </header>

                <div className="bg-[#2a2a2a]/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 p-6 md:p-8">
                    <h1 className="text-3xl font-bold font-title text-[#4ade80] mb-6">Mon Profil</h1>
                    
                    {/* Message feedback */}
                    {message && (
                        <div className={`mb-6 p-4 rounded border ${
                            message.type === 'success' 
                                ? 'bg-green-900/30 border-green-700 text-green-300' 
                                : 'bg-red-900/30 border-red-700 text-red-300'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Display Name Section */}
                        <div className="border-b border-gray-700 pb-6">
                            <h2 className="text-xl font-bold text-gray-200 mb-4">Nom d'affichage</h2>
                            {!isEditingName ? (
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-300">{user.displayName || 'Non défini'}</p>
                                    <button
                                        onClick={() => setIsEditingName(true)}
                                        className="bg-[#2D7A73] hover:bg-[#3d9a8a] text-white font-semibold py-2 px-4 rounded transition-colors"
                                    >
                                        Modifier
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Votre nom d'affichage"
                                        className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-4 py-2 text-gray-200 focus:outline-none focus:border-[#2D7A73]"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdateDisplayName}
                                            disabled={loading}
                                            className="bg-[#2D7A73] hover:bg-[#3d9a8a] text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingName(false);
                                                setDisplayName(user.displayName || '');
                                            }}
                                            disabled={loading}
                                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Email Section */}
                        <div className="border-b border-gray-700 pb-6">
                            <h2 className="text-xl font-bold text-gray-200 mb-4">Adresse email</h2>
                            {!isEditingEmail ? (
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-300">{user.email || 'Non disponible'}</p>
                                    <button
                                        onClick={() => setIsEditingEmail(true)}
                                        className="bg-[#2D7A73] hover:bg-[#3d9a8a] text-white font-semibold py-2 px-4 rounded transition-colors"
                                    >
                                        Modifier
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Nouvelle adresse email"
                                        className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-4 py-2 text-gray-200 focus:outline-none focus:border-[#2D7A73]"
                                    />
                                    {!isGoogleUser && (
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Mot de passe actuel (pour confirmation)"
                                            className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-4 py-2 text-gray-200 focus:outline-none focus:border-[#2D7A73]"
                                        />
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdateEmail}
                                            disabled={loading}
                                            className="bg-[#2D7A73] hover:bg-[#3d9a8a] text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingEmail(false);
                                                setEmail(user.email || '');
                                                setCurrentPassword('');
                                            }}
                                            disabled={loading}
                                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Password Section */}
                        <div className="border-b border-gray-700 pb-6">
                            <h2 className="text-xl font-bold text-gray-200 mb-4">Mot de passe</h2>
                            {isGoogleUser ? (
                                <div className="bg-blue-900/20 border border-blue-700 rounded p-4">
                                    <p className="text-blue-300 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span>Compte créé avec Google - Le mot de passe est géré par Google</span>
                                    </p>
                                </div>
                            ) : !isEditingPassword ? (
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-300">••••••••</p>
                                    <button
                                        onClick={() => setIsEditingPassword(true)}
                                        className="bg-[#2D7A73] hover:bg-[#3d9a8a] text-white font-semibold py-2 px-4 rounded transition-colors"
                                    >
                                        Modifier
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Mot de passe actuel"
                                        className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-4 py-2 text-gray-200 focus:outline-none focus:border-[#2D7A73]"
                                    />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nouveau mot de passe (min. 6 caractères)"
                                        className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-4 py-2 text-gray-200 focus:outline-none focus:border-[#2D7A73]"
                                    />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirmer le nouveau mot de passe"
                                        className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-4 py-2 text-gray-200 focus:outline-none focus:border-[#2D7A73]"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdatePassword}
                                            disabled={loading}
                                            className="bg-[#2D7A73] hover:bg-[#3d9a8a] text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingPassword(false);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                            disabled={loading}
                                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User ID Section */}
                        <div className="border-b border-gray-700 pb-6">
                            <h2 className="text-xl font-bold text-gray-200 mb-4">ID Utilisateur</h2>
                            <p className="text-gray-400 text-xs font-mono break-all">{user.uid}</p>
                        </div>

                        {/* Sign Out Section */}
                        <div>
                            <button
                                onClick={handleSignOut}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors"
                            >
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
