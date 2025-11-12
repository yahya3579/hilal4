import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../../Loader/loader";
import CommonCard1Urdu from "../../shared/urdu/CommonCard1Urdu";
import CommonCard4Urdu from "../../shared/urdu/CommonCard4Urdu";
import CommonCard5Urdu from "../../shared/urdu/CommonCard5Urdu";
import CommonCard6Urdu from "../../shared/urdu/CommonCard6Urdu";


const TrendingHilalSectionKidsUrdu = () => {
    // Fetch articles specifically from national-news category for Hilal Urdu Kids
    const { data: articles, isLoading, error } = useQuery({
        queryKey: ["articles", "national-news", "Hilal Urdu Kids"],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('publication', 'Hilal Urdu Kids');
            params.append('category_id', '12'); // national-news category for Hilal Urdu Kids
            params.append('count', '6');
            
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
            return res.data.data || [];
        },
    });

    if (isLoading) return <Loader />;
    if (error) return <p>Error fetching articles</p>;

    // Shuffle articles randomly and take only 6 articles (2 per column)
    const shuffledArticles = [...(articles || [])].sort(() => Math.random() - 0.5);

    return (
        <div className="bg-white py-2 px-4 font-poppins">
            {/* Second Slice Header */}
            <div className="border-t-[3px] border-red-600">
                <div className="py-2">
                    <h2 className="heading-text-primary" dir='rtl'>قومی و بین الاقوامی خبریں</h2>
                </div>

                {/* Three Column Layout - Only 2 articles per column */}
                <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
                    {/* Left Column - Only 2 articles */}
                    <div className="flex flex-col gap-4">
                        {shuffledArticles.length > 0 ? (
                            shuffledArticles.slice(0, 2).map((article) => (
                                <CommonCard1Urdu key={article.id} article={article} publicationName="Hilal Urdu Kids" />
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm" dir="rtl">
                                کوئی قومی و بین الاقوامی خبریں دستیاب نہیں ہیں
                            </div>
                        )}
                    </div>

                    {/* Middle Column - Only 2 articles */}
                    <div className="flex flex-col gap-4">
                        {shuffledArticles.length > 2 ? (
                            shuffledArticles.slice(2, 4).map((article) => (
                                <CommonCard1Urdu key={article.id} article={article} publicationName="Hilal Urdu Kids" />
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm" dir="rtl">
                                کوئی اضافی خبریں دستیاب نہیں ہیں
                            </div>
                        )}
                    </div>

                    {/* Right Column - Only 2 articles */}
                    <div className="flex flex-col gap-4">
                        {shuffledArticles.length > 4 ? (
                            shuffledArticles.slice(4, 6).map((article) => (
                                <CommonCard1Urdu key={article.id} article={article} publicationName="Hilal Urdu Kids" />
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm" dir="rtl">
                                کوئی اضافی خبریں دستیاب نہیں ہیں
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingHilalSectionKidsUrdu;
