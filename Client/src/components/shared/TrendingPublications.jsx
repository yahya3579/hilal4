import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../Loader/loader";
import { CommonCard1English } from "./english/CommonCard1English";
import CommonCard1Urdu from "./urdu/CommonCard1Urdu";
import { getCurrentMonthYear, getCurrentMonthYearUrdu } from "../../utils/dateUtils";

const TrendingPublications = ({ 
    publicationName = "Hilal English", 
    isUrdu = false,
    className = ""
}) => {
    const { data: articles, isLoading, error } = useQuery({
        queryKey: ["trending-articles", publicationName],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/trending/${publicationName}/`);
            return res.data.data || [];
        },
    });

    if (isLoading) return <Loader />;
    if (error) return <p className="p-4 text-red-500">Error fetching articles</p>;

    // Choose the appropriate card component based on language
    const CardComponent = isUrdu ? CommonCard1Urdu : CommonCard1English;

    // Title and styling based on language and publication
    const getTitle = () => {
        if (publicationName.toLowerCase() === "hilal-english") {
            return "TRENDING";
        } else if (publicationName.toLowerCase() === "hilal-urdu") {
            return "ہلال اردو";
        } else if (publicationName.toLowerCase() === "hilal-urdu-kids") {
            return "ہلال بچوں کے لیے اردو";
        } else if (publicationName.toLowerCase() === "hilal-digital") {
            return "ہلال دیجیٹل";
        } else {
            // For other English publications, use the publication name
            return publicationName.toUpperCase();
        }
    };
    
    const title = getTitle();
    const titleClassName = isUrdu ? "heading-text-primary font-urdu-nastaliq-sm1" : "heading-text-primary";
    const titleDir = isUrdu ? "rtl" : "ltr";

    // For mixed publications (hilal-english, hilal-urdu), arrange articles in a specific grid pattern
    // For others, just display in a simple grid
    const isMixedPublication = publicationName.toLowerCase() === "hilal-english" || publicationName.toLowerCase() === "hilal-urdu";

    if (isMixedPublication) {
        // For mixed publications: arrange in 3 columns with specific pattern
        // Backend returns: [in-focus1, in-focus2, national-news1, national-news2, misc1, misc2]
        // We want: Left column (in-focus), Middle column (national-news), Right column (misc)
        const gridArticles = [
            // Row 1: Column 1 (in-focus), Column 2 (national-news), Column 3 (misc)
            articles[0] || null, // in-focus1
            articles[2] || null, // national-news1
            articles[4] || null, // misc1
            // Row 2: Column 1 (in-focus), Column 2 (national-news), Column 3 (misc)
            articles[1] || null, // in-focus2
            articles[3] || null, // national-news2
            articles[5] || null, // misc2
        ];

        return (
            <div className={`py-2 px-4 font-poppins ${className}`}>
                {/* Header */}
                <div className="border-t-[3px] border-red-600">
                    <div className={`bg-white py-2 mb-2 flex justify-between items-center ${isUrdu ? 'flex-row-reverse' : ''}`}>
                        <h2 className={titleClassName} dir={titleDir}>{title}</h2>
                        <span className={`text-sm text-gray-600 font-medium ${isUrdu ? 'font-urdu-nastaliq-sm1' : ''}`} dir={titleDir}>
                            {isUrdu ? getCurrentMonthYearUrdu() : getCurrentMonthYear()}
                        </span>
                    </div>

                    {/* Images Grid - 3 columns for mixed publications */}
                    <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
                        {gridArticles.map((article, index) => (
                            article ? (
                                <CardComponent key={`${article.id}-${index}`} article={article} publicationName={publicationName} />
                            ) : (
                                <div key={`empty-${index}`} className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                                    <p className={`text-gray-500 text-sm ${isUrdu ? 'font-urdu' : ''}`} dir={titleDir}>
                                        {isUrdu ? "کوئی مضمون دستیاب نہیں" : "No article available"}
                                    </p>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        );
    } else {
        // For other publications: simple 3-column grid
        return (
            <div className={`py-2 px-4 font-poppins ${className}`}>
                {/* Header */}
                <div className="border-t-[3px] border-red-600">
                    <div className={`bg-white py-2 mb-2 flex justify-between items-center ${isUrdu ? 'flex-row-reverse' : ''}`}>
                        <h2 className={titleClassName} dir={titleDir}>{title}</h2>
                        <span className={`text-sm text-gray-600 font-medium ${isUrdu ? 'font-urdu-nastaliq-sm1' : ''}`} dir={titleDir}>
                            {isUrdu ? getCurrentMonthYearUrdu() : getCurrentMonthYear()}
                        </span>
                    </div>

                    {/* Images Grid - 3 columns for other publications */}
                    <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
                        {articles.slice(0, 6).map((article) => (
                            <CardComponent key={article.id} article={article} publicationName={publicationName} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
};

export default TrendingPublications;
