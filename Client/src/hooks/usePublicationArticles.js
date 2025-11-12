import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Custom hook to fetch articles for a specific publication for the current month
 * @param {string} publicationName - The publication name (e.g., "Hilal English", "Hilal Urdu")
 * @returns {Object} Query result with current month articles for the publication
 */
export const usePublicationArticles = (publicationName) => {
  return useQuery({
    queryKey: ["publication-articles", publicationName],
    queryFn: async () => {
      if (!publicationName) {
        throw new Error("Publication name is required");
      }
      
      // Use filtered API with publication parameter
      const params = new URLSearchParams();
      params.append('publication', publicationName);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`
      );
      
      return res.data.data || [];
    },
    enabled: !!publicationName, // Only run query if publicationName is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Custom hook to fetch articles for a specific publication and category
 * @param {string} publicationName - The publication name
 * @param {string} categoryName - The category name
 * @returns {Object} Query result with filtered articles
 */
export const usePublicationCategoryArticles = (publicationName, categoryName) => {
  return useQuery({
    queryKey: ["publication-category-articles", publicationName, categoryName],
    queryFn: async () => {
      if (!publicationName || !categoryName) {
        throw new Error("Both publication name and category name are required");
      }
      
      // First, get the category ID from the category name
      const categoriesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/active/`);
      const categories = categoriesRes.data.data || [];
      
      // Find the category that matches the publication and category name
      const category = categories.find(cat => 
        cat.name === categoryName && 
        cat.publication_name === publicationName
      );
      
      if (!category) {
        console.warn(`Category '${categoryName}' not found for publication '${publicationName}'`);
        return [];
      }
      
      // Now fetch articles using the category ID
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/articles/filtered/?publication=${encodeURIComponent(publicationName)}&category_id=${category.id}`
      );
      
      return res.data.data || [];
    },
    enabled: !!publicationName && !!categoryName,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};
