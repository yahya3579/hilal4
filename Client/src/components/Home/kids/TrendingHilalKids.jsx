import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../../Loader/loader";
import CommonCard4English from "../../shared/english/CommonCard4English";
import CommonCard5English from "../../shared/english/CommonCard5English";
import CommonCard6English from "../../shared/english/CommonCard6English";

const TrendingHilalKidsSection = () => {
    const { data: articles, isLoading, error } = useQuery({
        queryKey: ["articles", "trending", "Hilal Kids"],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('publication', 'Hilal Kids');
            params.append('category_id', '15'); // trending category for Hilal Kids
            params.append('count', '11');
            
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
            return res.data.data || [];
        },
    });

    if (isLoading) return <Loader />;
    if (error) return <p>Error fetching articles</p>;

    // Shuffle articles randomly
    const shuffledArticles = articles;

    return (
        <div className="bg-white py-2 px-4 font-poppins">
            {/* Trending Publications Header */}
            <div className="border-t-[3px] border-red-600">
                <div className="py-2">
                    <h2 className="heading-text-primary">TRENDING - HILAL PUBLICATIONS</h2>
                </div>

                <div className="py-4 grid lg:grid-cols-2 gap-x-6">
                    <div className="flex flex-col gap-6 mb-6">
                        {/* Large Featured Article */}
                        {shuffledArticles.slice(0, 1).map((article) => (
                            <CommonCard4English key={article.id} article={article} />
                        ))}

                        {/* Smaller Articles */}
                        <div className="grid grid-cols-2 gap-x-8">
                            {shuffledArticles.slice(1, 5).map((article) => (
                                <CommonCard5English key={article.id} article={article} />
                            ))}
                        </div>
                    </div>

                    {/* Grid of smaller articles */}
                    <div className="flex flex-col gap-6">
                        {shuffledArticles.slice(5, 6).map((article) => (
                            <CommonCard4English key={article.id} article={article} />
                        ))}

                        <div className="grid grid-cols-1 gap-4">
                            {shuffledArticles.slice(6, 11).map((article) => (
                                <CommonCard6English key={article.id} article={article} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingHilalKidsSection;
