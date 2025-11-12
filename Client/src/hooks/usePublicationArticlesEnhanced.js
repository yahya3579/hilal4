import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Enhanced hook to fetch articles for a specific publication and category with count and month filtering
 * @param {string} publicationName - The publication name (e.g., "Hilal English", "Hilal Urdu")
 * @param {string} categoryName - The category name (e.g., "in-focus", "trending", "misc")
 * @param {number} count - Number of articles to fetch (optional)
 * @param {number} month - Month to filter by (optional, defaults to current month)
 * @param {number} year - Year to filter by (optional, defaults to current year)
 * @returns {Object} Query result with filtered articles
 */
export const usePublicationCategoryArticlesEnhanced = (
    publicationName, 
    categoryName, 
    count = null, 
    month = null, 
    year = null
) => {
    return useQuery({
        queryKey: ["publication-category-articles-enhanced", publicationName, categoryName, count, month, year],
        queryFn: async () => {
            if (!publicationName || !categoryName) {
                throw new Error("Both publication name and category name are required");
            }
            
            // Get current month/year if not provided
            const now = new Date();
            const currentMonth = month || (now.getMonth() + 1);
            const currentYear = year || now.getFullYear();
            
            // First, get the publication ID from the publication name
            const publicationsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/publications/active/`);
            const publications = publicationsRes.data.data || [];
            
            // Find the publication by name
            const publication = publications.find(pub => pub.name === publicationName);
            
            if (!publication) {
                console.warn(`Publication '${publicationName}' not found`);
                return [];
            }
            
            // Get the category ID from the category name and publication ID
            const categoriesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/active/`);
            const categories = categoriesRes.data.data || [];
            
            // Find the category that matches the category name and publication ID
            const category = categories.find(cat => 
                cat.name === categoryName && 
                cat.publication === publication.id
            );
            
            if (!category) {
                console.warn(`Category '${categoryName}' not found for publication '${publicationName}' (ID: ${publication.id})`);
                return [];
            }
            
            // Build query parameters
            const params = new URLSearchParams();
            params.append('publication', publicationName);
            params.append('category_id', category.id);
            params.append('month', currentMonth);
            params.append('year', currentYear);
            if (count) {
                params.append('count', count);
            }
            
            // Fetch articles using the enhanced filtered API
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`
            );
            
            return res.data.data || [];
        },
        enabled: !!publicationName && !!categoryName,
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
    });
};

/**
 * Hook to fetch trending articles for a publication (6 articles: 2 from trending, 2 from misc, 2 from in-focus)
 * @param {string} publicationName - The publication name
 * @returns {Object} Query result with mixed trending articles
 */
export const useTrendingArticlesMixed = (publicationName) => {
    return useQuery({
        queryKey: ["trending-articles-mixed", publicationName],
        queryFn: async () => {
            if (!publicationName) {
                throw new Error("Publication name is required");
            }
            
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            
            // First, get the publication ID from the publication name
            const publicationsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/publications/active/`);
            const publications = publicationsRes.data.data || [];
            
            const publication = publications.find(pub => pub.name === publicationName);
            if (!publication) {
                console.warn(`Publication '${publicationName}' not found`);
                return [];
            }
            
            // Get the category IDs for trending, misc, and in-focus
            const categoriesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/active/`);
            const categories = categoriesRes.data.data || [];
            
            const trendingCategory = categories.find(cat => cat.name === "trending" && cat.publication === publication.id);
            const miscCategory = categories.find(cat => cat.name === "misc" && cat.publication === publication.id);
            const inFocusCategory = categories.find(cat => cat.name === "in-focus" && cat.publication === publication.id);
            
            // Fetch articles from different categories
            const fetchArticles = async (categoryId, count) => {
                if (!categoryId) return [];
                
                const params = new URLSearchParams();
                params.append('publication', publicationName);
                params.append('category_id', categoryId);
                params.append('month', currentMonth);
                params.append('year', currentYear);
                params.append('count', count);
                
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
                return res.data.data || [];
            };
            
            const [trendingRes, miscRes, inFocusRes] = await Promise.all([
                fetchArticles(trendingCategory?.id, 2),
                fetchArticles(miscCategory?.id, 2),
                fetchArticles(inFocusCategory?.id, 2)
            ]);
            
            // Combine and shuffle the articles
            const allArticles = [...trendingRes, ...miscRes, ...inFocusRes];
            return allArticles.slice(0, 6); // Ensure we only return 6 articles
        },
        enabled: !!publicationName,
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
    });
};

/**
 * Hook to fetch in-focus articles for a publication (5 articles)
 * @param {string} publicationName - The publication name
 * @returns {Object} Query result with in-focus articles
 */
export const useInFocusArticles = (publicationName) => {
    return usePublicationCategoryArticlesEnhanced(publicationName, "in-focus", 5);
};

/**
 * Hook to fetch national news articles for a publication (9 articles)
 * Note: This hook tries to find the appropriate category based on publication type
 * @param {string} publicationName - The publication name
 * @returns {Object} Query result with national news articles
 */
export const useNationalNewsArticles = (publicationName) => {
    return useQuery({
        queryKey: ["national-news-articles", publicationName],
        queryFn: async () => {
            if (!publicationName) {
                throw new Error("Publication name is required");
            }
            
            // Get current month/year
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            
            // Get publications and categories
            const publicationsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/publications/active/`);
            const publications = publicationsRes.data.data || [];
            const publication = publications.find(pub => pub.name === publicationName);
            
            if (!publication) {
                console.warn(`Publication '${publicationName}' not found`);
                return [];
            }
            
            const categoriesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/active/`);
            const categories = categoriesRes.data.data || [];
            
            // Get publication-specific category names
            const pubNameLower = publicationName.toLowerCase();
            let categoryNamesToTry = [];
            
            if (pubNameLower === 'hilal-english' || pubNameLower === 'hilal english') {
                categoryNamesToTry = ['national-news'];
            } else if (pubNameLower === 'hilal-urdu' || pubNameLower === 'hilal urdu') {
                categoryNamesToTry = ['national-and-international-issues', 'national-news'];
            } else {
                categoryNamesToTry = ['national-news', 'national-and-international-issues', 'trending'];
            }
            
            // Find the category
            let category = null;
            for (const categoryName of categoryNamesToTry) {
                category = categories.find(cat => 
                    cat.name === categoryName && 
                    cat.publication === publication.id
                );
                if (category) break;
            }
            
            if (!category) {
                category = categories.find(cat => cat.publication === publication.id);
            }
            
            if (!category) {
                console.warn(`No suitable category found for publication '${publicationName}'`);
                return [];
            }
            
            // Build query parameters
            const params = new URLSearchParams();
            params.append('publication', publicationName);
            params.append('category_id', category.id);
            params.append('month', currentMonth);
            params.append('year', currentYear);
            params.append('count', '9');
            
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
            return res.data.data || [];
        },
        enabled: !!publicationName,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    });
};

/**
 * Hook to fetch national news articles from last N months
 * @param {string} publicationName - The publication name
 * @param {number} monthsCount - Number of past months to fetch (default: 8)
 * @param {number} articlesPerMonth - Number of articles per month (default: null for all)
 * @returns {Object} Query result with national news articles from last N months
 */
export const useNationalNewsArticlesLastMonths = (publicationName, monthsCount = 8, articlesPerMonth = null) => {
    return useQuery({
        queryKey: ["national-news-last-months", publicationName, monthsCount, articlesPerMonth],
        queryFn: async () => {
            if (!publicationName) {
                throw new Error("Publication name is required");
            }
            
            // First, get the publication ID from the publication name
            const publicationsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/publications/active/`);
            const publications = publicationsRes.data.data || [];
            
            const publication = publications.find(pub => pub.name === publicationName);
            if (!publication) {
                console.warn(`Publication '${publicationName}' not found`);
                return [];
            }
            
            // Get the category ID for national-news (with fallback for different publication types)
            const categoriesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/active/`);
            const categories = categoriesRes.data.data || [];
            
            // Get publication-specific category names based on publication type
            const pubNameLower = publicationName.toLowerCase();
            let categoryNamesToTry = [];
            let nationalNewsCategory = null;
            
            // Special handling for hilal-her and hilal-english-kids: Find category with second most articles
            if (pubNameLower === 'hilal-her' || pubNameLower === 'hilal her' || 
                pubNameLower === 'hilal-english-kids' || pubNameLower === 'hilal english kids') {
                // Get all categories for this publication
                const publicationCategories = categories.filter(cat => cat.publication === publication.id);
                
                if (publicationCategories.length === 0) {
                    console.warn(`No categories found for publication '${publicationName}'`);
                    return [];
                }
                
                // Count articles for each category and find the one with second most articles
                const categoryCounts = await Promise.all(
                    publicationCategories.map(async (category) => {
                        try {
                            const params = new URLSearchParams();
                            params.append('category_id', category.id.toString());
                            params.append('publication', publicationName);
                            
                            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
                            const articleCount = res.data.data?.length || 0;
                            return { category, count: articleCount };
                        } catch (error) {
                            console.error(`Error counting articles for category ${category.name}:`, error);
                            return { category, count: 0 };
                        }
                    })
                );
                
                // Sort by count (descending) and pick the category with second most articles
                categoryCounts.sort((a, b) => b.count - a.count);
                if (categoryCounts.length >= 2 && categoryCounts[1].count > 0) {
                    // Use second most
                    nationalNewsCategory = categoryCounts[1].category;
                    const pubType = pubNameLower.includes('kids') ? 'hilal-english-kids' : 'hilal-her';
                    console.log(`Using category '${nationalNewsCategory.name}' with ${categoryCounts[1].count} articles (second most) for ${pubType} NationalNews`);
                } else if (categoryCounts.length > 0 && categoryCounts[0].count > 0) {
                    // Fallback to first if second doesn't exist
                    nationalNewsCategory = categoryCounts[0].category;
                    const pubType = pubNameLower.includes('kids') ? 'hilal-english-kids' : 'hilal-her';
                    console.log(`Using category '${nationalNewsCategory.name}' with ${categoryCounts[0].count} articles (only one available) for ${pubType} NationalNews`);
                }
                    } else {
                // For other publications, use the existing logic
                if (pubNameLower === 'hilal-english' || pubNameLower === 'hilal english') {
                    // For hilal-english, use national-news
                    categoryNamesToTry = ['national-news'];
                } else if (pubNameLower === 'hilal-urdu' || pubNameLower === 'hilal urdu') {
                    // For hilal-urdu, try national-and-international-issues first, then national-news
                    categoryNamesToTry = ['national-and-international-issues', 'national-news'];
            } else {
                // For other publications, try multiple category names
                categoryNamesToTry = ['national-news', 'national-and-international-issues', 'trending'];
            }
            
            // Find the category for this publication (try in order of priority)
                for (const categoryName of categoryNamesToTry) {
                    nationalNewsCategory = categories.find(cat => 
                        cat.name === categoryName && 
                        cat.publication === publication.id
                    );
                    if (nationalNewsCategory) {
                        break; // Found a match, stop searching
                    }
                }
            }
            
            // If still no category found, get the first available category for this publication
            if (!nationalNewsCategory) {
                nationalNewsCategory = categories.find(cat => cat.publication === publication.id);
                if (nationalNewsCategory) {
                    console.warn(`Using first available category '${nationalNewsCategory.name}' for publication '${publicationName}'`);
                }
            }
            
            if (!nationalNewsCategory) {
                console.warn(`No suitable category found for publication '${publicationName}' (ID: ${publication.id})`);
                return [];
            }
            
            // Generate array of last N months
            const now = new Date();
            const monthsToFetch = [];
            
            for (let i = 0; i < monthsCount; i++) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                monthsToFetch.push({
                    month: date.getMonth() + 1,
                    year: date.getFullYear()
                });
            }
            
            // Fetch articles for each month
            const fetchArticlesForMonth = async (month, year) => {
                const params = new URLSearchParams();
                params.append('publication', publicationName);
                params.append('category_id', nationalNewsCategory.id);
                params.append('month', month);
                params.append('year', year);
                if (articlesPerMonth) {
                    params.append('count', articlesPerMonth);
                }
                
                try {
                    const res = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`
                    );
                    return res.data.data || [];
                } catch (error) {
                    console.error(`Error fetching articles for ${month}/${year}:`, error);
                    return [];
                }
            };
            
            // Fetch all months in parallel
            const allMonthsArticles = await Promise.all(
                monthsToFetch.map(({ month, year }) => fetchArticlesForMonth(month, year))
            );
            
            // Combine all articles and sort by publish_date (most recent first)
            const combinedArticles = allMonthsArticles.flat();
            combinedArticles.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
            
            return combinedArticles;
        },
        enabled: !!publicationName,
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
    });
};

/**
 * Hook to fetch misc articles for a publication (4 articles)
 * @param {string} publicationName - The publication name
 * @returns {Object} Query result with misc articles
 */
export const useMiscArticles = (publicationName) => {
    return usePublicationCategoryArticlesEnhanced(publicationName, "misc", 4);
};
