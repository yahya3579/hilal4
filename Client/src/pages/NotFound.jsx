// src/pages/admin/NotFoundAdmin.jsx
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6">
            <div className="text-center max-w-lg">
                {/* Error Code */}
                <h1 className="text-9xl font-bold text-[#DF1600]">404</h1>

                {/* Error Message */}
                <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-[#424242]">
                    Page Not Found
                </h2>

                {/* Description */}
                <p className="mt-6 text-base sm:text-lg text-[#616161] font-zen">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                {/* Navigation Links */}
                <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                    <Link
                        to="/"
                        className="px-6 py-3 bg-black text-white font-zen font-bold text-sm sm:text-base rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center"
                    >
                        Return Home
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>

                    <Link
                        to="/contact"
                        className="px-6 py-3 border border-black text-[#424242] font-zen font-bold text-sm sm:text-base rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center text-sm text-[#9E9E9E]">
                <p>If you believe this is an error, please contact the site administrator.</p>
            </div>
        </div>
    );
};

export default NotFound;
