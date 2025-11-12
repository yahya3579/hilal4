import axios from "axios";
import useAuthStore from "./store";

export const fetchArticlesList = async (categoryId = null, month = null, year = null, publication = null, magazine = null) => {
    const { setArticlesList, setLoadingArticlesList, setCurrentCategoryId } = useAuthStore.getState();
    
    try {
        setLoadingArticlesList(true);
        setCurrentCategoryId(categoryId);
        
        // Build query parameters - category is now optional
        const params = new URLSearchParams();
        if (categoryId) params.append('category_id', categoryId);
        if (month) params.append('month', month);
        if (year) params.append('year', year);
        if (publication) params.append('publication', publication);
        if (magazine) params.append('magazine_id', magazine);
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
        setArticlesList(response.data.data);
        
        return response.data.data;
    } catch (error) {
        console.error("Error fetching articles list:", error);
        setArticlesList([]); // Fallback to empty array
        return [];
    } finally {
        setLoadingArticlesList(false);
    }
};
