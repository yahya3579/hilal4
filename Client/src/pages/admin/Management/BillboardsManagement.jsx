import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../utils/store';
import { create } from 'zustand';
import Loader from '../../../components/Loader/loader';
import { useToast } from "../../../context/ToastContext";
import { getBillboardImageUrl } from "../../../utils/fileManager";
import { ChevronLeft, ChevronRight } from 'lucide-react';
// Table columns configuration
const columns = [
    { key: "image", label: "Image" },
    { key: "title", label: "Title" },
    { key: "created", label: "Created" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
];

// API calls
const fetchBillboards = async (page = 1, pageSize = 50, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    
    // Add filters
    if (filters.location) {
        params.append('location', filters.location);
    }
    if (filters.status) {
        params.append('status', filters.status);
    }
    if (filters.search) {
        params.append('search', filters.search);
    }
    
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/get-billboards/?${params.toString()}`);
    console.log("Fetched billboards:", res.data.data);
    return {
        data: res.data.data || [],
        pagination: res.data.pagination || {}
    };
};

const deleteBillboard = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/billboard/${id}/`);
};

const BillboardsManagement = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // Initialize query client for refetching
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    
    // Filter state
    const [filters, setFilters] = useState({
        location: '',
        status: '',
        search: ''
    });
    
    // Search input state (for debouncing)
    const [searchInput, setSearchInput] = useState('');
    
    // Location mapping
    const locationMapping = {
        "1": "Armed Forces Section",
        "2": "Advertisement 1",
        "3": "Advertisement 2",
        "4": "Trending Publication Section",
        "5": "Reader's Opinion 1",
        "6": "Reader's Opinion 2",
    };

    const { data: queryData, isLoading, error } = useQuery({
        queryKey: ['billboards', currentPage, pageSize, filters],
        queryFn: () => fetchBillboards(currentPage, pageSize, filters),
    });
    
    // Extract data and pagination info
    const data = queryData?.data || [];
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
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page when filter changes
    };
    
    // Clear all filters
    const clearFilters = () => {
        setFilters({
            location: '',
            status: '',
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
        mutationFn: deleteBillboard,
        onSuccess: () => {
            showToast("Billboard deleted successfully!", "success");
            queryClient.invalidateQueries(['billboards']); // Refetch billboards data
            // If current page becomes empty after deletion, go to previous page
            if (data.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        },
        onError: (error) => {
            showToast(`Error deleting billboard: ${error.response?.data || error.message}`, "error");
        },
    });

    if (isLoading) return <Loader />;
    if (error && !data) return <p className="p-4 text-red-500">Error fetching billboards</p>;

    return (
        <>
            {/* Custom Scrollbar Styles */}
            <style>{`
                .billboard-management-container::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .billboard-management-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .billboard-management-container::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .billboard-management-container::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                /* For Firefox */
                .billboard-management-container {
                    scrollbar-width: thin;
                    scrollbar-color: #888 #f1f1f1;
                }
            `}</style>
            <div className="p-6 bg-white min-h-screen billboard-management-container overflow-y-auto max-h-screen">
            {/* Header */}
            <div className="relative mb-6">
                <h1 className="font-medium text-[32.21px] leading-[100%] tracking-[-0.03em] uppercase font-poppins text-[#DF1600] text-center mx-auto w-fit">
                    Billboard Management
                </h1>

                {/* New Billboard Button - Top Left */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <Link to="/admin/edit-billboard">
                        <button className="bg-[#DF0404] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-bold text-[14px] leading-[100%] tracking-[-0.01em] font-poppins">
                            New Billboard
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
                        placeholder="Search billboards by title..."
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-poppins bg-white focus:outline-none focus:ring-2 focus:ring-[#DF0404] focus:border-transparent"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Location Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                            Location
                        </label>
                        <select
                            value={filters.location}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-poppins bg-white"
                        >
                            <option value="">All Locations</option>
                            {Object.entries(locationMapping).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>

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
                            <option value="Disabled">Disabled</option>
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
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total_count || 0)} of {pagination.total_count || 0} billboards
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                {(!data || data.length === 0) && !error ? (
                    <p className="text-center text-gray-500 font-poppins text-lg">No billboards found.</p>
                ) : error ? (
                    <p className="text-center text-red-500 font-poppins text-lg">Error fetching billboards</p>
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
                            {data.map((item, index) => (
                                <tr
                                    key={index}
                                    className="border-b-[0.5px] border-[#292D32] hover:bg-gray-50"
                                >
                                    <td className="py-4 px-4 text-gray-700">{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <img
                                            src={getBillboardImageUrl(item.image)}
                                            alt="Billboard"
                                            className="w-[120px] h-[47px] object-cover"
                                        />
                                    </td>

                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">{item.title}</span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">{item.created}</span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <span className="font-medium text-[12.7px] font-poppins">
                                            {locationMapping[item.location] || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">
                                        <button className="bg-[#31AB5A] text-white px-4 py-1 rounded text-[10.89px] font-bold">
                                            {item.status}
                                        </button>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">

                                        <select
                                            defaultValue=""
                                            className="border border-gray-300 rounded px-3 py-1 text-sm bg-white text-[10.89px] font-poppins"
                                            onChange={(e) => {
                                                const action = e.target.value;

                                                if (action === "edit") {
                                                    navigate(`/admin/edit-billboard/${item.id}`);
                                                } else if (action === "preview") {
                                                    console.log("Preview Billboard:", item.id);
                                                } else if (action === "delete") {
                                                    if (window.confirm("Are you sure you want to delete this Billboard?")) {
                                                        mutation.mutate(item.id);
                                                    }
                                                }

                                                // Reset select so next selection always fires onChange
                                                e.target.value = "";
                                            }}
                                        >
                                            <option disabled value="">Action</option>
                                            {/* Uncomment if needed */}
                                            {/* <option value="preview">Preview</option> */}
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
            {pagination && pagination.total_pages > 0 && data.length > 0 && (
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


export default BillboardsManagement;
