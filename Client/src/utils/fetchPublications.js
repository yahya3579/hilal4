import axios from 'axios';
import useAuthStore from './store';

export const fetchPublications = async () => {
    try {
        useAuthStore.getState().setLoadingPublications(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/publications/active/`);
        useAuthStore.getState().setPublications(response.data.data);
    } catch (error) {
        console.error("Error fetching publications:", error);
        // Fallback to empty array if API fails
        useAuthStore.getState().setPublications([]);
    } finally {
        useAuthStore.getState().setLoadingPublications(false);
    }
};
