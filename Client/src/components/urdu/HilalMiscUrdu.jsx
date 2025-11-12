import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../Loader/loader";
import CommonCard1Urdu from "../shared/urdu/CommonCard1Urdu";
import { getCurrentMonthYear } from "../../utils/dateUtils";

const fetchArticlesByCategory = async (category) => {
    // First, get the category ID by name
    const categoriesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/active/`)
    const categories = categoriesRes.data.data || []
    const categoryObj = categories.find(cat => cat.name === category)
    
    if (!categoryObj) {
        throw new Error(`Category '${category}' not found`)
    }
    
    // Then fetch articles using the filtered API
    const params = new URLSearchParams()
    params.append('category_id', categoryObj.id.toString())
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`)
    return res.data.data;
};

const HilalMiscUrdu = () => {
    const { data: articles, isLoading, error } = useQuery({
        queryKey: ["articles", "misc-urdu"],
        queryFn: () => fetchArticlesByCategory("misc-urdu"),
    });


    if (isLoading) return <Loader />;
    if (error) return <p>Error fetching articles</p>;

    // Shuffle articles randomly
    const shuffledArticles = [...(articles || [])].sort(() => Math.random() - 0.5);

    // return (
    //     <div className="py-2 px-4 font-poppins">
    //         {/* Header */}
    //         <div className="border-t-[3px] border-red-600">
    //             <div className="bg-white py-2 mb-2 flex justify-between items-center">
    //                 <span className="text-sm text-gray-600 font-medium">
    //                     {getCurrentMonthYear()}
    //                 </span>
    //                 <h2 className="heading-text-primary font-urdu-nastaliq-sm1" dir='rtl'>متفرقات</h2>
    //             </div>

    //             {/* Images Grid */}
    //             <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
    //                 {shuffledArticles.slice(0, 6).map((article) => (
    //                     <CommonCard1Urdu key={article.id} article={article} />
    //                 ))}
    //             </div>
    //         </div>
    //     </div>
    // );
};

export default HilalMiscUrdu;
