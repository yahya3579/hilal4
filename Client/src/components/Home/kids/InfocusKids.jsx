import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../../Loader/loader";
import CommonCard2English from "../../shared/english/CommonCard2English";
import CommonCard3English from "../../shared/english/CommonCard3English";


const InFocusKidsSection = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["articles", "in-focus", "Hilal Kids"],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('publication', 'Hilal Kids');
            params.append('category_id', '14'); // in-focus category for Hilal Kids
            params.append('count', '5');
            
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
            return res.data.data || [];
        },
    });

    if (isLoading) return <Loader />;
    if (error) return <p className="p-4 text-red-500">Error fetching articles</p>;

    return (
        <div className="bg-white font-poppins px-4 py-2">
            {/* In Focus Header */}
            <div className="border-t-[3px] border-red-600">
                <div className="py-2">
                    <h2 className="heading-text-primary">IN - FOCUS</h2>
                </div>

                <div className="py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Large Featured Article */}
                        {data.length > 0 && (
                            <CommonCard2English key={data[0].id} data={data} />
                        )}

                        {/* Smaller Articles */}
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                            {data.slice(1, 5).map((article) => (
                                <CommonCard3English key={article.id} article={article} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InFocusKidsSection;
