import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const SearchResults = () => {
    const location = useLocation();
    const [allArticles, setAllArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 10;

    // Get query param
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";

    // Filter articles based on search query
    const filteredArticles = allArticles.filter(article => {
        const q = query.toLowerCase();
        const stripHtml = (html) => html ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
        return (
            (article.title && article.title.toLowerCase().includes(q)) ||
            (article.description && stripHtml(article.description).toLowerCase().includes(q)) ||
            (article.author_name && article.author_name.toLowerCase().includes(q))
        );
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const currentArticles = filteredArticles.slice(startIndex, endIndex);

    useEffect(() => {
        if (!query) return;
        setLoading(true);
        setError(null);
        setCurrentPage(1); // Reset to first page on new search
        
        axios
            .get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/`)
            .then((res) => {
                const articles = res.data.data || [];
                console.log("Fetched articles:", articles);
                setAllArticles(articles);
                setLoading(false);
            })
            .catch((err) => {
                setError("Failed to fetch articles.");
                setLoading(false);
            });
    }, [query]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 min-h-[60vh]">
            <h2 className="text-2xl font-bold mb-6 text-[#DF1600]">Search Results for "{query}"</h2>
            
            {loading && <div className="text-gray-500 text-center py-8">Loading...</div>}
            {error && <div className="text-red-500 text-center py-8">{error}</div>}
            
            {!loading && !error && filteredArticles.length === 0 && (
                <div className="text-gray-500 text-center py-8">No articles found for "{query}"</div>
            )}

            {!loading && !error && filteredArticles.length > 0 && (
                <>
                    {/* Results count */}
                    <div className="text-gray-600 mb-4">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} results
                    </div>

                    {/* Responsive grid for articles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
                        {currentArticles.map((article) => (
                            <div key={article.id} className="bg-white rounded-lg shadow-md p-0 border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
                                {/* Article Cover Image */}
                                <div className="w-full h-48 overflow-hidden bg-gray-100">
                                    {article.cover_image ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/media/uploads/articles/${article.cover_image}`}
                                            alt={article.title || "Article cover"}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 border-2 border-solid"
                                            style={{ borderColor: '#df1600' }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <div className="text-center text-gray-500">
                                                <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-sm font-medium">No Image</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Article Content */}
                                <div className="p-5">
                                    <a href={`/article/${article.id}`} className="text-lg font-semibold text-[#DF1600] mb-2 hover:underline block line-clamp-2">
                                        {article.title}
                                    </a>
                                
                                {/* Article meta info */}
                                <div className="text-sm text-gray-500 mb-2">
                                    {article.author_name && <span>By {article.author_name}</span>}
                                    {article.publish_date && (
                                        <span className="ml-2">
                                            • {new Date(article.publish_date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {/* Article description */}
                                <div
                                    className="text-gray-700 mb-3 line-clamp-3 text-sm"
                                    dangerouslySetInnerHTML={{
                                        __html: article.description
                                            ? article.description.replace(/<img[^>]*>/gi, "").slice(0, 120) + "..."
                                            : (article.content?.slice(0, 120) + "...")
                                    }}
                                />
                                
                                    <a href={`/article/${article.id}`} className="text-red-600 hover:underline font-medium text-sm">
                                        Read More →
                                    </a>
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
                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Previous
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                                // Show first page, last page, current page, and pages around current page
                                const shouldShow = 
                                    pageNumber === 1 || 
                                    pageNumber === totalPages || 
                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                                
                                if (!shouldShow) {
                                    // Show ellipsis for gaps
                                    if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                        return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                                    }
                                    return null;
                                }

                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            currentPage === pageNumber
                                                ? 'bg-[#DF1600] text-white'
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
                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResults;
