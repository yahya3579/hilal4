import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../../Loader/loader";
import CommonCard1Urdu from "../../shared/urdu/CommonCard1Urdu";

const HilalMiscUrduKids = () => {
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

    // Shuffle articles randomly
    const shuffledArticles = [...(articles || [])].sort(() => Math.random() - 0.5);

    return (
        <div className="py-2 px-4 font-poppins">
            {/* Header */}
            <div className="border-t-[3px] border-red-600">
                <div className="bg-white py-2 mb-2">
                    <h2 className="heading-text-primary font-urdu-nastaliq-sm1" dir='rtl'>متفرقات</h2>
                </div>

                {/* Images Grid */}
                <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
                    {shuffledArticles.slice(0, 6).map((article) => (
                        <CommonCard1Urdu key={article.id} article={article} publicationName="Hilal Urdu Kids" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HilalMiscUrduKids;
