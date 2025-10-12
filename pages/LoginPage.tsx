
import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 9.998C34.897 6.618 29.81 4.5 24 4.5C13.5 4.5 5 13 5 23.5S13.5 42.5 24 42.5c10.5 0 18.5-8.5 18.5-19.5c0-1.422-.134-2.813-.389-4.167z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039L38.804 9.998C34.897 6.618 29.81 4.5 24 4.5C17.6 4.5 12.022 7.855 8.124 12.585l-1.818 2.106z"></path>
        <path fill="#4CAF50" d="M24 42.5c5.81 0 10.897-2.118 14.804-5.502l-6.571-4.819C29.932 35.396 27.214 36.5 24 36.5c-5.039 0-9.345-2.608-11.129-6.386l-6.625 4.931C9.978 39.145 16.3 42.5 24 42.5z"></path>
        <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.571 4.819C42.012 33.688 44 28.711 44 23.5c0-1.916-.184-3.766-.52-5.553L43.611 20.083z"></path>
    </svg>
);

const LoginPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEmailPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#2a2a2a]/90 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-gray-600">
                <div className="flex justify-center mb-4">
                    <img src="/Dragonbane-Character-Sheets-Manager/logo.png" alt="Dragonbane" className="h-24 w-auto object-contain" />
                </div>
                <h2 className="text-xl text-center text-[#e5e5e5] mb-6">Character Manager</h2>
                
                {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-sm border border-red-700">{error}</p>}

                <form onSubmit={handleEmailPassword}>
                    <div className="mb-4">
                        <label className="block text-[#d1d5db] text-sm font-bold mb-2" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow-inner appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-[#1a1a1a] text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-[#2D7A73]"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-[#d1d5db] text-sm font-bold mb-2" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow-inner appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-[#1a1a1a] text-gray-200 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[#2D7A73]"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-[#2D7A73] hover:bg-[#3d9a8a] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                        >
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="inline-block align-baseline font-bold text-sm text-[#4ade80] hover:text-[#5eea90]"
                        >
                            {isLogin ? 'Need an account?' : 'Have an account?'}
                        </button>
                    </div>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400">OR</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-200 font-semibold py-2 px-4 border border-gray-600 rounded shadow-md w-full flex items-center justify-center transition-colors duration-200"
                >
                    <GoogleIcon />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
