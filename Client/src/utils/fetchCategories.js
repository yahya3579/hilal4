import axios from "axios";
import useAuthStore from "./store";

export const fetchCategories = async () => {
    const { setCategories, setLoadingCategories } = useAuthStore.getState();
    try {
        setLoadingCategories(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/active/`);
        setCategories(response.data.data);
    } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]); // Fallback to empty array
    } finally {
        setLoadingCategories(false);
    }
};
