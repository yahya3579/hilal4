

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import useAuthStore from '../utils/store';
import Loader from '../components/Loader/loader';

const ProtectedRoutes = ({ children }) => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const setAccessToken = useAuthStore((state) => state.setAccessToken);
    const setUserRole = useAuthStore((state) => state.setUserRole);
    const setIsAuthorized = useAuthStore((state) => state.setIsAuthorized);
    const isAuthorized = useAuthStore((state) => state.isAuthorized);
    const authTrigger = useAuthStore((state) => state.authTrigger);
    const setUserId = useAuthStore((state) => state.setUserId);
    const userRole = useAuthStore((state) => state.userRole);
    const location = useLocation(); // ✅ detect current path



    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const isAdminRoute = location.pathname.startsWith('/admin');
            
            // Only run authentication for admin routes
            if (isAdminRoute) {
                try {
                    await auth();
                } catch (error) {
                    console.error('Error during authentication:', error);
                    setIsAuthorized(false);
                }
            }
            
            setLoading(false);
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authTrigger, location.pathname]);

    const fetchUserRole = async (userId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/user/${userId}/role/`
            );
            setUserRole(response.data.role);
            console.log('User role fetched and stored:', response.data.role);
        } catch (error) {
            console.error(
                'Error fetching user role:',
                error?.response?.data || error.message
            );
        }
    };

    const refreshToken = async () => {
        try {
            console.log('Refreshing token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
                {},
                { withCredentials: true }
            );
            if (response.status === 200) {
                const newToken = response.data.access;
                setAccessToken(newToken);
                setIsAuthorized(true);

                const decodedToken = jwtDecode(newToken);
                setUserId(decodedToken.user_id);
                await fetchUserRole(decodedToken.user_id);

                return true;
            }
        } catch (error) {
            console.error(
                'Error refreshing token:',
                error?.response?.data || error.message
            );
            setIsAuthorized(false);
        }
        return false;
    };

    const auth = async () => {
        console.log('Access Token:', accessToken);
        if (!accessToken) {
            const refreshed = await refreshToken();
            if (!refreshed) {
                setIsAuthorized(false);
            }
            return;
        }

        try {
            const decodedToken = jwtDecode(accessToken);
            const expirationTime = decodedToken.exp;
            const currentTime = Date.now() / 1000;

            if (expirationTime < currentTime) {
                console.log('Token expired getting new');
                await refreshToken();
            } else {
                setIsAuthorized(true);
                setUserId(decodedToken.user_id);
                console.log('User ID:', decodedToken.user_id);
                await fetchUserRole(decodedToken.user_id);
            }
        } catch (error) {
            console.error('Invalid token format, attempting refresh:', error);
            await refreshToken();
        }
    };

    // Show loading until we finish auth check
    if (loading) {
        return <Loader />;
    }

    const adminPath = location.pathname;
    const isAdminRoute = adminPath.startsWith('/admin');

    // Only protect admin routes
    if (isAdminRoute) {
        // Check if user is authenticated
        if (!isAuthorized) {
            return <Navigate to="/login" replace />;
        }

        // Check if user has admin role
        if (userRole !== 'admin') {
            return <Navigate to="/" replace />;
        }
    }

    // For non-admin routes, allow access to all users
    return children;
};

export default ProtectedRoutes;
