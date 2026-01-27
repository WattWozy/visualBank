import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Validate token or just decode user info if needed
            // For now, we'll assume if token exists, we are logged in.
            // In a real app, we might verify with an endpoint /api/auth/me
            const savedUser = JSON.parse(localStorage.getItem('user'));
            if (savedUser) {
                setUser(savedUser);
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        try {
            const res = await axios.post('http://localhost:3001/api/auth/login', { username, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setToken(token);
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    };

    const register = async (username, password) => {
        try {
            const res = await axios.post('http://localhost:3001/api/auth/register', { username, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setToken(token);
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
