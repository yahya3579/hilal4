import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "../Loader/loader";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import useAuthStore from "../../utils/store";

// Fetch previous month magazines for a specific publication
const fetchPreviousMonthMagazines = async (publicationName) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/magazines/previous/${encodeURIComponent(publicationName)}/`);
        return res.data.data || [];
    } catch (error) {
        console.error("Error fetching previous month magazines:", error);
        return [];
    }
};

// Get publication-specific styling and text dynamically
const getPublicationConfig = (publicationName, publications, isUrdu) => {
    const publication = publications.find(pub => pub.name === publicationName);
    
    if (!publication) {
        // Check if it's Hilal Urdu or Hilal Urdu Kids for fallback
        const isUrduPub = publicationName.toLowerCase().includes('urdu') || isUrdu;
        const isHilalUrdu = publicationName.toLowerCase() === 'hilal-urdu' || publicationName.toLowerCase().includes('hilal urdu');
        const isHilalUrduKids = publicationName.toLowerCase() === 'hilal-urdu-kids' || publicationName.toLowerCase().includes('hilal urdu kids') || publicationName.toLowerCase().includes('hilal kids urdu');
        
        let fallbackDisplayName = publicationName.toUpperCase();
        let fallbackTitle = `${publicationName} - Previous Month Issues`;
        let fallbackTitleClass = "heading-text-primary";
        let fallbackTitleDir = "ltr";
        
        if (isUrduPub && isHilalUrduKids) {
            fallbackDisplayName = 'ہلال بچوں کے لیے اردو';
            fallbackTitle = 'ہلال بچوں کے لیے اردو - گزشتہ ماہ کے شمارے';
            fallbackTitleClass = "heading-text-primary font-urdu-nastaliq-sm1";
            fallbackTitleDir = "rtl";
        } else if (isUrduPub && isHilalUrdu) {
            fallbackDisplayName = 'ہلال اردو';
            fallbackTitle = 'ہلال اردو - گزشتہ ماہ کے شمارے';
            fallbackTitleClass = "heading-text-primary font-urdu-nastaliq-sm1";
            fallbackTitleDir = "rtl";
        }
        
        // Fallback config
        return {
            title: fallbackTitle,
            titleClass: fallbackTitleClass,
            titleDir: fallbackTitleDir,
            fallbackText: fallbackDisplayName,
            badgeColor: "bg-red-600",
            gradientFrom: "from-red-500",
            gradientTo: "to-red-700",
            textColor: "text-red-600",
            routePrefix: "/articles"
        };
    }

    let displayName = publication.display_name || publication.name;
    const isUrduPublication = publicationName.toLowerCase().includes('urdu') || isUrdu;
    
    // Convert publication names to Urdu script for Urdu publications
    if (isUrduPublication) {
        const pubNameLower = publicationName.toLowerCase();
        const displayNameLower = displayName.toLowerCase();
        
        // Check for Hilal Urdu Kids first (more specific)
        if (pubNameLower === 'hilal-urdu-kids' || 
            pubNameLower.includes('hilal urdu kids') || 
            pubNameLower.includes('hilal kids urdu') ||
            displayNameLower.includes('hilal urdu kids') ||
            displayNameLower.includes('hilal kids urdu')) {
            displayName = 'ہلال بچوں کے لیے اردو';
        } 
        // Check for Hilal Urdu
        else if (pubNameLower === 'hilal-urdu' || 
                 displayNameLower.includes('hilal urdu')) {
            displayName = 'ہلال اردو';
        }
    }
    
    return {
        title: isUrduPublication 
            ? `${displayName} - گزشتہ ماہ کے شمارے`
            : `${displayName} - Previous Month Issues`,
        titleClass: isUrduPublication 
            ? "heading-text-primary font-urdu-nastaliq-sm1"
            : "heading-text-primary",
        titleDir: isUrduPublication ? "rtl" : "ltr",
        fallbackText: isUrduPublication ? displayName : displayName.toUpperCase(),
        badgeColor: "bg-red-600",
        gradientFrom: "from-red-500",
        gradientTo: "to-red-700",
        textColor: "text-red-600",
        routePrefix: "/articles"
    };
};

// No more static cover images - use dynamic data from API

const PreviousMonth = ({ publicationName = "Hilal English", isUrdu = false }) => {
    // Get publications from store
    const publications = useAuthStore((state) => state.publications);
    const loadingPublications = useAuthStore((state) => state.loadingPublications);
    
    const { data: magazines = [], isLoading, error } = useQuery({
        queryKey: ["previousMonthMagazines", publicationName],
        queryFn: () => fetchPreviousMonthMagazines(publicationName),
        enabled: !!publicationName,
    });

    if (loadingPublications || isLoading) return <Loader />;
    if (error) return <p>Error fetching previous month magazines</p>;

    const config = getPublicationConfig(publicationName, publications, isUrdu);

    // Sort magazines by year and month (newest first)
    const sortedMagazines = [...magazines].sort((a, b) => {
        // First compare by year
        if (b.year !== a.year) {
            return b.year - a.year;
        }
        // If years are equal, compare by month
        return b.month_num - a.month_num;
    });

    // Handle magazine click - download PDF if available, otherwise navigate to articles
    const handleMagazineClick = (e, magazine) => {
        e.preventDefault();
        
        // If magazine has doc_url, download the PDF directly
        if (magazine.doc_url) {
            // Create a temporary link to download the PDF
            const link = document.createElement('a');
            link.href = `${import.meta.env.VITE_API_URL}/media/uploads/magazinesPdf/${magazine.doc_url}`;
            link.download = `${magazine.title || publicationName} - ${magazine.month} ${magazine.year}.pdf`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Navigate to articles page
            window.location.href = `${config.routePrefix}?publication=${encodeURIComponent(magazine.publication.name)}&magazine=${magazine.id}`;
        }
    };

    return (
        <div className="bg-white w-full font-poppins px-4">
            <div className="border-t-[3px] border-red-600">
                <div className="py-2">
                    <h2 className={config.titleClass} dir={config.titleDir}>
                        {config.title}
                    </h2>
                </div>

                {/* Month Cards Grid */}
                <div className="mt-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedMagazines.map((magazine) => {
                            const date = new Date(magazine.year, magazine.month_num - 1, 1);
                            const monthName = isUrdu 
                                ? date.toLocaleDateString('ur-PK', { month: 'long' })
                                : date.toLocaleDateString('en-US', { month: 'long' });
                            const year = magazine.year;
                            
                            return (
                                <div 
                                    key={magazine.id}
                                    onClick={(e) => handleMagazineClick(e, magazine)}
                                    className="overflow-hidden w-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer bg-white block rounded-lg group"
                                >
                                    {/* Month Cover */}
                                    <div className="relative h-64 overflow-hidden">
                                        {magazine.cover_image ? (
                                            <img
                                                loading="lazy"
                                                src={`${import.meta.env.VITE_API_URL}/media/uploads/magazines/${magazine.cover_image}`}
                                                alt={`${publicationName} ${monthName} ${year}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    // Fallback to gradient if image fails to load
                                                    e.target.style.display = 'none';
                                                    e.target.nextElementSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        
                                        {/* Fallback gradient (hidden by default, shown if image fails) */}
                                        <div className={`w-full h-full bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} flex items-center justify-center ${magazine.cover_image ? 'hidden' : 'flex'}`}>
                                            <div className="text-center text-white">
                                                <div className="text-3xl font-bold mb-2">{magazine.title || config.fallbackText}</div>
                                                <div className="text-lg">{monthName} {year}</div>
                                            </div>
                                        </div>
                                        
                                        {/* Overlay with month info */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="text-white">
                                                <h3 className="text-lg font-bold mb-1">{magazine.title || config.fallbackText}</h3>
                                                <p className="text-sm opacity-90">{monthName} {year}</p>
                                                {/* <p className="text-xs mt-2">
                                                    {magazine.article_count} {isUrdu ? 'مضامین' : 'Articles'}
                                                </p> */}
                                            </div>
                                        </div>
                                        
                                        {/* Article Count Badge */}
                                        {/* <div className={`absolute top-2 right-2 ${config.badgeColor} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                                            {magazine.article_count}
                                        </div> */}
                                        
                                        {/* PDF Download Indicator */}
                                        {magazine.doc_url && (
                                            <div className="absolute top-2 left-2 bg-green-600 text-white p-2 rounded-full">
                                                <Download className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Month Info */}
                                    {/* <div className="p-4">
                                        <h3 className="font-semibold text-gray-800 mb-1 text-center" dir={config.titleDir}>
                                            {magazine.title || `${config.fallbackText} ${monthName} ${year}`}
                                        </h3>
                                        <p className="text-sm text-gray-600 text-center mb-2" dir={config.titleDir}>
                                            {magazine.article_count} {isUrdu ? 'مضامین' : 'Articles'}
                                        </p>
                                        <div className={`text-xs ${config.textColor} font-medium text-center`} dir={config.titleDir}>
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
                </div>
            </div>
        </div>
    );
};

export default PreviousMonth;
