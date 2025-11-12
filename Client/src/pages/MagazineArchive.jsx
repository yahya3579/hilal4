import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "../components/Loader/loader";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import useAuthStore from "../utils/store";

// Helper function to get magazine config from publications store
const getMagazineConfig = (publicationName, publications) => {
    const publication = publications.find(pub => pub.name === publicationName);
    if (!publication) return null;
    
    return {
        name: publication.display_name || publication.name,
        coverImage: publication.cover_image,
        description: publication.description
    };
};

const fetchFilteredMagazineArticles = async (filters) => {
    try {
        const params = new URLSearchParams();
        
        if (filters.year) params.append('year', filters.year);
        // Only add month parameter if it's not "all"
        if (filters.month && filters.month !== 'all') params.append('month', filters.month);
        if (filters.publication) params.append('publication', filters.publication);
        
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/magazine-filtered/?${params.toString()}`);
        const magazines = res.data.data || [];
        
        // Filter out current and future months
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        
        const filteredMagazines = magazines.filter(magazine => {
            // If magazine year is less than current year, include it
            if (magazine.year < currentYear) {
                return true;
            }
            // If magazine year equals current year, only include if month is before current month
            if (magazine.year === currentYear) {
                return magazine.month_num < currentMonth;
            }
            // If magazine year is greater than current year, exclude it
            return false;
        });
        
        return filteredMagazines;
    } catch (error) {
        console.error("Error fetching filtered magazine articles:", error);
        return [];
    }
};

// Group magazines by month and year
const groupMagazinesByMonthYear = (magazines) => {
    const groups = {};
    
    magazines.forEach(magazine => {
        const monthYear = `${magazine.year}-${String(magazine.month_num).padStart(2, '0')}`;
        const displayDate = `${magazine.month} ${magazine.year}`;
        
        if (!groups[monthYear]) {
            groups[monthYear] = {
                displayDate,
                magazines: []
            };
        }
        
        groups[monthYear].magazines.push(magazine);
    });
    
    // Sort groups by date (newest first)
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
    return sortedGroups;
};

const MagazineArchive = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Get publications from store
    const publications = useAuthStore((state) => state.publications);
    const loadingPublications = useAuthStore((state) => state.loadingPublications);
    
    // Get current date for default values
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Calculate previous month for default selection
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // Initialize filters from URL params or use defaults ("all" months)
    const [filters, setFilters] = useState({
        year: searchParams.get('year') || previousYear.toString(),
        month: searchParams.get('month') || 'all',
        publication: searchParams.get('publication') || 'hilal-english'
    });
    
    // Get magazine config based on publication filter
    const magazineType = filters.publication;
    const magazine = getMagazineConfig(magazineType, publications);
    const isUrdu = magazineType && magazineType.includes('urdu');
    
    // Update URL when filters change
    useEffect(() => {
        const newSearchParams = new URLSearchParams();
        if (filters.year) newSearchParams.set('year', filters.year);
        if (filters.month) newSearchParams.set('month', filters.month);
        if (filters.publication) newSearchParams.set('publication', filters.publication);
        
        setSearchParams(newSearchParams);
    }, [filters, setSearchParams]);
    
    const { data: magazines = [], isLoading, error } = useQuery({
        queryKey: ["filteredMagazineArticles", filters],
        queryFn: () => fetchFilteredMagazineArticles(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
    
    if (loadingPublications) return <Loader />;
    
    if (!magazine) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Magazine Not Found</h1>
                    <p className="text-gray-600 mb-4">Publication: {magazineType}</p>
                    <Link to="/magazines" className="text-blue-600 hover:underline">Go back to Magazines</Link>
                </div>
            </div>
        );
    }
    
    if (isLoading) return <Loader />;
    if (error) return <p>Error fetching magazines</p>;
    
    // Group magazines by month/year
    const groupedMagazines = groupMagazinesByMonthYear(magazines);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };
    
    const handleMonthYearChange = (magazine) => {
        // If magazine has doc_url, download the PDF directly
        if (magazine.doc_url) {
            // Create a temporary link to download the PDF
            const link = document.createElement('a');
            link.href = `${import.meta.env.VITE_API_URL}/media/uploads/magazinesPdf/${magazine.doc_url}`;
            link.download = `${magazine.title || magazine.publication_name} - ${magazine.month} ${magazine.year}.pdf`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Navigate to ArticlesList with magazine filter (no month/year needed)
            const params = new URLSearchParams();
            params.append('publication', magazine.publication_name);
            params.append('magazine', magazine.id);
            
            navigate(`/articles?${params.toString()}`);
        }
    };

    // Generate year options (1952 to previous year, or current year if we're not in current month)
    const yearOptions = [];
    const maxYear = currentMonth === 1 ? currentYear - 1 : currentYear; // If January, max year is previous year
    for (let year = 1952; year <= maxYear; year++) {
        yearOptions.push(year);
    }

    // Month options - filter out current and future months
    const allMonthOptions = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];
    
    // Filter month options based on selected year
    const monthOptions = allMonthOptions.filter(month => {
        const selectedYear = parseInt(filters.year);
        const monthNum = parseInt(month.value);
        
        // If selected year is current year, only show months before current month
        if (selectedYear === currentYear) {
            return monthNum < currentMonth;
        }
        // For previous years, show all months
        return true;
    });

    return (
        <div className={`min-h-screen bg-gray-50 ${isUrdu ? 'font-urdu-nastaliq-sm' : 'font-poppins'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
            {/* Header Section */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Magazine Cover */}
                        <div className="flex-shrink-0">
                            <img
                                src={magazine.coverImage}
                                alt={magazine.name}
                                className="w-32 h-40 object-cover rounded-lg shadow-lg"
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEyOCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjY0IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NYWdhemluZTwvdGV4dD4KPC9zdmc+';
                                }}
                            />
                        </div>
                        
                        {/* Magazine Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <Link to="/" className="text-gray-500 hover:text-gray-700">
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                                <h1 className={`text-3xl font-bold text-gray-800 ${isUrdu ? 'lg:text-right' : ''}`}>
                                    {magazine.name}
                                </h1>
                            </div>
                            <p className={`text-gray-600 mb-4 ${isUrdu ? 'lg:text-right' : ''}`}>
                                {magazine.description}
                            </p>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
                                    {magazines.length} {isUrdu ? 'میگزین' : 'Magazines'}
                                </span>
                                {groupedMagazines.length > 0 && (
                                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                                        {groupedMagazines.length} {isUrdu ? 'ماہ' : 'Months'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex flex-wrap gap-4">
                            {/* Year Filter */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    {isUrdu ? 'سال' : 'Year'}
                                </label>
                                <select
                                    value={filters.year}
                                    onChange={(e) => handleFilterChange('year', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    {yearOptions.map(year => (
                                        <option key={year} value={year.toString()}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Month Filter */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    {isUrdu ? 'مہینہ' : 'Month'}
                                </label>
                                <select
                                    value={filters.month}
                                    onChange={(e) => handleFilterChange('month', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="all">{isUrdu ? 'تمام' : 'All'}</option>
                                    {monthOptions.map(month => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Publication Filter */}
                            {/* <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    {isUrdu ? 'اشاعت' : 'Publication'}
                                </label>
                                <select
                                    value={filters.publication}
                                    onChange={(e) => handleFilterChange('publication', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    {publications.filter(pub => pub.status === 'Active').map(pub => (
                                        <option key={pub.id} value={pub.name}>
                                            {pub.display_name || pub.name}
                                        </option>
                                    ))}
                                </select>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Section - Month Cards Only */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {groupedMagazines.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {isUrdu ? 'کوئی میگزین دستیاب نہیں' : 'No Magazines Available'}
                        </h3>
                        <p className="text-gray-500">
                            {isUrdu ? 'اس اشاعت کے لیے کوئی میگزین نہیں ملا' : 'No magazines found for this publication'}
                        </p>
                    </div>
                ) : (
                    <>

                        {/* Month Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {groupedMagazines.map(([monthYear, group]) => {
                                const magazine = group.magazines[0]; // Get the first magazine from the group
                                const monthName = isUrdu 
                                    ? new Date(2000, magazine.month_num - 1, 1).toLocaleDateString('ur-PK', { month: 'long' })
                                    : magazine.month;
                                const year = magazine.year;
                                
                                return (
                                    <div 
                                        key={monthYear}
                                        onClick={() => handleMonthYearChange(magazine)}
                                        className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                                    >
                                        {/* Magazine Cover */}
                                        <div className="h-100 overflow-hidden relative">
                                            {magazine.cover_image ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/media/uploads/magazines/${magazine.cover_image}`}
                                                    alt={`${magazine.title} ${monthName} ${year}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                                                    <div className="text-center text-white">
                                                        <div className="text-4xl font-bold mb-2">{magazine.publication_display_name}</div>
                                                        <div className="text-lg">{monthName} {year}</div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* PDF Download Indicator */}
                                            {magazine.doc_url && (
                                                <div className="absolute top-2 left-2 bg-green-600 text-white p-2 rounded-full">
                                                    <Download className="w-4 h-4" />
                                                </div>
                                            )}
                                            
                                            {/* Overlay with magazine info */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="text-white">
                                                    <h3 className="text-lg font-bold mb-1">{magazine.title}</h3>
                                                    <p className="text-sm opacity-90">{monthName} {year}</p>
                                                    <p className="text-xs mt-2">{magazine.article_count} {isUrdu ? 'مضامین' : 'Articles'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Card Footer */}
                                        {/* <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 mb-1">
                                                {magazine.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {magazine.article_count} {isUrdu ? 'مضامین' : 'Articles'}
                                            </p>
                                            <div className="text-xs text-red-600 font-medium">
                                                {magazine.doc_url 
                                                    ? (isUrdu ? 'ڈاؤن لوڈ کے لیے کلک کریں' : 'Click to download PDF')
                                                    : (isUrdu ? 'مضامین دیکھنے کے لیے کلک کریں' : 'Click to view articles')
                                                }
                                            </div>
                                        </div> */}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MagazineArchive;
