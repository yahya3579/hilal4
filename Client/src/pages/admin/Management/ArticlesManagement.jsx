import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../utils/store';
import Loader from '../../../components/Loader/loader';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';


// Table columns configuration
const columns = [
    { key: "cover_image", label: "Article Cover" },
    { key: "title", label: "Article Title" },
    { key: "publication", label: "Publication" },
    { key: "magazine", label: "Magazine" },
    { key: "publish_date", label: "Publish Date" },
    { key: "writer", label: "Author" },
    { key: "visits", label: "Article Visits" },
    // { key: "issue_new", label: "Issue News" },
    // { key: "status", label: "Status" },
    { key: "category", label: "Category" },
    { key: "actions", label: "Actions" },
];

// API calls
const fetchArticles = async (userRole, userId, page = 1, pageSize = 50, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    
    // Add filters
    if (filters.publication) {
        params.append('publication', filters.publication);
    }
    if (filters.category_id) {
        params.append('category_id', filters.category_id.toString());
    }
    if (filters.magazine_id) {
        params.append('magazine_id', filters.magazine_id.toString());
    }
    if (filters.month) {
        params.append('month', filters.month.toString());
    }
    if (filters.year) {
        params.append('year', filters.year.toString());
    }
    if (filters.search) {
        params.append('search', filters.search);
    }

    
    if (userRole === "admin") {
        // Use filtered API to get all articles with pagination
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
        return {
            data: res.data.data || [],
            pagination: res.data.pagination || {}
        };
    } else if (userRole === "author") {
        // Use filtered API to get articles by user with pagination
        params.append('author_id', userId.toString());
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
        console.log("Fetched articles for author:", res.data.data);
        return {
            data: res.data.data || [],
            pagination: res.data.pagination || {}
        };
    }
    return { data: [], pagination: {} };
};

// Fetch publications for filter
const fetchPublications = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/publications/active/`);
    return res.data.data || [];
};

// Fetch categories for filter
const fetchCategories = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/active/`);
    return res.data.data || [];
};

const deleteArticle = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/article/${id}/`);
};

const ArticleManagement = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // Initialize query client for refetching
    const { showToast } = useToast(); // For toast notifications
    const userRole = useAuthStore((state) => state.userRole);
    const userId = useAuthStore((state) => state.userId);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    
    // Filter state
    const [filters, setFilters] = useState({
        publication: '',
        category_id: '',
        magazine_id: '',
        month: '',
        year: '',
        search: ''
    });
    
    // Search input state (for debouncing)
    const [searchInput, setSearchInput] = useState('');
    
    // Fetch publications and categories for filters
    const { data: publications = [] } = useQuery({
        queryKey: ['publications'],
        queryFn: fetchPublications,
    });
    
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });
    
    // Filter categories based on selected publication
    const filteredCategories = filters.publication 
        ? categories.filter(cat => {
            // Find publication by name or display_name
            const pub = publications.find(p => 
                p.name === filters.publication || p.display_name === filters.publication
            );
            return pub && cat.publication === pub.id;
        })
        : categories;

    const { data: queryData, isLoading, error } = useQuery({
        queryKey: ['articles', userRole, userId, currentPage, pageSize, filters],
        queryFn: () => fetchArticles(userRole, userId, currentPage, pageSize, filters),
    });

    // Extract data and pagination info
    const articles = queryData?.data || [];
    const pagination = queryData?.pagination || {
        current_page: 1,
        page_size: pageSize,
        total_count: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
    };
    
    // Handle filter change
    const handleFilterChange = (key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            // Reset category if publication changes
            if (key === 'publication') {
                newFilters.category_id = '';
            }
            return newFilters;
        });
        setCurrentPage(1); // Reset to first page when filter changes
    };
    
    // Clear all filters
    const clearFilters = () => {
        setFilters({
            publication: '',
            category_id: '',
            magazine_id: '',
            month: '',
            year: '',
            search: ''
        });
        setSearchInput('');
        setCurrentPage(1);
    };
    
    // Debounce search input (wait 500ms after user stops typing)
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput }));
            setCurrentPage(1); // Reset to first page when search changes
        }, 500);
        
        return () => clearTimeout(timer);
    }, [searchInput]);

    const mutation = useMutation({
        mutationFn: deleteArticle,
        onSuccess: () => {
            showToast("Article deleted successfully!", "success");
            queryClient.invalidateQueries(['articles']); // Refetch articles data
            // If current page becomes empty after deletion, go to previous page
            if (articles.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        },
        onError: (error) => {
            showToast(`Error deleting article: ${error.response?.data || error.message}`, "error");
        },
    });

    if (isLoading) return <Loader />;
    if (error) return <p className="p-4 text-red-500">Error fetching articles</p>;

    return (
        <>
            {/* Custom Scrollbar Styles */}
            <style>{`
                .article-management-container::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .article-management-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .article-management-container::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .article-management-container::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                /* For Firefox */
                .article-management-container {
                    scrollbar-width: thin;
                    scrollbar-color: #888 #f1f1f1;
                }
            `}</style>
            <div className="p-6 bg-white min-h-screen article-management-container overflow-y-auto max-h-screen">
            {/* Header */}
            <div className="relative mb-6">
                <h1 className="font-medium text-[32.21px] leading-[100%] tracking-[-0.03em] uppercase font-poppins text-[#DF1600] text-center mx-auto w-fit">
                    Article Management
                </h1>

                {/* New Article Button - Top Left */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <Link to="/admin/new-article">
                        <button className="bg-[#DF0404] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-bold text-[14px] leading-[100%] tracking-[-0.01em] font-poppins">
                            New Article
                        </button>
                    </Link>
                </div>

            </div>

            {/* Filter Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 font-poppins">Filters</h2>
                    <button
                        onClick={clearFilters}
                        className="text-sm text-[#DF0404] hover:text-red-700 font-medium font-poppins underline"
                    >
                        Clear All Filters
                    </button>
                </div>
                
                {/* Search Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                        Search by Title
                    </label>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search articles by title..."
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-poppins bg-white focus:outline-none focus:ring-2 focus:ring-[#DF0404] focus:border-transparent"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Publication Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                            Publication
                        </label>
                        <select
                            value={filters.publication}
                            onChange={(e) => handleFilterChange('publication', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-poppins bg-white"
                        >
                            <option value="">All Publications</option>
                            {publications.map((pub) => (
                                <option key={pub.id} value={pub.name}>
                                    {pub.display_name || pub.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                            Category
                        </label>
                        <select
                            value={filters.category_id}
                            onChange={(e) => handleFilterChange('category_id', e.target.value)}
                            disabled={!filters.publication}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-poppins bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">All Categories</option>
                            {filteredCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.display_name || cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Month Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                            Month
                        </label>
                        <select
                            value={filters.month}
                            onChange={(e) => handleFilterChange('month', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-poppins bg-white"
                        >
                            <option value="">All Months</option>
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                            Year
                        </label>
                        <select
                            value={filters.year}
                            onChange={(e) => handleFilterChange('year', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-poppins bg-white"
                        >
                            <option value="">All Years</option>
                            {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                );
                            })}
                    </select>
                    </div>
                </div>
            </div>

            {/* Pagination Controls - Top (Page Size Selector & Info) */}
            {pagination.total_pages > 0 && (
                <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 font-poppins">Show:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1); // Reset to first page when changing page size
                            }}
                            className="border border-gray-300 rounded px-3 py-1 text-sm font-poppins"
                        >
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <span className="text-sm text-gray-700 font-poppins">per page</span>
                    </div>

                    {/* Pagination Info */}
                    <div className="text-sm text-gray-700 font-poppins">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total_count || 0)} of {pagination.total_count || 0} articles
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                {(!articles || articles.length === 0) ? (
                    <p className="text-center text-gray-500 font-poppins text-lg">No articles found.</p>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="text-left py-3 px-4 text-[#DF1600] font-medium text-[15px] capitalize font-poppins">No</th>
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className="text-left py-3 px-4 text-[#DF1600] font-medium text-[15px] capitalize font-poppins"
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((item, index) => (
                                <tr
                                    key={index}
                                    className="border-b-[0.5px] border-[#292D32] hover:bg-gray-50"
                                >
                                    <td className="py-4 px-4 text-gray-700">{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/media/uploads/articles/${item.cover_image}`}
                                            alt="Article"
                                            className="w-[120px] h-[47px] object-cover"
                                        />
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">{item.title}</span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">
                                            {item.publication_display_name || item.publication_name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">
                                            {item.magazine_title || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">
                                            {new Date(item.publish_date).toLocaleDateString("en-GB")}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">
                                            {item.author_name || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">
                                            {item.visits}
                                        </span>
                                    </td>
                                    {/* <td className="py-4 px-4 text-gray-700">
                                        <button className="bg-black text-white px-3 py-1 text-[10.89px] font-bold rounded">
                                            {item.issue_new}
                                        </button>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <button className="bg-[#31AB5A] text-white px-4 py-1 rounded text-[10.89px] font-bold">
                                            {item.status}
                                        </button>
                                    </td> */}
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <select
                                            defaultValue=""
                                            className="border border-gray-300 rounded px-3 py-1 text-sm bg-white text-[10.89px] font-poppins"
                                            onChange={(e) => {
                                                const action = e.target.value;
                                                if (action === "edit") {
                                                    navigate(`/admin/new-article/${item.id}`);
                                                } else if (action === "preview") {
                                                    console.log("Preview article:", item.id);
                                                } else if (action === "delete") {
                                                    if (window.confirm("Are you sure you want to delete this article?")) {
                                                        mutation.mutate(item.id);
                                                    }
                                                }
                                            }}
                                        >
                                            <option disabled value="">Action</option>
                                            <option value="preview">Preview</option>
                                            <option value="edit">Edit</option>
                                            <option value="delete">Delete</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls - Bottom (Navigation Buttons) */}
            {pagination && pagination.total_pages > 0 && articles.length > 0 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={!pagination.has_previous || pagination.total_pages <= 1}
                        className={`px-3 py-1 rounded border font-poppins text-sm ${
                            !pagination.has_previous || pagination.total_pages <= 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                        }`}
                    >
                        First
                    </button>
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.has_previous || pagination.total_pages <= 1}
                        className={`px-3 py-1 rounded border font-poppins text-sm flex items-center gap-1 ${
                            !pagination.has_previous || pagination.total_pages <= 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                        }`}
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.total_pages || 0) }, (_, i) => {
                            let pageNum;
                            if (pagination.total_pages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= pagination.total_pages - 2) {
                                pageNum = pagination.total_pages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 rounded border font-poppins text-sm ${
                                        currentPage === pageNum
                                            ? 'bg-[#DF0404] text-white border-[#DF0404]'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.has_next || pagination.total_pages <= 1}
                        className={`px-3 py-1 rounded border font-poppins text-sm flex items-center gap-1 ${
                            !pagination.has_next || pagination.total_pages <= 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                        }`}
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(pagination.total_pages || 1)}
                        disabled={!pagination.has_next || pagination.total_pages <= 1}
                        className={`px-3 py-1 rounded border font-poppins text-sm ${
                            !pagination.has_next || pagination.total_pages <= 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                        }`}
                    >
                        Last
                    </button>
                </div>
            )}

        </div>
        </>
    );
};

export default ArticleManagement;
