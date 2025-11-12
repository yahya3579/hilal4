import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { filterCurrentMonthArticles } from "../utils/dateUtils";

/**
 * Custom hook to fetch articles from current month for a specific category
 * @param {string} category - The category to fetch articles from
 * @returns {Object} Query result with filtered current month articles
 */
export const useCurrentMonthArticles = (category) => {
  return useQuery({
    queryKey: ["current-month-articles", category],
    queryFn: async () => {
      // First, get the category ID by name
      const categoriesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/active/`)
      const categories = categoriesRes.data.data || []
      const categoryObj = categories.find(cat => cat.name === category)
      
      if (!categoryObj) {
        throw new Error(`Category '${category}' not found`)
      }
      
      // Then fetch articles using the filtered API
      const params = new URLSearchParams()
      params.append('category_id', categoryObj.id.toString())
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`)
      const allArticles = res.data.data || [];
      
      // Filter to show only current month articles
      const currentMonthArticles = filterCurrentMonthArticles(allArticles);
      
      // If no current month articles, return the most recent ones as fallback
      if (currentMonthArticles.length === 0) {
        // Sort by publish_date descending and return recent ones
        return allArticles
          .sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date))
          .slice(0, 10); // Return last 10 articles as fallback
      }
      
      // Sort current month articles by date (newest first)
      return currentMonthArticles.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Custom hook to fetch all articles and filter by current month
 * @returns {Object} Query result with all current month articles
 */
export const useAllCurrentMonthArticles = () => {
  return useQuery({
    queryKey: ["all-current-month-articles"],
    queryFn: async () => {
      // Use filtered API to get current month articles directly
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = now.getFullYear();
      
      const params = new URLSearchParams();
      params.append('month', currentMonth.toString());
      params.append('year', currentYear.toString());
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
      const allArticles = res.data.data || [];
      
      // Filter to show only current month articles (should already be filtered by API)
      const currentMonthArticles = filterCurrentMonthArticles(allArticles);
      
      // If no current month articles, return the most recent ones as fallback
      if (currentMonthArticles.length === 0) {
        return allArticles
          .sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date))
          .slice(0, 20); // Return last 20 articles as fallback
      }
      
      // Sort current month articles by date (newest first)
      return currentMonthArticles.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};
