import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../Loader/loader";
import CommonCard4Urdu from "../shared/urdu/CommonCard4Urdu";
import CommonCard5Urdu from "../shared/urdu/CommonCard5Urdu";
import CommonCard6Urdu from "../shared/urdu/CommonCard6Urdu";
import { getCurrentMonthYear } from "../../utils/dateUtils";
import useAuthStore from "../../utils/store";

const TrendingHilalSectionUrdu = () => {
    // Get publications from store
    const publications = useAuthStore((state) => state.publications);
    
    // Find the Hilal Urdu publication dynamically
    const hilalUrduPub = publications.find(pub => 
        pub.name === 'hilal-urdu' || 
        pub.id === 2
    );

    const { data: articles, isLoading, error } = useQuery({
        queryKey: ["articles", "national-news", hilalUrduPub?.name || 'hilal-urdu'],
        queryFn: async () => {
            if (!hilalUrduPub) {
                console.warn('Hilal Urdu publication not found');
                return [];
            }

            const params = new URLSearchParams();
            params.append('publication', hilalUrduPub.name);
            params.append('category', 'national-news'); // Use category name "national-news"
            params.append('count', '11');
            
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
            return res.data.data || [];
        },
        enabled: !!hilalUrduPub, // Only run query if publication is found
    });

    if (isLoading) return <Loader />;
    if (error) return <p>Error fetching articles</p>;

    return (
        <div className="bg-white py-2 px-4 font-poppins">
            {/* Trending Publications Header */}
            <div className="border-t-[3px] border-red-600">
                <div className="py-2 flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">
                        {getCurrentMonthYear()}
                    </span>
                    <h2 className="heading-text-primary font-urdu-nastaliq-sm1" dir='rtl'>قومی و بین الاقوامی</h2>
                </div>

                <div className="py-4 grid lg:grid-cols-2 gap-x-6">
                    <div className="flex flex-col gap-6 mb-6">
                        {/* Large Featured Article */}
                        {articles.slice(0, 1).map((article) => (
                            <CommonCard4Urdu key={article.id} article={article} />
                        ))}

                        {/* Smaller Articles */}
                        <div className="grid grid-cols-2 gap-x-8">
                            {articles.slice(1, 5).map((article) => (
                                <CommonCard5Urdu key={article.id} article={article} />
                            ))}
                        </div>
                    </div>

                    {/* Grid of smaller articles */}
                    <div className="flex flex-col gap-6">
                        {articles.slice(5, 6).map((article) => (
                            <CommonCard4Urdu key={article.id} article={article} />
                        ))}

                        <div className="grid grid-cols-1 gap-4">
                            {articles.slice(6, 11).map((article) => (
                                <CommonCard6Urdu key={article.id} article={article} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingHilalSectionUrdu;
