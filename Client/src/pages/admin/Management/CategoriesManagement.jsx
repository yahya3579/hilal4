import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loader from '../../../components/Loader/loader';
import { useToast } from '../../../context/ToastContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchPublications } from '../../../utils/fetchPublications';

// API calls
const fetchCategories = async (page = 1, pageSize = 50, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    
    // Add filters to params
    if (filters.status) params.append('status', filters.status);
    if (filters.publication) params.append('publication', filters.publication);
    if (filters.search) params.append('search', filters.search);
    
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/?${params.toString()}`);
    return {
        data: res.data.data || [],
        pagination: res.data.pagination || {}
    };
};

const deleteCategory = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/category/${id}/`);
};

const CategoriesManagement = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    
    // Filter state
    const [filters, setFilters] = useState({
        status: '',
        publication: '',
        search: ''
    });
    const [searchInput, setSearchInput] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput }));
            setCurrentPage(1); // Reset to first page on search
        }, 500);
        
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch publications for filter dropdown
    useEffect(() => {
        fetchPublications();
    }, []);

    const { data: queryData, isLoading, error } = useQuery({
        queryKey: ["categories", currentPage, pageSize, filters],
        queryFn: () => fetchCategories(currentPage, pageSize, filters),
    });
    
    // Extract data and pagination info
    const categories = queryData?.data || [];
    const pagination = queryData?.pagination || {
        current_page: 1,
        page_size: pageSize,
        total_count: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
    };
    
    // Get publications from store for filter dropdown
    const publications = useQuery({
        queryKey: ["publications-active"],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/publications/active/`);
            return res.data.data || [];
        },
    }).data || [];

    const mutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            showToast("Category deleted successfully!", "success");
            queryClient.invalidateQueries(["categories"]);
            // If current page becomes empty after deletion, go to previous page
            if (categories.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        },
        onError: (error) => {
            showToast(`Error deleting category: ${error.response?.data || error.message}`, "error");
        },
    });
    
    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1); // Reset to first page when filter changes
    };
    
    // Clear all filters
    const clearFilters = () => {
        setFilters({
            status: '',
            publication: '',
            search: ''
        });
        setSearchInput('');
        setCurrentPage(1);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            mutation.mutate(id);
        }
    };

    if (isLoading) return <Loader />;
    if (error) return <p>Error fetching categories</p>;

    return (
        <>
            {/* Custom Scrollbar Styles */}
            <style>{`
                .categories-management-container::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .categories-management-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .categories-management-container::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .categories-management-container::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                /* For Firefox */
                .categories-management-container {
                    scrollbar-width: thin;
                    scrollbar-color: #888 #f1f1f1;
                }
            `}</style>
            <div className="p-6 bg-white min-h-screen categories-management-container overflow-y-auto max-h-screen">
            {/* Header */}
            <div className="relative mb-6">
                <h1 className="font-medium text-[32.21px] leading-[100%] tracking-[-0.03em] uppercase font-poppins text-[#DF1600] text-center mx-auto w-fit">
                    Categories Management
                </h1>

                {/* New Category Button - Top Left */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <Link to="/admin/category/create">
                        <button className="bg-[#DF0404] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-bold text-[14px] leading-[100%] tracking-[-0.01em] font-poppins">
                            New Category
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
                
                {/* Search by Name/Display Name */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                        Search by Name or Display Name
                    </label>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Enter category name or display name to search..."
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-poppins"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-poppins bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

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
                                <option key={pub.id} value={pub.id}>
                                    {pub.display_name || pub.name}
                                </option>
                            ))}
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
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total_count || 0)} of {pagination.total_count || 0} categories
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                {(!categories || categories.length === 0) ? (
                    <p className="text-center text-gray-500 font-poppins text-lg">No categories found.</p>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="text-left py-3 px-4 text-[#DF1600] font-medium text-[15px] capitalize font-poppins">No</th>
                                <th className="text-left py-3 px-4 text-[#DF1600] font-medium text-[15px] capitalize font-poppins">Name</th>
                                <th className="text-left py-3 px-4 text-[#DF1600] font-medium text-[15px] capitalize font-poppins">Display Name</th>
                                <th className="text-left py-3 px-4 text-[#DF1600] font-medium text-[15px] capitalize font-poppins">Publication</th>
                                <th className="text-left py-3 px-4 text-[#DF1600] font-medium text-[15px] capitalize font-poppins">Status</th>
                                <th className="text-left py-3 px-4 text-[#DF1600] font-medium text-[15px] capitalize font-poppins">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category, index) => (
                                <tr
                                    key={category.id}
                                    className="border-b-[0.5px] border-[#292D32] hover:bg-gray-50"
                                >
                                    <td className="py-4 px-4 text-gray-700">{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">{category.name}</span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">{category.display_name}</span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">{category.publication_name || 'No publication'}</span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <button className={`px-4 py-1 rounded text-[10.89px] font-bold ${category.status === "Active" ? "bg-[#31AB5A] text-white" : "bg-gray-400 text-white"}`}>
                                            {category.status}
                                        </button>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <select
                                            defaultValue=""
                                            className="border border-gray-300 rounded px-3 py-1 text-sm bg-white text-[10.89px] font-poppins"
                                            onChange={(e) => {
                                                const action = e.target.value;
                                                if (action === "edit") {
                                                    window.location.href = `/admin/category/edit/${category.id}`;
                                                } else if (action === "delete") {
                                                    if (window.confirm("Are you sure you want to delete this category?")) {
                                                        handleDelete(category.id);
                                                    }
                                                }
                                                e.target.value = ""; // Reset dropdown
                                            }}
                                        >
                                            <option disabled value="">Action</option>
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
            {pagination && pagination.total_pages > 0 && categories.length > 0 && (
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

export default CategoriesManagement;
