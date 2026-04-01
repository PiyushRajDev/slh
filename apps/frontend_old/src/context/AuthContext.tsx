import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface UserPayload {
    userId: string;
    email: string;
    role: string;
}

interface AuthContextType {
    token: string | null;
    user: UserPayload | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserPayload | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('slh_token');
        if (storedToken) {
            try {
                const payloadStr = atob(storedToken.split('.')[1]);
                const payloadObj = JSON.parse(payloadStr) as UserPayload;
                setToken(storedToken);
                setUser(payloadObj);
            } catch (e) {
                console.error("Invalid token found resolving auth state");
                localStorage.removeItem('slh_token');
            }
        }
    }, []);

    const login = (newToken: string) => {
        localStorage.setItem('slh_token', newToken);
        try {
            const payloadStr = atob(newToken.split('.')[1]);
            const payloadObj = JSON.parse(payloadStr) as UserPayload;
            setToken(newToken);
            setUser(payloadObj);
        } catch (e) {
            console.error("Invalid token format submitted");
        }
    };

    const logout = () => {
        localStorage.removeItem('slh_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
