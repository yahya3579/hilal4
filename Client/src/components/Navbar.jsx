import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaBars, FaTimes, FaSearch, FaWhatsapp } from "react-icons/fa";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../assets/hilal-logo.svg";
import hilalHerLogo from '../assets/hilal-logo-her.svg'
import hilalKidsLogo from '../assets/hilal-logo-kids.svg'
import hilalUrduLogo from '../assets/hilal-urdu.png'
import {
    Facebook,
    Youtube,
    Music2,
    Instagram,
    ChevronRight,
    Menu,
    X,
    ChevronDown,
} from "lucide-react";
import useAuthStore from '../utils/store';
import axios from "axios";
import { getDynamicCategoriesForPath, getCategoryUrl } from '../utils/categories';


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isMagazinesOpen, setIsMagazinesOpen] = useState(false);
    const [isEbookOpen, setIsEbookOpen] = useState(false);
    const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
    const [mobileMagazinesOpen, setMobileMagazinesOpen] = useState(false);
    const [mobileEbookOpen, setMobileEbookOpen] = useState(false);
    // Search popup state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef(null);
    // Get publications from store
    const publications = useAuthStore((state) => state.publications);
    const loadingPublications = useAuthStore((state) => state.loadingPublications);
    const currentPublication = useAuthStore((state) => state.currentPublication);
    
    // Get search params for URL parameters
    const [searchParams] = useSearchParams();
    // Focus input when popup opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);
    // Handle search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearchOpen(false);
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    const categoryRef = useRef(null);
    const magazinesRef = useRef(null);
    const ebookRef = useRef(null);



    const location = useLocation();

    // Dynamic logo mapping based on publication data from API
    const getLogoForPublication = (publicationName) => {
        const logoMap = {
            "hilal-english": Logo,
            "hilal-her": hilalHerLogo,
            "hilal-kids": hilalKidsLogo,
            "hilal-urdu-kids": hilalKidsLogo,
            "hilal-urdu": hilalUrduLogo,
            // Add fallback for new publications
            "hilal-digital": Logo,
            "hilal-test": Logo,
        };
        return logoMap[publicationName] || Logo; // Default to main logo for unknown publications
    };

    // Dynamic logo size mapping based on publication data from API
    const getLogoSizeForPublication = (publicationName) => {
        const sizeMap = {
            "hilal-english": "h-14 w-auto", // Default size for English logo
            "hilal-urdu": "h-25 w-auto", // Larger size for Urdu logo
            "hilal-urdu-kids": "h-12 w-45", // Smaller size for Kids Urdu logo
            "hilal-kids": "h-12 w-45", // Smaller size for Kids logo
            "hilal-her": "h-12 w-45", // Smaller size for Her logo
            // Add fallback for new publications
            "hilal-digital": "h-14 w-auto",
            "hilal-test": "h-14 w-auto",
        };
        return sizeMap[publicationName] || "h-14 w-auto"; // Default size for unknown publications
    };

    // Get current publication and logo dynamically
    const getCurrentPublicationAndLogo = () => {
        // Check if we're on a publication page (hilal-english, hilal-urdu, etc.)
        const isPublicationPage = publications.some(pub => location.pathname === `/${pub.name}`) || location.pathname === "/";
        
        let currentPub = null;
        
        if (isPublicationPage) {
            // On publication pages, find the publication from the current path
            const pathPublicationName = location.pathname === "/" ? "hilal-english" : location.pathname.substring(1);
            currentPub = publications.find(pub => pub.name === pathPublicationName);
        } else {
            // On other pages (ebooks, archives, etc.), use the stored publication
            currentPub = currentPublication;
        }
        
        // Fallback to hilal-english if no publication found
        if (!currentPub) {
            currentPub = publications.find(pub => pub.name === "hilal-english");
        }
        
        return currentPub;
    };
    
    const currentPub = getCurrentPublicationAndLogo();
    const currentLogo = currentPub ? getLogoForPublication(currentPub.name) : Logo;
    const currentLogoSize = currentPub ? getLogoSizeForPublication(currentPub.name) : "h-14 w-auto";
    
    // Store the current publication in the store when on publication pages
    useEffect(() => {
        if (currentPub && publications.length > 0) {
            const isPublicationPage = publications.some(pub => location.pathname === `/${pub.name}`) || location.pathname === "/";
            if (isPublicationPage) {
                useAuthStore.getState().setCurrentPublication(currentPub);
            }
        }
    }, [currentPub, location.pathname, publications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const navbar = document.querySelector("nav");
            if (navbar && !navbar.contains(event.target)) {
                setIsCategoryOpen(false);
                setIsMagazinesOpen(false);
                setIsEbookOpen(false);
            }
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }
            if (magazinesRef.current && !magazinesRef.current.contains(event.target)) {
                setIsMagazinesOpen(false);
            }
            if (ebookRef.current && !ebookRef.current.contains(event.target)) {
                setIsEbookOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isMenuOpen) {
            setMobileCategoryOpen(false);
            setMobileMagazinesOpen(false);
            setMobileEbookOpen(false);
        }
    };

    const closeMobileMenu = () => {
        setIsMenuOpen(false);
        setMobileCategoryOpen(false);
        setMobileMagazinesOpen(false);
        setMobileEbookOpen(false);
    };

    const handleCategoryClick = (e) => {
        e.stopPropagation();
        setIsCategoryOpen((prev) => !prev);
        setIsMagazinesOpen(false);
        setIsEbookOpen(false);
    };

    const handleMagazinesClick = (e) => {
        e.stopPropagation();
        setIsMagazinesOpen((prev) => !prev);
        setIsCategoryOpen(false);
        setIsEbookOpen(false);
    };

    const handleEbookClick = (e) => {
        e.stopPropagation();
        setIsEbookOpen((prev) => !prev);
        setIsCategoryOpen(false);
        setIsMagazinesOpen(false);
    };

    const handleDropdownLinkClick = () => {
        setIsCategoryOpen(false);
        setIsMagazinesOpen(false);
        setIsEbookOpen(false);
    };

    const accessToken = useAuthStore((state) => state.accessToken);
    const isAuthorized = useAuthStore((state) => state.isAuthorized);
    const clearTokens = useAuthStore((state) => state.clearTokens);
    const navigate = useNavigate();
    const userRole = useAuthStore((state) => state.userRole);
    console.log("User Role:", userRole);
    console.log("Is Authorized:", isAuthorized);


    // Helper function to generate route path from publication name using database data
    const getPublicationPath = (publicationName) => {
        const publications = useAuthStore.getState().publications;
        const publication = publications.find(pub => pub.name === publicationName || pub.display_name === publicationName);
        const name = publication ? publication.name : 'hilal-english';
        return `/${name}`;
    };

    // Enhanced click outside handler - only closes dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Only close if clicking completely outside the navbar area
            const navbar = document.querySelector("nav");
            if (navbar && !navbar.contains(event.target)) {
                setIsCategoryOpen(false);
                setIsMagazinesOpen(false);
                setIsEbookOpen(false);
            }

            // Individual dropdown close logic
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }
            if (
                magazinesRef.current &&
                !magazinesRef.current.contains(event.target)
            ) {
                setIsMagazinesOpen(false);
            }
            if (ebookRef.current && !ebookRef.current.contains(event.target)) {
                setIsEbookOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/logout/`, {}, { withCredentials: true });

            clearTokens();
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error?.response?.data || error.message);
        }
    };

    return (
        <nav className="relative bg-[#DF1600] text-white shadow-lg z-10">
            <div className="px-4 flex justify-between items-center  h-[75px] py-3 relative">
                {/* Logo Section */}
                <div className="absolute -bottom-3 left-4 top-0 flex items-center bg-white p-4 shadow-lg z-20">
                    <Link to="/">
                        <img
                            src={currentLogo}
                            alt="Hilal Publications"
                            className={currentLogoSize}
                        />
                    </Link>
                </div>

                {/* Enhanced Mobile Menu Button - Premium White Design */}
                <button
                    className="lg:hidden absolute right-4 ml-auto z-30 bg-white text-[#DF1600] p-3 rounded-2xl hover:bg-red-50 active:bg-red-100 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-30 shadow-2xl border-2 border-red-100 backdrop-blur-sm"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                {/* Desktop Navigation */}
                <div className={`hidden lg:flex items-center space-x-3 xl:space-x-6 ${currentPub?.name === "hilal-urdu" ? "ml-40 xl:ml-44" : "ml-56 xl:ml-60"}`}>
                    <ul className="flex space-x-2 xl:space-x-6 text-base xl:text-lg font-medium">
                        <Link to="/">
                            <li className="hover:underline cursor-pointer transition-all duration-200 hover:text-red-200">
                                Home
                            </li>
                        </Link>

                        <li className="relative group cursor-pointer" onClick={handleMagazinesClick}>
                            Magazines <FaChevronDown className="inline ml-1" />
                            {isMagazinesOpen && (
                                <ul className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50 border border-gray-200">
                                    {loadingPublications ? (
                                        <li className="block px-4 py-2 text-sm text-gray-500">
                                            Loading...
                                        </li>
                                    ) : (
                                        <>
                                            {publications.map((publication) => (
                                                <li key={publication.id} className="text-sm hover:bg-gray-100">
                                                    <Link 
                                                        to={getPublicationPath(publication.name)} 
                                                        className="block px-4 py-2 w-full"
                                                        onClick={handleDropdownLinkClick}
                                                    >
                                                        {publication.display_name}
                                                    </Link>
                                                </li>
                                            ))}
                                            <li className="text-sm hover:bg-gray-100 border-t border-gray-200">
                                                <Link 
                                                    to="/archives" 
                                                    className="block px-4 py-2 w-full"
                                                    onClick={handleDropdownLinkClick}
                                                >
                                                    Archives
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            )}
                        </li>

                        <li className="relative group cursor-pointer" onClick={handleCategoryClick}>
                            {getDynamicCategoriesForPath(location.pathname, searchParams).label} 
                            {
                                getDynamicCategoriesForPath(location.pathname, searchParams).categories.length > 0 && (
                                    <FaChevronDown className="inline ml-1" />
                                )
                            }
                            {isCategoryOpen && getDynamicCategoriesForPath(location.pathname, searchParams).categories.length > 0 && (
                                <ul className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50 border border-gray-200">
                                    {getDynamicCategoriesForPath(location.pathname, searchParams).categories.map((category) => (
                                        <li key={category.id} className="hover:bg-red-50">
                                            <Link
                                                to={getCategoryUrl(category.id, location.pathname, searchParams, true)}
                                                className="block px-4 py-3 hover:text-red-600 transition-all duration-200 text-sm font-medium"
                                                onClick={handleDropdownLinkClick}
                                            >
                                                {category.displayName}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                        
                        <li className="relative group cursor-pointer" onClick={handleEbookClick}>
                            <Link 
                            className="hover:underline transition-all duration-200 hover:text-red-200" to="/ebooks">E-Book</Link>
                            {isEbookOpen && (
                                // Removed all dropdown options for E-Book
                                <ul>
                                    {/* No options for now - dropdown intentionally left empty */}
                                </ul>
                            )}
                        </li>


                        <li className="hover:underline cursor-pointer">
                            <Link
                                to="/ourcontributors"
                                className="hover:underline transition-all duration-200 hover:text-red-200"
                            >
                                Our Contributors
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="flex items-center space-x-1 xl:space-x-2 ml-auto">
                    {/* Social Media Icons */}
                    <div className="hidden lg:flex items-center space-x-2">
                        <a 
                            href="https://www.facebook.com/hilaldigital0/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white hover:text-red-200 transition-all duration-200"
                            aria-label="Facebook"
                        >
                            <Facebook size={20} />
                        </a>
                        <a 
                            href="https://www.youtube.com/@HilalDigital" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white hover:text-red-200 transition-all duration-200"
                            aria-label="YouTube"
                        >
                            <Youtube size={20} />
                        </a>
                        <a 
                            href="https://www.tiktok.com/@hilal.digital?_t=8kSUshJ6Z9d&_r=1" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white hover:text-red-200 transition-all duration-200"
                            aria-label="TikTok"
                        >
                            <Music2 size={20} />
                        </a>
                        <a 
                            href="https://www.instagram.com/hilal.digital/?igsh=bmFscm90ZnV6eDF0" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white hover:text-red-200 transition-all duration-200"
                            aria-label="Instagram"
                        >
                            <Instagram size={20} />
                        </a>
                        <a 
                            href="https://whatsapp.com/channel/0029VaYFuEPFHWqARc78DN0U" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white hover:text-red-200 transition-all duration-200"
                            aria-label="WhatsApp"
                        >
                            <FaWhatsapp size={20} />
                        </a>
                    </div>
                    
                    {/* Search Icon */}
                    <button
                        className="hidden lg:flex items-center justify-center p-2 rounded-full bg-white text-[#DF1600] hover:bg-red-50 transition-all duration-200 shadow border border-red-100 ml-2"
                        onClick={() => setIsSearchOpen(true)}
                        aria-label="Open search"
                    >
                        <FaSearch size={20} />
                    </button>
            {/* Search Popup Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-fadeInUp">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                            onClick={() => setIsSearchOpen(false)}
                            aria-label="Close search"
                        >
                            <FaTimes />
                        </button>
                        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
                            <label htmlFor="navbar-search" className="text-lg font-semibold text-[#DF1600]">Search Articles</label>
                            <input
                                id="navbar-search"
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Type keywords..."
                                className="border border-red-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-800 text-base"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-[#DF1600] to-red-700 text-white font-bold py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            )}
                    {/* Desktop Buttons - Show different options based on auth status */}
                    <div className="hidden lg:flex items-center space-x-2 text-sm xl:text-base ml-2">
                        {isAuthorized ? (
                            <>
                                {/* Show Admin/Author button based on role */}
                                {userRole === 'admin' && (
                                    <Link to="/admin/dashboard">
                                        <button className="w-28 xl:w-32 bg-white text-[#DF1600] p-2 xl:p-3 font-bold border border-white cursor-pointer hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 active:scale-95">
                                            Admin
                                        </button>
                                    </Link>
                                )}
                                {userRole === 'author' && (
                                    <Link to="/admin/dashboard">
                                        <button className="w-28 xl:w-32 bg-white text-[#DF1600] p-2 xl:p-3 font-bold border border-white cursor-pointer hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 active:scale-95">
                                            Author
                                        </button>
                                    </Link>
                                )}
                                {/* Logout Button */}
                                <button 
                                    onClick={handleLogout}
                                    className="w-28 xl:w-32 bg-white text-[#DF1600] p-2 xl:p-3 font-bold border border-white cursor-pointer hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 active:scale-95"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            /* Subscribe Button - Only show when not logged in */
                            <Link to="/subscribe">
                                <button className="w-28 xl:w-32 bg-white text-[#DF1600] p-2 xl:p-3 font-bold border border-white cursor-pointer hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 active:scale-95">
                                    Subscribe
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Mobile Menu with Modern Clean Design */}
            <div
                className={`lg:hidden absolute top-20 left-0 right-0 z-50 transition-all duration-500 ease-in-out transform ${isMenuOpen ? "opacity-100 translate-y-0 max-h-screen visible" : "opacity-0 -translate-y-4 max-h-0 overflow-hidden invisible"
                    }`}
            >
                <div className="bg-gradient-to-b from-white via-gray-50 to-gray-100 shadow-2xl border-t-4 border-red-500">
                    <div className="h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500"></div>
                    <ul className="flex flex-col px-6 py-4 text-base font-medium">
                        {/* Mobile Home Link */}
                        <li className="py-4 border-b border-gray-200 hover:bg-red-50 px-4 rounded-xl transition-all duration-300">
                            <Link to="/" className="block text-gray-700 hover:text-red-600 font-semibold text-lg" onClick={closeMobileMenu}>
                                Home
                            </Link>
                        </li>

                        {/* Mobile Category Dropdown */}
                        <li
                            className={`py-4 border-b border-gray-200/60 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-25 px-4 rounded-xl transition-all duration-300 transform ${isMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                                }`}
                        >
                            <div
                                className="flex justify-between items-center cursor-pointer w-full text-gray-700 hover:text-red-600 font-semibold text-lg"
                                onClick={() => setMobileCategoryOpen(!mobileCategoryOpen)}
                            >
                                <span>{getDynamicCategoriesForPath(location.pathname, searchParams).label}</span>
                                <FaChevronDown className={`ml-2 transition-transform duration-300 text-red-500 ${mobileCategoryOpen ? "rotate-180" : "rotate-0"}`} />
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${mobileCategoryOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
                                    }`}
                            >
                                <ul className="ml-6 space-y-2 bg-gradient-to-r from-red-25 to-red-50 border-l-3 border-red-300 pl-4 py-3 rounded-r-lg">
                                    {getDynamicCategoriesForPath(location.pathname, searchParams).categories.map((category) => (
                                        <li key={category.id} className="transform transition-all duration-300 hover:translate-x-2">
                                            <Link
                                                to={getCategoryUrl(category.id, location.pathname, searchParams)}
                                                className="block py-2 text-base hover:underline hover:text-red-600 text-gray-600 font-medium"
                                                onClick={closeMobileMenu}
                                            >
                                                {category.displayName}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>

                        {/* Mobile Magazines Dropdown */}
                        <li
                            className={`py-4 border-b border-gray-200/60 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-25 px-4 rounded-xl transition-all duration-300 transform ${isMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                                }`}
                        >
                            <div
                                className="flex justify-between items-center cursor-pointer w-full text-gray-700 hover:text-red-600 font-semibold text-lg"
                                onClick={() => setMobileMagazinesOpen(!mobileMagazinesOpen)}
                            >
                                <span>Magazines</span>
                                <FaChevronDown className={`ml-2 transition-transform duration-300 text-red-500 ${mobileMagazinesOpen ? "rotate-180" : "rotate-0"}`} />
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${mobileMagazinesOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
                                    }`}
                            >
                                <ul className="ml-6 space-y-2 bg-gradient-to-r from-red-25 to-red-50 border-l-3 border-red-300 pl-4 py-3 rounded-r-lg">
                                    {loadingPublications ? (
                                        <li className="py-2 text-base text-gray-500">
                                            Loading...
                                        </li>
                                    ) : (
                                        publications.map((publication) => (
                                            <li key={publication.id} className="transform transition-all duration-300 hover:translate-x-2">
                                                <Link
                                                    to={getPublicationPath(publication.name)}
                                                    className="block py-2 text-base hover:underline hover:text-red-600 text-gray-600 font-medium"
                                                    onClick={closeMobileMenu}
                                                >
                                                    {publication.display_name}
                                                </Link>
                                            </li>
                                        ))
                                    )}
                                    <li className="transform transition-all duration-300 hover:translate-x-2">
                                        <Link
                                            to="/archives"
                                            className="block py-2 text-base hover:underline hover:text-red-600 text-gray-600 font-medium"
                                            onClick={closeMobileMenu}
                                        >
                                            Archives
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        {/* Mobile E-Book Dropdown */}
                        <li
                            className={`py-4 border-b border-gray-200/60 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-25 px-4 rounded-xl transition-all duration-300 transform ${isMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                                }`}
                        >
                            <div
                                className="flex justify-between items-center cursor-pointer w-full text-gray-700 hover:text-red-600 font-semibold text-lg"
                                onClick={() => setMobileEbookOpen(!mobileEbookOpen)}
                            >
                                <Link
                                    to="/ebooks"
                                    onClick={closeMobileMenu}
                                    className="flex-1 hover:text-red-600"
                                >
                                    E-Book
                                </Link>
                            </div>
                        </li>



                        <li className="py-4 border-b border-gray-200 hover:bg-red-50 px-4 rounded-xl transition-all duration-300">
                            <Link to="/ourcontributors" className="block text-gray-700 hover:text-red-600 font-semibold text-lg" onClick={closeMobileMenu}>
                                Our Contributors
                            </Link>
                        </li>
                    </ul>
                    {/* Mobile Social Media Icons - Circular Red Buttons */}
                    <div className="flex items-center justify-center space-x-4 py-6 border-t border-gray-200">
                        <a 
                            href="https://www.facebook.com/hilaldigital0/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-[#DF1600] flex items-center justify-center text-white hover:bg-red-700 transition-all duration-200 transform hover:scale-110 shadow-lg"
                            aria-label="Facebook"
                        >
                            <Facebook size={20} />
                        </a>
                        <a 
                            href="https://www.youtube.com/@HilalDigital" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-[#DF1600] flex items-center justify-center text-white hover:bg-red-700 transition-all duration-200 transform hover:scale-110 shadow-lg"
                            aria-label="YouTube"
                        >
                            <Youtube size={20} />
                        </a>
                        <a 
                            href="https://www.tiktok.com/@hilal.digital?_t=8kSUshJ6Z9d&_r=1" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-[#DF1600] flex items-center justify-center text-white hover:bg-red-700 transition-all duration-200 transform hover:scale-110 shadow-lg"
                            aria-label="TikTok"
                        >
                            <Music2 size={20} />
                        </a>
                        <a 
                            href="https://www.instagram.com/hilal.digital/?igsh=bmFscm90ZnV6eDF0" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-[#DF1600] flex items-center justify-center text-white hover:bg-red-700 transition-all duration-200 transform hover:scale-110 shadow-lg"
                            aria-label="Instagram"
                        >
                            <Instagram size={20} />
                        </a>
                        <a 
                            href="https://whatsapp.com/channel/0029VaYFuEPFHWqARc78DN0U" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-[#DF1600] flex items-center justify-center text-white hover:bg-red-700 transition-all duration-200 transform hover:scale-110 shadow-lg"
                            aria-label="WhatsApp"
                        >
                            <FaWhatsapp size={20} />
                        </a>
                    </div>
                    
                    {/* Mobile Search and Subscribe/Auth Buttons */}
                    <div className="p-6 pt-0 space-y-3">
                        <button 
                            onClick={() => {
                                setIsSearchOpen(true);
                                closeMobileMenu();
                            }}
                            className="w-full bg-[#DF1600] text-white p-4 font-bold cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-xl hover:bg-red-700 text-lg flex items-center justify-center gap-3"
                        >
                            <FaSearch size={18} />
                            Search Articles
                        </button>
                        
                        {isAuthorized ? (
                            <>
                                {/* Admin/Author Button */}
                                {userRole === 'admin' && (
                                    <Link to="/admin/dashboard" className="w-full" onClick={closeMobileMenu}>
                                        <button className="w-full bg-[#DF1600] text-white p-4 font-bold cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-xl hover:bg-red-700 text-lg">
                                            Admin Dashboard
                                        </button>
                                    </Link>
                                )}
                                {userRole === 'author' && (
                                    <Link to="/admin/dashboard" className="w-full" onClick={closeMobileMenu}>
                                        <button className="w-full bg-[#DF1600] text-white p-4 font-bold cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-xl hover:bg-red-700 text-lg">
                                            Author Dashboard
                                        </button>
                                    </Link>
                                )}
                                {/* Logout Button */}
                                <button 
                                    onClick={() => {
                                        handleLogout();
                                        closeMobileMenu();
                                    }}
                                    className="w-full bg-white text-[#DF1600] border-2 border-[#DF1600] p-4 font-bold cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-xl hover:bg-red-50 text-lg"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            /* Subscribe Button - Only show when not logged in */
                            <Link to="/subscribe" className="w-full" onClick={closeMobileMenu}>
                                <button className="w-full bg-[#DF1600] text-white p-4 font-bold cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-xl hover:bg-red-700 text-lg">
                                    Subscribe
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
