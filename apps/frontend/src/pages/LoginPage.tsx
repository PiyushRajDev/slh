import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function LoginPage() {
    const { token, login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (token) {
            navigate('/project-analysis', { replace: true });
        }
    }, [token, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await client.post('/auth/login', { email, password });
            if (response.data?.data?.tokens?.accessToken) {
                login(response.data.data.tokens.accessToken);
                navigate('/project-analysis');
            } else {
                setError("Authentication payload invalid from upstream.");
            }
        } catch (err: any) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError("An error occurred trying to sign you in. Check your network.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">SkillLighthouse</h1>
                    <p className="text-sm text-gray-500 mt-2">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
