import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();//create global container(storage)
//provide data to components
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);//user data
    const [loading, setLoading] = useState(true);//loading state(login status)
    const navigate = useNavigate();//for navigation(redirect pages)

    //auto login on refresh(saved data, restore session(if user already logged in) - Even if i refresh, user stays logged in)
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);
    //login function
    const login = async (email, password) => {
        // Hardcoded demo credentials for easy access
        if ((email === 'admin' && (password === 'admin' || password === '123')) || 
            (email === 'manager1' && password === '123') ||
            (email === 'technician1' && password === '123')) {
            const mockUser = { 
                id: 'demo-id', 
                name: email.charAt(0).toUpperCase() + email.slice(1), 
                email: `${email}@example.com`,
                role: email.includes('admin') ? 'admin' : (email.includes('manager') ? 'manager' : 'technician')
            };
            localStorage.setItem('token', 'mock-token');//save in local storage
            localStorage.setItem('user', JSON.stringify(mockUser));
            setUser(mockUser);//update state
            navigate('/');//redirect to home page
            return true;
        }
//API login
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);//save response
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);//update state
            navigate('/');//redirect to home page
            return true;
        } catch (error) {
            console.error('Login error', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');//clear storage
        localStorage.removeItem('user');
        setUser(null);//clear state
        navigate('/login');//redirect to login
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>{/*For use in components*/}
            {children}
        </AuthContext.Provider>
    );
};
