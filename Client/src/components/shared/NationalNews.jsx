import React from "react";
import { Link } from "react-router-dom";
import Loader from "../Loader/loader";
import CommonCard4English from "./english/CommonCard4English";
import CommonCard5English from "./english/CommonCard5English";
import CommonCard4Urdu from "./urdu/CommonCard4Urdu";
import CommonCard5Urdu from "./urdu/CommonCard5Urdu";
import { useNationalNewsArticlesLastMonths } from "../../hooks/usePublicationArticlesEnhanced";
import { getCurrentMonthYear, getCurrentMonthYearUrdu } from "../../utils/dateUtils";

const NationalNews = ({ 
    publicationName = "Hilal English", 
    isUrdu = false,
    className = "",
    monthsCount = 8 // Number of past months to fetch articles from
}) => {
    // Fetch articles from last N months (default: 8 months)
    const { data, isLoading, error } = useNationalNewsArticlesLastMonths(publicationName, monthsCount);
    
    // Limit to first 6 articles for display
    const articlesToDisplay = data?.slice(0, 6) || [];

    if (isLoading) return <Loader />;
    if (error) return <p className="p-4 text-red-500">Error fetching articles: {error.message}</p>;

    // Choose the appropriate card components based on language
    const LargeCard = isUrdu ? CommonCard4Urdu : CommonCard4English;
    const SmallCard = isUrdu ? CommonCard5Urdu : CommonCard5English;

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

    // Title and styling based on language and category
    // Get category display name from first article if available
    const getTitle = () => {
        const pubNameLower = publicationName.toLowerCase();
        const isUrduKids = pubNameLower === "hilal-urdu-kids" || pubNameLower === "hilal urdu kids";
        const isEnglishKids = pubNameLower === "hilal-english-kids" || pubNameLower === "hilal english kids";
        
        // Try to get category from first article
        if (articlesToDisplay.length > 0 && articlesToDisplay[0]?.category_display_name) {
            const categoryName = articlesToDisplay[0].category_display_name;
            // For hilal-urdu-kids, if category is in English, use Urdu fallback
            if (isUrduKids && !containsUrduCharacters(categoryName)) {
                return "ہلال بچوں کے لیے اردو";
            }
            // Fix HIAL -> HILAL spelling for hilal-english-kids
            if (isEnglishKids) {
                return fixHilalSpelling(categoryName);
            }
            return categoryName;
        }
        // Fallback to default titles
        if (isUrduKids) {
            return "ہلال بچوں کے لیے اردو";
        }
        return isUrdu ? "قومی اور بین الاقوامی خبریں" : "NATIONAL & INTERNATIONAL NEWS";
    };

    const title = getTitle();
    const titleClassName = isUrdu ? "heading-text-primary font-urdu-nastaliq-sm1" : "heading-text-primary";
    const titleDir = isUrdu ? "rtl" : "ltr";

    return (
        <div className={`bg-white font-poppins px-4 py-2 ${className}`}>
            {/* National & International News Header */}
            <div className="border-t-[3px] border-red-600">
                <div className="py-2 flex justify-between items-center">
                    {isUrdu ? (
                        <>
                            <span className="text-sm text-gray-600 font-medium font-urdu-nastaliq-sm1" dir="rtl">
                                {getCurrentMonthYearUrdu()}
                            </span>
                            <h2 className={titleClassName} dir={titleDir}>
                                {title}
                            </h2>
                        </>
                    ) : (
                        <>
                            <h2 className={titleClassName} dir={titleDir}>
                                {title}
                            </h2>
                            <span className="text-sm text-gray-600 font-medium">
                                {getCurrentMonthYear()}
                            </span>
                        </>
                    )}
                </div>

                {articlesToDisplay && articlesToDisplay.length > 0 ? (
                    <div className="py-4 grid lg:grid-cols-2 gap-x-6">
                        {/* LEFT COLUMN - Articles 1-3 */}
                        <div className="flex flex-col gap-6 mb-6">
                            {/* Article 1 - Large Featured Article */}
                            <LargeCard key={articlesToDisplay[0].id} article={articlesToDisplay[0]} />

                            {/* Articles 2-3 - Smaller Articles */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                {articlesToDisplay.slice(1, 3).map((article) => (
                                    <SmallCard key={article.id} article={article} />
                                ))}
                            </div>
                        </div>

                        {/* RIGHT COLUMN - Articles 4-6 */}
                        <div className="flex flex-col gap-6">
                            {/* Article 4 - Large Featured Article */}
                            {articlesToDisplay.length > 3 && (
                                <LargeCard key={articlesToDisplay[3].id} article={articlesToDisplay[3]} />
                            )}

                            {/* Articles 5-6 - Smaller Articles in 2-column grid */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                {articlesToDisplay.slice(4, 6).map((article) => (
                                    <SmallCard key={article.id} article={article} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-gray-500 text-sm">
                            {isUrdu ? "کوئی مضامین دستیاب نہیں" : "No articles available"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NationalNews;
