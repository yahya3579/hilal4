import React from "react";
import { Link } from "react-router-dom";
import Loader from "../Loader/loader";
import CommonCard2English from "./english/CommonCard2English";
import CommonCard3English from "./english/CommonCard3English";
import { CommonCard2Urdu } from "./urdu/CommonCard2Urdu";
import CommonCard3Urdu from "./urdu/CommonCard3Urdu";
import { useTrendingArticlesMixed } from "../../hooks/usePublicationArticlesEnhanced";
import { getCurrentMonthYear } from "../../utils/dateUtils";

const TrendingArticles = ({ 
    publicationName = "Hilal English", 
    isUrdu = false,
    className = ""
}) => {
    const { data, isLoading, error } = useTrendingArticlesMixed(publicationName);

    if (isLoading) return <Loader />;
    if (error) return <p className="p-4 text-red-500">Error fetching articles</p>;

    // Choose the appropriate card components based on language
    const LargeCard = isUrdu ? CommonCard2Urdu : CommonCard2English;
    const SmallCard = isUrdu ? CommonCard3Urdu : CommonCard3English;

    // Title and styling based on language
    const title = isUrdu ? "مقبول مضامین" : "TRENDING ARTICLES";
    const titleClassName = isUrdu ? "heading-text-primary font-urdu-nastaliq-sm1" : "heading-text-primary";
    const titleDir = isUrdu ? "rtl" : "ltr";

    return (
        <div className={`bg-white font-poppins px-4 py-2 ${className}`}>
            {/* Trending Articles Header */}
            <div className="border-t-[3px] border-red-600">
                <div className="py-2 flex justify-between items-center">
                    {isUrdu ? (
                        <>
                            <span className="text-sm text-gray-600 font-medium">
                                {getCurrentMonthYear()}
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

                <div className="py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Large Featured Article */}
                        {data && data.length > 0 && (
                            <LargeCard key={data[0].id} data={data} />
                        )}

                        {/* Smaller Articles */}
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                            {data && data.slice(1, 5).map((article) => (
                                <SmallCard key={article.id} article={article} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingArticles;
