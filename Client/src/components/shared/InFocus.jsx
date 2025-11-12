import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../Loader/loader";
import CommonCard2English from "./english/CommonCard2English";
import CommonCard3English from "./english/CommonCard3English";
import { CommonCard2Urdu } from "./urdu/CommonCard2Urdu";
import CommonCard3Urdu from "./urdu/CommonCard3Urdu";
import { getCurrentMonthYear, getCurrentMonthYearUrdu } from "../../utils/dateUtils";

const InFocus = ({ 
    publicationName = "hilal-english", 
    isUrdu = false,
    className = ""
}) => {
    // Fetch articles from in-focus category dynamically based on publication
    const { data: result, isLoading, error } = useQuery({
        queryKey: ["infocus-articles", publicationName],
        queryFn: async () => {
            // First, get all categories to find the in-focus category for this publication
            const categoriesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/active/`);
            const categories = categoriesRes.data.data || [];
            
            // Get publication ID
            const publicationsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/publications/active/`);
            const publications = publicationsRes.data.data || [];
            const publication = publications.find(pub => pub.name === publicationName);
            
            if (!publication) {
                console.warn(`Publication '${publicationName}' not found`);
                return [];
            }
            
            // Get publication-specific category names based on publication type
            const pubNameLower = publicationName.toLowerCase();
            let categoryNamesToTry = [];
            let inFocusCategory = null;
            
            // Special handling for hilal-her and hilal-english-kids: Find category with most articles
            if (pubNameLower === 'hilal-her' || pubNameLower === 'hilal her' || 
                pubNameLower === 'hilal-english-kids' || pubNameLower === 'hilal english kids') {
                // Get all categories for this publication
                const publicationCategories = categories.filter(cat => cat.publication === publication.id);
                
                if (publicationCategories.length === 0) {
                    console.warn(`No categories found for publication '${publicationName}'`);
                    return [];
                }
                
                // Count articles for each category and find the one with most articles
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
                
                // Sort by count (descending) and pick the category with most articles
                categoryCounts.sort((a, b) => b.count - a.count);
                if (categoryCounts.length > 0 && categoryCounts[0].count > 0) {
                    inFocusCategory = categoryCounts[0].category;
                    const pubType = pubNameLower.includes('kids') ? 'hilal-english-kids' : 'hilal-her';
                    console.log(`Using category '${inFocusCategory.name}' with ${categoryCounts[0].count} articles for ${pubType} InFocus`);
                }
            } else {
                // For other publications, use the existing logic
                if (pubNameLower === 'hilal-english' || pubNameLower === 'hilal english') {
                    // For hilal-english, use in-focus
                    categoryNamesToTry = ['in-focus'];
                } else if (pubNameLower === 'hilal-urdu' || pubNameLower === 'hilal urdu') {
                    // For hilal-urdu, try special-focus first (Urdu equivalent), then in-focus
                    categoryNamesToTry = ['special-focus', 'in-focus'];
                } else if (pubNameLower.includes('kids')) {
                    // For kids publications, try in-focus or trending
                    categoryNamesToTry = ['in-focus', 'trending'];
                } else {
                    // For other publications, try multiple category names
                    categoryNamesToTry = ['in-focus', 'trending', 'special-focus'];
                }
                
                // Find the category for this publication (try in order of priority)
                for (const categoryName of categoryNamesToTry) {
                    inFocusCategory = categories.find(cat => 
                        cat.name === categoryName && 
                        cat.publication === publication.id
                    );
                    if (inFocusCategory) {
                        break; // Found a match, stop searching
                    }
                }
            }
            
            // If still no category found, get the first available category for this publication
            if (!inFocusCategory) {
                inFocusCategory = categories.find(cat => cat.publication === publication.id);
                if (inFocusCategory) {
                    console.warn(`Using first available category '${inFocusCategory.name}' for publication '${publicationName}'`);
                }
            }
            
            if (!inFocusCategory) {
                console.warn(`No suitable category found for publication '${publicationName}'`);
                return [];
            }
            
            // Build query parameters for category and publication
            const params = new URLSearchParams();
            params.append('category_id', inFocusCategory.id.toString());
            params.append('publication', publicationName);
            params.append('count', '5'); // Get 5 articles for InFocus section
            
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
            const data = res.data.data || [];
            // Return both articles and category info for dynamic title
            return { articles: data, category: inFocusCategory };
        },
    });

    if (isLoading) return <Loader />;
    if (error) return <p className="p-4 text-red-500">Error fetching articles</p>;

    // Extract articles and category from result
    // Handle both formats: { articles: [], category: {} } or just []
    const articles = Array.isArray(result) ? result : (result?.articles || []);
    const selectedCategory = result?.category;

    // Helper function to check if a string contains Urdu characters
    const containsUrduCharacters = (str) => {
        if (!str) return false;
        // Urdu Unicode range: U+0600 to U+06FF (Arabic script)
        const urduRegex = /[\u0600-\u06FF]/;
        return urduRegex.test(str);
    };

    // Helper function to fix Hilal spelling (HIAL -> HILAL)
    const fixHilalSpelling = (str) => {
        if (!str) return str;
        // Replace HIAL with HILAL (case-insensitive, but preserve case of surrounding text)
        return str.replace(/HIAL/gi, (match) => {
            // If original was all caps, return HILAL, if mixed case, preserve pattern
            if (match === 'HIAL' || match === 'Hial') {
                return match === 'HIAL' ? 'HILAL' : 'Hilal';
            }
            return 'Hilal'; // default for other cases
        });
    };

    // Title based on category display name if available, otherwise fallback to publication-based title
    const getTitle = () => {
        const pubNameLower = publicationName.toLowerCase();
        const isUrduKids = pubNameLower === "hilal-urdu-kids" || pubNameLower === "hilal urdu kids";
        const isEnglishKids = pubNameLower === "hilal-english-kids" || pubNameLower === "hilal english kids";
        
        // If we have category info, use its display_name
        // But for hilal-urdu-kids, if display_name is in English, use Urdu fallback
        if (selectedCategory?.display_name) {
            if (isUrduKids && !containsUrduCharacters(selectedCategory.display_name)) {
                // Category name is in English, use Urdu fallback for urdu kids
                return "ہلال بچوں کے لیے اردو";
            }
            // Fix HIAL -> HILAL spelling for hilal-english-kids
            if (isEnglishKids) {
                return fixHilalSpelling(selectedCategory.display_name);
            }
            return selectedCategory.display_name;
        }
        
        // If category from article is available, check for hilal-urdu-kids
        if (articles.length > 0 && articles[0]?.category_display_name) {
            if (isUrduKids && !containsUrduCharacters(articles[0].category_display_name)) {
                // Category name is in English, use Urdu fallback for urdu kids
                return "ہلال بچوں کے لیے اردو";
            }
            if (pubNameLower === "hilal-her" || pubNameLower === "hilal her") {
                return articles[0].category_display_name;
            }
            if (isUrduKids) {
                return articles[0].category_display_name;
            }
            // Fix HIAL -> HILAL spelling for hilal-english-kids
            if (isEnglishKids) {
                return fixHilalSpelling(articles[0].category_display_name);
            }
        }
        
        // Fallback to publication-based titles
        if (pubNameLower === "hilal-english") {
            return "IN - FOCUS";
        } else if (pubNameLower === "hilal-urdu" || pubNameLower === "hilal urdu") {
            return "خصوصی فوکس";
        } else if (isUrduKids) {
            return "ہلال بچوں کے لیے اردو";
        } else if (isEnglishKids) {
            return "KIDS IN FOCUS";
        } else if (pubNameLower === "hilal-her" || pubNameLower === "hilal her") {
            // Try to get category from first article if available
            if (articles.length > 0 && articles[0]?.category_display_name) {
                return articles[0].category_display_name;
            }
            return "IN - FOCUS";
        } else if (pubNameLower === "hilal-digital" || pubNameLower === "hilal digital") {
            return "دیجیٹل توجہ";
        } else {
            return "IN - FOCUS";
        }
    };

    const title = getTitle();
    const titleClassName = isUrdu ? "heading-text-primary font-urdu-nastaliq-sm1" : "heading-text-primary";
    const titleDir = isUrdu ? "rtl" : "ltr";

    // Choose the appropriate card components based on language
    const LargeCard = isUrdu ? CommonCard2Urdu : CommonCard2English;
    const SmallCard = isUrdu ? CommonCard3Urdu : CommonCard3English;

    return (
        <div className={`bg-white font-poppins px-4 py-2 ${className}`}>
            {/* In Focus Header */}
            <div className="border-t-[3px] border-red-600">
                <div className={`py-2 flex justify-between items-center ${isUrdu ? 'flex-row-reverse' : ''}`}>
                    <h2 className={titleClassName} dir={titleDir}>{title}</h2>
                    <span className={`text-sm text-gray-600 font-medium ${isUrdu ? 'font-urdu-nastaliq-sm1' : ''}`} dir={titleDir}>
                        {isUrdu ? getCurrentMonthYearUrdu() : getCurrentMonthYear()}
                    </span>
                </div>

                <div className="py-2">
                    {articles && articles.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Large Featured Article */}
                            <LargeCard key={articles[0].id} data={articles} />

                            {/* Smaller Articles */}
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                {articles.slice(1, 5).map((article) => (
                                    <SmallCard key={article.id} article={article} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                            <p className={`text-gray-500 text-sm ${isUrdu ? 'font-urdu' : ''}`} dir={titleDir}>
                                {isUrdu ? "کوئی مضمون دستیاب نہیں" : "No articles available"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InFocus;
