import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "../components/Loader/loader";
import { ChevronLeft } from "lucide-react";

// Fetch articles for a specific month (Urdu magazines only)
const fetchMonthArticlesUrdu = async (monthYear) => {
    try {
        // Parse month and year from monthYear parameter
        const [year, month] = monthYear.split('-');
        const targetYear = parseInt(year);
        const targetMonth = parseInt(month); // API expects 1-indexed months
        
        // Use filtered API to get articles for specific month/year
        // We'll get all articles for the month and filter by publication on frontend
        const params = new URLSearchParams();
        params.append('month', targetMonth.toString());
        params.append('year', targetYear.toString());
        
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
        const allArticles = res.data.data || [];
        
        // Filter for Urdu publications (Hilal Urdu, Hilal Urdu Kids, Hilal Her)
        const urduPublications = ['Hilal Urdu', 'Hilal Urdu Kids', 'Hilal Her'];
        const monthArticles = allArticles.filter(article => {
            return urduPublications.includes(article.publication_display_name);
        });
        
        // Sort by date (newest first)
        return monthArticles.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
    } catch (error) {
        console.error("Error fetching month articles:", error);
        return [];
    }
};

const MonthArticlesUrdu = () => {
    const { monthYear } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 12;
    
    // Parse month and year for display
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = date.toLocaleDateString('ur-PK', { month: 'long' });
    const displayDate = `${monthName} ${year}`;

    // Scroll to top when component mounts or monthYear changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [monthYear]);
    
    const { data: articles = [], isLoading, error } = useQuery({
        queryKey: ["monthArticlesUrdu", monthYear],
        queryFn: () => fetchMonthArticlesUrdu(monthYear),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
    
    if (isLoading) return <Loader />;
    if (error) return <p>Error fetching articles</p>;
    
    // Pagination
    const totalPages = Math.ceil(articles.length / articlesPerPage);
    const startIndex = (currentPage - 1) * articlesPerPage;
    const currentArticles = articles.slice(startIndex, startIndex + articlesPerPage);
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-poppins" dir="rtl">
            {/* Header Section */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Back Button and Title */}
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <Link to="/hilal-urdu" className="text-gray-500 hover:text-gray-700">
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                                <h1 className="text-3xl font-bold text-gray-800 font-urdu-nastaliq-sm">
                                    ہلال {displayDate}
                                </h1>
                            </div>
                            <p className="text-gray-600 mb-4 font-urdu-nastaliq-sm">
                                {displayDate} کے مضامین جو دفاع، قومی مسائل اور حالات حاضرہ پر مبنی ہیں۔
                            </p>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
                                    {articles.length} مضامین
                                </span>
                                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                                    {displayDate}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Articles Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {articles.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2 font-urdu-nastaliq-sm">
                            کوئی مضمون دستیاب نہیں
                        </h3>
                        <p className="text-gray-500 font-urdu-nastaliq-sm">
                            {displayDate} کے لیے کوئی مضمون نہیں ملا
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Results Info */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-gray-600 font-urdu-nastaliq-sm">
                                دکھا رہے ہیں {startIndex + 1}-{Math.min(startIndex + articlesPerPage, articles.length)} از {articles.length} مضامین
                            </div>
                        </div>

                        {/* Articles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {currentArticles.map((article) => (
                                <div key={article.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                                    {/* Article Image */}
                                    {article.cover_image && (
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={article.cover_image}
                                                alt={article.article_title || article.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 border-2 border-solid"
                                                style={{ borderColor: '#df1600' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Article Content */}
                                    <div className="p-4">
                                        <Link 
                                            to={`/article/${article.id}`}
                                            className="text-lg font-semibold text-gray-800 hover:text-red-600 transition-colors line-clamp-2 mb-2 block font-urdu-nastaliq-sm text-right"
                                        >
                                            {article.article_title || article.title}
                                        </Link>
                                        
                                        {/* Article Meta */}
                                        <div className="text-sm text-gray-500 mb-3 text-right">
                                            {article.author_name && (
                                                <span className="font-urdu-nastaliq-sm">بذریعہ {article.author_name}</span>
                                            )}
                                            <span className="mr-2 font-urdu-nastaliq-sm">
                                                • {new Date(article.publish_date).toLocaleDateString('ur-PK', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        
                                        {/* Category */}
                                        {article.category_name && (
                                            <div className="mb-3 text-right">
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium font-urdu-nastaliq-sm">
                                                    {article.category_name}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Article Description */}
                                        {article.description && (
                                            <div 
                                                className="text-gray-600 text-sm line-clamp-3 mb-3 font-urdu-nastaliq-sm text-right"
                                                dangerouslySetInnerHTML={{
                                                    __html: article.description.replace(/<[^>]*>/g, '').slice(0, 150) + '...'
                                                }}
                                            />
                                        )}
                                        
                                        {/* Read More Link */}
                                        <Link 
                                            to={`/article/${article.id}`}
                                            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors float-left font-urdu-nastaliq-sm"
                                        >
                                            مزید پڑھیں ←
                                        </Link>
                                        <div className="clear-both"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                {/* Previous button */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-md text-sm font-medium font-urdu-nastaliq-sm ${
                                        currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    پچھلا
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 7) {
                                        pageNumber = i + 1;
                                    } else {
                                        if (currentPage <= 4) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 3) {
                                            pageNumber = totalPages - 6 + i;
                                        } else {
                                            pageNumber = currentPage - 3 + i;
                                        }
                                    }

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                                currentPage === pageNumber
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}

                                {/* Next button */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-md text-sm font-medium font-urdu-nastaliq-sm ${
                                        currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    اگلا
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MonthArticlesUrdu;
