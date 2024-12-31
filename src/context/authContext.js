import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthToken(token);
            axios.get('http://localhost:3001/protected', {
                headers: { Authorization: token }
            })
            .then(response => setUser(response.data.user))
            .catch(() => logout());
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);

        axios.get('http://localhost:3001/protected', {
            headers: { Authorization: token }
        })
        .then(response => setUser(response.data.user));
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ authToken, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
