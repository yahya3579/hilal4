import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../Loader/loader";
import { CommonCard1English } from "../shared/english/CommonCard1English";
import useAuthStore from "../../utils/store";

const HilalMiscEnglish = () => {
    // Get publications from store
    const publications = useAuthStore((state) => state.publications);
    
    // Find the Hilal English publication dynamically
    const hilalEnglishPub = publications.find(pub => 
        pub.name === 'hilal-english' || 
        pub.id === 1
    );

    const { data: articles, isLoading, error } = useQuery({
        queryKey: ["articles", "misc", hilalEnglishPub?.name || 'hilal-english'],
        queryFn: async () => {
            if (!hilalEnglishPub) {
                console.warn('Hilal English publication not found');
                return [];
            }

            const params = new URLSearchParams();
            params.append('publication', hilalEnglishPub.name);
            params.append('category', 'misc'); // Use category name "misc"
            params.append('count', '6');
            
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
            return res.data.data || [];
        },
        enabled: !!hilalEnglishPub, // Only run query if publication is found
    });


    if (isLoading) return <Loader />;
    if (error) return <p>Error fetching articles</p>;

    // Shuffle articles randomly
    const shuffledArticles = [...articles].sort(() => Math.random() - 0.5);

    return (
        <div className="py-2 px-4 font-poppins">
            {/* Header */}
            <div className="border-t-[3px] border-red-600">
                <div className="bg-white py-2 mb-2">
                    <h2 className="heading-text-primary">Hilal Misc</h2>
                </div>

                {/* Images Grid */}
                <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
                    {shuffledArticles.slice(0, 6).map((article) => (
                        <CommonCard1English key={article.id} article={article} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HilalMiscEnglish;